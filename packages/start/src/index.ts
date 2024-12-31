import { Logger } from '@/util/logger/index.ts';
import configSchema from '@/util/schemas/config.ts';
import * as YAML from '@std/yaml';
import { Database } from '@/util/db/index.ts';
import { dbSchema } from '@/util/schemas/db.ts';
import { hashPassword } from '@/util/functions/hashPassword.ts';
import path from 'node:path';
import { isProcessRunning } from './util/isProcessRunning.ts';
import * as caddyAPI from '@/util/caddy.ts';
import checkStatus from './util/waitForOnline.ts';
import { Interval } from '@/util/interval.ts';

const logger = new Logger();

logger.log('======= Welcome to cadgate! =======');

const CONFIG_PATH = Deno.env.get('CONFIG_PATH')!;
const DATABASE_PATH = Deno.env.get('DATABASE_PATH')!;
const INIT_FILES = Boolean(Deno.env.get('INIT_FILES'));
const INTERFACE_PATH = Deno.env.get('INTERFACE_PATH')!;
const DATA_PATH = Deno.env.get('DATA_PATH')!;
const API_PATH = Deno.env.get('API_PATH')!;
const JWT_SECRET = Deno.env.get('JWT_SECRET')!;
const DEFAULT_PASSWORD = Deno.env.get('DEFAULT_PASSWORD') ?? 'ch4ngem3';
const BACKUP_CADDY_EVERY =
    Number(Deno.env.get('BACKUP_CADDY_EVERY')) || 1 * 60 * 1000;
const DEV = (Deno.env.get('DEV') ?? 'false') === 'true';
const STARTER_DEBUG = (Deno.env.get('STARTER_DEBUG') ?? 'false') === 'true';

// TODO: Add env variables for enabling specific logs
// const ENABLE_CADDY_LOGS = Boolean(Deno.env.get('ENABLE_CADDY_LOGS'));

const requiredEnvVariables = [
    'CONFIG_PATH',
    'DATABASE_PATH',
    'INTERFACE_PATH',
    'API_PATH',
    'JWT_SECRET',
    'DATA_PATH',
];

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

const API_PORT = 2000;
const API_URL = `http://0.0.0.0:${API_PORT}`;

logger.info('Running preflight checks');

const API_DIR = path.resolve(path.dirname(API_PATH));
const API_FILE = path.relative(API_DIR, API_PATH);

const caddyConfPath = path.join(DATA_PATH, 'caddy.json');

const processEnv = {
    DATABASE_PATH,
    CONFIG_PATH,
    JWT_SECRET,
};

const allArgs = {
    dev: {
        api: ['run', '-A', '--watch', API_FILE],
        interface: ['task', 'dev'],
    },
    prod: {
        api: ['run', '-A', API_FILE],
        interface: ['index.js'],
    },
} as Record<'dev' | 'prod', Record<'api' | 'interface', string[]>>;

const currentArgs = allArgs[DEV ? 'dev' : 'prod'];

const cmds = {
    startCaddy: (...args: string[]) =>
        new Deno.Command('caddy', {
            args: ['run', ...args],
            stdin: 'piped',
            stdout: STARTER_DEBUG ? 'inherit' : 'piped',
            stderr: STARTER_DEBUG ? 'inherit' : 'piped',
        }),
    startAPI: new Deno.Command(Deno.execPath(), {
        args: currentArgs.api,
        stdin: STARTER_DEBUG ? 'inherit' : 'piped',
        stdout: STARTER_DEBUG ? 'inherit' : 'piped',
        stderr: STARTER_DEBUG ? 'inherit' : 'piped',
        clearEnv: true,
        env: {
            ...processEnv,
            PORT: '2000',
        },
        cwd: API_DIR,
    }),
    startInterface: new Deno.Command(DEV ? Deno.execPath() : '/usr/bin/node', {
        args: currentArgs.interface,
        stdin: STARTER_DEBUG ? 'inherit' : 'piped',
        stdout: STARTER_DEBUG ? 'inherit' : 'piped',
        stderr: STARTER_DEBUG ? 'inherit' : 'piped',
        clearEnv: true,
        env: {
            ...processEnv,
            API_URL,
            HOST: '0.0.0.0',
            PORT: DEV ? '5173' : '3000',
        },
        cwd: INTERFACE_PATH,
    }),
};

logger.info('Checking config...');

logger.indent().log(`Getting cached config file from ${CONFIG_PATH}...`);

let content: string;

try {
    const file = await Deno.open(CONFIG_PATH);

    file.close();

    content = await Deno.readTextFile(CONFIG_PATH);
} catch {
    if (INIT_FILES) {
        const fileContent = YAML.stringify({ isSetUp: false });
        await Deno.writeTextFile(CONFIG_PATH, fileContent);

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

await Deno.writeTextFile(CONFIG_PATH, YAML.stringify(configData));

logger.info('Checking database...');

logger.indent().log('Checking for file...');

try {
    const file = await Deno.open(DATABASE_PATH);

    file.close();
} catch {
    if (INIT_FILES) {
        await Deno.writeTextFile(
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
                challenge: null,
                forcePasskey: false,
                isApiUser: false,
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

const additionalCaddyArgs: string[] = [];

logger.info('Preparing caddy configuration..');
logger.indent().info('Checking for cached configuration...');

try {
    await Deno.mkdir(DATA_PATH, { recursive: true });
    await Deno.open(caddyConfPath);

    additionalCaddyArgs.push('--config', caddyConfPath);
} catch {
    logger
        .indent()
        .warn('Config file not found. Using default config for now.');
}

logger.info('Starting caddy...');
const caddy = cmds.startCaddy(...additionalCaddyArgs).spawn();
caddy.ref();
logger.indent().success('Caddy has been started successfully!');

logger.info('Starting API...');
const api = cmds.startAPI.spawn();
api.ref();
logger.indent().success('API has been started successfully!');

logger.info('Starting interface...');
const webInterface = cmds.startInterface.spawn();
webInterface.ref();
logger.indent().success('Interface has been started successfully!');

const configBackup = new Interval(BACKUP_CADDY_EVERY, async () => {
    let config: unknown;

    try {
        config = await caddyAPI.getAll();
    } catch {
        logger.error('CRITICAL', 'Could not reach caddy!');

        return;
    }

    const apiFile = await Deno.open(caddyConfPath, {
        create: true,
        write: true,
    });

    apiFile.close();

    await Deno.writeTextFile(caddyConfPath, JSON.stringify(config));
});

const stopHandler = async () => {
    logger.warn('Exit detected!');

    configBackup.stop();

    logger.indent().info('Stopping interface...');

    if (await isProcessRunning(webInterface)) {
        webInterface.kill('SIGTERM');
        await webInterface.output();
    }

    logger.indent().info('Stopping API...');

    if (await isProcessRunning(api)) {
        api.kill('SIGTERM');
        await api.output();
    }

    logger.indent().info('Stopping caddy...');

    if (await isProcessRunning(caddy)) {
        caddy.kill('SIGTERM');
        await caddy.output();
    }

    logger.log('');
    logger.log(
        '======= Everything has been stopped successfully. Goodbye! ======='
    );

    Deno.exit(0);
};

Deno.addSignalListener('SIGINT', stopHandler);

logger.info('Waiting for Caddy to start...');

await checkStatus('http://localhost:2019/config/', 250);

const result = await caddyAPI.getAll();

if (result == null) {
    logger.warn('Caddy configuration has not been found!');
    await caddyAPI.resetConfig();
    await caddyAPI.initialize();
    logger.indent().success('Caddy has been initialized!');
    logger.indent().info('Writing from database...');

    const proxyEntries = await db.getData('proxyEntries');
    const redirectEntries = await db.getData('redirectEntries');

    await caddyAPI.createFromConfig({ proxyEntries, redirectEntries });

    logger.indent().success('Success!');
}

configBackup.start();

logger.log('');
logger.success('======= Initialization complete! =======');
logger.log('');
