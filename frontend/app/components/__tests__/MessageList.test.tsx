import { render, screen } from '@testing-library/react';
import { MessageList } from '../MessageList';
import { ChatMessage } from '../../types/chat';

// Mock react-markdown
jest.mock('react-markdown', () => {
  return function MockMarkdown({ children }: { children: string }) {
    return <div>{children}</div>;
  };
});

jest.mock('remark-gfm', () => ({}));
jest.mock('rehype-raw', () => ({}));

describe('MessageList', () => {
  const createMessage = (overrides?: Partial<ChatMessage>): ChatMessage => ({
    text: 'Test message',
    isUser: false,
    timestamp: new Date(),
    ...overrides,
  });

  const defaultProps = {
    messages: [],
    currentMessageIndex: null,
    playingSentenceText: null,
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render empty state when no messages', () => {
    render(<MessageList {...defaultProps} />);
    expect(
      screen.getByText('Start a conversation by typing a message below')
    ).toBeInTheDocument();
  });

  it('should render user messages', () => {
    const messages = [createMessage({ isUser: true, text: 'User message' })];
    render(<MessageList {...defaultProps} messages={messages} />);
    expect(screen.getByText('User message')).toBeInTheDocument();
  });

  it('should render AI messages', () => {
    const messages = [createMessage({ isUser: false, text: 'AI message' })];
    render(<MessageList {...defaultProps} messages={messages} />);
    expect(screen.getByText('AI message')).toBeInTheDocument();
  });

  it('should render multiple messages', () => {
    const messages = [
      createMessage({ isUser: true, text: 'First message' }),
      createMessage({ isUser: false, text: 'Second message' }),
    ];
    render(<MessageList {...defaultProps} messages={messages} />);
    expect(screen.getByText('First message')).toBeInTheDocument();
    expect(screen.getByText('Second message')).toBeInTheDocument();
  });

  it('should show loading indicator when loading', () => {
    render(<MessageList {...defaultProps} isLoading={true} />);
    // Loading dots should be present
    const loadingDots = screen
      .getAllByRole('generic')
      .filter((el) => el.className.includes('animate-pulse'));
    expect(loadingDots.length).toBeGreaterThan(0);
  });

  it('should pass playingSentenceText to current message', () => {
    const messages = [
      createMessage({
        isUser: false,
        text: 'AI message',
        sentences: ['AI message'],
      }),
    ];
    render(
      <MessageList
        {...defaultProps}
        messages={messages}
        currentMessageIndex={0}
        playingSentenceText="AI message"
      />
    );
    // The text might be wrapped in <mark> tags, so we check for the text content
    expect(screen.getByText(/AI message/)).toBeInTheDocument();
  });

  it('should align user messages to the right', () => {
    const messages = [createMessage({ isUser: true, text: 'User message' })];
    const { container } = render(
      <MessageList {...defaultProps} messages={messages} />
    );
    const messageContainer = container.querySelector('.flex.justify-end');
    expect(messageContainer).toBeInTheDocument();
  });

  it('should align AI messages to the left', () => {
    const messages = [createMessage({ isUser: false, text: 'AI message' })];
    const { container } = render(
      <MessageList {...defaultProps} messages={messages} />
    );
    const messageContainer = container.querySelector('.flex.justify-start');
    expect(messageContainer).toBeInTheDocument();
  });
});
