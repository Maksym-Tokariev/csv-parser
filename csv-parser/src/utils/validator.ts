import {ARR_OF_COLUMNS, MAX_LINE_SIZE, NUMBER_OF_COLUMNS} from "../config/constants";
import {ValidationError} from "../types/types";

export class Validator {

    public isHeaderCorrect(header: string[]): boolean {
        console.log(`Header: ${header}`);
        const isHeaderValid = ARR_OF_COLUMNS.every((col: string) => {
            return header.includes(col);
        });
        if (!isHeaderValid) {
            const missing = ARR_OF_COLUMNS.filter(col => !header.includes(col));
            throw new Error(`Some required fields are missing: ${missing.join(', ')}`);
        }
        return true;
    }

    public validateLine(values: string[], lineNumber: number): boolean {
        const errors: ValidationError[] = [];

        this.validateNumberOfColumns(errors, values, lineNumber);

        values.forEach((value, index) => {
            const fieldName = ARR_OF_COLUMNS[index];

            this.validateEmptyLine(errors, value, lineNumber, fieldName);
            this.validateLineLength(errors, value, lineNumber, fieldName);
            if (errors.length < 0) {
                this.validateValue(errors, value, lineNumber, fieldName);
            }
        });
        this.handleValidationErrors(errors);
        return errors.length > 0
    }

    private validateValue(
        error: ValidationError[],
        value: string,
        lineNumber: number,
        fieldName: string
    ): void {
        console.log(`Field name: [${fieldName}], value [${value}]`);
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
                this.validateStringValue(error, lineNumber, value);
                break;
        }
        if (this.hasDigit(value)) {
            `The ${value} must not contain numbers`;
        }
        if (this.hasSpecialChars(value)) {
            `The ${value} must not contain special chars`;
        }
    }

    private hasSpecialChars(value: string): boolean {
        return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);
    }

    private hasDigit(value: string): boolean {
        return /\d/.test(value);
    }

    private validateId(
        errors: ValidationError[],
        lineNumber: number,
        id: string
    ): void {
        let numericPart: string = id;
        let hasPrefix = false;

        if (numericPart.startsWith('P')) {
            hasPrefix = true;
            numericPart = id.slice(1);

            if (numericPart.length === 0) {
                const message = `Id must contain numbers after 'P' prefix`;
                this.pushError(errors, lineNumber, message, id, 'id');
                return;
            }
        }

        if (!/^\d+$/.test(numericPart)) {
            const message = hasPrefix?
                `Id with 'P' prefix must contain only number after prefix. Invalid character: ${this.findInvalidChar(numericPart)}`
                : `Id must contain only numbers. Invalid character: ${this.findInvalidChar(numericPart)}`;
            this.pushError(errors, lineNumber, message, id, 'id');
            return;
        }
        const numId = parseInt(numericPart, 10);
        if (numId <= 0) {
            const message = 'Id must be positive number';
            this.pushError(errors, lineNumber, message, id, 'id');
            return;
        }

        console.log(`Id [${id}] is valid`);
    }

    private validatePrice(
        errors: ValidationError[],
        lineNumber: number,
        value: string
    ): void {
        if (!/^[\d.]+$/.test(value)) {
            const message = 'Price must contain only numbers';
            this.pushError(errors, lineNumber, message, value, 'price');
            return;
        }
        const price: number = parseFloat(value);

        if (isNaN(price)) {
            const message = 'Price must be a number';
            this.pushError(errors, lineNumber, message, value, 'price');
            return
        }

        if (price < 0) {
            const message = 'Price cannot be negative';
            this.pushError(errors, lineNumber, message, value, 'price')
            return;
        }
        console.log(`Price ${value} is valid`);
    }

    private validateNumberOfColumns(
        errors: ValidationError[],
        values: string[],
        lineNumber: number
    ): void {
        if (values.length !== NUMBER_OF_COLUMNS) {
            const message: string = `Invalid number of fields. Expected ${NUMBER_OF_COLUMNS},` +
                ` got ${values.length}`;
            this.pushError(errors, lineNumber, message, values.join(','));
        }
    }

    private validateEmptyLine(
        errors: ValidationError[],
        value: string,
        lineNumber: number,
        fieldName: string
    ):void {
        if (value === undefined || value.length === 0) {
            const message: string = `Empty value in column: ${fieldName}`;
            this.pushError(errors, lineNumber, message, value, fieldName);
        }
    }

    private validateLineLength(
        errors: ValidationError[],
        value: string,
        lineNumber: number,
        fieldName: string
    ): void {
        if (value.length > MAX_LINE_SIZE) {
            const message: string = `Value too long in column [${fieldName}].`
                + ` Max length: ${MAX_LINE_SIZE}`;
            this.pushError(errors, lineNumber, message, value, fieldName);
        }
    }

    private validateQuantity(
        error: ValidationError[],
        lineNumber: number,
        value: string
    ): void {
        if (!/^\d+$/.test(value)) {
            const message = 'Quantity must contain only numbers';
            this.pushError(error, lineNumber, message, value, 'quantity');
            return;
        }
        const quantity = parseInt(value);
        if (isNaN(quantity)) {
            const message = 'Quantity must be a number';
            this.pushError(error, lineNumber, message, value, 'quantity');
            return;
        }
        console.log(`Quantity ${value} is valid`);
    }

    private validateSoldAt(error: ValidationError[], lineNumber: number, value: string) {

    }

    private validateStringValue(error: ValidationError[], lineNumber: number, value: string) {

    }

    private pushError(
        errors: ValidationError[],
        lineNumber: number,
        message: string,
        value: string = '',
        fieldName?: string,
    ): void {
        const error: ValidationError = {
            lineNumber,
            message,
            value: value
        }
        if (fieldName) {
            error.field = fieldName;
        }
        errors.push(error);
    }

    private findInvalidChar(str: string) {
        const invalidChar = str.split('').filter(char => !/\d/.test(char));
        return invalidChar.join(', ');
    }

    private handleValidationErrors(errors: ValidationError[]) {
        errors.forEach(e => {
            console.log('== Error == \n_____________________________________________')
            console.warn(`Line ${e.lineNumber}: ${e.message}`);
            if (e.field) {
                console.warn(`  Field: ${e.field}, Value: "${e.value}"`);
            }
            console.log('____________________________________________')
        });
    }
}