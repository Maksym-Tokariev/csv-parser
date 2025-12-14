export const SEPARATORS = {
    COMMA: ',',
    SEMICOLON: ';',
    SPACE: ' ',
    VERTICAL_LINE: '|'
} as const;

export type Separator = typeof SEPARATORS[keyof typeof SEPARATORS];
