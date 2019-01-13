# WaveNet for Chrome
A wrapper for Google Cloud’s text-to-speech services that transforms highlighted text into high-quality natural sounding audio.

## How to use
* [Download the chrome extension in the Chrome store](https://chrome.google.com/webstore/detail/wavenet-for-chrome/iefankigbnlnlaolflbcopliocibkffc).
* [Generate an API Key using Google Cloud's Console](https://www.youtube.com/watch?v=1n8xlVNWEZ0).
* Paste the API Key in the extension's popup menu.
* Right click on highlighted text and click "Read this by WaveNet for Chrome".

Note: Although WaveNet for Chrome is a free extension and Google Cloud's text-to-speech services offer the first 1 million characters free of charge, the regular pricing is [$16.00USD per 1 million characters](https://cloud.google.com/text-to-speech/pricing).

## Features
### Currently available
* Support for all Google WaveNet voices and languages.
* Ajustable pitch and speed.
* Download selected text to an MP3 file.
* [SSML support](https://developers.google.com/actions/reference/ssml)
* Shortcuts to start speaking (`Cmd+Shift+S` on macOS and `Ctrl+Shift+S` on all other platforms & [modfiable through browser settings](chrome://extensions/shortcuts)).

### Suggested features
* Split large queries into smaller one to prevent the 5000 character limit.
* Live sentence highlighting.
* Skip or replay sentences and paragraphs.
* Multimedia functions with onscreen display.

## License
[MIT](/LICENSE)
