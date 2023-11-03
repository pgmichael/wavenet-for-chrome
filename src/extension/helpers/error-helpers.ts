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

export function createGithubIssueFromError(error) {
    const extensionVersion = chrome.runtime.getManifest().version;

    const issueBody = `
## Environment

- **Extension Version:** ${extensionVersion}

## Error Details

- **Error Code:** \`${error.errorCode}\`
- **Error Message:** _"${error.errorMessage}"_
    `;

    window.open(
        `https://github.com/pgmichael/wavenet-for-chrome/issues/new?title=${encodeURIComponent(error.errorCode)}&body=${encodeURIComponent(issueBody)}`
    );
}
