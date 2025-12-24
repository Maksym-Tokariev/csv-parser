import * as fs from 'fs';
import readline from 'readline';
import {CSVRecord, ParseResult} from '../types/parsing-types';
import {Validator} from "./validator";
import {Logger} from "./logger";
import {ConfigService} from "./config-service";
import {getContext} from "../utils/context";
import {ErrorReporter} from "./error-reporter";

export class CSVProcessor {
    private config: ConfigService;
    private logger: Logger;
    private readonly validator: Validator;

    constructor(config: ConfigService, logger: Logger, reporter: ErrorReporter) {
        this.config = config;
        this.logger = logger;
        this.validator = new Validator(config, logger, reporter);
    }

    public async parseCSV(filePath: string): Promise<ParseResult> {
        const rl = await this.initializeFileReader(filePath);
        try {
            this.logger.info('Start of parsing', filePath, getContext(this));

            const header: string[] = await this.readHeader(rl);
            this.validator.checkHeaderCorrect(header);

            return await this.processDataLines(rl);
        } catch (error: any) {
            this.logger.error('CSV parsing failed' , {
                filePath: filePath,
                error: error.message,
            });
            throw error;
        } finally {
            if (rl) {
                rl.close();
                this.logger.debug('Readline interface closed', null, getContext(this));
            }
            this.logger.debug('Stream closed', null, getContext(this));
        }
    }

    private async initializeFileReader(filePath: string): Promise<readline.Interface> {
        if (!this.isFileFound(filePath)) {
            const error = new Error('File not found')
            this.logger.error(error.message, filePath, getContext(this));
            throw error;
        }
        const fileStream = fs.createReadStream(filePath, {
            encoding: 'utf-8'
        });
        this.logger.info('Reader was initialized', null, getContext(this));
        return readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });
    }

    private isFileFound(filePath: string): boolean {
        return fs.existsSync(filePath);
    }

    private async readHeader(rl: readline.Interface): Promise<string[]> {
        const iterator = rl[Symbol.asyncIterator]();
        const headerResult = await iterator.next();

        if (headerResult.done) {
            const error = new Error('CSV file is empty');
            this.logger.error('CSV file is empty', error, getContext(this));
            throw error;
        }
        return headerResult.value.split(this.config.validation?.separator? this.config.validation.separator : ',');
    }

    private async processDataLines(rl: readline.Interface): Promise<ParseResult> {
        const result: ParseResult = this.createEmptyResult();
        let lineNumber: number = 1;

        this.logger.info('Process line', null, getContext(this))
        for await (const line of rl) {
            lineNumber++;
            result.totalLines++;

            if (line.trim().length === 0) {
                this.logger.debug('Skipping empty line', lineNumber, getContext(this));
                continue;
            }

            this.logger.debug('Process line:\n', line, getContext(this));
            try {
                await this.processLine(line, lineNumber, result);
            } catch (error: any) {
                this.logger.warn('Error processing line', {
                    lineNumber,
                    line,
                    error: error
                }, getContext(this));
            }
        }
        this.logger.info('Validation completed', null, getContext(this))
        return result;
    }

    private async processLine(line: string, lineNumber: number, result: ParseResult): Promise<void> {
        const values: string[] = line.split(this.config.parsing?.separator);
        const hasValidationErrors: boolean = this.validator.validateLine(values, lineNumber);

        if (hasValidationErrors) {
            result.invalidLines++;
            this.logger.warn('Invalid line values: ', line, getContext(this))
            return;
        }
        const record = this.createRecord(values);
        this.logger.debug('Record added\n', record, getContext(this));

        result.records.push(record);
        result.validLines++;
    }

    private createRecord(values: string[]): CSVRecord {
        const columns = this.config.parsing?.columns;
        const record: CSVRecord = {} as CSVRecord;
        columns?.forEach((columnName, index) => {
            record[columnName as keyof CSVRecord] = values[index]?.trim() || '';
        });
        return record;
    }

    private createEmptyResult(): ParseResult {
        return {
            records: [],
            totalLines: 0,
            validLines: 0,
            invalidLines: 0
        }
    }
}
