import * as fs from "node:fs";
import { ParseResult, Report, StatData } from "../types/types";
import {logger} from "./logger";
import path from "node:path";
import {RESULTS_DIR} from "../config/constants";

export class Writer {
    private readonly context: string;

    constructor(context: string = 'Writer') {
        this.context = context;
    }

    public async createJson(total: ParseResult, stat: StatData, fileName: string): Promise<void> {
        logger.info('Creating report file...', null, this.context);
        try {
            await this.checkDirectoryExistence();
            const rep: Report = this.createEmptyReport();

            this.setReportData(total, stat, rep);

            const jsonRep = JSON.stringify(rep, null, 2);

            fs.writeFile(fileName, jsonRep, 'utf-8', e => {
                if (e) {
                    logger.error(e.message, e, this.context);
                } else
                    logger.info('File has been created: ', fileName, this.context);
            });
            logger.info('Report file created successfully', {
                fileName,
                fileSize: `${(jsonRep.length / 1024).toFixed(2)} KB`,
                path: path.resolve(fileName)
            }, this.context);
        } catch (error: any) {
            logger.error('Failed to create report file', {
                fileName,
                error: error.message,
                stack: error.stack
            }, this.context);
            throw new Error(`Failed to write report: ${error.message}`)
        }
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
                categoriesStats: {
                    items: {},
                    revenue: {},
                    avgPrice: {},
                },
                countriesStats: {
                    items: {},
                    revenue: {},
                    avgPrice: {},
                }
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

    private async checkDirectoryExistence(): Promise<boolean> {
        const dir: string = RESULTS_DIR;
        try {
            await fs.promises.access(dir, fs.constants.W_OK);
            logger.debug('Directory exists and is writable', dir, this.context);
            return true;
        } catch (error) {
            logger.error('Directory not found', dir , this.context);
            throw new Error;
        }
    }
}