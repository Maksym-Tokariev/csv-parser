import * as fs from "node:fs";
import {ParseResult, Report, StatData} from "../types/types";

export class Writer {

    public createJson(total: ParseResult, stat: StatData, fileName: string) {
        const rep: Report = this.createEmptyReport();

        // this.dataCorrelate(total, stat, rep);

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

}