import {Separator} from "../config/validation";
import {LogLevel} from "../config/logging";

export interface PathsConfig {
    resultsDir?: string;
    inputFilePath?: string;
    resultFilePath?: string;
    resultFileName?: string;
    outputFormat?: 'json' | 'csv' | 'array';
}

export interface ParserConfig {
    columns?: readonly string[];
    numberOfColumns?: number;
    maxLineSize?: number;
    dateFormat?: string;
    idPrefix?: string;
    separator?: Separator;
}

export interface ValidationConfig {
    validateId?: boolean;
    validatePrice?: boolean;
    validateQuantity?: boolean;
    validateSoldAt?: boolean;
    validateStringValues?: boolean;
    validateEmptyLines?: boolean;
    maxQuantity?: number;
    maxPrice?: number;
    specialCharsRegEx?: RegExp;
    separator?: Separator;
    digitsRegExp?: RegExp;
    isoRegExp?: RegExp;
    positiveIntegerRegex?: RegExp;
    floatNumberRegEx?: RegExp;
    hasHeader?: boolean
}

export interface AggregationConfig {
    aggregate?: boolean;
    calculateTotalItems?: boolean;
    calculateTotalRevenue?: boolean;
    calculateDimensionStats?: boolean;
}

export interface LoggingConfig {
    level?: LogLevel;
    showTimestamp?: boolean;
    showLevel?: boolean;
    showContext?: boolean;
    maxMessageLen?: number;
}

export interface AppConfig {
    paths?: PathsConfig;
    parsing?: ParserConfig;
    validation?: ValidationConfig;
    aggregation?: AggregationConfig;
    logging?: LoggingConfig;
}
export type RequiredPathsConfig = Required<PathsConfig>;
export type RequiredParserConfig = Required<ParserConfig>;
export type RequiredValidationConfig = Required<ValidationConfig>;
export type RequiredAggregationConfig = Required<AggregationConfig>;
export type RequiredLoggingConfig = Required<LoggingConfig>;

export type RequiredAppConfig = {
    paths: RequiredPathsConfig;
    parsing: RequiredParserConfig;
    validation: RequiredValidationConfig;
    aggregation: RequiredAggregationConfig;
    logging: RequiredLoggingConfig;
};