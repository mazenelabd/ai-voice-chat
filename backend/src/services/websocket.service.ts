import { WebSocket, WebSocketServer } from 'ws';
import { OpenAIService, ChatMessage } from './openai.service';
import { ClientMessage } from '../types';
import { SYSTEM_MESSAGE } from '../constants/system.constants';
import { WEBSOCKET_CONFIG } from '../constants/websocket.constants';
import { ERROR_MESSAGES } from '../constants/errors.constants';
import { ResponseBuilder } from '../utils/response-builder';
import { ErrorHandler } from '../utils/error-handler';

export class WebSocketService {
  private wss: WebSocketServer;
  private openaiService: OpenAIService;
  private conversationHistory: Map<WebSocket, ChatMessage[]>;
  private abortControllers: Map<WebSocket, AbortController>;

  constructor(port: number, openaiApiKey: string) {
    this.wss = new WebSocketServer({ port });
    this.openaiService = new OpenAIService(openaiApiKey);
    this.conversationHistory = new Map();
    this.abortControllers = new Map();
    this.setupServer();
  }

  private setupServer(): void {
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('New WebSocket connection established');
      this.conversationHistory.set(ws, [
        {
          role: 'system',
          content: SYSTEM_MESSAGE.CONTENT,
        },
      ]);

      ws.on('message', async (data: Buffer) => {
        try {
          const message: ClientMessage = JSON.parse(data.toString());
          await this.handleMessage(ws, message);
        } catch {
          this.sendError(ws, ERROR_MESSAGES.INVALID_MESSAGE_FORMAT);
        }
      });

      ws.on('error', (err: Error) => {
        console.error('WebSocket error:', err);
      });

      ws.on('close', () => {
        console.log('WebSocket connection closed');
        this.conversationHistory.delete(ws);
        this.abortControllers.delete(ws);
      });
    });

    console.log(`WebSocket server listening on port ${this.wss.options.port}`);
  }

  private async handleMessage(
    ws: WebSocket,
    message: ClientMessage
  ): Promise<void> {
    if (message.action === 'stop') {
      const abortController = this.abortControllers.get(ws);
      if (abortController) {
        console.log('Stop requested by client');
        abortController.abort();
        this.abortControllers.delete(ws);

        const stopResponse = ResponseBuilder.createStopResponse();
        ws.send(JSON.stringify(stopResponse));
      }
      return;
    }

    if (!message.text || typeof message.text !== 'string') {
      this.sendError(ws, ERROR_MESSAGES.INVALID_MESSAGE_TEXT);
      return;
    }

    const abortController = new AbortController();
    this.abortControllers.set(ws, abortController);

    try {
      const history = this.conversationHistory.get(ws) || [];

      const userMessage: ChatMessage = {
        role: 'user',
        content: message.text,
      };
      history.push(userMessage);

      let chunkIndex = 0;

      const fullResponse = await this.openaiService.streamChatCompletion(
        history,
        abortController.signal,
        async (sentence: string, fullText: string) => {
          if (abortController.signal.aborted) {
            return;
          }

          try {
            let sentenceChunks: string[];
            if (sentence.length > WEBSOCKET_CONFIG.MAX_SENTENCE_LENGTH) {
              sentenceChunks = this.openaiService.splitLongParagraph(sentence);
            } else {
              sentenceChunks = [sentence];
            }

            for (const chunkText of sentenceChunks) {
              if (abortController.signal.aborted) {
                return;
              }

              const audioBuffer =
                await this.openaiService.textToSpeechChunk(chunkText);

              if (abortController.signal.aborted) {
                return;
              }

              const audioBase64 = audioBuffer.toString('base64');

              if (
                abortController.signal.aborted ||
                ws.readyState !== WebSocket.OPEN
              ) {
                return;
              }

              const textResponse = ResponseBuilder.createTextResponse(
                fullText,
                chunkText
              );
              ws.send(JSON.stringify(textResponse));

              if (
                abortController.signal.aborted ||
                ws.readyState !== WebSocket.OPEN
              ) {
                return;
              }

              const audioResponse = ResponseBuilder.createAudioChunkResponse(
                audioBase64,
                chunkText,
                chunkIndex
              );
              ws.send(JSON.stringify(audioResponse));

              chunkIndex++;
            }
          } catch (error) {
            if (abortController.signal.aborted) {
              return;
            }
            console.error('Error processing sentence:', error);
          }
        }
      );

      if (abortController.signal.aborted) {
        return;
      }

      if (
        chunkIndex > 0 &&
        !abortController.signal.aborted &&
        ws.readyState === WebSocket.OPEN
      ) {
        const finalResponse = ResponseBuilder.createFinalAudioChunkResponse(
          chunkIndex - 1,
          chunkIndex
        );
        ws.send(JSON.stringify(finalResponse));
      }

      this.abortControllers.delete(ws);

      if (!abortController.signal.aborted && fullResponse) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: fullResponse,
        };
        history.push(assistantMessage);
      }

      const systemMessage = history[0];
      const recentMessages = history
        .slice(1)
        .slice(-WEBSOCKET_CONFIG.HISTORY_LIMIT);
      const limitedHistory = systemMessage
        ? [systemMessage, ...recentMessages]
        : recentMessages;
      this.conversationHistory.set(ws, limitedHistory);
    } catch (error) {
      this.abortControllers.delete(ws);

      if (ErrorHandler.isAbortError(error)) {
        return;
      }

      const errorMessage = ErrorHandler.getErrorMessage(
        error,
        ERROR_MESSAGES.UNKNOWN_ERROR
      );
      console.error('Error processing message:', errorMessage);
      this.sendError(ws, errorMessage);
    }
  }

  private sendError(ws: WebSocket, errorMessage: string): void {
    const errorResponse = ResponseBuilder.createErrorResponse(errorMessage);
    ws.send(JSON.stringify(errorResponse));
  }

  public close(): void {
    this.wss.close();
  }
}
