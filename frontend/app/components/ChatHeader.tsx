'use client';

import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquarePlus } from 'lucide-react';

interface ChatHeaderProps {
  isLoading: boolean;
  onNewChat: () => void;
}

export function ChatHeader({ isLoading, onNewChat }: ChatHeaderProps) {
  return (
    <CardHeader className="border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6">
      <CardTitle className="flex items-center justify-between text-lg sm:text-xl font-semibold gap-2 sm:gap-4">
        <span className="flex-shrink-0">Talk</span>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <Button
            variant="outline"
            size="default"
            onClick={onNewChat}
            disabled={isLoading}
            className="text-sm h-9 px-3 sm:px-4 py-2 gap-1.5 sm:gap-2"
          >
            <MessageSquarePlus className="h-4 w-4" />
            <span className="whitespace-nowrap">New Chat</span>
          </Button>
        </div>
      </CardTitle>
    </CardHeader>
  );
}
