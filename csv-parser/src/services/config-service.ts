import {AppConfig} from "../types/configTypes";
import {Configurator} from "./configurator";

class ConfigService {
    private readonly configurator: Configurator;

    private _paths: AppConfig['paths'];
    private _parsing: AppConfig['parsing'];
    private _validation: AppConfig['validation'];
    private _aggregation: AppConfig['aggregation'];
    private _logging: AppConfig['logging'];

    private constructor() {
        this.initializeConfig();
    }

    private initializeConfig(): void {
        this.configurator = new Configurator();
        this._paths = this.configurator.getSection('paths');
        this._parsing = this.configurator.getSection('parsing');
        this._validation = this.configurator.getSection('validation');
        this._aggregation = this.configurator.getSection('aggregation');
        this._logging = this.configurator.getSection('logging');
    }

    get paths(): AppConfig['paths'] {
        return this._paths
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