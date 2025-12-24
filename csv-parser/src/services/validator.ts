import {ErrorReporter} from "./error-reporter";
import {ValidationError} from "../types/validation-types";
import {Logger} from "./logger";
import {ConfigService} from "./config-service";
import {getContext} from "../utils/context";

export class Validator {
    private config: ConfigService;
    private logger: Logger;
    private readonly reporter: ErrorReporter;
    private readonly columns: readonly string[];

    constructor(config: ConfigService, logger: Logger, reporter: ErrorReporter) {
        this.config = config;
        this.logger = logger;
        this.reporter = reporter;
        this.columns = this.config.parsing?.columns as string[];
    }

    public checkHeaderCorrect(header: string[]): void {
        const isHeaderValid = this.columns.every((col: string) => {
            return header.includes(col);
        });
        if (!isHeaderValid) {
            const missing: string[] = this.columns.filter(col => !header.includes(col));
            this.logger.error('Some required fields are missing:', {
                missing: missing.join(', '),
                expected: this.columns,
                actual: header
            } , getContext(this));
            throw new Error('Invalid header');
        }
        this.logger.debug('Header is valid', header, getContext(this));
    }

    public validateLine(values: string[], lineNumber: number): boolean {
        this.logger.debug('Start validation', null, getContext(this));
        const errors: ValidationError[] = [];
        this.validateNumberOfColumns(errors, values, lineNumber);

        values.forEach((value, index) => {
            const fieldName = this.columns[index];

            if (this.config.validation?.validateEmptyLines) {
                this.validateEmptyLine(errors, value, lineNumber, fieldName)
            }
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
                if (this.config.validation?.validateId) {
                    this.validateId(error, lineNumber, value);
                }
                break;
            case 'price':
                if (this.config.validation?.validatePrice) {
                    this.validatePrice(error, lineNumber, value);
                }
                break;
            case 'quantity':
                if (this.config.validation?.validateQuantity) {
                    this.validateQuantity(error, lineNumber, value);
                }
                break;
            case 'sold_at':
                if (this.config.validation?.validateSoldAt) {
                    this.validateSoldAt(error, lineNumber, value);
                }
                break;
            default:
                if (this.config.validation?.validateStringValues) {
                    this.validateStringValue(error, lineNumber, value, fieldName);
                }
                break;
        }
    }

    private hasInvalidSpecialChars(value: string): boolean {
        return this.config.validation?.specialCharsRegEx?.test(value);
    }

    private hasDigit(value: string): boolean {
        return this.config.validation?.digitsRegExp?.test(value);
    }

    private validateNumberOfColumns(errors: ValidationError[], values: string[], lineNumber: number): void {
        if (values.length !== this.columns.length) {
            const message: string = `Invalid number of fields.\n`
                + `Expected ${this.config.parsing?.columns.length} [${this.config.parsing?.columns}],`
                + ` got ${values.length} [${values}]`;
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
        if (value.length > this.config.parsing?.maxLineSize) {
            const message: string = `Value too long in column [${fieldName}].`
                + ` Max length: ${this.config.parsing?.maxLineSize}`;
            this.reporter.pushError(errors, lineNumber, message, value, fieldName);
        }
    }

    private validateId(errors: ValidationError[], lineNumber: number, value: string, fieldName: string = 'id'): void {
        let numericPart: string = value;
        let hasPrefix = false;

        if (numericPart.startsWith(this.config.parsing?.idPrefix)) {
            hasPrefix = true;
            numericPart = value.slice(1);

            if (numericPart.length === 0) {
                const message = `Id must contain numbers after 'P' prefix`;
                this.logger.warn(`Empty numeric part of id: ${value}`,
                    lineNumber, getContext(this));
                this.reporter.pushError(errors, lineNumber, message, value, fieldName);
                return;
            }
        }
        if (!/^\d+$/.test(numericPart)) {
            const message = hasPrefix?
                `Id with ${this.config.parsing?.idPrefix} prefix must contain only number after prefix. Invalid character: ${this.findInvalidChar(numericPart)}`
                : `Id must contain only numbers. Invalid character: ${this.findInvalidChar(numericPart)}`;
            this.logger.warn(`Invalid character in id [${value}]`, null, 'Validator.validateId');
            this.reporter.pushError(errors, lineNumber, message, value, fieldName);
            return;
        }
        const numId = parseInt(numericPart, 10);
        if (numId <= 0) {
            const message = 'Id must be positive number';
            this.logger.warn(`Invalid ID format: ${value}`, lineNumber, 'Validator.validateId')
            this.reporter.pushError(errors, lineNumber, message, value, fieldName);
            return;
        }
        this.logger.debug(`${fieldName} ${value} is valid`, null, 'Validator.validateId');
    }

    private validatePrice(errors: ValidationError[], lineNumber: number, value: string, fieldName: string = 'price'): void {
        if (!this.config.validation?.floatNumberRegEx.test(value)) {
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

        if (this.config.validation?.maxPrice && (price >= this.config.validation?.maxPrice)) {
            const message = `The price value must be less then ${this.config.validation?.maxPrice}`;
            this.reporter.pushError(errors, lineNumber, message, value, fieldName);
            return;
        }

        if (price < 0) {
            const message = 'Price cannot be negative';
            this.reporter.pushError(errors, lineNumber, message, value, 'price')
            return;
        }
        this.logger.debug(`${fieldName} ${value} is valid`, null, getContext(this));
    }

    private validateQuantity(errors: ValidationError[], lineNumber: number, value: string, fieldName: string = 'quantity'): void {
        const quantityMatch = value.match(this.config.validation?.positiveIntegerRegex);
        if (!quantityMatch) {
            const message = 'Quantity must be a positive integer';
            this.reporter.pushError(errors, lineNumber, message, value, fieldName);
            return;
        }
        const quantity: number = parseInt(value, 5);
        if (this.config.validation?.maxQuantity && (quantity > this.config.validation?.maxQuantity)) {
            const message = `The quantity value must be less then ${this.config.validation?.maxQuantity}`;
            this.reporter.pushError(errors, lineNumber, message, value, fieldName);
            return;
        }

        if (quantity === 0) {
            const message = 'Quantity cannot be zero';
            this.reporter.pushError(errors, lineNumber, message, value, fieldName);
            return;
        }
        this.logger.debug(`${fieldName} ${value} is valid`, null, getContext(this));

    }

    private validateSoldAt(errors: ValidationError[], lineNumber: number, value: string, fieldName: string = 'sold_at'): void {
        const isoRegex: RegExp = this.config.validation?.isoRegExp;

        if (!isoRegex.test(value)) {
            const message = `${fieldName} must be in exact format: ${this.config.parsing?.dateFormat}`;
            this.reporter.pushError(errors, lineNumber, message, value, fieldName);
            return;
        }

        if (!this.isValidDate(value)) {
            const message = `${fieldName} is not a valid calendar date`;
            this.reporter.pushError(errors, lineNumber, message, value, fieldName);
            return;
        }
        this.logger.debug(`${fieldName} ${value} is valid`, null, getContext(this));
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
        this.logger.debug(`${fieldName} ${value} is valid`, null, getContext(this));
    }

    private findInvalidChar(str: string): string {
        const invalidChar = str.split('').filter(char =>
            !this.config.validation?.digitsRegExp.test(char)
        );
        return invalidChar.join(', ');
    }

    private isValidDate(dateString: string): boolean {
        const date = new Date(dateString);
        return date.toISOString().slice(0,19) === dateString.slice(0, 19);
    }
}