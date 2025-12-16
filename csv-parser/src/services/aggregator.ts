import {ParseResult} from "../types/parsingTypes";
import {logger} from "./logger";
import {configService} from "./config-service";
import {DimensionStats, StatData} from "../types/statTypes";
import {getContext} from "../utils/context";

export class Aggregator {

    public async aggregateData(data: ParseResult): Promise<StatData> {
        logger.info('Start of aggregation', null, getContext(this))
        const total: StatData = this.createEmptyStatData();
        if (configService.aggregation.performAggregation) {
            this.calculateTotalItems(data, total);
            this.calculateTotalRevenue(data, total);

            const categoryStat = this.calculateDimensionStats(data, 'category');
            const countryStat = this.calculateDimensionStats(data, 'country');

            this.setCategoryStats(categoryStat, total);
            this.setCountryStats(countryStat, total);

            logger.info('Aggregation completed', null, getContext(this));
        }
        return total;
    }

    private calculateTotalItems(data: ParseResult, totalStat: StatData): void {
        if (!configService.aggregation.calculateTotalItems) return
        totalStat.totalItems = data.records.reduce((sum, record) =>
            sum + parseInt(record.quantity, 10), 0);
        logger.debug(`Total items [${totalStat.totalItems}]`);
    }

    private calculateTotalRevenue(data: ParseResult, totalStat: StatData): void {
        if (!configService.aggregation.calculateTotalRevenue) return
        totalStat.totalRevenue = data.records.reduce((sum, record) => {
            const price = parseFloat(record.price);
            const quantity = parseInt(record.quantity, 5);
            return sum + (price * quantity);
        }, 0);
        logger.debug(`Total revenue [${totalStat.totalRevenue}]`, null, getContext(this));
    }

    private calculateDimensionStats(
        data: ParseResult,
        dimension: 'category' | 'country'
    ): { stats: DimensionStats; count: number } {
        if (!configService.aggregation.calculateDimensionStats) {
            return { stats: this.createEmptyDimensionStats(), count: 0 }
        }
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

    private createEmptyDimensionStats(): DimensionStats {
        return {
            items: {},
            revenue: {},
            avgPrice: {}
        };
    }

    private parsePrice(priceStr: string): number {
        return parseFloat(priceStr);
    }

    private parseQuantity(quantityStr: string): number {
        return parseInt(quantityStr, 5);
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
    ): void {
        total.categoriesCount = dimensionResult.count;
        total.categoriesStats = dimensionResult.stats;
    }

    private setCountryStats(dimensionResult: { stats: DimensionStats; count: number }, total: StatData
    ): void {
        total.countriesCount = dimensionResult.count;
        total.countriesStats = dimensionResult.stats;
    }
}