import {ParseResult} from "../types/parsing-types";
import {Logger} from "./logger";
import {ConfigService} from "./config-service";
import {CategoryStats, CountryStats, DimensionStats, StatData} from "../types/stat-types";
import {getContext} from "../utils/context";

export class Aggregator {
    private config: ConfigService;
    private logger: Logger;

    constructor(config: ConfigService, logger: Logger) {
        this.config = config;
        this.logger = logger;
    }

    public async aggregateData(data: ParseResult): Promise<StatData> {
        this.logger.info('Start of aggregation', null, getContext(this))
        const total: StatData = this.createEmptyStatData();
        if (this.config.aggregation?.aggregate) {
            this.calculateTotalItems(data, total);
            this.calculateTotalRevenue(data, total);

            const categoryStat = this.calculateDimensionStats(data, 'category');
            const countryStat = this.calculateDimensionStats(data, 'country');

            this.setCategoryStats(categoryStat, total);
            this.setCountryStats(countryStat, total);

            this.logger.info('Aggregation completed', null, getContext(this));
        }
        this.logger.debug('Total statistics\n', total, getContext(this));
        return total;
    }

    private calculateTotalItems(data: ParseResult, totalStat: StatData): void {
        if (!this.config.aggregation?.calculateTotalItems) return;
        totalStat.totalItems = data.records.reduce((sum, record) =>
            sum + this.parsePrice(record.quantity), 0);
        this.logger.debug('Total items ', totalStat.totalItems, getContext(this));
    }

    private calculateTotalRevenue(data: ParseResult, totalStat: StatData): void {
        if (!this.config.aggregation?.calculateTotalRevenue) return
        totalStat.totalRevenue = data.records.reduce((sum, record, index) => {
            const price = this.parsePrice(record.price);
            const quantity: number = this.parseQuantity(record.quantity);

            this.logger.debug('Record', index + 1, getContext(this));
            this.logger.debug(' Raw price:', record.price, getContext(this));
            this.logger.debug(' Raw quantity', record.quantity, getContext(this));
            const revenue: number = price * quantity;
            return sum + this.roundCurrency(revenue);
        }, 0);
        this.logger.debug('Total revenue ', totalStat.totalRevenue, getContext(this));
    }

    private calculateDimensionStats(data: ParseResult, dimension: 'category' | 'country'): { stats: DimensionStats; count: number } {
        if (!this.config.aggregation?.calculateDimensionStats) {
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
            revenueMap.set(key, (revenueMap.get(key) || 0) + this.roundCurrency(revenue));

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
    ): void {
        total.categoriesCount = dimensionResult.count;
        total.categoriesStats = dimensionResult.stats;
    }

    private setCountryStats(dimensionResult: { stats: DimensionStats; count: number }, total: StatData
    ): void {
        total.countriesCount = dimensionResult.count;
        total.countriesStats = dimensionResult.stats;
    }

    private mapToSortedObject(map: Map<string, number>): Record<string, number> {
        return Object.fromEntries(
            Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
        );
    }

    private roundCurrency(value: number) {
        return parseFloat(value.toFixed(this.config.aggregation.fractionDigits));
    }

    private createEmptyDimensionStats(): DimensionStats {
        return {} as DimensionStats;
    }

    private createEmptyStatData(): StatData {
        return {
            totalItems: 0,
            totalRevenue: 0,
            categoriesCount: 0,
            countriesCount: 0,
            categoriesStats: {} as CategoryStats,
            countriesStats: {} as CountryStats
        };
    }
}