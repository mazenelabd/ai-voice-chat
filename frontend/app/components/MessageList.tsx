'use client';

import { ChatMessage } from '../types/chat';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  messages: ChatMessage[];
  currentMessageIndex: number | null;
  playingSentenceText: string | null;
  isLoading: boolean;
}

export function MessageList({
  messages,
  currentMessageIndex,
  playingSentenceText,
  isLoading,
}: MessageListProps) {
  return (
    <div className="flex-1 min-h-0 space-y-3 sm:space-y-4 overflow-y-auto rounded-lg border border-slate-200 bg-white p-3 sm:p-4 lg:p-6 dark:border-slate-800 dark:bg-slate-900">
      {messages.length === 0 ? (
        <div className="flex h-full items-center justify-center text-muted-foreground text-sm sm:text-base lg:text-lg px-4 text-center">
          Start a conversation by typing a message below
        </div>
      ) : (
        messages.map((message, index) => {
          const isCurrentMessage = currentMessageIndex === index;
          const activePlayingText = isCurrentMessage
            ? playingSentenceText
            : null;

          return (
            <div
              key={index}
              className={`flex ${
                message.isUser ? 'justify-end' : 'justify-start'
              }`}
            >
              <MessageBubble
                message={message}
                playingSentenceText={activePlayingText}
              />
            </div>
          );
        })
      )}
      {isLoading && (
        <div className="flex justify-start">
          <div className="rounded-lg bg-slate-50 px-4 sm:px-5 py-3 dark:bg-slate-800">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-slate-400" />
              <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-slate-400 [animation-delay:0.2s]" />
              <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-slate-400 [animation-delay:0.4s]" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
