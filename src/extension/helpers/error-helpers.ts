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

export function createGithubIssueFromError(error: TError) {
    const extensionVersion = chrome.runtime.getManifest().version
    const userAgent = navigator.userAgent

    const issueBody = `
## Environment

- **Extension Version:** ${extensionVersion}
- **Browser/User Agent:** ${userAgent}

## Error Details

- **Error Code:** \`${error.errorCode}\`
- **Error Title:** _"${error.errorTitle}"_
- **Error Message:** _"${error.errorMessage}"_

## Steps to Reproduce

Please provide a detailed list of steps that reproduce the issue.

1. [Step 1]
2. [Step 2]
3. [Step 3]

## Additional Information

Provide any additional context about the error, such as what you were doing when it occurred.
    `

    window.open(
        `https://github.com/pgmichael/wavenet-for-chrome/issues/new?title=${encodeURIComponent(error.errorTitle)}&body=${encodeURIComponent(issueBody)}`
    )
}


