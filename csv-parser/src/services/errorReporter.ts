import {logger} from "./logger";
import {ValidationError} from "../types/validationTypes";
import {getContext} from "../utils/context";

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
        if (errors.length === 0) {
            return;
        }

        logger.warn(`Found validation error`,
            new Set(errors.map(e => e.lineNumber)).size,
            getContext(this));

        errors.forEach((error, index) => {
            const logData = {
                errorNumber: index + 1,
                lineNumber: error.lineNumber,
                field: error.field,
                value: error.value?.substring(0, 100)
            };

            logger.warn(error.message, logData, `${getContext(this)}.Detail`);
        });
    }

    public hasError(errors: ValidationError[]) {
        return errors.length > 0;
    }

}