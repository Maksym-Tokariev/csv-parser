import {Logger} from "./logger";
import {ValidationError} from "../types/validation-types";
import {getContext} from "../utils/context";

export class ErrorReporter {
    private readonly logger: Logger;

    constructor(logger: Logger) {
        this.logger = logger;
    }

    public pushError(
        errors: ValidationError[],
        lineNumber: number,
        message: string,
        value: string = '',
        fieldName?: string
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

    public reportError(errors: ValidationError[]): void {
        if (errors.length === 0) {
            return;
        }
        this.logger.info(`Found validation error`,
            new Set(errors.map(e => e.lineNumber)).size,
            getContext(this));

        errors.forEach((error, index) => {
            const logData = {
                errorNumber: index + 1,
                lineNumber: error.lineNumber,
                field: error.field || '',
                value: error.value?.substring(0, 100)
            };

            this.logger.warn(error.message, logData, `${getContext(this)}.Detail`);
        });
    }

    public hasError(errors: ValidationError[]) {
        return errors.length > 0;
    }

}