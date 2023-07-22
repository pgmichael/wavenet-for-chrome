import winkNLP from 'wink-nlp';
import model from 'wink-eng-lite-web-model'

const nlp = winkNLP(model);

String.prototype.chunk = function() {
  return nlp.readDoc(this).sentences().out('array')
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
