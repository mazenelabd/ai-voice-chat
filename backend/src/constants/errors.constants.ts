export const ERROR_MESSAGES = {
  INVALID_MESSAGE_FORMAT: 'Invalid message format',
  INVALID_MESSAGE_TEXT: 'Invalid message: text field is required',
  NO_RESPONSE_CONTENT: 'No response content from OpenAI',
  TEXT_EMPTY: 'Text is empty',
  TTS_CHUNK_EXCEEDS_LIMIT: (length: number) =>
    `Text chunk exceeds TTS limit: ${length} characters (max 4096)`,
  OPENAI_CHAT_ERROR: (message: string) =>
    `OpenAI Chat Completion error: ${message}`,
  OPENAI_TTS_ERROR: (message: string) => `OpenAI TTS error: ${message}`,
  UNKNOWN_CHAT_ERROR: 'Unknown error in OpenAI Chat Completion',
  UNKNOWN_TTS_ERROR: 'Unknown error in OpenAI TTS',
  UNKNOWN_ERROR: 'Unknown error occurred',
} as const;
