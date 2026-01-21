import OpenAI from 'openai';
import { TextProcessing } from '../utils/textProcessing';
import { OPENAI_CONFIG } from '../constants/openai.constants';
import { ERROR_MESSAGES } from '../constants/errors.constants';
import { StreamProcessor } from '../utils/stream-processor';
import { ErrorHandler } from '../utils/error-handler';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class OpenAIService {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  splitTextIntoParagraphs(text: string): string[] {
    return TextProcessing.splitTextIntoParagraphs(text);
  }

  splitLongParagraph(text: string, maxLength: number = OPENAI_CONFIG.MAX_SENTENCE_LENGTH): string[] {
    return TextProcessing.splitLongParagraph(text, maxLength);
  }

  async streamChatCompletion(
    messages: ChatMessage[],
    signal?: AbortSignal,
    onSentence?: (sentence: string, fullText: string) => Promise<void>
  ): Promise<string> {
    try {
      const stream = await this.client.chat.completions.create(
        {
          model: OPENAI_CONFIG.CHAT_MODEL,
          messages: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          max_tokens: OPENAI_CONFIG.MAX_TOKENS,
          stream: true,
        },
        { signal }
      );

      const processor = onSentence
        ? new StreamProcessor(onSentence, signal)
        : null;

      try {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content && processor) {
            await processor.processChunk(content);
          }
        }
      } catch (error) {
        if (ErrorHandler.isAbortError(error)) {
          throw new DOMException('Aborted', 'AbortError');
        }
        throw error;
      }

      if (!signal?.aborted && processor) {
        await processor.processRemaining();
      }

      return processor ? processor.getFullContent() : '';
    } catch (error) {
      if (ErrorHandler.isAbortError(error)) {
        throw new DOMException('Aborted', 'AbortError');
      }
      if (error instanceof Error) {
        throw new Error(ERROR_MESSAGES.OPENAI_CHAT_ERROR(error.message));
      }
      throw new Error(ERROR_MESSAGES.UNKNOWN_CHAT_ERROR);
    }
  }

  async getChatCompletion(
    messages: ChatMessage[],
    maxRetries: number = 1,
    continuationCount: number = 0
  ): Promise<{ content: string; assistantMessage: ChatMessage }> {
    try {
      const response = await this.client.chat.completions.create({
        model: OPENAI_CONFIG.CHAT_MODEL,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        max_tokens: OPENAI_CONFIG.MAX_TOKENS,
      });

      const choice = response.choices[0];
      let content = choice?.message?.content;
      if (!content) {
        throw new Error(ERROR_MESSAGES.NO_RESPONSE_CONTENT);
      }

      if (choice?.finish_reason === 'length' && maxRetries > 0) {
        const newContinuationCount = continuationCount + 1;

        if (newContinuationCount >= OPENAI_CONFIG.MAX_CONTINUATION_COUNT) {
          const stopMessage =
            '\n\n[I stopped here to avoid overwhelming you with too much information. Would you like me to continue?]';
          content = content.trim() + stopMessage;
        } else {
          const continuationMessages: ChatMessage[] = [
            ...messages,
            {
              role: 'assistant',
              content: content,
            },
            {
              role: 'user',
              content:
                'Please continue your previous response from where you left off. Complete your thought, but remember to conclude naturally before hitting the token limit.',
            },
          ];

          try {
            const continuation = await this.getChatCompletion(
              continuationMessages,
              maxRetries - 1,
              newContinuationCount
            );

            content = content.trim() + ' ' + continuation.content.trim();
          } catch (continuationError) {
            if (newContinuationCount >= 1) {
              const stopMessage =
                '\n\n[I stopped here to avoid overwhelming you with too much information. Would you like me to continue?]';
              content = content.trim() + stopMessage;
            }
          }
        }
      }

      if (!TextProcessing.isResponseComplete(content)) {
        console.warn('Response may still be incomplete (does not end with proper punctuation).');
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content,
      };

      return { content, assistantMessage };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(ERROR_MESSAGES.OPENAI_CHAT_ERROR(error.message));
      }
      throw new Error(ERROR_MESSAGES.UNKNOWN_CHAT_ERROR);
    }
  }

  async textToSpeech(text: string): Promise<Buffer> {
    const paragraphs = this.splitTextIntoParagraphs(text);
    if (paragraphs.length === 0) {
      throw new Error(ERROR_MESSAGES.TEXT_EMPTY);
    }
    return this.textToSpeechChunk(paragraphs[0]);
  }

  async textToSpeechChunk(text: string): Promise<Buffer> {
    if (text.length > OPENAI_CONFIG.TTS_MAX_CHARS) {
      throw new Error(ERROR_MESSAGES.TTS_CHUNK_EXCEEDS_LIMIT(text.length));
    }

    try {
      const response = await this.client.audio.speech.create({
        model: OPENAI_CONFIG.TTS_MODEL,
        voice: OPENAI_CONFIG.TTS_VOICE,
        input: text,
      });

      const buffer = Buffer.from(await response.arrayBuffer());
      return buffer;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(ERROR_MESSAGES.OPENAI_TTS_ERROR(error.message));
      }
      throw new Error(ERROR_MESSAGES.UNKNOWN_TTS_ERROR);
    }
  }

  async textToSpeechParagraphs(
    text: string
  ): Promise<Array<{ audio: Buffer; paragraph: string; index: number }>> {
    const paragraphs = this.splitTextIntoParagraphs(text);
    if (paragraphs.length === 0) {
      throw new Error(ERROR_MESSAGES.TEXT_EMPTY);
    }

    const results: Array<{ audio: Buffer; paragraph: string; index: number }> = [];

    for (let i = 0; i < paragraphs.length; i++) {
      const paragraph = paragraphs[i];
      if (!paragraph.trim()) continue;

      try {
        let paragraphChunks: string[];
        if (paragraph.length > OPENAI_CONFIG.MAX_SENTENCE_LENGTH) {
          paragraphChunks = this.splitLongParagraph(paragraph);
        } else {
          paragraphChunks = [paragraph];
        }

        for (const chunk of paragraphChunks) {
          const buffer = await this.textToSpeechChunk(chunk);
          results.push({
            audio: buffer,
            paragraph: chunk,
            index: results.length,
          });
        }
      } catch (error) {
        console.error(`Error generating TTS for paragraph ${i + 1}:`, error);
        throw error;
      }
    }

    return results;
  }

  async textToSpeechChunks(text: string): Promise<Buffer[]> {
    const results = await this.textToSpeechParagraphs(text);
    return results.map((r) => r.audio);
  }
}

