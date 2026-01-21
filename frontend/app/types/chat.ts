export interface ChatMessage {
  text: string;
  isUser: boolean;
  timestamp: Date;
  sentences?: string[];
}

export interface AudioChunk {
  audio: string;
  chunkIndex?: number;
  paragraph?: string;
}
