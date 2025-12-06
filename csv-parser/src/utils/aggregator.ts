import {ParseResult, StatData, DimensionStats} from "../types/types";

export class Aggregator {
    public async aggregateData(data: ParseResult): Promise<StatData> {
        const total: StatData = this.createEmptyStatData();
        this.calculateTotalItems(data, total);
        this.calculateTotalRevenue(data, total);

        const categoryStat = this.calculateDimensionStats(data, 'category');
        const countryStat = this.calculateDimensionStats(data, 'country');

        this.setCategoryStats(categoryStat, total);
        this.setCountryStats(countryStat, total);

        return total;
    }

    private calculateTotalItems(data: ParseResult, totalStat: StatData): void {
        totalStat.totalItems = data.records.reduce((sum, record) =>
            sum + parseInt(record.quantity, 10), 0);
    }

    private calculateTotalRevenue(data: ParseResult, totalStat: StatData): void {
        totalStat.totalRevenue = data.records.reduce((sum, record) => {
            const price = parseFloat(record.price);
            const quantity = parseInt(record.quantity, 10);
            return sum + (price * quantity);
        }, 0);
    }

    private calculateDimensionStats(
        data: ParseResult,
        dimension: 'category' | 'country'
    ): { stats: DimensionStats; count: number } {
        const itemsMap = new Map<string, number>();
        const revenueMap = new Map<string, number>();
        const aggregatesMap = new Map<string, { sum: number, count: number }>();

        data.records.forEach(record => {
            const key: string = record[dimension];
            const price: number = this.parsePrice(record.price);
            const quantity: number = this.parseQuantity(record.quantity);
            const revenue: number = price * quantity;

            itemsMap.set(key, (itemsMap.get(key) || 0) + quantity);
            revenueMap.set(key, (revenueMap.get(key) || 0) + revenue);

            const currentAggregate = aggregatesMap.get(key) || { sum: 0, count: 0 };

            aggregatesMap.set(key, {
                sum: currentAggregate.sum + price,
                count: currentAggregate.count + 1
            });
        });

        const items = this.mapToSortedObject(itemsMap);
        const revenue = this.mapToSortedObject(revenueMap);
        const avgPrice = this.calculateAvgPrices(aggregatesMap);
        return {
            stats: { items, revenue, avgPrice },
            count: itemsMap.size
        }
    }

    private mapToSortedObject(map: Map<string, number>): Record<string, number> {
        return Object.fromEntries(
          Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
        );
    }
    
    private createEmptyStatData(): StatData {
        return {
            totalItems: 0,
            totalRevenue: 0,
            categoriesCount: 0,
            countriesCount: 0,
            categoriesStats: { items: {}, revenue: {}, avgPrice: {} },
            countriesStats: { items: {}, revenue: {}, avgPrice: {} }
        };
    }

    private parsePrice(priceStr: string): number {
        return parseFloat(priceStr);
    }

    private parseQuantity(quantityStr: string): number {
        return parseInt(quantityStr, 10);
    }

    private calculateAvgPrices(aggregatesMap: Map<string, { sum: number; count: number }>): Record<string, number> {
        const res: Record<string, number> = {};

        aggregatesMap.forEach(({ sum, count }, key) => {
            res[key] = count > 0 ? sum / count : 0;
        });

        return Object.fromEntries(
            Object.entries(res).sort(([a], [b]) => a.localeCompare(b))
        );
    }

    private setCategoryStats(
        dimensionResult: {
            stats: DimensionStats,
            count: number
        },
        total: StatData
    ) {
        total.categoriesCount = dimensionResult.count;
        total.categoriesStats = dimensionResult.stats;
    }

    private setCountryStats(dimensionResult: { stats: DimensionStats; count: number }, total: StatData
    ): void {
        total.countriesCount = dimensionResult.count;
        total.countriesStats = dimensionResult.stats;
    }
}