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

    // The highlightedSentence from message.sentences should match exactly what's in message.text
    // including any markdown syntax. Try to find it directly first.
    const sentenceText = highlightedSentence.trim();
    let index = message.text.indexOf(sentenceText);
    
    // If exact match not found, try case-insensitive
    if (index === -1) {
      const lowerText = message.text.toLowerCase();
      const lowerSentence = sentenceText.toLowerCase();
      index = lowerText.indexOf(lowerSentence);
    }
    
    // If still not found, the sentence might have different markdown formatting
    // Try to find it by matching the text content (ignoring markdown)
    if (index === -1) {
      // Create a regex that matches the sentence text, allowing markdown around it
      // Escape special regex characters
      const escaped = sentenceText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Replace markdown patterns with optional patterns
      const pattern = escaped
        .replace(/\*\*/g, '\\*\\*?')
        .replace(/__/g, '__?')
        .replace(/\*/g, '\\*?')
        .replace(/_/g, '_?')
        .replace(/`/g, '`?')
        .replace(/#+/g, '#*');
      
      const regex = new RegExp(pattern, 'i');
      const match = message.text.match(regex);
      if (match && match.index !== undefined) {
        index = match.index;
        // Use the matched text length instead of sentenceText.length
        const before = message.text.substring(0, index);
        const matched = match[0];
        const after = message.text.substring(index + matched.length);
        return `${before}<mark>${matched}</mark>${after}`;
      }
    }
    
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

