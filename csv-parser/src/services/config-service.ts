import {AppConfig} from "../types/configTypes";
import {config} from "../utils/configurator";

export class ConfigService {
    private static instance: ConfigService;

    private _paths: AppConfig['paths'];
    private _parsing: AppConfig['parsing'];
    private _validation: AppConfig['validation'];
    private _aggregation: AppConfig['aggregation'];
    private _logging: AppConfig['logging'];

    private constructor() {
        this.initializeConfig();
    }

    public static getInstance(): ConfigService {
        if (!ConfigService.instance) {
            ConfigService.instance = new ConfigService();
        }
        return ConfigService.instance;
    }

    private initializeConfig(): void {
        this._paths = config.getSection('paths');
        this._parsing = config.getSection('parsing');
        this._validation = config.getSection('validation');
        this._aggregation = config.getSection('aggregation');
        this._logging = config.getSection('logging');
    }

    get paths(): AppConfig['paths'] {
        return this.paths
    }

    get parsing(): AppConfig['parsing'] {
        return this._parsing;
    }

    get validation(): AppConfig['validation'] {
        return this._validation;
    }

    get aggregation(): AppConfig['aggregation'] {
        return this._aggregation;
    }

    get logging(): AppConfig['logging'] {
        return this._logging;
    }
}

export const configService: ConfigService = ConfigService.getInstance();