import * as path from 'path';
import {ContextTypes} from "../types/contextTypes";
import {Parser} from "../index";

export const RESULT_FILE_NAME = 'report.json';
export const INPUT_FILE_NAME = 'exampleData.csv';
export const PROJECT_ROOT = path.resolve(__dirname, '../..');
export const DATA_DIR = path.join(PROJECT_ROOT, 'data');
export const RESULTS_DIR = path.join(PROJECT_ROOT, 'results');
export const INPUT_FILE_PATH = path.join(DATA_DIR, INPUT_FILE_NAME);
export const RESULT_FILE_PATH = path.join(RESULTS_DIR, RESULT_FILE_NAME);

export const EXPECTED_COLUMNS: readonly string[] = [
    'id', 'category', 'country', 'price', 'quantity', 'sold_at'
] as const;
export const EXPECTED_COLUMN_COUNT: number = EXPECTED_COLUMNS.length;

export const ISO_REGEX: RegExp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
export const POSITIVE_INTEGER_REGEX: RegExp = /^(0|[1-9]\d*)$/;
export const FLOAT_NUMBER_REGEX : RegExp = /^\d+(\.\d+)?$/;
export const SPECIAL_CHARS_REGEX: RegExp = /[@#$%^*()_+=\[\]{}|;:"<>?~]/;
export const DIGIT_REGEX : RegExp = /\d/;

export const MAX_LINE_SIZE = 30;
export const DATE_FORMAT = 'YYYY-MM-DDTHH:MM:SSZ';
export const ID_PREFIX = 'P';

export const CONTEXTS: ContextTypes = {
    parser: 'Parser',
    processor: 'CSVProcessor',
    validator: 'Validator',
    configurator: 'Configurator',
    errorReporter: 'Error',
    writer: 'Writer',
    aggregator: 'Aggregator'
}