import {Guard, Logger, ModelBase, Router} from 'esp-js';
import {UncaughtExceptionMonitor} from '../common';

const _log = Logger.create('AppModel');

export class AppModel extends ModelBase {
    constructor(
        modelId: string,
        router: Router,
        private _uncaughtExceptionMonitor: UncaughtExceptionMonitor,
    ) {
        super(modelId, router);
        Guard.isString(modelId, 'modelId should be a string');
        Guard.isDefined(router, 'router required');
        Guard.isDefined(_uncaughtExceptionMonitor, '_uncaughtExceptionMonitor required');
    }

    observeEvents() {
        super.observeEvents();
    }

    start() {
        this._uncaughtExceptionMonitor.start();
        this.ensureOnDispatchLoop(() => {
            this._start();
        });
    }

    stop() {
        _log.info(`Stopping`);
    }

    _start() {
        _log.info('Starting');
    };
}