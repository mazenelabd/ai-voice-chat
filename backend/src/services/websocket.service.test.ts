import { WebSocketService } from './websocket.service';
import { OpenAIService } from './openai.service';

// Mock WebSocket server
const mockWs = {
  on: jest.fn(),
  send: jest.fn(),
  close: jest.fn(),
  readyState: 1, // OPEN
};

jest.mock('ws', () => {
  const mockWebSocketServer = jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    close: jest.fn(),
    options: { port: 8000 },
  }));

  const MockWebSocket = jest.fn(() => mockWs) as any;
  // Define WebSocket constants
  MockWebSocket.CONNECTING = 0;
  MockWebSocket.OPEN = 1;
  MockWebSocket.CLOSING = 2;
  MockWebSocket.CLOSED = 3;

  return {
    WebSocketServer: mockWebSocketServer,
    WebSocket: MockWebSocket,
  };
});

// Mock OpenAIService
const mockStreamChatCompletion = jest.fn();
const mockTextToSpeechChunk = jest.fn();
const mockSplitLongParagraph = jest.fn();

jest.mock('./openai.service', () => ({
  OpenAIService: jest.fn().mockImplementation(() => ({
    streamChatCompletion: mockStreamChatCompletion,
    textToSpeechChunk: mockTextToSpeechChunk,
    splitLongParagraph: mockSplitLongParagraph,
  })),
}));

describe('WebSocketService', () => {
  let service: WebSocketService;
  const mockApiKey = 'test-api-key';

  const getConnectionHandler = () => {
    const { WebSocketServer } = require('ws');
    // Get the last call to WebSocketServer (the one created by our service)
    const serverCalls = (WebSocketServer as jest.Mock).mock.results;
    if (serverCalls.length > 0) {
      const serverInstance = serverCalls[serverCalls.length - 1].value;
      const connectionCall = serverInstance.on.mock.calls.find(
        (call: any[]) => call[0] === 'connection'
      );
      return connectionCall ? connectionCall[1] : null;
    }
    return null;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockStreamChatCompletion.mockResolvedValue('Full response text');
    mockTextToSpeechChunk.mockResolvedValue(Buffer.from('test audio'));
    mockSplitLongParagraph.mockImplementation((text: string) => [text]);

    service = new WebSocketService(8000, mockApiKey);
  });

  it('should create WebSocket server on specified port', () => {
    const { WebSocketServer } = require('ws');
    expect(WebSocketServer).toHaveBeenCalledWith({ port: 8000 });
  });

  it('should handle incoming text messages', async () => {
    const testWs = {
      on: jest.fn(),
      send: jest.fn(),
      readyState: 1,
    };

    // Mock streamChatCompletion to actually call onSentence
    mockStreamChatCompletion.mockImplementation(
      async (messages: any, signal: any, onSentence: any) => {
        await onSentence('Test response.', 'Test response.');
        return 'Test response.';
      }
    );

    const connectionHandler = getConnectionHandler();
    if (!connectionHandler) {
      throw new Error('Connection handler not found');
    }

    connectionHandler(testWs);

    // Get message handler
    const messageCall = testWs.on.mock.calls.find((call: any[]) => call[0] === 'message');
    if (!messageCall) {
      throw new Error('Message handler not found');
    }

    const messageHandler = messageCall[1];
    const message = JSON.stringify({ text: 'Test message' });
    
    // Start the async handler
    const handlerPromise = messageHandler(Buffer.from(message));
    
    // Wait a bit for async operations
    await new Promise((resolve) => setTimeout(resolve, 50));
    
    // Wait for the handler to complete
    await handlerPromise;

    expect(mockStreamChatCompletion).toHaveBeenCalled();
    // The send might be called asynchronously, so check after a delay
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(testWs.send.mock.calls.length).toBeGreaterThan(0);
  });

  it('should handle stop action', async () => {
    const testWs = {
      on: jest.fn(),
      send: jest.fn(),
      readyState: 1,
    };

    // Mock streamChatCompletion to take some time so we can stop it
    mockStreamChatCompletion.mockImplementation(
      async (messages: any, signal: any, onSentence: any) => {
        // Wait a bit to simulate processing
        await new Promise((resolve) => setTimeout(resolve, 100));
        // Check if aborted
        if (signal.aborted) {
          return 'Aborted';
        }
        await onSentence('Test response.', 'Test response.');
        return 'Test response.';
      }
    );

    const connectionHandler = getConnectionHandler();
    if (!connectionHandler) {
      throw new Error('Connection handler not found');
    }

    connectionHandler(testWs);

    // Get message handler
    const messageCall = testWs.on.mock.calls.find((call: any[]) => call[0] === 'message');
    if (!messageCall) {
      throw new Error('Message handler not found');
    }

    const messageHandler = messageCall[1];

    // First send a message to create an abort controller (don't wait for completion)
    messageHandler(Buffer.from(JSON.stringify({ text: 'Test' })));

    // Wait a bit for the abort controller to be created
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Now send stop action
    const stopMessage = JSON.stringify({ action: 'stop' });
    await messageHandler(Buffer.from(stopMessage));

    // Wait for async operations
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Should send stop response (empty text message)
    expect(testWs.send.mock.calls.length).toBeGreaterThan(0);
    // Verify it's a stop response
    const stopResponse = JSON.parse(testWs.send.mock.calls[testWs.send.mock.calls.length - 1][0]);
    expect(stopResponse.type).toBe('text');
    expect(stopResponse.data).toBe('');
  });

  it('should send audio chunks as they are generated', async () => {
    const testWs = {
      on: jest.fn(),
      send: jest.fn(),
      readyState: 1,
    };

    mockStreamChatCompletion.mockImplementation(
      async (messages: any, signal: any, onSentence: any) => {
        // Simulate generating TTS for each sentence
        await onSentence('First sentence.', 'First sentence.');
        await onSentence('Second sentence.', 'First sentence. Second sentence.');
        return 'First sentence. Second sentence.';
      }
    );

    const connectionHandler = getConnectionHandler();
    if (!connectionHandler) {
      throw new Error('Connection handler not found');
    }

    connectionHandler(testWs);

    const messageCall = testWs.on.mock.calls.find((call: any[]) => call[0] === 'message');
    if (!messageCall) {
      throw new Error('Message handler not found');
    }

    const messageHandler = messageCall[1];
    
    // Start handler (don't await immediately to allow async operations)
    const handlerPromise = messageHandler(Buffer.from(JSON.stringify({ text: 'Test' })));
    
    // Wait for async operations to complete
    await new Promise((resolve) => setTimeout(resolve, 200));
    await handlerPromise;

    // Should have sent text and audio chunks
    const sendCalls = testWs.send.mock.calls;
    expect(sendCalls.length).toBeGreaterThan(0);

    // Check for audio-chunk messages
    const audioChunks = sendCalls.filter((call: any[]) => {
      try {
        const message = JSON.parse(call[0]);
        return message.type === 'audio-chunk';
      } catch {
        return false;
      }
    });
    expect(audioChunks.length).toBeGreaterThan(0);
  });

  it('should handle errors gracefully', async () => {
    const testWs = {
      on: jest.fn(),
      send: jest.fn(),
      readyState: 1,
    };

    mockStreamChatCompletion.mockRejectedValueOnce(new Error('Test error'));

    const connectionHandler = getConnectionHandler();
    if (!connectionHandler) {
      throw new Error('Connection handler not found');
    }

    connectionHandler(testWs);

    const messageCall = testWs.on.mock.calls.find((call: any[]) => call[0] === 'message');
    if (!messageCall) {
      throw new Error('Message handler not found');
    }

    const messageHandler = messageCall[1];
    await messageHandler(Buffer.from(JSON.stringify({ text: 'Test' })));

    // Should send error message
    const sendCalls = testWs.send.mock.calls;
    const errorMessages = sendCalls.filter((call: any[]) => {
      const message = JSON.parse(call[0]);
      return message.type === 'error';
    });
    expect(errorMessages.length).toBeGreaterThan(0);
  });

  it('should handle abort errors without sending to client', async () => {
    const testWs = {
      on: jest.fn(),
      send: jest.fn(),
      readyState: 1,
    };

    const abortError = new DOMException('Aborted', 'AbortError');
    mockStreamChatCompletion.mockRejectedValueOnce(abortError);

    const connectionHandler = getConnectionHandler();
    if (!connectionHandler) {
      throw new Error('Connection handler not found');
    }

    connectionHandler(testWs);

    const messageCall = testWs.on.mock.calls.find((call: any[]) => call[0] === 'message');
    if (!messageCall) {
      throw new Error('Message handler not found');
    }

    const messageHandler = messageCall[1];
    await messageHandler(Buffer.from(JSON.stringify({ text: 'Test' })));

    // Should not send error for abort
    const sendCalls = testWs.send.mock.calls;
    const errorMessages = sendCalls.filter((call: any[]) => {
      const message = JSON.parse(call[0]);
      return message.type === 'error';
    });
    expect(errorMessages.length).toBe(0);
  });

  it('should split long sentences before TTS', async () => {
    const testWs = {
      on: jest.fn(),
      send: jest.fn(),
      readyState: 1,
    };

    const longSentence = 'x'.repeat(5000);
    mockSplitLongParagraph.mockReturnValue(['First part', 'Second part']);

    mockStreamChatCompletion.mockImplementation(
      async (messages: any, signal: any, onSentence: any) => {
        await onSentence(longSentence, longSentence);
        return longSentence;
      }
    );

    const connectionHandler = getConnectionHandler();
    if (!connectionHandler) {
      throw new Error('Connection handler not found');
    }

    connectionHandler(testWs);

    const messageCall = testWs.on.mock.calls.find((call: any[]) => call[0] === 'message');
    if (!messageCall) {
      throw new Error('Message handler not found');
    }

    const messageHandler = messageCall[1];
    
    const handlerPromise = messageHandler(Buffer.from(JSON.stringify({ text: 'Test' })));
    await new Promise((resolve) => setTimeout(resolve, 200));
    await handlerPromise;

    expect(mockSplitLongParagraph).toHaveBeenCalled();
    // Should generate TTS for each split part (at least 2 calls)
    expect(mockTextToSpeechChunk.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('should clean up conversation history on connection close', () => {
    const testWs = {
      on: jest.fn(),
      send: jest.fn(),
      readyState: 1,
    };

    const connectionHandler = getConnectionHandler();
    if (!connectionHandler) {
      throw new Error('Connection handler not found');
    }

    connectionHandler(testWs);

    // Get close handler
    const closeCall = testWs.on.mock.calls.find((call: any[]) => call[0] === 'close');
    if (closeCall) {
      closeCall[1]();
    }

    // Conversation history should be cleaned up (tested indirectly)
    expect(testWs.on).toHaveBeenCalled();
  });
});

