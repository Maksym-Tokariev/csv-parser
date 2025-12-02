import {ParseResult, StatData} from "../types/types";

export class Aggregator {
    public async aggregateData(data: ParseResult): Promise<StatData> {
        const totalStat: StatData = this.createEmptyStatData();
        this.calculateTotalItems(data, totalStat);
        this.calculateTotalRevenue(data, totalStat);
        this.calculateCategoryStat(data, totalStat);
        return totalStat;
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

    private calculateCategoryStat(data: ParseResult, totalStat: StatData): void {
        const categories = {
            items: {},
            revenue: {},
            avgPrice: 0
        }
        this.calculateCategoryItems(data, categories)
        this.calculateCategoryRevenue(data, categories);
        this.calculateAvgPrice(data, categories);

        totalStat.categories_stats = categories;
    }

    private calculateCategoryItems(
        data: ParseResult,
        categories: {
            items: {};
            revenue: {};
            avgPrice: number
        }
        ): void {
        const items: Map<string, number> =
            this.categoriesToMap(this.getCategories(data));
        data.records.forEach(record => {
            const quantity: number = parseInt(record.quantity);
            const category: string = record.category;
            const currentQuantity: number = items.get(category) || 0;

            items.set(category, currentQuantity + quantity);
        });
        categories.items = Object.fromEntries(items);
    }

    private calculateCategoryRevenue(
        data: ParseResult,
        categories: {
            items: {};
            revenue: {};
            avgPrice: number
        }
    ): void {
        const revenues: Map<string, number> =
            this.categoriesToMap(this.getCategories(data));
        data.records.forEach(record => {
            const price: number = parseInt(record.price, 10);
            const quantity: number = parseFloat(record.quantity);
            const category: string = record.category;
            const revenue: number = price * quantity;
            const currentRevenue: number = revenues.get(category) || 0;

            revenues.set(category, currentRevenue + revenue);
        });
        categories.revenue = Object.fromEntries(revenues);
    }

    private calculateAvgPrice(
        data: ParseResult,
        categories: {
            items: {};
            revenue: {};
            avgPrice: number
        }
        ): void {
        const avgPrices: Map<string, number> =
            this.categoriesToMap(this.getCategories(data));

        data.records.forEach(record => {
            const price: number = parseFloat(record.price);
            const category: string = record.category;
            // TODO calculating avg value
        });
    }

    private createEmptyStatData(): StatData {
        return {
            totalItems: 0,
            totalRevenue: 0,
            categories_count: 0,
            countries_count: 0,
            categories_stats: {},
            countries_stats: {},
            top_categories: []
        };
    }

    private categoriesToMap(categories: Set<string>): Map<string, number> {
        const items: Map<string, number> = new Map();
        categories.forEach(value => {
            items.set(value, 0);
        });
        return items;
    }

    public getQuantities(data: ParseResult): number[] {
        return data.records.map(rec  => parseInt(rec.quantity, 10));
    }

    public getPrices(data: ParseResult): number[] {
        return data.records.map(rec => parseFloat(rec.price));
    }

    public getCategories(data: ParseResult): Set<string> {
        return new Set<string>(data.records.map(r => r.category));
    }

    public getCountries(data: ParseResult): Set<string> {
        return new Set<string>(data.records.map(r => r.country));
    }
}