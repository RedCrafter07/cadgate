class Interval<T> {
    intervalID?: number;
    every: number;
    callback: () => T;

    constructor(every: number, callback: () => T) {
        this.every = every;
        this.callback = callback;
    }

    start() {
        if (this.intervalID) return;

        this.intervalID = setInterval(this.callback, this.every);
    }

    stop() {
        if (!this.intervalID) return;

        clearInterval(this.intervalID);
    }
}

export { Interval };
