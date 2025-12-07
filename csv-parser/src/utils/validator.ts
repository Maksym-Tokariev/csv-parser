import {
    ARR_OF_COLUMNS,
    MAX_LINE_SIZE,
    NUMBER_OF_COLUMNS
} from "../config/constants";
import {ValidationError} from "../types/types";
import {ErrorReporter} from "./errorReporter";
import {logger} from "./logger";

export class Validator {

    private readonly reporter: ErrorReporter = new ErrorReporter();

    public isHeaderCorrect(header: string[]): boolean {
        const isHeaderValid = ARR_OF_COLUMNS.every((col: string) => {
            return header.includes(col);
        });
        if (!isHeaderValid) {
            const missing = ARR_OF_COLUMNS.filter(col => !header.includes(col));
            logger.error('Some required fields are missing:',
                missing.join(', '), 'Validator.isHeaderCorrect');
        }
        logger.debug('Header is valid', header, 'Validator.isHeaderCorrect');
        return true;
    }

    public validateLine(values: string[], lineNumber: number): boolean {
        logger.debug('Start validation', null, 'Validator.validateLine');
        const errors: ValidationError[] = [];
        this.validateNumberOfColumns(errors, values, lineNumber);

        values.forEach((value, index) => {
            const fieldName = ARR_OF_COLUMNS[index];

            this.validateEmptyLine(errors, value, lineNumber, fieldName);
            this.validateLineLength(errors, value, lineNumber, fieldName);

            if (!this.reporter.hasError(errors)) {
                this.validateValue(errors, value, lineNumber, fieldName);
            }
        });
        this.reporter.reportError(errors);
        return this.reporter.hasError(errors);
    }

    private validateValue(error: ValidationError[], value: string, lineNumber: number, fieldName: string): void {
        switch (fieldName) {
            case 'id':
                this.validateId(error, lineNumber, value);
                break;
            case 'price':
                this.validatePrice(error, lineNumber, value);
                break;
            case 'quantity':
                this.validateQuantity(error, lineNumber, value);
                break;
            case 'sold_at':
                this.validateSoldAt(error, lineNumber, value);
                break;
            default:
                this.validateStringValue(error, lineNumber, value, fieldName);
                break;
        }
    }

    private hasInvalidSpecialChars(value: string): boolean {
        return /[@#$%^*()_+=\[\]{}|;:"<>?~]/.test(value);
    }

    private hasDigit(value: string): boolean {
        return /\d/.test(value);
    }

    private validateNumberOfColumns(errors: ValidationError[], values: string[], lineNumber: number): void {
        if (values.length !== NUMBER_OF_COLUMNS) {
            const message: string = `Invalid number of fields. Expected ${NUMBER_OF_COLUMNS},` +
                ` got ${values.length}`;
            this.reporter.pushError(errors, lineNumber, message, values.join(','));
        }
    }

    private validateEmptyLine(errors: ValidationError[], value: string, lineNumber: number, fieldName: string):void {
        if (value === undefined || value.length === 0) {
            const message: string = `Empty value in column: ${fieldName}`;
            this.reporter.pushError(errors, lineNumber, message, value, fieldName);
        }
    }

    private validateLineLength(errors: ValidationError[], value: string, lineNumber: number, fieldName: string): void {
        if (value.length > MAX_LINE_SIZE) {
            const message: string = `Value too long in column [${fieldName}].`
                + ` Max length: ${MAX_LINE_SIZE}`;
            this.reporter.pushError(errors, lineNumber, message, value, fieldName);
        }
    }

    private validateId(errors: ValidationError[], lineNumber: number, value: string, fieldName: string = 'id'): void {
        let numericPart: string = value;
        let hasPrefix = false;

        if (numericPart.startsWith('P')) {
            hasPrefix = true;
            numericPart = value.slice(1);

            if (numericPart.length === 0) {
                const message = `Id must contain numbers after 'P' prefix`;
                this.reporter.pushError(errors, lineNumber, message, value, fieldName);
                return;
            }
        }
        if (!/^\d+$/.test(numericPart)) {
            const message = hasPrefix?
                `Id with 'P' prefix must contain only number after prefix. Invalid character: ${this.findInvalidChar(numericPart)}`
                : `Id must contain only numbers. Invalid character: ${this.findInvalidChar(numericPart)}`;
            this.reporter.pushError(errors, lineNumber, message, value, fieldName);
            return;
        }
        const numId = parseInt(numericPart, 10);
        if (numId <= 0) {
            const message = 'Id must be positive number';
            logger.warn(`Invalid ID format: ${value}`, {lineNumber})
            this.reporter.pushError(errors, lineNumber, message, value, fieldName);
            return;
        }
        logger.debug(`${fieldName} ${value} is valid`, null, 'Validator.validateId');
    }

    private validatePrice(errors: ValidationError[], lineNumber: number, value: string, fieldName: string = 'price'): void {
        if (!/^\d+(\.\d+)?$/.test(value)) {
            const message = 'Price must be a valid decimal number (e.g., 10.99)';
            this.reporter.pushError(errors, lineNumber, message, value, fieldName);
            return;
        }

        const price: number = parseFloat(value);
        if (isNaN(price)) {
            const message = 'Price must be a number';
            this.reporter.pushError(errors, lineNumber, message, value, fieldName);
            return
        }

        if (price < 0) {
            const message = 'Price cannot be negative';
            this.reporter.pushError(errors, lineNumber, message, value, 'price')
            return;
        }
        logger.debug(`${fieldName} ${value} is valid`, null, 'Validator.validatePrice');
    }

    private validateQuantity(errors: ValidationError[], lineNumber: number, value: string, fieldName: string = 'quantity'): void {
        const quantityMatch = value.match(/^(0|[1-9]\d*)$/);
        if (!quantityMatch) {
            const message = 'Quantity must be a positive integer';
            this.reporter.pushError(errors, lineNumber, message, value, fieldName);
            return;
        }
        const quantity: number = parseInt(value, 10);
        if (quantity === 0) {
            const message = 'Quantity cannot be zero';
            this.reporter.pushError(errors, lineNumber, message, value, fieldName);
            return;
        }
        logger.debug(`${fieldName} ${value} is valid`, null, 'Validator.validateQuantity');

    }

    private validateSoldAt(errors: ValidationError[], lineNumber: number, value: string, fieldName: string = 'sold_at'): void {
        const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;

        if (!isoRegex.test(value)) {
            const message = `${fieldName} must be in exact format: YYYY-MM-DDTHH:MM:SSZ`;
            this.reporter.pushError(errors, lineNumber, message, value, fieldName);
            return;
        }

        if (!this.isValidDate(value)) {
            const message = `${fieldName} is not a valid calendar date`;
            this.reporter.pushError(errors, lineNumber, message, value, fieldName);
            return;
        }
        logger.debug(`${fieldName} ${value} is valid`, null, 'Validator.validateSoldAt');
    }

    private validateStringValue(error: ValidationError[], lineNumber: number, value: string, fieldName: string): void {
        if (this.hasDigit(value)) {
            const message = `The ${value} must not contain numbers`;
            this.reporter.pushError(error, lineNumber, message, value, fieldName);
            return;
        }

        if (this.hasInvalidSpecialChars(value)) {
            const message = `The ${value} must not contain special chars`;
            this.reporter.pushError(error, lineNumber, message, value, fieldName);
            return;
        }
        logger.debug(`${fieldName} ${value} is valid`, null, 'Validator.validateSoldAt');
    }

    private findInvalidChar(str: string): string {
        const invalidChar = str.split('').filter(char => !/\d/.test(char));
        return invalidChar.join(', ');
    }

    private isValidDate(dateString: string): boolean {
        const date = new Date(dateString);
        return date.toISOString().slice(0,19) === dateString.slice(0, 19);
    }
}