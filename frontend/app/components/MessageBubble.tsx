'use client';

import { ChatMessage } from '../types/chat';
import { isSentenceHighlighted } from '../utils/textUtils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useMemo } from 'react';
import { markdownComponents } from './markdownComponents';

interface MessageBubbleProps {
  message: ChatMessage;
  playingSentenceText: string | null;
}

export function MessageBubble({
  message,
  playingSentenceText,
}: MessageBubbleProps) {
  const highlightedSentence = useMemo(() => {
    if (!playingSentenceText || !message.sentences) return null;
    return message.sentences.find((sentence) =>
      isSentenceHighlighted(sentence, playingSentenceText)
    ) || null;
  }, [playingSentenceText, message.sentences]);

  const processedText = useMemo(() => {
    if (!highlightedSentence) {
      return message.text;
    }

    const sentenceText = highlightedSentence.trim();
    const normalizedSentence = sentenceText.toLowerCase();
    const normalizedText = message.text.toLowerCase();
    
    const index = normalizedText.indexOf(normalizedSentence);
    
    if (index === -1) {
      return message.text;
    }

    const before = message.text.substring(0, index);
    const match = message.text.substring(index, index + sentenceText.length);
    const after = message.text.substring(index + sentenceText.length);

    return `${before}<mark>${match}</mark>${after}`;
  }, [message.text, highlightedSentence]);

  return (
    <div
      className={`max-w-[85%] sm:max-w-[80%] lg:max-w-[75%] rounded-lg px-4 py-3 sm:px-5 sm:py-3.5 ${
        message.isUser
          ? 'bg-slate-900 text-white dark:bg-slate-800'
          : 'bg-slate-50 text-slate-900 dark:bg-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
      }`}
    >
      <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={markdownComponents}
        >
          {processedText}
        </ReactMarkdown>
      </div>
    </div>
  );
}

