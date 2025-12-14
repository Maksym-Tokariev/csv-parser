export const SEPARATORS = {
    COMMA: ',',
    SEMICOLON: ';',
    SPACE: ' ',
    VERTICAL_LINE: '|'
} as const;

export type Separator = typeof SEPARATORS[keyof typeof SEPARATORS]

export interface ValidationConfig {
    validateId: boolean,
    validatePrice: boolean,
    validateQuantity: boolean,
    validateSoldAt: boolean,
    validateStringValues: boolean,
    validateEmptyLines: boolean,
    maxQuantity: number,
    maxPrice: number,
    separator: Separator
}

export const VALIDATOR_CONFIG: ValidationConfig = {
    validateId: true,
    validatePrice: true,
    validateQuantity: true,
    validateSoldAt: true,
    validateStringValues: true,
    validateEmptyLines: true,
    maxQuantity: 1000000,
    maxPrice: 1000000,
    separator: SEPARATORS.COMMA
}
