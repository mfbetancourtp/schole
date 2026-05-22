export enum ColorType {
    primary = 'primary',
    secondary = 'secondary',
    accent = 'accent',
    info = 'info',
    success = 'success',
    warning = 'warning',
    error = 'error',
    ghost = 'ghost'
}

export type ColorTypeStrings = keyof typeof ColorType;