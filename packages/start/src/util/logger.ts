import chalk from 'chalk';

class Logger {
	logFn = console.log;
	append = '';

	constructor(logFn?: (...data: any[]) => void) {
		if (logFn) this.logFn = logFn;
	}

	private write(...data: string[]) {
		this.logFn(this.append, ...data);
	}

	log(...text: string[]) {
		this.write(chalk.white(...text));
	}

	warn(...text: string[]) {
		this.write(chalk.yellow(...text));
	}

	success(...text: string[]) {
		this.write(chalk.green(...text));
	}

	indent() {
		const indentedLogger = new Logger();

		indentedLogger.append = '> ';

		return indentedLogger;
	}
}

export { Logger };
