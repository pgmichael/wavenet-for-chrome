export type TError = TErrorDetails & {
    error: true;
};

export type TErrorDetails = {
    errorCode: string;
    errorTitle: string
    errorMessage: string;
};

export function createError(error: TErrorDetails): TError {
    return { error: true, ...error };
}

export function isError(value: any): value is TError {
    return value && value.error === true;
}

