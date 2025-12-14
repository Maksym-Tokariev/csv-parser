import {ValidationError} from "../types/types";
import {ErrorReporter} from "./errorReporter";
import {logger} from "./logger";
import {configService} from "../services/config-service";

export class Validator {
    private readonly reporter: ErrorReporter;
    private readonly context: string;
    private readonly columns: readonly string[] = configService.parsing.columns;

    constructor(context: string = 'Validator') {
        this.context = context;
        this.reporter = new ErrorReporter();
    }

    public checkHeaderCorrect(header: string[]): void {
        const isHeaderValid = this.columns.every((col: string) => {
            return header.includes(col);
        });
        if (!isHeaderValid) {
            const missing: string[] = this.columns.filter(col => !header.includes(col));
            logger.error('Some required fields are missing:', {
                missing: missing.join(', '),
                expected: this.columns,
                actual: header
            } , this.context);
            throw new Error('Invalid header');
        }
        logger.debug('Header is valid', header, this.context);
    }

    public validateLine(values: string[], lineNumber: number): boolean {
        logger.debug('Start validation', null, this.context);
        const errors: ValidationError[] = [];
        this.validateNumberOfColumns(errors, values, lineNumber);

        values.forEach((value, index) => {
            const fieldName = this.columns[index];

            if (configService.validation.validateEmptyLines) {
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
                if (configService.validation.validateId) {
                    this.validateId(error, lineNumber, value);
                }
                break;
            case 'price':
                if (configService.validation.validatePrice) {
                    this.validatePrice(error, lineNumber, value);
                }
                break;
            case 'quantity':
                if (configService.validation.validateQuantity) {
                    this.validateQuantity(error, lineNumber, value);
                }
                break;
            case 'sold_at':
                if (configService.validation.validateSoldAt) {
                    this.validateSoldAt(error, lineNumber, value);
                }
                break;
            default:
                if (configService.validation.validateStringValues) {
                    this.validateStringValue(error, lineNumber, value, fieldName);
                }
                break;
        }
    }

    private hasInvalidSpecialChars(value: string): boolean {
        return configService.validation.specialCharsRegEx.test(value);
    }

    private hasDigit(value: string): boolean {
        return configService.validation.digitsRegExp.test(value);
    }

    private validateNumberOfColumns(errors: ValidationError[], values: string[], lineNumber: number): void {
        if (values.length !== configService.parsing.numberOfColumns) {
            const message: string = `Invalid number of fields. Expected ${configService.parsing.numberOfColumns},` +
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
        if (value.length > configService.parsing.maxLineSize) {
            const message: string = `Value too long in column [${fieldName}].`
                + ` Max length: ${configService.parsing.maxLineSize}`;
            this.reporter.pushError(errors, lineNumber, message, value, fieldName);
        }
    }

    private validateId(errors: ValidationError[], lineNumber: number, value: string, fieldName: string = 'id'): void {
        let numericPart: string = value;
        let hasPrefix = false;

        if (numericPart.startsWith(configService.parsing.idPrefix)) {
            hasPrefix = true;
            numericPart = value.slice(1);

            if (numericPart.length === 0) {
                const message = `Id must contain numbers after 'P' prefix`;
                logger.warn(`Empty numeric part of id: ${value}`,
                    lineNumber, this.context);
                this.reporter.pushError(errors, lineNumber, message, value, fieldName);
                return;
            }
        }
        if (!/^\d+$/.test(numericPart)) {
            const message = hasPrefix?
                `Id with ${configService.parsing.idPrefix} prefix must contain only number after prefix. Invalid character: ${this.findInvalidChar(numericPart)}`
                : `Id must contain only numbers. Invalid character: ${this.findInvalidChar(numericPart)}`;
            logger.warn(`Invalid character in id [${value}]`, null, 'Validator.validateId');
            this.reporter.pushError(errors, lineNumber, message, value, fieldName);
            return;
        }
        const numId = parseInt(numericPart, 10);
        if (numId <= 0) {
            const message = 'Id must be positive number';
            logger.warn(`Invalid ID format: ${value}`, lineNumber, 'Validator.validateId')
            this.reporter.pushError(errors, lineNumber, message, value, fieldName);
            return;
        }
        logger.debug(`${fieldName} ${value} is valid`, null, 'Validator.validateId');
    }

    private validatePrice(errors: ValidationError[], lineNumber: number, value: string, fieldName: string = 'price'): void {
        if (!configService.validation.floatNumberRegEx.test(value)) {
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

        if (configService.validation.maxPrice && (price >= configService.validation.maxPrice)) {
            const message = `The price value must be less then ${configService.validation.maxPrice}`;
            this.reporter.pushError(errors, lineNumber, message, value, fieldName);
            return;
        }

        if (price < 0) {
            const message = 'Price cannot be negative';
            this.reporter.pushError(errors, lineNumber, message, value, 'price')
            return;
        }
        logger.debug(`${fieldName} ${value} is valid`, null, this.context);
    }

    private validateQuantity(errors: ValidationError[], lineNumber: number, value: string, fieldName: string = 'quantity'): void {
        const quantityMatch = value.match(configService.validation.positiveIntegerRegex);
        if (!quantityMatch) {
            const message = 'Quantity must be a positive integer';
            this.reporter.pushError(errors, lineNumber, message, value, fieldName);
            return;
        }
        const quantity: number = parseInt(value, 5);
        if (configService.validation.maxQuantity && (quantity > configService.validation.maxQuantity)) {
            const message = `The quantity value must be less then ${configService.validation.maxQuantity}`;
            this.reporter.pushError(errors, lineNumber, message, value, fieldName);
            return;
        }

        if (quantity === 0) {
            const message = 'Quantity cannot be zero';
            this.reporter.pushError(errors, lineNumber, message, value, fieldName);
            return;
        }
        logger.debug(`${fieldName} ${value} is valid`, null, this.context);

    }

    private validateSoldAt(errors: ValidationError[], lineNumber: number, value: string, fieldName: string = 'sold_at'): void {
        const isoRegex = configService.validation.isoRegExp;

        if (!isoRegex.test(value)) {
            const message = `${fieldName} must be in exact format: ${configService.parsing.dateFormat}`;
            this.reporter.pushError(errors, lineNumber, message, value, fieldName);
            return;
        }

        if (!this.isValidDate(value)) {
            const message = `${fieldName} is not a valid calendar date`;
            this.reporter.pushError(errors, lineNumber, message, value, fieldName);
            return;
        }
        logger.debug(`${fieldName} ${value} is valid`, null, this.context);
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
        logger.debug(`${fieldName} ${value} is valid`, null, this.context);
    }

    private findInvalidChar(str: string): string {
        const invalidChar = str.split('').filter(char => !configService.validation.digitsRegExp.test(char));
        return invalidChar.join(', ');
    }

    private isValidDate(dateString: string): boolean {
        const date = new Date(dateString);
        return date.toISOString().slice(0,19) === dateString.slice(0, 19);
    }
}