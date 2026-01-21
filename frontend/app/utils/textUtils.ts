/**
 * Splits text into sentences while preserving original formatting including newlines
 */
export function splitIntoSentences(text: string): string[] {
  // Split by sentence-ending punctuation followed by whitespace or end of string
  const sentenceRegex = /[.!?]+(?:\s+|$)/g;
  const sentences: string[] = [];
  let lastIndex = 0;
  let match;

  while ((match = sentenceRegex.exec(text)) !== null) {
    const sentence = text.substring(lastIndex, match.index + match[0].length);
    if (sentence.trim().length > 0) {
      sentences.push(sentence);
    }
    lastIndex = match.index + match[0].length;
  }

  // Add any remaining text after the last sentence
  if (lastIndex < text.length) {
    const remaining = text.substring(lastIndex);
    if (remaining.trim().length > 0) {
      sentences.push(remaining);
    }
  }

  // If no sentences found (no punctuation), return the whole text as one sentence
  return sentences.length > 0 ? sentences : [text];
}

/**
 * Checks if a sentence matches the currently playing sentence
 */
export function isSentenceHighlighted(
  sentence: string,
  playingSentence: string | null
): boolean {
  if (!playingSentence) return false;

  const normalizedSentence = sentence
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, '');
  const normalizedPlaying = playingSentence
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, '');

  // Exact or near-exact match
  if (normalizedSentence === normalizedPlaying) {
    return true;
  }

  // Check if sentence contains the playing text (for partial matches)
  if (normalizedSentence.includes(normalizedPlaying)) {
    return true;
  }

  // Check reverse (in case playing text is longer)
  if (
    normalizedPlaying.includes(normalizedSentence) &&
    normalizedSentence.length > 10
  ) {
    return true;
  }

  // Word-based matching for better accuracy
  const playingWords = normalizedPlaying
    .split(/\s+/)
    .filter((w) => w.length > 2);
  if (playingWords.length >= 2) {
    const matchingWords = playingWords.filter((word) =>
      normalizedSentence.includes(word)
    );
    // If at least 70% of significant words match, highlight
    if (matchingWords.length >= Math.ceil(playingWords.length * 0.7)) {
      return true;
    }
  }

  return false;
}
