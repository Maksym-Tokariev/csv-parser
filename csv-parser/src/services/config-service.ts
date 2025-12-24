import {
    AppConfig, RequiredAggregationConfig,
    RequiredAppConfig, RequiredLoggingConfig,
    RequiredParserConfig,
    RequiredPathsConfig,
    RequiredValidationConfig
} from "../types/config-types";
import {DEFAULT_CONFIG} from "../config/default-configs";

export class ConfigService {
    private config: RequiredAppConfig;
    private isLocked: boolean = false;

    constructor(userConfig?: Partial<AppConfig>) {
        this.config = this.merge(DEFAULT_CONFIG, userConfig || {}) as RequiredAppConfig;
    }

    get paths(): Readonly<RequiredAppConfig['paths']> {
        return this.config.paths;
    }

    get parsing(): Readonly<RequiredAppConfig['parsing']> {
        return this.config.parsing;
    }

    get validation(): Readonly<RequiredAppConfig['validation']> {
        return this.config.validation;
    }

    get aggregation(): Readonly<RequiredAppConfig['aggregation']> {
        return this.config.aggregation;
    }

    get logging(): Readonly<RequiredAppConfig['logging']> {
        return this.config.logging;
    }

    getConfig(): Readonly<RequiredAppConfig> {
        return this.config;
    }

    getSection<K extends keyof AppConfig>(section: K): AppConfig[K] {
        return this.config[section];
    }

    getValue<S extends keyof RequiredAppConfig,P extends keyof RequiredAppConfig[S]>(
        section: S,
        prop: P
    ): RequiredAppConfig[S][P] {
        return this.config[section][prop];
    }

    setValue<
        S extends keyof RequiredAppConfig,
        P extends keyof RequiredAppConfig[S]
    >(
        section: S,
        property: P,
        value: RequiredAppConfig[S][P]
    ): this {
        const sectionConfig: RequiredAppConfig[S] = this.config[section];

        if (property in sectionConfig) {
            sectionConfig[property] = value;
        } else {
            throw new Error(`Property ${String(property)} does not exist in section ${section}`);
        }
        return this;
    }

    update(updates: Partial<AppConfig>): void {
        this.config = this.merge(this.config, updates);

    }

    lock(): void {
        this.isLocked = true;
    }

    unlock(): void {
        this.isLocked = false;
    }

    isConfigLocked(): boolean {
        return this.isLocked;
    }

    clone(): ConfigService {
        return new ConfigService(this.config);
    }

    private merge(defaultConfig: RequiredAppConfig, updates: Partial<AppConfig>): RequiredAppConfig {
        return {
            ...defaultConfig,
            ...updates,
            paths: {...defaultConfig.paths, ...updates.paths} as RequiredPathsConfig,
            parsing: {...defaultConfig.parsing, ...updates.parsing} as RequiredParserConfig,
            validation: {...defaultConfig.validation, ...updates.validation} as RequiredValidationConfig,
            aggregation: {...defaultConfig.aggregation, ...updates.aggregation} as RequiredAggregationConfig,
            logging: {...defaultConfig.logging, ...updates.logging} as RequiredLoggingConfig
        }
    }
}