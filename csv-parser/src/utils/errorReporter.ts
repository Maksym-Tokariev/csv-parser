import {ValidationError} from "../types/types";
import {logger} from "./logger";

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
            logger.warn(`Line ${e.lineNumber}: ${e.message}`, null, 'ValidationError');
            if (e.field) {
                logger.warn(`  Field: ${e.field}, Value: "${e.value}"`, null, 'ValidationError');
                logger.warn(`The Line with ${e.value} was skipped`, null, 'ValidationError');
            }
        });
    }

    public hasError(errors: ValidationError[]) {
        return errors.length > 0;
    }

}