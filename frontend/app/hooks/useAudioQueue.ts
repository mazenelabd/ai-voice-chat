import { useState, useRef, useCallback } from 'react';
import { AudioChunk } from '../types/chat';

interface UseAudioQueueReturn {
  currentPlayingParagraph: string | null;
  isPlaying: boolean;
  addChunk: (chunk: AudioChunk, onFirstChunk?: () => void) => void;
  clearQueue: () => void;
  stopAudio: () => void;
}

export function useAudioQueue(
  onParagraphChange?: (paragraph: string | null) => void
): UseAudioQueueReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioQueueRef = useRef<AudioChunk[]>([]);
  const isPlayingQueueRef = useRef(false);
  const [currentPlayingParagraph, setCurrentPlayingParagraph] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const updatePlayingParagraph = useCallback(
    (paragraph: string | null) => {
      setCurrentPlayingParagraph(paragraph);
      if (onParagraphChange) {
        onParagraphChange(paragraph);
      }
    },
    [onParagraphChange]
  );

  const playAudioQueue = useCallback(() => {
    if (isPlayingQueueRef.current) {
      return;
    }

    if (audioQueueRef.current.length === 0) {
      return;
    }

    isPlayingQueueRef.current = true;
    setIsPlaying(true);
    const playNext = () => {
      if (audioQueueRef.current.length === 0) {
        isPlayingQueueRef.current = false;
        setIsPlaying(false);
        updatePlayingParagraph(null);
        return;
      }

      const chunk = audioQueueRef.current.shift()!;
      const audio = new Audio(chunk.audio);
      audioRef.current = audio;

      // Update highlighted paragraph based on the paragraph text from the chunk
      if (chunk.paragraph) {
        updatePlayingParagraph(chunk.paragraph);
      }

      audio.onended = () => {
        updatePlayingParagraph(null);
        playNext();
      };

      audio.onerror = () => {
        playNext(); // Continue with next chunk even if one fails
      };

      audio.play().catch(() => {
        playNext();
      });
    };

    playNext();
  }, [updatePlayingParagraph]);

  const addChunk = useCallback(
    (chunk: AudioChunk, onFirstChunk?: () => void) => {
      // Handle first chunk setup
      if (chunk.chunkIndex === 0) {
        // Clear queue for new message
        audioQueueRef.current = [];
        isPlayingQueueRef.current = false;
        if (onFirstChunk) {
          onFirstChunk();
        }
      }

      // Check if this chunk is already in the queue to avoid duplicates
      const existingChunkIndex = audioQueueRef.current.findIndex(
        (c) => c.chunkIndex === (chunk.chunkIndex ?? 0)
      );

      if (existingChunkIndex >= 0) {
        // Still try to start playback if it's not playing and this is chunk 0
        if (chunk.chunkIndex === 0 && !isPlayingQueueRef.current) {
          playAudioQueue();
        }
        return; // Don't add duplicate
      }

      // Find the correct position to insert
      let insertIndex = audioQueueRef.current.length;
      for (let i = 0; i < audioQueueRef.current.length; i++) {
        if ((audioQueueRef.current[i].chunkIndex ?? 0) > (chunk.chunkIndex ?? 0)) {
          insertIndex = i;
          break;
        }
      }
      audioQueueRef.current.splice(insertIndex, 0, chunk);

      // Start playing immediately when first chunk arrives
      // Subsequent chunks will be queued and played sequentially
      if (chunk.chunkIndex === 0 && !isPlayingQueueRef.current) {
        playAudioQueue();
      } else if (chunk.chunkIndex !== undefined && chunk.chunkIndex > 0) {
        // For subsequent chunks, if queue is already playing, they'll be picked up automatically
        // But if for some reason playback stopped, restart it
        if (!isPlayingQueueRef.current) {
          playAudioQueue();
        }
      }
    },
    [playAudioQueue]
  );

  const clearQueue = useCallback(() => {
    audioQueueRef.current = [];
    isPlayingQueueRef.current = false;
    setIsPlaying(false);
    updatePlayingParagraph(null);
  }, [updatePlayingParagraph]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    clearQueue();
  }, [clearQueue]);

  return {
    currentPlayingParagraph,
    isPlaying,
    addChunk,
    clearQueue,
    stopAudio,
  };
}

