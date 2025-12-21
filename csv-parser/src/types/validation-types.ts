export interface ValidationError {
    lineNumber?: number;
    field?: string;
    message: string;
    value?: string;
}