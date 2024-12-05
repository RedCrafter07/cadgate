import { Logger } from '@/util/logger/index.ts';
import configSchema from '@/util/schemas/config.ts';
import * as YAML from '@std/yaml';
import { Database } from '@/util/db/index.ts';
import { dbSchema } from '@/util/schemas/db.ts';
import { hashPassword } from '@/util/functions/hashPassword.ts';

const logger = new Logger();

logger.log('======= Welcome to cadgate! =======');

const CONFIG_PATH = Deno.env.get('CONFIG_PATH')!;
const DATABASE_PATH = Deno.env.get('DATABASE_PATH')!;
const INIT_FILES = Boolean(Deno.env.get('INIT_FILES'));
const DEFAULT_PASSWORD = Deno.env.get('DEFAULT_PASSWORD') ?? 'ch4ngem3';
// TODO: Add env variables for enabling specific logs
// const ENABLE_CADDY_LOGS = Boolean(Deno.env.get('ENABLE_CADDY_LOGS'));

const requiredEnvVariables = ['CONFIG_PATH', 'DATABASE_PATH'];

const missingVariables = requiredEnvVariables
    .map((e) => ({ name: e, exists: !!Deno.env.get(e) }))
    .filter((e) => !e.exists)
    .map((e) => e.name);

if (missingVariables.length > 0) {
    logger.error(
        'ERROR',
        'Required environment variables not set:',
        missingVariables.join(', ')
    );

    Deno.exit(1);
}

logger.info('Running preflight checks');

const cmds = {
    start: new Deno.Command('caddy', {
        args: ['run'],
        stdin: 'piped',
        stdout: 'piped',
        stderr: 'piped',
    }),
};

logger.info('Checking config...');

logger.indent().log(`Getting cached config file from ${CONFIG_PATH}...`);

let content: string;

try {
    const file = await Deno.open(CONFIG_PATH);

    file.close();

    content = await Deno.readTextFileSync(CONFIG_PATH);
} catch {
    if (INIT_FILES) {
        const fileContent = YAML.stringify({ isSetUp: false });
        await Deno.writeTextFileSync(CONFIG_PATH, fileContent);

        content = fileContent;
    } else {
        logger.error('ERROR', 'Opening file failed. Does it exist?');
        logger
            .indent()
            .log(
                'You may run this container with INIT_FILES=true to initialize the files automatically.'
            );

        Deno.exit(1);
    }
}

let jsonContent: unknown;

try {
    jsonContent = YAML.parse(content);
} catch {
    logger.error('CRITICAL', 'Could not parse config. Is it a YAML?');

    Deno.exit(1);
}

logger.indent().log('Validating config...');

const validation = configSchema.safeParse(jsonContent);

if (!validation.success) {
    logger.error(
        'ERROR',
        `Config is not in the correct format. You may create the following config to restart:\n${YAML.stringify(
            {
                isSetUp: true,
            }
        )}`
    );

    Deno.exit(1);
}

logger.indent().log('Rewriting content...');

const configData = validation.data;

await Deno.writeTextFileSync(CONFIG_PATH, YAML.stringify(configData));

logger.info('Checking database...');

logger.indent().log('Checking for file...');

try {
    const file = await Deno.open(DATABASE_PATH);

    file.close();
} catch {
    if (INIT_FILES) {
        await Deno.writeTextFileSync(
            DATABASE_PATH,
            JSON.stringify({ proxyEntries: [], users: [] })
        );
    } else {
        logger.error('CRITICAL', 'Cannot open database file. Does it exist?');
        logger
            .indent()
            .log(
                'You may run this container with INIT_FILES=true to initialize the files automatically.'
            );
        Deno.exit(1);
    }
}

logger.indent().log('Validating content...');

const db = new Database(DATABASE_PATH, dbSchema);

const validationResult = await db.validate();

if (!validationResult.success) {
    logger.error('ERROR', 'Database content is not valid.');
    logger.log(validationResult.error);
    Deno.exit(1);
}

if (!configData.isSetUp) {
    logger.info('Set up has not been completed. Checking for admin user...');

    const users = await db.getData('users');

    if (users.length < 1) {
        logger.indent().log('Creating new user...');

        const passwordHash = await hashPassword(DEFAULT_PASSWORD);

        const id = crypto.randomUUID().split('-').join('');

        const newUsers: typeof users = [
            {
                administrator: true,
                email: 'admin@example.com',
                name: 'Admin',
                id,
                passwordHash,
                requiresNewEmail: true,
                requiresNewPassword: true,
            },
        ];

        await db.push('users', newUsers);

        logger
            .indent()
            .log(
                `Please log in with admin@example.com and the password ${DEFAULT_PASSWORD}.`
            );
    } else {
        logger.indent().log('User found. Please log in with your admin user.');
    }
}

logger.info('Preparing caddy configuration..');

logger.info('Starting caddy...');

const caddy = cmds.start.spawn();
caddy.ref();

logger.info('Caddy has been started!');

const stopHandler = async () => {
    logger.warn('Exit detected!');

    logger.indent().info('Stopping caddy...');

    caddy.kill('SIGTERM');

    await caddy.output();

    logger.indent().log('Everything has been successfully stopped. Goodbye!');

    Deno.exit(0);
};

Deno.addSignalListener('SIGINT', stopHandler);
