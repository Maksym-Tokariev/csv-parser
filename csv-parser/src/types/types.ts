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

export interface ValidationError {
    lineNumber?: number;
    field?: string;
    message: string;
    value?: string;
}

export interface StatData {
    totalItems: number,
    totalRevenue: number,
    categoriesCount: number,
    countriesCount: number,
    categoriesStats: {},
    countriesStats: {}
}

export interface DimensionStats {
    items: Record<string, number>;
    revenue: Record<string, number>;
    avgPrice: Record<string, number>;
}

export interface Report {
    totalLines: number;
    validLines: number;
    invalidLines: number;
    skippedRows: number,
    stat: StatData
}
export type ColumnName = 'id' | 'category' | 'country' | 'price' | 'quantity' | 'sold_at';
export const LOG_LEVEL = {
    DEBUG: 'debug',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
    NONE: 'none'
} as const;

export type LogLevel = typeof LOG_LEVEL[keyof typeof LOG_LEVEL];
export const APP_LOG_LEVEL: LogLevel = LOG_LEVEL.INFO;
