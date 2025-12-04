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
    countriesStats: {},
    topCategories: [],
    topCountriesByRevenue: []
}

export type ColumnName = 'id' | 'category' | 'country' | 'price' | 'quantity' | 'sold_at';
