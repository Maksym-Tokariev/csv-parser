import {Separator} from "../config/validation";
import {LogLevel} from "../config/logging";

export interface PathsConfig {
    projectRoot: string;
    dataDir: string;
    resultsDir: string;
    inputFilePath: string;
    resultFilePath: string;
}

export interface ParserConfig {
    columns: readonly string[];
    numberOfColumns: number;
    maxLineSize: number;
    dateFormat: string;
    idPrefix: string;
    separator: Separator;
}

export interface ValidationConfig {
    validateId: boolean;
    validatePrice: boolean;
    validateQuantity: boolean;
    validateSoldAt: boolean;
    validateStringValues: boolean;
    validateEmptyLines: boolean;
    maxQuantity: number;
    maxPrice: number;
}

export interface AggregationConfig {
    performAggregation: boolean;
    calculateTotalItems: boolean;
    calculateTotalRevenue: boolean;
    calculateDimensionStats: boolean;
}

export interface LoggingConfig {
    level: LogLevel;
    showTimestamp: boolean;
    showLevel: boolean;
    showContext: boolean;
    maxMessageLen: number;
}

export interface AppConfig {
    paths: PathsConfig;
    parsing: ParserConfig;
    validation: ValidationConfig;
    aggregation: AggregationConfig;
    logging: LoggingConfig;
}