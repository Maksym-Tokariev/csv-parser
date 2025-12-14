import path from "path";
import {AppConfig} from "../types/configTypes";
import {SEPARATORS} from "./validation";
import {LOG_LEVEL} from "./logging";
import {
    ARR_OF_COLUMNS,
    DATA_DIR,
    DATE_FORMAT,
    ID_PREFIX,
    INPUT_FILE_PATH,
    MAX_LINE_SIZE,
    PROJECT_ROOT, RESULT_FILE_NAME, RESULTS_DIR
} from "./constants";

export const DEFAULT_CONFIG: AppConfig = {
    paths: {
        projectRoot: PROJECT_ROOT,
        dataDir: DATA_DIR,
        resultsDir: RESULTS_DIR,
        inputFilePath: path.join(DATA_DIR, INPUT_FILE_PATH),
        resultFilePath: path.join(RESULTS_DIR, RESULT_FILE_NAME)
    },
    parsing: {
        columns: ARR_OF_COLUMNS,
        numberOfColumns: ARR_OF_COLUMNS.length,
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
    },
    aggregation: {
        performAggregation: true,
        calculateTotalItems: true,
        calculateTotalRevenue: true,
        calculateDimensionStats: true,
    },
    logging: {
        level: LOG_LEVEL.INFO,
        showTimestamp: true,
        showLevel: true,
        showContext: true,
        maxMessageLen: 1000,
    }
}