import {LOG_LEVEL, LOG_LEVELS, LogLevel} from "../config/logging";
import {ConfigService} from "./config-service";

export class Logger {
    private config: ConfigService;
    private readonly level: LogLevel;

    constructor(config: ConfigService) {
        this.config = config;
        this.level = this.config.logging?.level || LOG_LEVEL.INFO;
    }

    private formatMessage(level: LogLevel, message: string, context?: string): string {
        const parts: string[] = [];
        if (this.config.logging?.showTimestamp) {
            parts.push(`[${new Date().toISOString()}]`);
        }
        if (this.config.logging?.showLevel) {
            parts.push(`[${level.toUpperCase()}]`);
        }
        if (this.config.logging?.showContext) {
            parts.push(`[${context}]`);
        }
        parts.push(message);
        return parts.join(' ');
    }

    private shouldLog(level: LogLevel): boolean {
        return LOG_LEVELS[level] >= LOG_LEVELS[this.level];
    }

    public debug(message: string, data?: any, context?: string): void {
        if (this.shouldLog(LOG_LEVEL.DEBUG)) {
            const formatted = this.formatMessage(LOG_LEVEL.DEBUG, message, context);
            if (data) {
                console.debug(formatted, data);
            } else {
                console.debug(formatted);
            }
        }
    }

    public info(message: string, data?: any, context?: string): void {
        if (this.shouldLog(LOG_LEVEL.INFO)) {
            const formatted = this.formatMessage(LOG_LEVEL.INFO, message, context);
            if (data) {
                console.info(formatted, data);
            } else {
                console.info(formatted);
            }
        }
    }

    public warn(message: string, data?: any, context?: string): void {
        if (this.shouldLog(LOG_LEVEL.WARN)) {
            const formatted: string = this.formatMessage(LOG_LEVEL.WARN, message, context);
            if (data) {
                console.warn(formatted, data);
            } else {
                console.warn(formatted);
            }
        }
    }

    public error(message: string, data?: any, context?: string): void {
        if (this.shouldLog(LOG_LEVEL.ERROR)) {
            const formatted: string = this.formatMessage(LOG_LEVEL.ERROR, message, context);
            if (data) {
                console.error(formatted, data);
            } else {
                console.error(formatted);
            }
        }
    }
}