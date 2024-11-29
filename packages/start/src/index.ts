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

logger.indent().log('Getting cached config file...');

const file = await Deno.open(CONFIG_PATH);
