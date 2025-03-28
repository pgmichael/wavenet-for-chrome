# Wavenet for Chrome

[Chrome extension](https://chrome.google.com/webstore/detail/wavenet-for-chrome/iefankigbnlnlaolflbcopliocibkffc?hl=en) that transforms highlighted text into high-quality natural sounding audio using [Google Cloud's Text-to-Speech](https://cloud.google.com/text-to-speech).

## Features

- Support for all Google WaveNet, Neural2, News, Studio, Polyglot voices and languages.
- Adjustable pitch and speed.
- Download selected text to an MP3 or OGG file.
- [SSML support](https://developers.google.com/actions/reference/ssml)
- Shortcut to read aloud (`Cmd+Shift+S` on macOS and `Ctrl+Shift+S` on windows)
- Shortcut to download selected text (`Cmd+Shift+E` on macOS and `Ctrl+Shift+E` on windows)
- Chunk selected text into sentences to bypass the 5000 character limit and lower usage cost.
- Use your own [Google Cloud API key](<](https://www.youtube.com/watch?v=1n8xlVNWEZ0)>) or purchase credits directly.

### Usage Costs

- If you're using your own Google Cloud API key, your usage will be billed through your Google Cloud account according to their [pricing policy](https://cloud.google.com/text-to-speech/pricing).
- If you're using purchased credits on each synthesis, the cost will be deducted from your available credits. Your credits will be automatically refilled when empty.

## Development

Interested in contributing? Follow these steps to set up your development environment:

1. Install dependencies with `npm install`.
2. Run the [backend](https://github.com/pgmichael/wavenet-for-chrome-backend) of the project or change the `BACKEND_URL` in the `build.js` file at the root of the project to point to the production API (https://api.wavenet-for-chrome.com/v1).
3. Start the development server for the extension with `npm run start:extension`.
4. To run the website locally, use `npm run start:website`.

After running these commands, load the unpacked extension from the `dist` folder to your Chrome browser.

## License

This project is licensed under the [MIT License](/LICENSE).
