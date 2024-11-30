import chalk from 'npm:chalk';

type ErrorLevel = 'CRITICAL' | 'ERROR' | 'WARN';

class Logger {
	logFn = console.log;
	append = '';

	constructor(logFn?: (...data: any[]) => void) {
		if (logFn) this.logFn = logFn;
	}

	private write(...data: any[]) {
		if (this.append.length > 0) this.logFn(this.append, ...data);
		else this.logFn(...data);
	}

	log(...text: string[]) {
		this.write(chalk.white(...text));
	}

	warn(...text: string[]) {
		this.write(chalk.yellow('[WARNING]:', ...text));
	}

	success(...text: string[]) {
		this.write(chalk.green(...text));
	}

	error(level: ErrorLevel, ...data: any[]) {
		this.write(chalk.red(`[${level}]:`, ...data));
	}

	indent() {
		const indentedLogger = new Logger();

		indentedLogger.append = '	';

		return indentedLogger;
	}
}

export { Logger };
