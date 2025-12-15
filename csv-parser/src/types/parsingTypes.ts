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
