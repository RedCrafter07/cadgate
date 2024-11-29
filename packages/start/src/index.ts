import chalk from 'chalk';
import { Logger } from './util/logger.ts';

const CONFIG_PATH = Deno.env.get('CONFIG_PATH');

if (!CONFIG_PATH)
	throw new Error(chalk.red('[ERROR]: Config path has not been set!'));

const cmds = {
	start: new Deno.Command('caddy', {
		args: ['start'],
	}),
	stop: new Deno.Command('caddy', {
		args: ['stop'],
	}),
};

const logger = new Logger();

logger.warn('Preparing for start...');

logger.indent().log(`Getting cached config file from ${CONFIG_PATH}...`);

try {
	const file = await Deno.open(CONFIG_PATH);

	if (!file.readable) {
		logger.error('CRITICAL', 'Cannot read config file');
		throw new Error('Config file could not be read.');
	}

	const content = await Deno.readTextFileSync(CONFIG_PATH);

	file.close();

	console.log(content);
} catch {
	logger.warn('[WARNING]: Config file not found.');
}
