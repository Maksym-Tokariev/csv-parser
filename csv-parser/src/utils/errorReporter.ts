import {ValidationError} from "../types/types";

export class ErrorReporter {

    public pushError(errors: ValidationError[], lineNumber: number, message: string, value: string = '', fieldName?: string,): void {
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

    public reportError(errors: ValidationError[]): void {
        errors.forEach(e => {
            console.log('=== Error ===');
            console.warn(`Line ${e.lineNumber}: ${e.message}`);
            if (e.field) {
                console.warn(`  Field: ${e.field}, Value: "${e.value}"`);
                console.warn(`The Line with ${e.value} was skipped`);
            }
        });
    }

    public hasError(errors: ValidationError[]) {
        return errors.length > 0;
    }

}