import path from "path";
import {AppConfig, RequiredAppConfig} from "../types/config-types";
import {SEPARATORS} from "./validation";
import {LOG_LEVEL} from "./logging";
import {
    EXPECTED_COLUMNS,
    DATA_DIR, DATE_FORMAT, DIGIT_REGEX,
    FLOAT_NUMBER_REGEX, ID_PREFIX, ISO_REGEX,
    MAX_LINE_SIZE, POSITIVE_INTEGER_REGEX,
    RESULT_FILE_NAME, RESULTS_DIR,
    SPECIAL_CHARS_REGEX, INPUT_FILE_NAME, FRACTION_DIGITS
} from "./constants";

export const DEFAULT_CONFIG: RequiredAppConfig = {
    paths: {
        resultsDir: RESULTS_DIR,
        inputFilePath: path.join(DATA_DIR, INPUT_FILE_NAME),
        resultFilePath: path.join(RESULTS_DIR, RESULT_FILE_NAME),
        resultFileName: RESULT_FILE_NAME,
        outputFormat: "json"
    },
    parsing: {
        columns: EXPECTED_COLUMNS,
        numberOfColumns: EXPECTED_COLUMNS.length,
        maxLineSize: MAX_LINE_SIZE,
        dateFormat: DATE_FORMAT,
        idPrefix: ID_PREFIX,
        separator: SEPARATORS.COMMA,
    },
    validation: {
        validateId: true,
        validatePrice: true,
        validateQuantity: true,
        validateSoldAt: true,
        validateStringValues: true,
        validateEmptyLines: true,
        maxQuantity: 1000000,
        maxPrice: 1000000,
        specialCharsRegEx: SPECIAL_CHARS_REGEX,
        separator: SEPARATORS.COMMA,
        digitsRegExp: DIGIT_REGEX ,
        isoRegExp: ISO_REGEX,
        positiveIntegerRegex: POSITIVE_INTEGER_REGEX,
        floatNumberRegEx: FLOAT_NUMBER_REGEX,
        hasHeader: true
    },
    aggregation: {
        aggregate: true,
        calculateTotalItems: true,
        calculateTotalRevenue: true,
        calculateDimensionStats: true,
        fractionDigits: FRACTION_DIGITS
    },
    logging: {
        level: LOG_LEVEL.INFO,
        showTimestamp: true,
        showLevel: true,
        showContext: true,
        maxMessageLen: 1000,
    }
}
