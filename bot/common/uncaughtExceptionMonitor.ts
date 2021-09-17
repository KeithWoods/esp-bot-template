import {Logger} from 'esp-js';

const _log = Logger.create('UncaughtExceptionMonitor');

// Using an instance rather than a static so the creation of the counter is more deterministic
export class UncaughtExceptionMonitor {
    constructor() {
    }
    public start() {
        process.on('uncaughtException', (err) => {
            _log.error( `Process Uncaught error`, err);
        });
    }
}