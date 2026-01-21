'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useWebSocket, WebSocketMessage } from '../hooks/useWebSocket';
import { useChatMessages } from '../hooks/useChatMessages';
import { useAudioQueue } from '../hooks/useAudioQueue';
import { MessageList } from './MessageList';
import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';
import { ErrorDisplay } from './ErrorDisplay';
import { AudioChunk } from '../types/chat';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

export default function ChatInterface() {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    messages,
    currentMessageIndex,
    addUserMessage,
    updateAIMessage,
    startNewMessage,
    clearMessages,
    addErrorMessage,
    ensureAIMessageDisplayed,
  } = useChatMessages();

  const { currentPlayingParagraph, isPlaying: isAudioPlaying, addChunk, stopAudio } = useAudioQueue();

  const handleWebSocketMessage = useCallback(
    (message: WebSocketMessage) => {
      if (message.type === 'audio-chunk' && message.audio) {
        const audioData = `data:audio/mpeg;base64,${message.audio}`;
        const chunk: AudioChunk = {
          audio: audioData,
          chunkIndex: message.chunkIndex ?? 0,
          paragraph: message.paragraph,
        };

        if (message.chunkIndex === 0) {
          setIsLoading(false);
        }

        addChunk(chunk, () => {
          ensureAIMessageDisplayed();
        });
      }
    },
    [addChunk, ensureAIMessageDisplayed]
  );

  const { sendMessage, sendStop, isConnected, error, lastMessage, reconnect } = useWebSocket(
    WS_URL,
    handleWebSocketMessage
  );

  useEffect(() => {
    if (lastMessage) {
      if (lastMessage.type === 'error') {
        setIsLoading(false);
        addErrorMessage(lastMessage.error || 'Unknown error');
      } else if (lastMessage.type === 'text' && lastMessage.data) {
        updateAIMessage(lastMessage.data);
      } else if (lastMessage.type === 'audio-chunk' && lastMessage.chunkIndex === 0 && lastMessage.audio) {
        setIsLoading(false);
      }
    }
  }, [lastMessage, updateAIMessage, addErrorMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !isConnected || isLoading) return;

    addUserMessage(inputText);
    setIsLoading(true);
    startNewMessage();
    sendMessage(inputText);
    setInputText('');
  };

  const handleNewChat = () => {
    clearMessages();
    stopAudio();
    setIsLoading(false);
    setInputText('');
    reconnect();
  };

  const handleStop = () => {
    stopAudio();
    setIsLoading(false);
    sendStop();
  };

  return (
    <div className="flex h-screen items-center justify-center bg-white p-2 sm:p-4 md:p-6 dark:bg-slate-950 overflow-hidden">
      <Card className="w-full max-w-2xl lg:max-w-4xl xl:max-w-5xl h-full max-h-screen shadow-lg border-slate-200 dark:border-slate-800 flex flex-col">
        <ChatHeader
          isLoading={isLoading}
          onNewChat={handleNewChat}
        />
        <CardContent className="flex flex-col flex-1 min-h-0 space-y-3 sm:space-y-4 p-3 sm:p-6">
          {error && <ErrorDisplay error={error} />}

          <MessageList
            messages={messages}
            currentMessageIndex={currentMessageIndex}
            playingSentenceText={currentPlayingParagraph}
            isLoading={isLoading}
          />

          <ChatInput
            inputText={inputText}
            onInputChange={setInputText}
            onSubmit={handleSubmit}
            onStop={handleStop}
            isConnected={isConnected}
            isLoading={isLoading}
            isAudioPlaying={isAudioPlaying}
          />
        </CardContent>
      </Card>
    </div>
  );
}
