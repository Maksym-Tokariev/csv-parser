import * as path from 'path';

export const FILE_PATH = path.join(__dirname, '../../data/data.csv');
export const ARR_OF_COLUMNS: readonly string[] = [
    'id', 'category', 'country', 'price', 'quantity', 'sold_at'
] as const;
export const MAX_LINE_SIZE = 30;
export const NUMBER_OF_COLUMNS = 6;
export const RESULT_FILE_PATH = '../results/report.json';