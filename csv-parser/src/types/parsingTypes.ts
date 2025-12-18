import {StatData} from "./statTypes";

export interface CSVRecord {
    id: string;
    category: string;
    country: string;
    price: string;
    quantity: string;
    sold_at: string;
}

export interface ParseResult {
    records: CSVRecord[];
    totalLines: number;
    validLines: number;
    invalidLines: number;
}

export interface Report {
    totalLines: number;
    validLines: number;
    invalidLines: number;
    skippedRows: number,
    stat: StatData
}

export interface ParserOptions {
    separator?: string;
    hasHeaders?: boolean;
    skipEmptyLines?: boolean;

    validate?: boolean;
    validateId?: boolean;
    validatePrice?: boolean;
    validateQuantity?: boolean;
    validateSoldAt?: boolean;

    aggregate?: boolean;
    calculateTotalItems?: boolean;
    calculateTotalRevenue?: boolean;

    outputFormat?: 'json' | 'csv' | 'array';
    outputPath?: string;

    chunkSize?: number;
    maxRows?: number;

    transformRow?: (row: any[]) => any;
    validateRow?: (row: any[]) => boolean;
}

export interface ParseOptions extends ParserOptions {
    filePath?: string;
    data?: string | Buffer;
    encoding: string;
}