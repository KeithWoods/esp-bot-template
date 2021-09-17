import {Container} from 'esp-js-di'
import {Router} from 'esp-js';
import {asapScheduler} from 'rxjs';
import {ModelIdFactory} from './utils';
import {Config} from './config';
import {ContainerConsts} from './containerConsts';
import {AppModel} from './model';
import {UncaughtExceptionMonitor} from './common';

export namespace AlgoBotContainerConfiguration {
    export const configureContainer = (container: Container) => {
       
        container
            .register(ContainerConsts.uncaughtExceptionMonitor, UncaughtExceptionMonitor)
            .singleton();

        container.registerInstance(ContainerConsts.router, new Router())
        container.registerInstance(ContainerConsts.scheduler, asapScheduler);
        container.registerInstance(ContainerConsts.appModelId, ModelIdFactory.createId('app-model'))
        container.registerInstance(ContainerConsts.appConfiguration, Config)

        container
            .register(ContainerConsts.appModel, AppModel)
            .inject(
                ContainerConsts.appModelId,
                ContainerConsts.router,
                ContainerConsts.uncaughtExceptionMonitor
            )
            .singleton()
    }
}