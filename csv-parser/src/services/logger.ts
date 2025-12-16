import {LOG_LEVEL, LOG_LEVELS, LogLevel} from "../config/logging";
import {configService} from "./config-service";

export class Logger {
    private static instance: Logger;
    private level: LogLevel = configService.logging.level;

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    private formatMessage(level: LogLevel, message: string, context?: string): string {
        const parts: string[] = [];
        if (configService.logging.showTimestamp) {
            parts.push(`[${new Date().toISOString()}]`);
        }
        if (configService.logging.showLevel) {
            parts.push(`[${level.toUpperCase()}]`);
        }
        if (configService.logging.showContext) {
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
            const formatted = this.formatMessage(LOG_LEVEL.WARN, message, context);
            if (data) {
                console.warn(formatted, data);
            } else {
                console.warn(formatted);
            }
        }
    }

    public error(message: string, data?: any, context?: string): void {
        if (this.shouldLog(LOG_LEVEL.ERROR)) {
            const formatted = this.formatMessage(LOG_LEVEL.ERROR, message, context);
            if (data) {
                console.error(formatted, data);
            } else {
                console.error(formatted);
            }
        }
    }
}
export const logger: Logger = Logger.getInstance();
