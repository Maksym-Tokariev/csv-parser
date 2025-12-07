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
    categoriesStats: CategoryStats,
    countriesStats: CountryStats
}

export interface CategoryStats {
    items: Record<string, number>;
    revenue: Record<string, number>;
    avgPrice: Record<string, number>;
}

export interface CountryStats {
    items: Record<string, number>;
    revenue: Record<string, number>;
    avgPrice: Record<string, number>;
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
