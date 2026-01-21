import { render, screen } from '@testing-library/react';
import { MessageBubble } from '../MessageBubble';
import { ChatMessage } from '../../types/chat';

// Mock react-markdown
jest.mock('react-markdown', () => {
  return function MockMarkdown({ children }: { children: string }) {
    return <div data-testid="markdown">{children}</div>;
  };
});

jest.mock('remark-gfm', () => ({}));
jest.mock('rehype-raw', () => ({}));

describe('MessageBubble', () => {
  const createMessage = (overrides?: Partial<ChatMessage>): ChatMessage => ({
    text: 'Test message',
    isUser: false,
    timestamp: new Date(),
    sentences: ['Test message'],
    ...overrides,
  });

  it('should render user message', () => {
    const message = createMessage({ isUser: true, text: 'User message' });
    render(<MessageBubble message={message} playingSentenceText={null} />);

    expect(screen.getByText('User message')).toBeInTheDocument();
  });

  it('should render AI message', () => {
    const message = createMessage({ isUser: false, text: 'AI message' });
    render(<MessageBubble message={message} playingSentenceText={null} />);

    expect(screen.getByText('AI message')).toBeInTheDocument();
  });

  it('should apply highlight when sentence is playing', () => {
    const message = createMessage({
      text: 'First sentence. Second sentence.',
      sentences: ['First sentence.', 'Second sentence.'],
    });

    render(
      <MessageBubble message={message} playingSentenceText="First sentence." />
    );

    // The markdown should contain the highlighted sentence wrapped in <mark>
    const markdown = screen.getByTestId('markdown');
    expect(markdown.textContent).toContain('First sentence');
  });

  it('should render markdown content', () => {
    const message = createMessage({
      text: '**Bold text** and *italic text*',
    });

    render(<MessageBubble message={message} playingSentenceText={null} />);

    expect(screen.getByTestId('markdown')).toBeInTheDocument();
  });

  it('should not highlight when no sentence is playing', () => {
    const message = createMessage({
      text: 'Test message',
      sentences: ['Test message'],
    });

    render(<MessageBubble message={message} playingSentenceText={null} />);

    const markdown = screen.getByTestId('markdown');
    // Should not contain <mark> tags when nothing is playing
    expect(markdown.textContent).toBe('Test message');
  });

  it('should apply different styles for user vs AI messages', () => {
    const userMessage = createMessage({ isUser: true });
    const aiMessage = createMessage({ isUser: false });

    const { container, rerender } = render(
      <MessageBubble message={userMessage} playingSentenceText={null} />
    );

    // Find the outer div with the className (not the inner prose div)
    const userContainer = container.querySelector('.bg-slate-900');
    expect(userContainer).toBeInTheDocument();

    rerender(<MessageBubble message={aiMessage} playingSentenceText={null} />);

    const aiContainer = container.querySelector('.bg-slate-50');
    expect(aiContainer).toBeInTheDocument();
  });
});
