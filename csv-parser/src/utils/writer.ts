import * as fs from "node:fs";
import { ParseResult, Report } from "../types/parsingTypes";
import {StatData} from "../types/statTypes";
import {logger} from "./logger";
import path from "node:path";
import {configService} from "../services/config-service";
import {contextService} from "../services/context-service";

export class Writer {
    public async createJson(total: ParseResult, stat: StatData, fileName: string): Promise<void> {
        logger.info('Creating report file...', null, contextService.writer);
        try {
            await this.checkDirectoryExistence();
            const rep: Report = this.createEmptyReport();

            this.setReportData(total, stat, rep);

            const jsonRep = JSON.stringify(rep, null, 2);

            fs.writeFile(configService.paths.resultFileName, jsonRep, 'utf-8', e => {
                if (e) {
                    logger.error(e.message, e, contextService.writer);
                } else
                    logger.info('File has been created: ', fileName, contextService.writer);
            });
            logger.info('Report file created successfully', {
                fileName,
                fileSize: `${(jsonRep.length / 1024).toFixed(2)} KB`,
                path: path.resolve(fileName)
            }, contextService.writer);
        } catch (error: any) {
            logger.error('Failed to create report file', {
                fileName,
                error: error.message,
                stack: error.stack
            }, contextService.writer);
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
        const dir: string = configService.paths.resultsDir;
        try {
            await fs.promises.access(dir, fs.constants.W_OK);
            logger.debug('Directory exists and is writable', dir, contextService.writer);
            return true;
        } catch (error) {
            logger.error('Directory not found', dir , contextService.writer);
            throw new Error;
        }
    }
}