export class TextProcessing {
  static isResponseComplete(text: string): boolean {
    const trimmed = text.trim();
    if (trimmed.length === 0) return true;
    const sentenceEnders = /[.!?。！？]\s*$/;
    return sentenceEnders.test(trimmed);
  }

  static splitTextIntoParagraphs(text: string): string[] {
    const paragraphs = text
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    if (paragraphs.length === 1 && text.includes('\n')) {
      return text
        .split('\n')
        .map((p) => p.trim())
        .filter((p) => p.length > 0);
    }

    if (paragraphs.length === 1 && paragraphs[0].length > 4000) {
      return this.splitLongParagraph(paragraphs[0]);
    }

    return paragraphs.length > 0 ? paragraphs : [text];
  }

  static splitLongParagraph(text: string, maxLength: number = 4000): string[] {
    const chunks: string[] = [];
    let remaining = text;

    while (remaining.length > maxLength) {
      let splitIndex = maxLength;
      const lastPeriod = remaining.lastIndexOf('.', maxLength);
      const lastExclamation = remaining.lastIndexOf('!', maxLength);
      const lastQuestion = remaining.lastIndexOf('?', maxLength);

      const sentenceEnd = Math.max(lastPeriod, lastExclamation, lastQuestion);

      if (sentenceEnd > maxLength * 0.5) {
        splitIndex = sentenceEnd + 1;
      } else {
        const lastSpace = remaining.lastIndexOf(' ', maxLength);
        if (lastSpace > maxLength * 0.5) {
          splitIndex = lastSpace + 1;
        }
      }

      chunks.push(remaining.substring(0, splitIndex).trim());
      remaining = remaining.substring(splitIndex).trim();
    }

    if (remaining.length > 0) {
      chunks.push(remaining);
    }

    return chunks;
  }
}
