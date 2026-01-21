import { WebSocketMessage } from '../types';
import { WEBSOCKET_CONFIG } from '../constants/websocket.constants';

/**
 * Utility functions for building WebSocket response messages
 */
export class ResponseBuilder {
  static createTextResponse(
    fullText: string,
    paragraph: string
  ): WebSocketMessage {
    return {
      type: 'text',
      data: fullText,
      paragraph,
    };
  }

  static createAudioChunkResponse(
    audioBase64: string,
    paragraph: string,
    chunkIndex: number
  ): WebSocketMessage {
    return {
      type: 'audio-chunk',
      audio: audioBase64,
      paragraph,
      chunkIndex,
      totalChunks: WEBSOCKET_CONFIG.PLACEHOLDER_TOTAL_CHUNKS,
      isLastChunk: false,
    };
  }

  static createFinalAudioChunkResponse(
    chunkIndex: number,
    totalChunks: number
  ): WebSocketMessage {
    return {
      type: 'audio-chunk',
      chunkIndex,
      totalChunks,
      isLastChunk: true,
    };
  }

  static createStopResponse(): WebSocketMessage {
    return {
      type: 'text',
      data: '',
    };
  }

  static createErrorResponse(errorMessage: string): WebSocketMessage {
    return {
      type: 'error',
      error: errorMessage,
    };
  }
}
