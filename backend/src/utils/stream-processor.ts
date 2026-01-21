/**
 * Processes streaming chat completion and extracts sentences
 */
export class StreamProcessor {
  private fullContent = '';
  private currentSentence = '';
  private lastProcessedLength = 0;

  constructor(
    private onSentence: (sentence: string, fullText: string) => Promise<void>,
    private signal?: AbortSignal
  ) {}

  async processChunk(content: string): Promise<void> {
    if (this.signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    if (!content) return;

    this.fullContent += content;
    this.currentSentence += content;

    const sentenceEndMatch = this.currentSentence.match(/[.!?]+(?:\s+|$)/);

    if (sentenceEndMatch && this.onSentence) {
      const sentenceMatch = this.currentSentence.match(/^(.+?[.!?]+)(?:\s+|$)/);
      if (sentenceMatch) {
        const extractedSentence = sentenceMatch[1].trim();
        if (extractedSentence.length > 0) {
          await this.onSentence(extractedSentence, this.fullContent);
          this.lastProcessedLength = this.fullContent.length;
          const remaining = this.currentSentence.slice(sentenceMatch[0].length);
          this.currentSentence = remaining;
        }
      } else {
        const fallbackMatch = this.currentSentence.match(/^([^.!?]*[.!?]+)/);
        if (fallbackMatch) {
          const extractedSentence = fallbackMatch[1].trim();
          if (extractedSentence.length > 0) {
            await this.onSentence(extractedSentence, this.fullContent);
            this.lastProcessedLength = this.fullContent.length;
            this.currentSentence = this.currentSentence
              .slice(fallbackMatch[0].length)
              .trim();
          }
        } else {
          const sentence = this.currentSentence.trim();
          if (sentence.length > 0) {
            await this.onSentence(sentence, this.fullContent);
            this.lastProcessedLength = this.fullContent.length;
            this.currentSentence = '';
          }
        }
      }
    } else {
      // Fallback for long sentences without punctuation
      if (
        this.onSentence &&
        this.fullContent.length === this.currentSentence.length &&
        this.currentSentence.length > 50 &&
        this.currentSentence.match(/\s+$/)
      ) {
        await this.onSentence(this.currentSentence.trim(), this.fullContent);
        this.lastProcessedLength = this.fullContent.length;
        this.currentSentence = '';
      }
    }
  }

  async processRemaining(): Promise<void> {
    if (this.signal?.aborted) return;

    const trimmedSentence = this.currentSentence.trim();
    if (trimmedSentence.length > 0 && this.onSentence) {
      try {
        await this.onSentence(trimmedSentence, this.fullContent);
        this.lastProcessedLength = this.fullContent.length;
        this.currentSentence = '';
      } catch (err) {
        console.error('Error processing remaining sentence:', err);
      }
    }

    if (this.fullContent.length > this.lastProcessedLength) {
      const unprocessedText = this.fullContent
        .slice(this.lastProcessedLength)
        .trim();
      if (unprocessedText.length > 0 && this.onSentence) {
        try {
          await this.onSentence(unprocessedText, this.fullContent);
        } catch (err) {
          console.error('Error sending unprocessed text:', err);
        }
      }
    }
  }

  getFullContent(): string {
    return this.fullContent;
  }
}
