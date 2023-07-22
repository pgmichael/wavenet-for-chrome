# Wavenet for Chrome
[Chrome extension](https://chrome.google.com/webstore/detail/wavenet-for-chrome/iefankigbnlnlaolflbcopliocibkffc?hl=en) that transforms highlighted text into high-quality natural sounding audio using [Google Cloud's Text-to-Speech](https://cloud.google.com/text-to-speech).

## Features
* Support for all Google WaveNet, Neural2, News, Studio, Polyglot voices and languages.
* Adjustable pitch and speed.
* Download selected text to an MP3 file.
* [SSML support](https://developers.google.com/actions/reference/ssml)
* Shortcut to read aloud (`Cmd+Shift+S` on macOS and `Ctrl+Shift+S` on windows)
* Shortcut to download selected text (`Cmd+Shift+E` on macOS and `Ctrl+Shift+E` on windows)
* Chunk selected text into sentences to bypass the 5000 character limit and lower usage cost.
* Use your own Google Cloud API key.

### Using your own API key
* [Generate an API Key using Google Cloud's Console](https://www.youtube.com/watch?v=1n8xlVNWEZ0).
* Paste the API Key in the extension's popup menu (under Preferences > Credentials).

Usage will be charged through your Google Cloud account as per their [pricing policy](https://cloud.google.com/text-to-speech/pricing).

## Development
If you're interested in contributing, you can easily get started by running the following commands and loading the unpacked extension from the `dist` folder.

```
npm install

npm run start
```


## License
[MIT](/LICENSE)
