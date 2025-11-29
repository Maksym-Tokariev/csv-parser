import * as fs from 'fs';
import readline from 'readline';

import {
    CSVRecord,
    ParseResult,
    ValidationError
} from '../types/types';

import {
    FILE_PATH,
    ARR_OF_COLUMNS,
    MAX_LINE_SIZE,
    NUMBER_OF_COLUMNS
} from '../config/constants';

export class CSVProcessor {
    private readonly filePath: string;

    constructor(filePath: string = FILE_PATH) {
        console.log('constructor');
        this.filePath = filePath;
    }

    private isFileFound(): boolean {
        return fs.existsSync(this.filePath);
    }

    private async initializeFileReader(): Promise<readline.Interface> {
        console.log('initializeFileReader');
        if (!this.isFileFound()) {
            throw new Error(`File not found: ${this.filePath}`);
        }
        const fileStream = fs.createReadStream(this.filePath);
        return readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });
    }

    private isHeaderCorrect(header: string[]): boolean {
        const isHeaderValid = ARR_OF_COLUMNS.every((col: string) => {
            console.log(col)
            header.includes(col);
        });
        console.log(isHeaderValid)
        if (!isHeaderValid) {
            const missing = ARR_OF_COLUMNS.filter(col => !header.includes(col));
            throw new Error(`Some required fields are missing: ${missing.join(', ')}`);
        }
        return true;
    }

    private validateLine(values: string[], lineNumber: number): ValidationError[] {
        const errors: ValidationError[] = [];

        if (values.length !== NUMBER_OF_COLUMNS) {
            errors.push({
                lineNumber,
                message: `Invalid number of fields. Expected ${NUMBER_OF_COLUMNS}, 
                                    got ${values.length}`,
                value: values.join(',')
            });
            return errors;
        }

        values.forEach((value, index) => {
            const fieldName = ARR_OF_COLUMNS[index];

            if (value === undefined || value.length === 0) {
                errors.push({
                    lineNumber,
                    field: fieldName,
                    message: `Empty value in column: ${fieldName}`,
                    value: value
                });
            }

            if (value.length > MAX_LINE_SIZE) {
                errors.push({
                    lineNumber,
                    field: fieldName,
                    message: `Value too long in column [${fieldName}]. Max length: ${MAX_LINE_SIZE}`,
                    value: value
                })
            }
        });

        return errors;
    }

    public async parseCSV(): Promise<ParseResult> {
        console.log('parseCSV');
        const rl = await this.initializeFileReader();
        const iterator = rl[Symbol.asyncIterator]();

        const result: ParseResult = {
            records: [],
            totalLines: 0,
            validLines: 0,
            invalidLines: 0
        };

        try {
            console.log('in main try');
            const headerResult = await iterator.next();
            if (headerResult.done) {
                throw new Error('CSV file is empty');
            }

            const headerLine = headerResult.value;
            const headers = headerLine.split(',');

            console.log(headers);
            if (!this.isHeaderCorrect(headers)) {
                return result;
            }

            let lineNumber = 1;

             for await (const line of rl) {
                 lineNumber++;
                 result.totalLines++;

                 const values = line.split(',');

                 const validationErrors = this.validateLine(values, lineNumber);

                 if (validationErrors.length > 0) {
                     result.invalidLines++;
                     validationErrors.forEach(error => {
                         console.warn(`Line ${error.lineNumber}: ${error.message}`);
                         if (error.field) {
                             console.warn(`  Field: ${error.field}, Value: "${error.value}"`);
                         }
                     });
                     continue;
                 }
                 const record: CSVRecord = {
                     id: values[0]?.trim() || '',
                     category: values[1]?.trim() || '',
                     country: values[2]?.trim() || '',
                     price: values[3]?.trim() || '',
                     quantity: values[4]?.trim() || '',
                     sold_at: values[5]?.trim() || ''
                 }

                 console.log('Record -------------');
                 console.log(record);

                 result.records.push(record);
                 result.validLines++;
             }

        } finally {
            rl.close();
        }

        return result;
    }
}
