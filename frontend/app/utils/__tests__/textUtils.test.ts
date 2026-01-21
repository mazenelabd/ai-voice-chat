import { splitIntoSentences, isSentenceHighlighted } from '../textUtils';

describe('textUtils', () => {
  describe('splitIntoSentences', () => {
    it('should split text by sentence-ending punctuation', () => {
      const text = 'First sentence. Second sentence! Third sentence?';
      const result = splitIntoSentences(text);
      expect(result).toHaveLength(3);
      expect(result[0].trim()).toBe('First sentence.');
      expect(result[1].trim()).toBe('Second sentence!');
      expect(result[2].trim()).toBe('Third sentence?');
    });

    it('should handle text with no punctuation', () => {
      const text = 'No punctuation here';
      const result = splitIntoSentences(text);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(text);
    });

    it('should preserve newlines in sentences', () => {
      const text = 'First sentence.\n\nSecond sentence.';
      const result = splitIntoSentences(text);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle empty text', () => {
      const text = '';
      const result = splitIntoSentences(text);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(text);
    });

    it('should handle multiple punctuation marks', () => {
      const text = 'First sentence... Second sentence!!!';
      const result = splitIntoSentences(text);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('isSentenceHighlighted', () => {
    it('should return true for exact match', () => {
      const result = isSentenceHighlighted('Hello world.', 'Hello world.');
      expect(result).toBe(true);
    });

    it('should return true for case-insensitive match', () => {
      const result = isSentenceHighlighted('Hello world.', 'HELLO WORLD.');
      expect(result).toBe(true);
    });

    it('should return true when sentence contains playing text', () => {
      const result = isSentenceHighlighted(
        'This is a long sentence.',
        'long sentence'
      );
      expect(result).toBe(true);
    });

    it('should return true when playing text contains sentence', () => {
      const result = isSentenceHighlighted(
        'Long sentence here.',
        'This is a long sentence here with more text.'
      );
      expect(result).toBe(true);
    });

    it('should return true for word-based matching', () => {
      const result = isSentenceHighlighted(
        'This is a test sentence with multiple words.',
        'test sentence multiple'
      );
      expect(result).toBe(true);
    });

    it('should return false for no match', () => {
      const result = isSentenceHighlighted(
        'First sentence.',
        'Second sentence.'
      );
      expect(result).toBe(false);
    });

    it('should return false when playingSentenceText is null', () => {
      const result = isSentenceHighlighted('Hello world.', null);
      expect(result).toBe(false);
    });

    it('should handle punctuation differences', () => {
      const result = isSentenceHighlighted('Hello world.', 'Hello world');
      expect(result).toBe(true);
    });
  });
});
