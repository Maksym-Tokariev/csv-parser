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