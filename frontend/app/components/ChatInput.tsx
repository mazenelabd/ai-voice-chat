'use client';

import { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Square } from 'lucide-react';

interface ChatInputProps {
  inputText: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onStop: () => void;
  isConnected: boolean;
  isLoading: boolean;
  isAudioPlaying: boolean;
}

export function ChatInput({
  inputText,
  onInputChange,
  onSubmit,
  onStop,
  isConnected,
  isLoading,
  isAudioPlaying,
}: ChatInputProps) {
  const canStop = isLoading || isAudioPlaying;
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Textarea
        value={inputText}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={(e) => {
          // Submit form on Enter (without Shift), allow Shift+Enter for new line
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (inputText.trim() && isConnected && !isLoading) {
              onSubmit(e as any);
            }
          }
        }}
        placeholder="Type your message here..."
        rows={3}
        disabled={!isConnected || isLoading}
        className="resize-none text-sm sm:text-base"
      />
      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={!inputText.trim() || !isConnected || isLoading}
          className="flex-1 h-10 sm:h-11 text-sm sm:text-base font-medium"
          size="default"
        >
          {isLoading ? (
            'Processing...'
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send
            </>
          )}
        </Button>
          
        <Button
          type="button"
          onClick={onStop}
          disabled={!canStop}
          variant="outline"
          size="icon"
          className="h-10 sm:h-11 w-10 sm:w-11 flex-shrink-0"
          title="Stop generation and audio"
        >
          <Square className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>
    </form>
  );
}

