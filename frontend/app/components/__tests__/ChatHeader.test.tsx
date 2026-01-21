import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatHeader } from '../ChatHeader';

describe('ChatHeader', () => {
  const defaultProps = {
    isLoading: false,
    onNewChat: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render app title', () => {
    render(<ChatHeader {...defaultProps} />);
    expect(screen.getByText('Talk')).toBeInTheDocument();
  });

  it('should render New Chat button', () => {
    render(<ChatHeader {...defaultProps} />);
    const newChatButton = screen.getByRole('button', { name: /new chat/i });
    expect(newChatButton).toBeInTheDocument();
  });

  it('should call onNewChat when button is clicked', async () => {
    const onNewChat = jest.fn();
    render(<ChatHeader {...defaultProps} onNewChat={onNewChat} />);

    const newChatButton = screen.getByRole('button', { name: /new chat/i });
    fireEvent.click(newChatButton);

    expect(onNewChat).toHaveBeenCalled();
  });

  it('should disable New Chat button when loading', () => {
    render(<ChatHeader {...defaultProps} isLoading={true} />);
    const newChatButton = screen.getByRole('button', { name: /new chat/i });
    expect(newChatButton).toBeDisabled();
  });

  it('should render icon in New Chat button', () => {
    render(<ChatHeader {...defaultProps} />);
    const newChatButton = screen.getByRole('button', { name: /new chat/i });
    // Icon should be present (MessageSquarePlus)
    expect(newChatButton.querySelector('svg')).toBeInTheDocument();
  });
});
