import {Guard, Logger} from 'esp-js';
import path from 'path';
import fs from 'fs';

const log = Logger.create('ConfigLoader');

export interface AppConfig {
    authKey: string;
}

let _defaultConfig: AppConfig = null;

export const Config: AppConfig  = {
    get authKey() {
        return _defaultConfig.authKey;
    },
};

export namespace ConfigLoader {
    export const setConfig = (config: AppConfig) => {
        _defaultConfig = config;
    };
    export const loadConfig = () => {
        const args = process.argv.slice(2);
        if (args.length === 1) {
            let configPath = path.resolve(__dirname, args[0]);
            Guard.isTruthy(fs.existsSync(configPath), `Config not found at ${configPath}`);
            log.info(`Loading config from ${configPath}`);
            _defaultConfig = <AppConfig>require(configPath);
        }
        Guard.isDefined(_defaultConfig, `Config not loaded`);
    };
}
