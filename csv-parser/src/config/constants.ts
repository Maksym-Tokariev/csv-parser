import * as path from 'path';

export const PROJECT_ROOT = path.resolve(__dirname, '../..');
export const DATA_DIR = path.join(PROJECT_ROOT, 'data');
export const RESULTS_DIR = path.join(PROJECT_ROOT, 'results');
export const INPUT_FILE_PATH = path.join(DATA_DIR, 'exampleData.csv');
export const RESULT_FILE_NAME = 'report.json';
export const RESULT_FILE_PATH = path.join(RESULTS_DIR, RESULT_FILE_NAME);
export const ARR_OF_COLUMNS: readonly string[] = [
    'id', 'category', 'country', 'price', 'quantity', 'sold_at'
] as const;
export const NUMBER_OF_COLUMNS: number = ARR_OF_COLUMNS.length

export const MAX_LINE_SIZE = 30;
export const DATE_FORMAT = 'YYYY-MM-DDTHH:MM:SSZ';
export const ID_PREFIX = 'P';