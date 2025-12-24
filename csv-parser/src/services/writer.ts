import * as fs from "node:fs";
import { ParseResult, Report } from "../types/parsing-types";
import {StatData} from "../types/stat-types";
import {Logger} from "./logger";
import path from "node:path";
import {ConfigService} from "./config-service";
import {getContext} from "../utils/context";

export class Writer {
    private config: ConfigService;
    private logger: Logger;

    constructor(config: ConfigService, logger: Logger) {
        this.config = config;
        this.logger = logger;
    }

    public async writeOutput(total: ParseResult, stat: StatData, fileName: string): Promise<void> {
        this.logger.info('Creating report file...', null, getContext(this));
        try {
            await this.checkDirectoryExistence();
            const rep: Report = this.createEmptyReport();

            this.setReportData(total, stat, rep);

            const jsonRep = JSON.stringify(rep, null, 2);

            fs.writeFile(this.config.paths?.resultFileName, jsonRep, 'utf-8', e => {
                if (e) {
                    this.logger.error(e.message, e, getContext(this));
                } else
                    this.logger.info('File has been created: ', fileName, getContext(this));
            });
            this.logger.info('Report file created successfully', {
                fileName,
                fileSize: `${(jsonRep.length / 1024).toFixed(2)} KB`,
                path: path.resolve(fileName)
            }, getContext(this));
        } catch (error: any) {
            this.logger.error('Failed to create report file', {
                fileName,
                error: error.message,
                stack: error.stack
            }, getContext(this));
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
        const dir: string = this.config.paths?.resultsDir;
        try {
            await fs.promises.access(dir, fs.constants.W_OK);
            this.logger.debug('Directory exists and is writable', dir, getContext(this));
            return true;
        } catch (error) {
            this.logger.error('Directory not found', dir , getContext(this));
            throw new Error;
        }
    }
}