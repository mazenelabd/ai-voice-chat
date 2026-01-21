import { renderHook, act } from '@testing-library/react';
import { useChatMessages } from '../useChatMessages';

describe('useChatMessages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with empty messages', () => {
    const { result } = renderHook(() => useChatMessages());
    expect(result.current.messages).toEqual([]);
    expect(result.current.currentMessageIndex).toBeNull();
  });

  it('should add user message', () => {
    const { result } = renderHook(() => useChatMessages());

    act(() => {
      result.current.addUserMessage('Hello');
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].text).toBe('Hello');
    expect(result.current.messages[0].isUser).toBe(true);
  });

  it('should create new AI message on first update', () => {
    const { result } = renderHook(() => useChatMessages());

    act(() => {
      result.current.updateAIMessage('AI response');
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].text).toBe('AI response');
    expect(result.current.messages[0].isUser).toBe(false);
    expect(result.current.messages[0].sentences).toBeDefined();
    expect(result.current.currentMessageIndex).toBe(0);
  });

  it('should update existing AI message on subsequent updates', () => {
    const { result } = renderHook(() => useChatMessages());

    act(() => {
      result.current.updateAIMessage('First part');
    });

    act(() => {
      result.current.updateAIMessage('First part. Second part.');
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].text).toBe('First part. Second part.');
    expect(result.current.currentMessageIndex).toBe(0);
  });

  it('should split text into sentences', () => {
    const { result } = renderHook(() => useChatMessages());

    act(() => {
      result.current.updateAIMessage('First sentence. Second sentence! Third sentence?');
    });

    expect(result.current.messages[0].sentences).toHaveLength(3);
  });

  it('should start new message after startNewMessage', () => {
    const { result } = renderHook(() => useChatMessages());

    act(() => {
      result.current.updateAIMessage('First message');
    });

    act(() => {
      result.current.startNewMessage();
    });

    act(() => {
      result.current.updateAIMessage('Second message');
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.currentMessageIndex).toBe(1);
  });

  it('should add error message', () => {
    const { result } = renderHook(() => useChatMessages());

    act(() => {
      result.current.addErrorMessage('Connection failed');
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].text).toBe('Error: Connection failed');
    expect(result.current.messages[0].isUser).toBe(false);
  });

  it('should clear all messages', () => {
    const { result } = renderHook(() => useChatMessages());

    act(() => {
      result.current.addUserMessage('Hello');
      result.current.updateAIMessage('Response');
    });

    expect(result.current.messages).toHaveLength(2);

    act(() => {
      result.current.clearMessages();
    });

    expect(result.current.messages).toHaveLength(0);
    expect(result.current.currentMessageIndex).toBeNull();
  });

  it('should ensure AI message is displayed', () => {
    const { result } = renderHook(() => useChatMessages());

    act(() => {
      result.current.startNewMessage();
    });

    // Manually set text in ref (simulating accumulation)
    const text = 'Some accumulated text';
    act(() => {
      // Simulate text accumulation
      result.current.updateAIMessage(text);
      result.current.startNewMessage();
      result.current.ensureAIMessageDisplayed();
    });

    expect(result.current.messages.length).toBeGreaterThan(0);
  });
});

