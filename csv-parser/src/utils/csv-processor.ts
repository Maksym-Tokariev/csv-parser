import * as fs from 'fs';
import readline from 'readline';

import {
    CSVRecord,
    ParseResult
} from '../types/types';

import {
    FILE_PATH
} from '../config/constants';
import { Validator } from "./validator";

export class CSVProcessor {
    private readonly filePath: string;
    private readonly validator: Validator = Validator.prototype;

    constructor(filePath: string = FILE_PATH) {
        this.filePath = filePath;
    }

    public async parseCSV(): Promise<ParseResult> {
        const rl = await this.initializeFileReader();

        try {
            const header: string[] = await this.readHeader(rl);

            if (!this.validator.isHeaderCorrect(header)) {
                return this.createEmptyResult();
            }

            return await this.processDataLines(rl);
        } finally {
            rl.close();
        }
    }

    private async initializeFileReader(): Promise<readline.Interface> {
        if (!this.isFileFound()) {
            throw new Error(`File not found: ${this.filePath}`);
        }
        const fileStream = fs.createReadStream(this.filePath);
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

        if (headerResult.done) throw new Error('CSV file is empty');

        return headerResult.value.split(',');
    }

    private async processDataLines(rl: readline.Interface): Promise<ParseResult> {
        const result: ParseResult = this.createEmptyResult();
        let lineNumber: number = 1;

        for await (const line of rl) {
            lineNumber++;
            result.totalLines++;
            await this.processLine(line, lineNumber, result);
        }
        return result;
    }

    private async processLine(line: string, lineNumber: number, result: ParseResult): Promise<void> {
        const values: string[] = line.split(',');
        const hasValidationErrors = this.validator.validateLine(values, lineNumber);

        if (hasValidationErrors) {
            result.invalidLines++;
            return
        }

        const record = this.createRecord(values);
        console.debug(record);
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
