import { OpenAIService } from './openai.service';

// Mock OpenAI client
const mockStream = {
  [Symbol.asyncIterator]: async function* () {
    yield { choices: [{ delta: { content: 'First ' } }] };
    yield { choices: [{ delta: { content: 'sentence. ' } }] };
    yield { choices: [{ delta: { content: 'Second ' } }] };
    yield { choices: [{ delta: { content: 'sentence.' } }] };
  },
};

const mockCreate = jest.fn().mockResolvedValue(mockStream);
const mockArrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(8));

jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate,
        },
      },
      audio: {
        speech: {
          create: jest.fn().mockResolvedValue({
            arrayBuffer: mockArrayBuffer,
          }),
        },
      },
    })),
  };
});

describe('OpenAIService', () => {
  let service: OpenAIService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new OpenAIService('test-api-key');
  });

  describe('getChatCompletion', () => {
    it('should return text response from OpenAI', async () => {
      // Mock non-streaming response
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: 'Test response from LLM',
            },
          },
        ],
      });

      const messages = [{ role: 'user' as const, content: 'Test prompt' }];
      const result = await service.getChatCompletion(messages);
      expect(result.content).toBe('Test response from LLM');
      expect(result.assistantMessage.role).toBe('assistant');
      expect(result.assistantMessage.content).toBe('Test response from LLM');
    });

    it('should throw error when response has no content', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: {} }],
      });

      const messages = [{ role: 'user' as const, content: 'Test prompt' }];
      await expect(
        service.getChatCompletion(messages)
      ).rejects.toThrow('No response content from OpenAI');
    });
  });

  describe('streamChatCompletion', () => {
    it('should stream chat completion and call onSentence for each sentence', async () => {
      const messages = [{ role: 'user' as const, content: 'Test prompt' }];
      const onSentence = jest.fn().mockResolvedValue(undefined);

      const result = await service.streamChatCompletion(messages, undefined, onSentence);

      expect(result).toBe('First sentence. Second sentence.');
      expect(onSentence).toHaveBeenCalledTimes(2);
      expect(onSentence).toHaveBeenNthCalledWith(1, 'First sentence.', 'First sentence. ');
      expect(onSentence).toHaveBeenNthCalledWith(
        2,
        'Second sentence.',
        'First sentence. Second sentence.'
      );
    });

    it('should handle abort signal', async () => {
      const messages = [{ role: 'user' as const, content: 'Test prompt' }];
      const abortController = new AbortController();
      const onSentence = jest.fn().mockResolvedValue(undefined);

      // Abort after first sentence
      const promise = service.streamChatCompletion(
        messages,
        abortController.signal,
        async (sentence) => {
          if (sentence.includes('First')) {
            abortController.abort();
          }
          await onSentence(sentence);
        }
      );

      await expect(promise).rejects.toThrow();
    });

    it('should process remaining text after stream ends', async () => {
      const incompleteStream = {
        [Symbol.asyncIterator]: async function* () {
          yield { choices: [{ delta: { content: 'Incomplete ' } }] };
          yield { choices: [{ delta: { content: 'sentence' } }] };
        },
      };

      mockCreate.mockResolvedValueOnce(incompleteStream);

      const messages = [{ role: 'user' as const, content: 'Test prompt' }];
      const onSentence = jest.fn().mockResolvedValue(undefined);

      const result = await service.streamChatCompletion(messages, undefined, onSentence);

      expect(result).toBe('Incomplete sentence');
      // Should process remaining text even without punctuation
      expect(onSentence).toHaveBeenCalled();
    });
  });

  describe('textToSpeechChunk', () => {
    it('should return audio buffer for text chunk', async () => {
      const result = await service.textToSpeechChunk('Test text');
      expect(result).toBeInstanceOf(Buffer);
      expect(mockArrayBuffer).toHaveBeenCalled();
    });
  });

  describe('splitTextIntoParagraphs', () => {
    it('should split text by paragraphs', () => {
      const text = 'First paragraph.\n\nSecond paragraph.';
      const result = service.splitTextIntoParagraphs(text);
      expect(result).toHaveLength(2);
      expect(result[0]).toBe('First paragraph.');
      expect(result[1]).toBe('Second paragraph.');
    });

    it('should handle single paragraph', () => {
      const text = 'Single paragraph text.';
      const result = service.splitTextIntoParagraphs(text);
      expect(result).toHaveLength(1);
    });
  });

  describe('splitLongParagraph', () => {
    it('should split long paragraphs at sentence boundaries', () => {
      const longText = 'First sentence. Second sentence. Third sentence.';
      const result = service.splitLongParagraph(longText, 20);
      expect(result.length).toBeGreaterThan(1);
      expect(result.every((chunk) => chunk.length <= 20)).toBe(true);
    });

    it('should preserve sentence boundaries when possible', () => {
      const text = 'Short. ' + 'x'.repeat(100) + '. End.';
      const result = service.splitLongParagraph(text, 50);
      // Should try to split at sentence boundaries
      expect(result.length).toBeGreaterThan(1);
    });
  });
});

