export const LOG_LEVEL = {
    DEBUG: 'debug',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
    NONE: 'none'
} as const;

export type LogLevel = typeof LOG_LEVEL[keyof typeof LOG_LEVEL];
export const APP_LOG_LEVEL: LogLevel = LOG_LEVEL.INFO;

export const LOG_LEVELS = {
    [LOG_LEVEL.DEBUG]: 0,
    [LOG_LEVEL.INFO]: 1,
    [LOG_LEVEL.WARN]: 2,
    [LOG_LEVEL.ERROR]: 3,
    [LOG_LEVEL.NONE]: 4
};

export const LOGGER_CONFIG = {
    level: APP_LOG_LEVEL,
    showTimestamp: true,
    showLevel: true,
    showContext: true,
    maxMessageLen: 1000
};
