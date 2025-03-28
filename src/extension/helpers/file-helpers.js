/**
 * Maps audio encoding formats to their corresponding file extensions.
 */
export const fileExtMap = {
    // MP3 formats
    MP3: 'mp3',
    MP3_64_KBPS: 'mp3',

    // OGG formats
    OGG_OPUS: 'ogg',
    OGG: 'ogg',

    // WAV formats
    LINEAR16: 'wav',

    // Other formats
    MULAW: 'raw',
    ALAW: 'raw'
}

/**
 * Gets the MIME type for a given audio encoding format.
 * @param {string} encoding - The audio encoding format
 * @returns {string} The corresponding MIME type
 */
export function getMimeType(encoding) {
    const ext = fileExtMap[encoding] || 'bin'

    switch (ext) {
        case 'mp3':
            return 'audio/mpeg'
        case 'ogg':
            return 'audio/ogg'
        case 'wav':
            return 'audio/wav'
        default:
            return 'application/octet-stream'
    }
}
