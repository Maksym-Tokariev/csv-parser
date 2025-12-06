import {ParseResult, StatData} from "../types/types";

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
        const quantities: number[] = this.getQuantities(data);

        totalStat.totalItems = quantities.reduce((sum, quantity) =>
            sum + quantity, 0);
    }

    private calculateTotalRevenue(data: ParseResult, totalStat: StatData): void {
        totalStat.totalRevenue = data.records.reduce((sum, record) => {
            const price = parseFloat(record.price);
            const quantity = parseInt(record.quantity, 10);
            return sum + (price * quantity);
        }, 0);
    }

    private calculateDimensionStats(data: ParseResult, key: 'category' | 'country') {
        const categoriesStat = this.calculateForCategories(data, key = 'category');
        const countriesStat = this.calculateForCountries(data, key = 'country');
        const stat = {
            items: {},
            revenue: {},
            avgPrice: {},
            categoriesCount: 0,
            countriesCount: 0
        }

        this.calculateItems(data, key, stat);
        this.calculateRevenue(data, key, stat);
        this.calculateAvgPrice(data, key, stat);
        this.calculateCount(data, key, stat);
        return stat;
    }

    private calculateForCategories(data: ParseResult, category: string)  {
        const stat = {
            items: {},
            revenue: {},
            avgPrice: {},
            categoriesCount: 0
        }
        const values: Map<string, number> =
            this.setToMap(this.getUniqueValuesByField(category, data));

        data.records.forEach(record => {

        });

        return stat;
    }

    private calculateItems(
        data: ParseResult,
        filed: 'category' | 'country',
        stat: {
            items: Record<string, number>;
            revenue: Record<string, number>;
            avgPrice: Record<string, number>
        }
        ): void {
        const items: Map<string, number> =
            this.setToMap(this.getUniqueValuesByField(filed, data));

        data.records.forEach(record => {
            const key: string = record[filed];
            const quantity: number = parseInt(record.quantity);
            const currentQuantity: number = items.get(key) || 0;
            items.set(key, currentQuantity + quantity);
        });
        stat.items = Object.fromEntries(items);
    }

    private calculateRevenue(
        data: ParseResult,
        field: 'category' | 'country',
        stat: {
            items: Record<string, number>;
            revenue: Record<string, number>;
            avgPrice: Record<string, number>
        }
    ): void {
        const revenues: Map<string, number> =
            this.setToMap(this.getUniqueValuesByField(field, data));

        data.records.forEach(record => {
            const price: number = parseFloat(record.price);
            const quantity: number = parseFloat(record.quantity);
            const revenue: number = price * quantity;
            const currentRevenue: number = revenues.get(record[field]) || 0;

            revenues.set(record[field], currentRevenue + revenue);
        });
        stat.revenue = Object.fromEntries(revenues);
    }

    private calculateAvgPrice(
        data: ParseResult,
        field: 'category' | 'country',
        stat: {
            items: {};
            revenue: {};
            avgPrice: {}
        }
        ): void {
        const avgPrices: Map<string, number> =
            this.setToMap(this.getUniqueValuesByField(field, data));

        const aggregates = new Map<
            string,
            { sum: number, count: number }
        >();

        data.records.forEach(record => {
            const key: string = record[field];
            const price: number = parseFloat(record.price);

            const current: {sum: number, count: number} =
                aggregates.get(key) || {sum: 0, count: 0};

            aggregates.set(key, {
                sum: current.sum + price,
                count: current.count + 1
            });
        });

        aggregates.forEach(({sum, count}, category) => {
            avgPrices.set(category, count > 0 ? sum / count : 0);
        });
        stat.avgPrice = avgPrices;
    }

    private calculateCount(
        data: ParseResult,
        key: "category" | "country",
        stat: {
            items: {};
            revenue: {};
            avgPrice: {};
            categoriesCount: number;
            countriesCount: number
        }
    ): void {
        stat.categoriesCount = (key === 'category')
            ? this.getCount(this.getCategories(data))
            : this.getCount(this.getCountries(data));
    }

    private getQuantities(data: ParseResult): number[] {
        return data.records.map(rec  => parseInt(rec.quantity, 10));
    }

    private getUniqueValuesByField(filed: string, data: ParseResult): Set<string> {
        return filed === 'category'? this.getCategories(data) : this.getCountries(data);
    }

    private getCategories(data: ParseResult): Set<string> {
        return new Set<string>(data.records.map(r => r.category));
    }

    private getCountries(data: ParseResult): Set<string> {
        return new Set<string>(data.records.map(r => r.country));
    }

    private getCount(items: Set<string>): number {
        return items.size;
    }

    private setCategoryStats(categoryStat: { items: {}; revenue: {}; avgPrice: {} }, total: StatData): void {
        total.categoriesStats = categoryStat;
    }

    private setCountryStats(countryStat: { items: {}; revenue: {}; avgPrice: {} }, total: StatData) {
      total.countriesStats = countryStat;
    }

    private setToMap(set: Set<string>): Map<string, number> {
        const items: Map<string, number> = new Map();
        set.forEach(value => {
            items.set(value, 0);
        });
        return this.sortMapByKeys(items);
    }

    private sortMapByKeys(items: Map<string, number>): Map<string, number> {
        return new Map(Array.from(items.entries())
            .sort(([a], [b]) => a.localeCompare(b))
        );
    }

    private createEmptyStatData(): StatData {
        return {
            totalItems: 0,
            totalRevenue: 0,
            categoriesCount: 0,
            countriesCount: 0,
            categoriesStats: {},
            countriesStats: {}
        };
    }
}