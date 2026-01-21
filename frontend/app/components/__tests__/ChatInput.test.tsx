/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatInput } from '../ChatInput';

describe('ChatInput', () => {
  const defaultProps = {
    inputText: '',
    onInputChange: jest.fn(),
    onSubmit: jest.fn(),
    onStop: jest.fn(),
    isConnected: true,
    isLoading: false,
    isAudioPlaying: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render input and send button', () => {
    render(<ChatInput {...defaultProps} />);
    expect(
      screen.getByPlaceholderText('Type your message here...')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('should render stop button', () => {
    render(<ChatInput {...defaultProps} />);
    const stopButton = screen.getByRole('button', { name: /stop/i });
    expect(stopButton).toBeInTheDocument();
  });

  it('should call onInputChange when typing', async () => {
    const user = userEvent.setup();
    const onInputChange = jest.fn();
    render(<ChatInput {...defaultProps} onInputChange={onInputChange} />);

    const input = screen.getByPlaceholderText('Type your message here...');
    await user.type(input, 'Hello');

    expect(onInputChange).toHaveBeenCalled();
  });

  it('should call onSubmit when form is submitted', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn((e) => e.preventDefault());
    render(
      <ChatInput {...defaultProps} inputText="Hello" onSubmit={onSubmit} />
    );

    const submitButton = screen.getByRole('button', { name: /send/i });
    await user.click(submitButton);

    expect(onSubmit).toHaveBeenCalled();
  });

  it('should submit on Enter key', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn((e) => e.preventDefault());
    render(
      <ChatInput {...defaultProps} inputText="Hello" onSubmit={onSubmit} />
    );

    const input = screen.getByPlaceholderText('Type your message here...');
    await user.type(input, '{Enter}');

    expect(onSubmit).toHaveBeenCalled();
  });

  it('should not submit on Shift+Enter', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(
      <ChatInput {...defaultProps} inputText="Hello" onSubmit={onSubmit} />
    );

    const input = screen.getByPlaceholderText('Type your message here...');
    await user.type(input, '{Shift>}{Enter}{/Shift}');

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should disable send button when input is empty', () => {
    render(<ChatInput {...defaultProps} inputText="" />);
    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).toBeDisabled();
  });

  it('should disable send button when not connected', () => {
    render(
      <ChatInput {...defaultProps} inputText="Hello" isConnected={false} />
    );
    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).toBeDisabled();
  });

  it('should disable send button when loading', () => {
    render(<ChatInput {...defaultProps} inputText="Hello" isLoading={true} />);
    // When loading, the button text is "Processing..." not "Send"
    const sendButton = screen.getByRole('button', { name: /processing/i });
    expect(sendButton).toBeDisabled();
  });

  it('should call onStop when stop button is clicked', async () => {
    const user = userEvent.setup();
    const onStop = jest.fn();
    render(<ChatInput {...defaultProps} onStop={onStop} isLoading={true} />);

    const stopButton = screen.getByRole('button', { name: /stop/i });
    await user.click(stopButton);

    expect(onStop).toHaveBeenCalled();
  });

  it('should disable stop button when not loading or playing', () => {
    render(
      <ChatInput {...defaultProps} isLoading={false} isAudioPlaying={false} />
    );
    const stopButton = screen.getByRole('button', { name: /stop/i });
    expect(stopButton).toBeDisabled();
  });

  it('should enable stop button when loading', () => {
    render(<ChatInput {...defaultProps} isLoading={true} />);
    const stopButton = screen.getByRole('button', { name: /stop/i });
    expect(stopButton).not.toBeDisabled();
  });

  it('should enable stop button when audio is playing', () => {
    render(<ChatInput {...defaultProps} isAudioPlaying={true} />);
    const stopButton = screen.getByRole('button', { name: /stop/i });
    expect(stopButton).not.toBeDisabled();
  });

  it('should show Processing... when loading', () => {
    render(<ChatInput {...defaultProps} isLoading={true} />);
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });
});
