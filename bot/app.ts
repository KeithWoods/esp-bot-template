import {Level, Logger, LoggingConfig} from 'esp-js';
import {Container} from 'esp-js-di';
import {ContainerConsts} from './containerConsts';
import {AlgoBotContainerConfiguration} from './containerConfiguration';
import {AppModel} from './model';
import {ConfigLoader} from './config';

LoggingConfig.defaultLoggerConfig.level = Level.debug;
LoggingConfig.defaultLoggerConfig.padOrTruncateLoggerNameLengthTo = 35;

const _log = Logger.create('App');

// Given the back test uses this package as a library, we don't explicitly start the app.
// You need to set RUN_APP to 'true' to run it up
if (process.env.RUN_APP && process.env.RUN_APP.toLowerCase() === 'true') {
    _log.info('Starting');

    ConfigLoader.loadConfig();

    const container = new Container();
    AlgoBotContainerConfiguration.configureContainer(container);

    let appModel = container.resolve<AppModel>(ContainerConsts.appModel);
    appModel.observeEvents();
    // do this before we start as the start() call won't return
    process.on('SIGTERM', () => {
        appModel.stop();
        container.dispose();
    });
    appModel.start();
}