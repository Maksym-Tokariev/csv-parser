import * as fs from 'fs';
import readline from 'readline';

import {
    CSVRecord,
    ParseResult
} from '../types/types';

import {
    INPUT_FILE_PATH
} from '../config/constants';
import { Validator } from "./validator";
import {logger} from "./logger";

export class CSVProcessor {
    private readonly filePath: string;
    private readonly validator: Validator;

    constructor(filePath: string = INPUT_FILE_PATH) {
        this.filePath = filePath;
        this.validator = new Validator();
    }

    public async parseCSV(): Promise<ParseResult> {
        const rl = await this.initializeFileReader();
        try {
            logger.info('Start of parsing', this.filePath, 'CSVProcessor.parseCSV');

            const header: string[] = await this.readHeader(rl);

            if (!this.validator.isHeaderCorrect(header)) {
                return this.createEmptyResult();
            }

            return await this.processDataLines(rl);
        } catch (error: any) {
            logger.error('CSV parsing failed' , {
                filePath: this.filePath,
                error: error.message,
                stack: error.stack
            });
            throw error;
        } finally {
            if (rl) {
                rl.close();
                logger.debug('Readline interface closed');
            }
            logger.debug('Stream closed', null, 'CSVProcessor.parseCSV');
        }
    }

    private async initializeFileReader(): Promise<readline.Interface> {
        if (!this.isFileFound()) {
            const error = new Error('File not found')
            logger.error(error.message, this.filePath, 'CSVProcessor.initializeFileReader');
            throw error;
        }
        const fileStream = fs.createReadStream(this.filePath, {
            encoding: 'utf-8'
        });
        logger.info('Reader was initialized', null, 'CSVProcessor.initializeFileReader');
        return readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });
    }

    private isFileFound(): boolean {
        return fs.existsSync(this.filePath);
    }

    private async readHeader(rl: readline.Interface): Promise<string[]> {
        const iterator = rl[Symbol.asyncIterator]();
        const headerResult = await iterator.next();

        if (headerResult.done) {
            const error = new Error('CSV file is empty');
            logger.error('CSV file is empty', error, 'CSVProcessor.readHeader');
            throw error;
        }
        return headerResult.value.split(',');
    }

    private async processDataLines(rl: readline.Interface): Promise<ParseResult> {
        const result: ParseResult = this.createEmptyResult();
        let lineNumber: number = 1;

        logger.info('Process line', null, 'CSVProcessor.processDataLines')
        for await (const line of rl) {
            lineNumber++;
            result.totalLines++;

            if (line.trim().length === 0) {
                logger.debug('Skipping empty line', lineNumber, 'CSVProcessor.processDataLines');
                continue;
            }

            logger.debug('Process line:\n', line, 'CSVProcessor.processDataLines');
            try {
                await this.processLine(line, lineNumber, result);
            } catch (error: any) {
                logger.warn('Error processing line', {
                    lineNumber,
                    line,
                    error: error.message
                });
            }
        }
        logger.info('Validation completed', null, 'CSVProcessor.processDataLines')
        return result;
    }

    private async processLine(line: string, lineNumber: number, result: ParseResult): Promise<void> {
        const values: string[] = line.split(',');
        const hasValidationErrors = this.validator.validateLine(values, lineNumber);

        if (hasValidationErrors) {
            result.invalidLines++;
            logger.warn('Invalid line values: ', line, 'CSVProcessor.processLine')
            return
        }
        const record = this.createRecord(values);
        logger.debug('Record added\n', record, 'CSVProcessor.processLine');

        result.records.push(record);
        result.validLines++;
    }

    private createRecord(values: string[]): CSVRecord {
        return {
            id: values[0]?.trim() || '',
            category: values[1]?.trim() || '',
            country: values[2]?.trim() || '',
            price: values[3]?.trim() || '',
            quantity: values[4]?.trim() || '',
            sold_at: values[5]?.trim() || ''
        }
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
