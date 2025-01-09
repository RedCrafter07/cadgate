import chalk from 'npm:chalk';
// @ts-types="npm:@types/figlet"
import figlet from 'npm:figlet';
// @ts-types="npm:@types/gradient-string"
import gradient from 'npm:gradient-string';
import * as yaml from 'jsr:@std/yaml';
import path from 'node:path';

const containerName = Deno.env.get('NAME') ?? 'cadgate';
const image = Deno.env.get('IMAGE') ?? 'ghcr.io/redcrafter07/cadgate/cadgate';
const write = Deno.env.get('WRITE') === 'true';
const interfacePort = Number(Deno.env.get('PORT') ?? '2080');

const ascii = figlet.textSync('CADGATE', {
    font: '3-D',
});

title();

console.log(
    chalk.gray(`
You can also use the following environment variables:

WRITE (boolean)  ->   Write the output to a file.    
PORT  (number)   ->   The port of the interface.
NAME  (string)   ->   The name of the container.
IMAGE  (string)  ->   The image to use instead of the default one.

Please note that all of the listed variables are optional.`)
);

console.log('\n\n');

const compose = generateDockerCompose();

if (write) {
    const composePath = path.resolve('./docker-compose.yml');

    let file: Deno.FsFile | undefined;

    try {
        file = await Deno.open(composePath, {
            createNew: true,
            write: true,
            read: true,
        });
    } catch {
        file = undefined;
    }

    if (!file) {
        console.log(
            chalk.red(
                `The file ${composePath} already exists and thus will not be overridden.`
            )
        );

        Deno.exit(1);
    }

    await file.write(new TextEncoder().encode(compose));

    console.log(chalk.green(`Successfully wrote file to ${composePath}.`));
} else {
    console.log(
        chalk.blue('Here is a Docker Compose you can use to deploy Cadgate:')
    );
    console.log(compose);
}

console.log(chalk.gray('Feel free to customize this file to your liking!'));

function title() {
    console.log(gradient(['#ff3434', '#7c00ff'])(ascii));
    console.log();
    console.log(chalk.gray.italic('A RedCrafter07 Project'));
}

function generateDockerCompose() {
    const ports = generatePorts([
        [80, 80],
        [443, 443],
        [2080, interfacePort],
    ]);

    const env = getDefaultEnv(generateSecret(128));

    const data = {
        services: {
            cadgate: {
                container_name: containerName,
                image: image,
                expose: ports,
                environment: env,
                volumes: ['cadgate_data:/data'],
            },
        },
    };

    return addVolume(yaml.stringify(data));
}

function addVolume(input: string) {
    return `${input}\nvolumes:\n  cadgate_data:`;
}

function getDefaultEnv(secret: string) {
    return [
        'CONFIG_PATH="/data/cadpm.yml"',
        'DATABASE_PATH="/data/db.json"',
        'INIT_FILES=true',
        `JWT_SECRET="${secret.replaceAll('"', '\\"')}"`,
    ];
}

function generatePorts(input: [number, number][]) {
    // internal:external
    return input.map(([i, e]) => `${i}:${e}`);
}

function generateSecret(length: number): string {
    return btoa(
        String.fromCharCode(...crypto.getRandomValues(new Uint8Array(length)))
    );
}
