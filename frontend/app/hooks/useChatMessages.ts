import { useState, useRef, useCallback } from 'react';
import { ChatMessage } from '../types/chat';
import { splitIntoSentences } from '../utils/textUtils';

interface UseChatMessagesReturn {
  messages: ChatMessage[];
  currentMessageIndex: number | null;
  addUserMessage: (text: string) => void;
  updateAIMessage: (text: string) => void;
  startNewMessage: () => void;
  clearMessages: () => void;
  addErrorMessage: (error: string) => void;
  ensureAIMessageDisplayed: () => void;
}

export function useChatMessages(): UseChatMessagesReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState<number | null>(
    null
  );
  const currentMessageIndexRef = useRef<number | null>(null);
  const isAccumulatingTextRef = useRef(false);
  const currentTextRef = useRef<string>('');

  const addUserMessage = useCallback((text: string) => {
    setMessages((prev) => [
      ...prev,
      { text, isUser: true, timestamp: new Date() },
    ]);
  }, []);

  const updateAIMessage = useCallback((text: string) => {
    currentTextRef.current = text;
    const sentences = splitIntoSentences(text);

    if (!isAccumulatingTextRef.current) {
      isAccumulatingTextRef.current = true;
      setMessages((prev) => {
        const newIndex = prev.length;
        currentMessageIndexRef.current = newIndex;
        setCurrentMessageIndex(newIndex);
        return [
          ...prev,
          {
            text,
            isUser: false,
            timestamp: new Date(),
            sentences,
          },
        ];
      });
    } else {
      setMessages((prev) => {
        if (currentMessageIndexRef.current !== null) {
          const updated = [...prev];
          const msgIndex = currentMessageIndexRef.current;
          if (updated[msgIndex]) {
            updated[msgIndex] = {
              ...updated[msgIndex],
              text,
              sentences,
            };
          }
          return updated;
        }
        return prev;
      });
    }
  }, []);

  const startNewMessage = useCallback(() => {
    isAccumulatingTextRef.current = false;
    currentTextRef.current = '';
    setCurrentMessageIndex(null);
  }, []);

  const addErrorMessage = useCallback((error: string) => {
    setMessages((prev) => [
      ...prev,
      {
        text: `Error: ${error}`,
        isUser: false,
        timestamp: new Date(),
      },
    ]);
  }, []);

  const ensureAIMessageDisplayed = useCallback(() => {
    const text = currentTextRef.current;
    if (!isAccumulatingTextRef.current && text) {
      const sentences = splitIntoSentences(text);
      setMessages((prev) => {
        const newIndex = prev.length;
        currentMessageIndexRef.current = newIndex;
        setCurrentMessageIndex(newIndex);
        isAccumulatingTextRef.current = true;
        return [
          ...prev,
          {
            text,
            isUser: false,
            timestamp: new Date(),
            sentences,
          },
        ];
      });
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    currentMessageIndexRef.current = null;
    setCurrentMessageIndex(null);
    isAccumulatingTextRef.current = false;
    currentTextRef.current = '';
  }, []);

  return {
    messages,
    currentMessageIndex,
    addUserMessage,
    updateAIMessage,
    startNewMessage,
    clearMessages,
    addErrorMessage,
    ensureAIMessageDisplayed,
  };
}
