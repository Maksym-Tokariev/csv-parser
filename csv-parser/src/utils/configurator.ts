import {AppConfig} from "../types/configTypes";
import {DEFAULT_CONFIG} from "../config/defaultConfigs";
import {logger} from "./logger";

export class Configurator {
    private static instance: Configurator;
    private isFrozen = false;
    private config: AppConfig;
    private readonly context: string;

    private constructor(context: string = 'Configurator') {
        this.config = DEFAULT_CONFIG;
        this.context = context;
    }

    public static getInstance(): Configurator {
        if (!Configurator.instance) {
            Configurator.instance = new Configurator()
        }
        return Configurator.instance;
    }
    public set<K extends keyof AppConfig>(section: K, value: Partial<AppConfig[K]>): void {
        Object.assign(this.config[section], value);
    }

    public get<K extends keyof AppConfig>(section: K, prop: keyof AppConfig[K]): AppConfig[K][keyof AppConfig[K]] {
        return this.config[section][prop];
    }

    public getAll(): AppConfig {
        return this.config;
    }

    public getSection<K extends keyof AppConfig>(section: K): AppConfig[K] {
        return this.config[section]
    }

    public update(config: Partial<AppConfig>): void {
        this.config = { ...this.config, ...config };
    }
}

export const config: Configurator = Configurator.getInstance();