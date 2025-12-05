import {ParseResult, StatData} from "../types/types";

export class Aggregator {
    public async aggregateData(data: ParseResult): Promise<StatData> {
        const total: StatData = this.createEmptyStatData();
        this.calculateTotalItems(data, total);
        this.calculateTotalRevenue(data, total);

        const categoryStat = this.calculateStat(data, 'category');
        const countryStat = this.calculateStat(data, 'country');
        this.enterCategoryStatStat(categoryStat, total);
        this.enterCountryStatStat(countryStat, total);

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

    private calculateStat(data: ParseResult, key: 'category' | 'country') {
        const stat = {
            items: {},
            revenue: {},
            avgPrice: {}
        }
        this.calculateItems(data, key, stat)
        this.calculateRevenue(data, key, stat);
        this.calculateAvgPrice(data, key, stat);

        return stat;
    }

    private calculateItems(
        data: ParseResult,
        filed: 'category' | 'country',
        categories: {
            items: Record<string, number>;
            revenue: Record<string, number>;
            avgPrice: Record<string, number>
        }
        ): void {
        const items: Map<string, number> =
            this.setToMap(this.getByKey(filed, data));

        data.records.forEach(record => {
            const key: string = record[filed];
            const quantity: number = parseInt(record.quantity);
            const currentQuantity: number = items.get(key) || 0;
            items.set(key, currentQuantity + quantity);
        });
        categories.items = Object.fromEntries(items);
    }

    private calculateRevenue(
        data: ParseResult,
        field: 'category' | 'country',
        categories: {
            items: Record<string, number>;
            revenue: Record<string, number>;
            avgPrice: Record<string, number>
        }
    ): void {
        const revenues: Map<string, number> =
            this.setToMap(this.getByKey(field, data));

        data.records.forEach(record => {
            const price: number = parseInt(record.price, 10);
            const quantity: number = parseFloat(record.quantity);
            const revenue: number = price * quantity;
            const currentRevenue: number = revenues.get(record[field]) || 0;

            revenues.set(record[field], currentRevenue + revenue);
        });
        categories.revenue = Object.fromEntries(revenues);
    }

    private calculateAvgPrice(
        data: ParseResult,
        field: 'category' | 'country',
        categories: {
            items: {};
            revenue: {};
            avgPrice: {}
        }
        ): void {
        const avgPrices: Map<string, number> =
            this.setToMap(this.getByKey(field, data));

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
        categories.avgPrice = avgPrices;
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

    private setToMap(set: Set<string>): Map<string, number> {
        const items: Map<string, number> = new Map();
        set.forEach(value => {
            items.set(value, 0);
        });
        return items;
        // return this.sortMapByKeys(items);
    }

    public getQuantities(data: ParseResult): number[] {
        return data.records.map(rec  => parseInt(rec.quantity, 10));
    }

    public getPrices(data: ParseResult): number[] {
        return data.records.map(rec => parseFloat(rec.price));
    }

    public getByKey(filed: string, data: ParseResult) {
        return filed === 'category'? this.getCategories(data) : this.getCountries(data);
    }

    public getCategories(data: ParseResult): Set<string> {
        return new Set<string>(data.records.map(r => r.category));
    }

    public getCountries(data: ParseResult): Set<string> {
        return new Set<string>(data.records.map(r => r.country));
    }

    private enterCategoryStatStat(categoryStat: { items: {}; revenue: {}; avgPrice: {} }, total: StatData): void {
        total.categoriesStats = categoryStat;
    }

    private enterCountryStatStat(countryStat: { items: {}; revenue: {}; avgPrice: {} }, total: StatData) {
      total.countriesStats = countryStat;
    }

    // TODO
    // private sortMapByKeys(items: Map<string, number>): Map<string, number> {
    //     return Array.from(items.entries()).sort((a, b) =>
    //         a[0].localeCompare(b[0])
    //     );
    // }
}