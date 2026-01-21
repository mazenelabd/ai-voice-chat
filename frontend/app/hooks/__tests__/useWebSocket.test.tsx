import { renderHook, waitFor, act } from '@testing-library/react';
import { useWebSocket } from '../useWebSocket';

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.CONNECTING;
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onclose: (() => void) | null = null;

  constructor(public url: string) {
    // Simulate connection after a short delay
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
    }, 10);
  }

  send(data: string) {
    // Simulate receiving a response
    setTimeout(() => {
      if (this.onmessage) {
        this.onmessage(
          new MessageEvent('message', {
            data: JSON.stringify({ type: 'text', data: 'test' }),
          })
        );
      }
    }, 10);
  }

  close() {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) {
      this.onclose();
    }
  }
}

(global as any).WebSocket = MockWebSocket as any;

describe('useWebSocket', () => {
  let mockWs: any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    mockWs = {
      readyState: MockWebSocket.CONNECTING,
      send: jest.fn(),
      close: jest.fn(),
      onopen: null,
      onmessage: null,
      onerror: null,
      onclose: null,
    };
    
    const WebSocketMock = jest.fn((url: string) => {
      mockWs.url = url;
      setTimeout(() => {
        mockWs.readyState = MockWebSocket.OPEN;
        if (mockWs.onopen) {
          mockWs.onopen(new Event('open'));
        }
      }, 10);
      return mockWs;
    }) as any;
    
    // Set static properties on the mock
    WebSocketMock.CONNECTING = MockWebSocket.CONNECTING;
    WebSocketMock.OPEN = MockWebSocket.OPEN;
    WebSocketMock.CLOSING = MockWebSocket.CLOSING;
    WebSocketMock.CLOSED = MockWebSocket.CLOSED;
    
    (global as any).WebSocket = WebSocketMock;
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should connect to WebSocket', async () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost:8000'));

    act(() => {
      jest.advanceTimersByTime(20);
    });
    
    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });
  });

  it('should send messages when connected', async () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost:8000'));

    act(() => {
      jest.advanceTimersByTime(20);
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
      expect(mockWs.readyState).toBe(MockWebSocket.OPEN);
    });

    act(() => {
      result.current.sendMessage('test message');
    });

    expect(mockWs.send).toHaveBeenCalledWith(JSON.stringify({ text: 'test message' }));
  });

  it('should send stop action', async () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost:8000'));

    act(() => {
      jest.advanceTimersByTime(20);
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
      expect(mockWs.readyState).toBe(MockWebSocket.OPEN);
    });

    act(() => {
      result.current.sendStop();
    });

    expect(mockWs.send).toHaveBeenCalledWith(JSON.stringify({ action: 'stop' }));
  });

  it('should handle message callback', async () => {
    const onMessageCallback = jest.fn();
    const { result } = renderHook(() => useWebSocket('ws://localhost:8000', onMessageCallback));

    act(() => {
      jest.advanceTimersByTime(20);
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    const testMessage = { type: 'text', data: 'Test message' };
    act(() => {
      if (mockWs.onmessage) {
        mockWs.onmessage(new MessageEvent('message', {
          data: JSON.stringify(testMessage),
        }));
      }
    });

    expect(onMessageCallback).toHaveBeenCalledWith(testMessage);
  });

  it('should reconnect when reconnect is called', async () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost:8000'));

    act(() => {
      jest.advanceTimersByTime(20);
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    act(() => {
      result.current.reconnect();
    });

    expect(mockWs.close).toHaveBeenCalled();
    
    act(() => {
      jest.advanceTimersByTime(150);
    });
    
    // Should create a new connection
    expect((global as any).WebSocket).toHaveBeenCalledTimes(2);
  });

  it('should handle errors', async () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost:8000'));

    act(() => {
      jest.advanceTimersByTime(20);
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    act(() => {
      if (mockWs.onerror) {
        mockWs.onerror(new Event('error'));
      }
    });

    expect(result.current.error).toBe('WebSocket connection error');
  });

  it('should handle audio-chunk messages', async () => {
    const onMessageCallback = jest.fn();
    const { result } = renderHook(() => useWebSocket('ws://localhost:8000', onMessageCallback));

    act(() => {
      jest.advanceTimersByTime(20);
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    const audioMessage = {
      type: 'audio-chunk',
      audio: 'base64audio',
      chunkIndex: 0,
      paragraph: 'Test sentence',
    };

    act(() => {
      if (mockWs.onmessage) {
        mockWs.onmessage(new MessageEvent('message', {
          data: JSON.stringify(audioMessage),
        }));
      }
    });

    expect(onMessageCallback).toHaveBeenCalledWith(audioMessage);
  });
});

