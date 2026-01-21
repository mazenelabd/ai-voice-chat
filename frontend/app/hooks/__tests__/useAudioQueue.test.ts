import { renderHook, act, waitFor } from '@testing-library/react';
import { useAudioQueue } from '../useAudioQueue';
import { AudioChunk } from '../../types/chat';

// Mock Audio
class MockAudio {
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;
  paused = false;

  play() {
    this.paused = false;
    return Promise.resolve();
  }

  pause() {
    this.paused = true;
  }

  triggerEnded() {
    if (this.onended) {
      this.onended();
    }
  }

  triggerError() {
    if (this.onerror) {
      this.onerror();
    }
  }
}

(global as any).Audio = jest.fn(() => new MockAudio()) as any;

describe('useAudioQueue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).Audio = jest.fn(() => new MockAudio());
  });

  it('should initialize with no playing paragraph', () => {
    const { result } = renderHook(() => useAudioQueue());
    expect(result.current.currentPlayingParagraph).toBeNull();
    expect(result.current.isPlaying).toBe(false);
  });

  it('should add chunk to queue', () => {
    const { result } = renderHook(() => useAudioQueue());

    const chunk: AudioChunk = {
      audio: 'data:audio/mpeg;base64,test',
      chunkIndex: 0,
      paragraph: 'Test paragraph',
    };

    act(() => {
      result.current.addChunk(chunk);
    });

    expect(result.current.currentPlayingParagraph).toBe('Test paragraph');
    expect(result.current.isPlaying).toBe(true);
  });

  it('should play chunks sequentially', async () => {
    const { result } = renderHook(() => useAudioQueue());
    const mockAudio1 = new MockAudio();
    const mockAudio2 = new MockAudio();
    let audioCallCount = 0;

    (global as any).Audio = jest.fn(() => {
      audioCallCount++;
      return audioCallCount === 1 ? mockAudio1 : mockAudio2;
    });

    const chunk1: AudioChunk = {
      audio: 'data:audio/mpeg;base64,test1',
      chunkIndex: 0,
      paragraph: 'First paragraph',
    };

    const chunk2: AudioChunk = {
      audio: 'data:audio/mpeg;base64,test2',
      chunkIndex: 1,
      paragraph: 'Second paragraph',
    };

    act(() => {
      result.current.addChunk(chunk1);
    });

    await waitFor(() => {
      expect(result.current.currentPlayingParagraph).toBe('First paragraph');
    });

    act(() => {
      result.current.addChunk(chunk2);
    });

    // Simulate first audio ending
    act(() => {
      mockAudio1.triggerEnded();
    });

    await waitFor(() => {
      expect(result.current.currentPlayingParagraph).toBe('Second paragraph');
    });
  });

  it('should stop audio and clear queue', () => {
    const { result } = renderHook(() => useAudioQueue());

    const chunk: AudioChunk = {
      audio: 'data:audio/mpeg;base64,test',
      chunkIndex: 0,
      paragraph: 'Test paragraph',
    };

    act(() => {
      result.current.addChunk(chunk);
    });

    expect(result.current.isPlaying).toBe(true);

    act(() => {
      result.current.stopAudio();
    });

    expect(result.current.isPlaying).toBe(false);
    expect(result.current.currentPlayingParagraph).toBeNull();
  });

  it('should clear queue', () => {
    const { result } = renderHook(() => useAudioQueue());

    const chunk: AudioChunk = {
      audio: 'data:audio/mpeg;base64,test',
      chunkIndex: 0,
      paragraph: 'Test paragraph',
    };

    act(() => {
      result.current.addChunk(chunk);
      result.current.clearQueue();
    });

    expect(result.current.isPlaying).toBe(false);
    expect(result.current.currentPlayingParagraph).toBeNull();
  });

  it('should handle chunk with callback on first chunk', () => {
    const { result } = renderHook(() => useAudioQueue());
    const onFirstChunk = jest.fn();

    const chunk: AudioChunk = {
      audio: 'data:audio/mpeg;base64,test',
      chunkIndex: 0,
      paragraph: 'Test paragraph',
    };

    act(() => {
      result.current.addChunk(chunk, onFirstChunk);
    });

    expect(onFirstChunk).toHaveBeenCalled();
  });

  it('should call onParagraphChange callback', () => {
    const onParagraphChange = jest.fn();
    const { result } = renderHook(() => useAudioQueue(onParagraphChange));

    const chunk: AudioChunk = {
      audio: 'data:audio/mpeg;base64,test',
      chunkIndex: 0,
      paragraph: 'Test paragraph',
    };

    act(() => {
      result.current.addChunk(chunk);
    });

    expect(onParagraphChange).toHaveBeenCalledWith('Test paragraph');
  });
});

