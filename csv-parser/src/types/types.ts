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
    categories_count: number,
    countries_count: number,
    categories_stats: {},
    countries_stats: {},
    top_categories: []
}

export type ColumnName = 'id' | 'category' | 'country' | 'price' | 'quantity' | 'sold_at';
