String.prototype.chunk = function() {
  if (this.isSSML()) return this.chunkSSML()

  const sentences = this.split(/(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s/gm)
  return sentences
    .map(sentence => sentence.trim())
    .filter(sentence => sentence)
}

String.prototype.chunkSSML = function() {
  const maxChunkSize = 5000
  const speakStartTag = '<speak>'
  const speakEndTag = '</speak>'
  const chunks = []
  let currentChunk = ''

  const content = this.slice(speakStartTag.length, -speakEndTag.length)

  const regex = /(<[^>]*>|[^<]+)/g
  let match

  while ((match = regex.exec(content)) !== null) {
    const element = match[0]

    if (currentChunk.length + element.length > maxChunkSize - (speakStartTag.length + speakEndTag.length)) {
      chunks.push(speakStartTag + currentChunk + speakEndTag)
      currentChunk = ''
    }

    currentChunk += element
  }

  if (currentChunk) {
    chunks.push(speakStartTag + currentChunk + speakEndTag)
  }

  return chunks
}

String.prototype.isSSML = function() {
  const trimmedText = this.trim()
  return trimmedText.startsWith('<speak>') && trimmedText.endsWith('</speak>')
}
