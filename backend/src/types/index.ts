export interface WebSocketMessage {
  type: 'text' | 'error' | 'audio-chunk';
  data?: string; // Full text response (sent with first chunk)
  error?: string;
  audio?: string; // base64 encoded audio
  paragraph?: string; // The paragraph text being read (for highlighting)
  chunkIndex?: number; // for multi-chunk audio
  totalChunks?: number; // for multi-chunk audio
  isLastChunk?: boolean; // indicates if this is the last chunk
}

export interface ClientMessage {
  text?: string;
  action?: 'stop';
}

