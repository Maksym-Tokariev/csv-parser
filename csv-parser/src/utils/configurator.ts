import {AppConfig} from "../types/configTypes";
import {DEFAULT_CONFIG} from "../config/defaultConfigs";
import {logger} from "./logger";
import {contextService} from "../services/context-service";

export class Configurator {
    private static instance: Configurator;
    private isLocked: boolean = false;
    private config: AppConfig;

    private constructor() {
        this.config = DEFAULT_CONFIG;
    }

    public static getInstance(): Configurator {
        if (!Configurator.instance) {
            Configurator.instance = new Configurator()
        }
        return Configurator.instance;
    }

    public set<K extends keyof AppConfig>(section: K, value: Partial<AppConfig[K]>): void {
        if (this.isLocked) {
            logger.error('Config is frozen. Configuration cannot be changed', null, contextService.configurator);
            return;
        }
        Object.assign(this.config[section], value);
        logger.debug(`The new value set`, {
            section: this.config[section],
            value: value},
            contextService.configurator
        )
    }

    public get<K extends keyof AppConfig>(section: K, prop: keyof AppConfig[K]): AppConfig[K][keyof AppConfig[K]] {
        return this.config[section][prop];
    }

    public getAll(): AppConfig {
        return this.config;
    }

    public getSection<K extends keyof AppConfig>(section: K): AppConfig[K] {
        return this.config[section];
    }

    public update(config: Partial<AppConfig>): void {
        this.config = { ...this.config, ...config };
    }

    public lock(): void {
        logger.warn('Configuration is locked', this.config, contextService.configurator);
        this.isLocked = true;
    }

    public unlock(): void {
        logger.warn('Configuration is unlocked', this.config, contextService.configurator);
        this.isLocked = false;
    }

}

export const config: Configurator = Configurator.getInstance();