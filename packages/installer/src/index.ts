import axios, { AxiosResponse } from 'npm:axios';
import chalk from 'npm:chalk';
import { Buffer } from 'node:buffer';

const image = Deno.env.get('IMAGE') ?? 'ghcr.io/redcrafter07/cadgate/cadgate';
const skipPull = Boolean(Deno.env.get('SKIP_PULL') ?? 'false');
const interfacePort = Number(Deno.env.get('PORT') ?? '2080');

const docker = axios.create({
    socketPath: '/var/run/docker.sock',
    baseURL: '/v1.47',
});

console.log(chalk.blue('Generating JWT secret...'));

function generateSecret(length: number): string {
    return btoa(
        String.fromCharCode(...crypto.getRandomValues(new Uint8Array(length)))
    );
}

if (!skipPull) {
    console.log(chalk.blue('Pulling image...'));

    await pullDockerImage({
        fromImage: image,
    });
}

const jwtSecret = generateSecret(256);

console.log(chalk.blue('Creating env variables...'));

const envVars = createEnvVars({
    jwtSecret,
});

console.log(chalk.blue('Creating volume...'));

let volumeCreation: AxiosResponse<any, any>;

try {
    volumeCreation = await docker.post('/volumes/create', {
        Name: 'cadgate_data',
    });
} catch {
    console.log(
        chalk.red(
            '[CRITICAL]: Volume creation failed! Please remove all volumes with the name cadgate_data'
        )
    );
    Deno.exit(1);
}

if (volumeCreation.status != 201) {
    console.log(
        chalk.red(
            '[CRITICAL]: Volume creation failed! Please remove all volumes with the name cadgate_data.'
        )
    );
    Deno.exit(1);
}

// internal:external
const portBinds = {
    3000: interfacePort,
    80: 80,
    443: 443,
};

const ports = genDockerPorts(portBinds);

let containerCreation: AxiosResponse<any, any>;

try {
    containerCreation = await docker.post('/containers/create', {
        Image: image,
        Env: envVars,
        HostConfig: {
            Binds: ['cadgate_data:/data'],
            PortBindings: ports,
        },
    });
} catch {
    console.log(chalk.red('[CRITICAL]: Container creation failed!'));
    Deno.exit(1);
}

if (containerCreation.status != 201) {
    console.log(
        chalk.red(
            '[CRITICAL]: Volume creation failed! Please remove all volumes with the name cadgate_data'
        )
    );
    Deno.exit(1);
}

const containerID = containerCreation.data.Id;

console.log(chalk.blue('Starting container...'));

let startResponse: AxiosResponse<any, any> | undefined = undefined;

try {
    startResponse = await docker.post(`/containers/${containerID}/start`);
} catch {
    //
}

if (
    startResponse &&
    (startResponse.status === 404 || startResponse.status === 500)
) {
    console.log(
        chalk.red(
            'An error occured while starting the container: ',
            startResponse.status
        )
    );

    Deno.exit(1);
}

console.log(chalk.green('Cadgate has been started successfully. Bye!'));

async function pullDockerImage(options: {
    fromImage: string;
    tag?: string;
}): Promise<void> {
    try {
        const response = await docker.post('/images/create', null, {
            params: {
                fromImage: options.fromImage,
                tag: options.tag || 'latest',
            },
            responseType: 'stream',
        });

        return new Promise((resolve, reject) => {
            response.data.on('data', (chunk: Buffer) => {
                const data = JSON.parse(chunk.toString());
                console.log(data.status || data.progress);
            });

            response.data.on('end', () => resolve());
            response.data.on('error', (error: Error) => reject(error));
        });
    } catch (error: any) {
        throw new Error(`Failed to pull image: ${error.message}`);
    }
}

function createEnvVars(config: {
    jwtSecret: string;
    initFiles?: boolean;
    dbPath?: string;
    configPath?: string;
}) {
    const confWithDefaults = {
        initFiles: true,
        dbPath: '/data/db.jsop',
        configPath: '/data/config.yml',
        ...config,
    };

    const envCase = {
        INIT_FILES: confWithDefaults.initFiles,
        DATABASE_PATH: confWithDefaults.dbPath,
        CONFIG_PATH: confWithDefaults.configPath,
        JWT_SECRET: confWithDefaults.jwtSecret,
    };

    return Object.entries(envCase).map(([k, v]) => `${k}=${v}`);
}

function genDockerPorts(input: Record<number, number>) {
    return Object.entries(input)
        .map(
            ([k, v]) =>
                [`${k}/tcp`, [{ HostPort: v.toString() }]] as [
                    string,
                    [{ HostPort: string }]
                ]
        )
        .reduce((p, [k, v]) => {
            p[k] = v;
            return p;
        }, {} as Record<string, [{ HostPort: string }]>);
}
