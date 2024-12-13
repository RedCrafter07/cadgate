// deno-lint-ignore-file no-explicit-any
import chalk from 'npm:chalk';

type ErrorLevel = 'CRITICAL' | 'ERROR' | 'WARN';

class Logger {
    logFn = console.log;
    append = '';
    prefixes = true;

    constructor(logFn?: (...data: any[]) => void) {
        if (logFn) this.logFn = logFn;
    }

    private write(...data: any[]) {
        if (this.append.length > 0) this.logFn(this.append, ...data);
        else this.logFn(...data);
    }

    log(...data: any[]) {
        this.write(chalk.white(...data));
    }

    info(...data: any[]) {
        if (!this.prefixes) this.write(chalk.blueBright(...data));
        else this.write(chalk.blueBright('[INFO]:', ...data));
    }

    warn(...text: string[]) {
        if (!this.prefixes) this.write(chalk.yellow(...text));
        else this.write(chalk.yellow('[WARNING]:', ...text));
    }

    success(...text: string[]) {
        this.write(chalk.green(...text));
    }

    error(level: ErrorLevel, ...data: any[]) {
        if (level === 'CRITICAL')
            this.write(chalk.bgRed.gray(`[${level}]:`, ...data));
        else this.write(chalk.red(`[${level}]:`, ...data));
    }

    indent() {
        const indentedLogger = new Logger();

        indentedLogger.append = chalk.bgWhite.white('>');
        indentedLogger.prefixes = false;

        return indentedLogger;
    }
}

export { Logger };
