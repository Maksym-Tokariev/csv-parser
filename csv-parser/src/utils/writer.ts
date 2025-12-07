import * as fs from "node:fs";
import { ParseResult, Report, StatData } from "../types/types";

export class Writer {

    public createJson(total: ParseResult, stat: StatData, fileName: string) {
        const rep: Report = this.createEmptyReport();

        this.setReportData(total, stat, rep);

        const jsonRep = JSON.stringify(rep);
        fs.writeFile(fileName, jsonRep, 'utf-8', e => {
            if (e) {
                console.log(e)
            } else
                console.log('File has been created');
        });
    }

    private createEmptyReport(): Report {
        return {
            totalLines: 0,
            validLines: 0,
            invalidLines: 0,
            skippedRows: 0,
            stat: {
                totalItems: 0,
                totalRevenue: 0,
                categoriesCount: 0,
                countriesCount: 0,
                categoriesStats: {},
                countriesStats: {}
            }
        }
    }

    private setReportData(total: ParseResult, stat: StatData, rep: Report) {
        rep.totalLines = total.totalLines;
        rep.validLines = total.validLines
        rep.invalidLines = total.invalidLines;
        rep.skippedRows = total.invalidLines;
        rep.stat.totalItems = stat.totalItems;
        rep.stat.totalRevenue = stat.totalRevenue;
        rep.stat.countriesCount = stat.countriesCount;
        rep.stat.categoriesCount = stat.categoriesCount;
        rep.stat.categoriesStats = stat.categoriesStats;
        rep.stat.countriesStats = stat.countriesStats;
    }
}