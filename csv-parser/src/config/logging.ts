import {
    APP_LOG_LEVEL,
    LOG_LEVEL
} from "../types/types";

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
    useColors: true,
    maxMessageLen: 1000
};
