import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StoryPage from './page';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  },
  useReducedMotion: vi.fn(() => false),
}));

// Mock components
vi.mock('@/app/components/Button', () => ({
  Button: ({ children, onClick, disabled, className, ...props }: React.ComponentProps<'button'>) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className={className} 
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/app/components/LinkAsButton', () => ({
  LinkAsButton: ({ children, href, className, ...props }: React.ComponentProps<'a'> & { href: string }) => (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/app/components/PageBackground', () => ({
  __esModule: true,
  default: ({ children, src, alt, wikiUrl }: { children: React.ReactNode; src: string; alt: string; wikiUrl: string }) => (
    <div data-testid="page-background" data-src={src} data-alt={alt} data-wiki={wikiUrl}>
      {children}
    </div>
  ),
}));

// Mock hooks
const mockUseOasisData = vi.fn();
vi.mock('@/app/lib/hooks/useOasis', () => ({
  useOasisData: () => mockUseOasisData(),
}));

// Mock actions
const mockRequestStory = vi.fn();
const mockSendStoryChat = vi.fn();
vi.mock('@/app/lib/actions/geminiStoryAction', () => ({
  requestStory: (opts: { listId: string; language?: string; vocabHint?: string }) => mockRequestStory(opts),
  sendStoryChat: (input: string, history: unknown[], extra?: { listId?: string }) => mockSendStoryChat(input, history, extra),
}));

// Mock data
vi.mock('@/app/data/deserts', () => ({
  deserts: [
    {
      name: 'Monument Valley',
      src: '/monument-valley.jpg',
      wikiUrl: 'https://en.wikipedia.org/wiki/Monument_Valley',
    },
  ],
}));

// Mock DOM APIs
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  value: vi.fn(),
  writable: true,
});

describe('StoryPage', () => {
  const defaultOasisData = {
    listId: 'test-list-123',
    meta: {
      name: 'Spanish Basics',
      language: 'Spanish',
    },
    words: [
      { target: 'casa', english: 'house' },
      { target: 'perro', english: 'dog' },
      { target: 'gato', english: 'cat' },
    ],
    loading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseOasisData.mockReturnValue(defaultOasisData);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Loading State', () => {
    it('renders loading state when data is loading', () => {
      mockUseOasisData.mockReturnValue({
        ...defaultOasisData,
        loading: true,
      });

      render(<StoryPage />);

      expect(screen.getByText('Loading your story')).toBeInTheDocument();
      expect(screen.getByText('Preparing your oasis…')).toBeInTheDocument();
      expect(screen.getByText(/We're crafting a tale based on the vocabulary/)).toBeInTheDocument();
    });

    it('shows loading animation and tips', () => {
      mockUseOasisData.mockReturnValue({
        ...defaultOasisData,
        loading: true,
      });

      render(<StoryPage />);

      expect(screen.getByText(/Tip: after it loads, ask the chat to simplify/)).toBeInTheDocument();
    });
  });

  describe('Error States', () => {
    it('renders error message when listId is missing', () => {
      mockUseOasisData.mockReturnValue({
        ...defaultOasisData,
        listId: null,
      });

      render(<StoryPage />);

      expect(screen.getByText('Missing list id.')).toBeInTheDocument();
    });
  });

  describe('Main Interface', () => {
    it('renders story generator interface when loaded', () => {
      render(<StoryPage />);

      expect(screen.getByText('Story Generator')).toBeInTheDocument();
      expect(screen.getByText(/Create a short tale using your oasis vocabulary/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Generate/i })).toBeInTheDocument();
    });

    it('displays oasis metadata correctly', () => {
      render(<StoryPage />);

      expect(screen.getByText('Spanish Basics')).toBeInTheDocument();
      // Use getAllByText and check we have the expected elements
      const spanishElements = screen.getAllByText(/Spanish/);
      expect(spanishElements.length).toBeGreaterThan(0);
    });

    it('renders back link with correct href', () => {
      render(<StoryPage />);

      const backLink = screen.getByRole('link', { name: /Back/i });
      expect(backLink).toHaveAttribute('href', '/oasis/test-list-123');
    });

    it('shows empty story placeholder initially', () => {
      render(<StoryPage />);

      expect(screen.getByPlaceholderText('Generate a story to begin…')).toBeInTheDocument();
    });
  });

  describe('Story Generation', () => {
    it('generates story when Generate button is clicked', async () => {
      const user = userEvent.setup();
      mockRequestStory.mockResolvedValue('Once upon a time, there was a casa where a perro lived...');

      render(<StoryPage />);

      const generateButton = screen.getByRole('button', { name: /Generate/i });
      await user.click(generateButton);

      await waitFor(() => {
        expect(mockRequestStory).toHaveBeenCalledWith({
          listId: 'test-list-123',
          language: 'Spanish',
          vocabHint: 'Use these vocabulary items where natural: casa = house, perro = dog, gato = cat.',
        });
      });
    });

    it('displays generated story in textarea', async () => {
      const user = userEvent.setup();
      const storyText = 'Once upon a time, there was a casa where a perro lived...';
      mockRequestStory.mockResolvedValue(storyText);

      render(<StoryPage />);

      await user.click(screen.getByRole('button', { name: /Generate/i }));

      await waitFor(() => {
        const storyTextarea = screen.getByPlaceholderText('Generate a story to begin…');
        expect(storyTextarea).toHaveValue(storyText);
      });
    });

    it('shows generating state during story creation', async () => {
      const user = userEvent.setup();
      let resolveStory: (value: string) => void;
      const storyPromise = new Promise<string>((resolve) => {
        resolveStory = resolve;
      });
      mockRequestStory.mockReturnValue(storyPromise);

      render(<StoryPage />);

      await user.click(screen.getByRole('button', { name: /Generate/i }));

      expect(screen.getByRole('button', { name: /Generating…/i })).toBeInTheDocument();

      const storyTextarea = screen.getByPlaceholderText('Generate a story to begin…');
      expect(storyTextarea).toHaveValue('Generating...');

      resolveStory!('Story complete!');
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Generate/i })).toBeInTheDocument();
      });
    });

    it('handles story generation with object response', async () => {
      const user = userEvent.setup();
      mockRequestStory.mockResolvedValue({ 
        story: 'Generated story content',
        usedSettings: { language: 'Spanish', difficulty: 'beginner' }
      });

      render(<StoryPage />);

      await user.click(screen.getByRole('button', { name: /Generate/i }));

      await waitFor(() => {
        const storyTextarea = screen.getByPlaceholderText('Generate a story to begin…');
        expect(storyTextarea).toHaveValue('Generated story content');
      });
    });

    it('handles story generation failure', async () => {
      const user = userEvent.setup();
      mockRequestStory.mockResolvedValue(null);

      render(<StoryPage />);

      await user.click(screen.getByRole('button', { name: /Generate/i }));

      await waitFor(() => {
        const storyTextarea = screen.getByPlaceholderText('Generate a story to begin…');
        expect(storyTextarea).toHaveValue('Failed to generate story.');
      });
    });

    it('clears chat log when generating new story', async () => {
      const user = userEvent.setup();
      mockRequestStory.mockResolvedValue('New story');

      render(<StoryPage />);

      // First, add some chat history by simulating chat
      const chatInput = screen.getByPlaceholderText('Ask something about the story…');
      await user.type(chatInput, 'Test message');

      // Generate a new story which should clear chat
      await user.click(screen.getByRole('button', { name: /Generate/i }));

      await waitFor(() => {
        expect(screen.getByText(/Ask questions about the generated story/)).toBeInTheDocument();
      });
    });
  });

  describe('Chat Functionality', () => {
    beforeEach(async () => {
      // Setup with a generated story first
      const user = userEvent.setup();
      mockRequestStory.mockResolvedValue('Test story content');
      render(<StoryPage />);
      await user.click(screen.getByRole('button', { name: /Generate/i }));
      await waitFor(() => {
        const storyTextarea = screen.getByPlaceholderText('Generate a story to begin…');
        expect(storyTextarea).toHaveValue('Test story content');
      });
    });

    it('shows chat interface with placeholder message', () => {
      expect(screen.getByText('Chat')).toBeInTheDocument();
      expect(screen.getByText(/Ask questions about the generated story/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Ask something about the story…')).toBeInTheDocument();
    });

    it('sends chat message when Send button is clicked', async () => {
      const user = userEvent.setup();
      mockSendStoryChat.mockResolvedValue({ text: 'This story is about adventure!' });

      const chatInput = screen.getByPlaceholderText('Ask something about the story…');
      await user.type(chatInput, 'What is this story about?');
      await user.click(screen.getByRole('button', { name: /Send/i }));

      await waitFor(() => {
        expect(mockSendStoryChat).toHaveBeenCalledWith(
          'What is this story about?',
          expect.arrayContaining([
            expect.objectContaining({ role: 'user' }),
            expect.objectContaining({ role: 'model' }),
          ]),
          { listId: 'test-list-123' }
        );
      });
    });

    it('displays chat messages in conversation format', async () => {
      const user = userEvent.setup();
      mockSendStoryChat.mockResolvedValue({ text: 'This story is about adventure!' });

      const chatInput = screen.getByPlaceholderText('Ask something about the story…');
      await user.type(chatInput, 'What is this story about?');
      await user.click(screen.getByRole('button', { name: /Send/i }));

      await waitFor(() => {
        expect(screen.getByText('What is this story about?')).toBeInTheDocument();
        expect(screen.getByText('This story is about adventure!')).toBeInTheDocument();
      });
    });

    it('clears input after sending message', async () => {
      const user = userEvent.setup();
      mockSendStoryChat.mockResolvedValue({ text: 'Response' });

      const chatInput = screen.getByPlaceholderText('Ask something about the story…') as HTMLTextAreaElement;
      await user.type(chatInput, 'Test message');
      await user.click(screen.getByRole('button', { name: /Send/i }));

      await waitFor(() => {
        expect(chatInput).toHaveValue('');
      });
    });

    it('sends message on Enter key press', async () => {
      const user = userEvent.setup();
      mockSendStoryChat.mockResolvedValue({ text: 'Response via Enter!' });

      const chatInput = screen.getByPlaceholderText('Ask something about the story…');
      await user.type(chatInput, 'Enter key test');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockSendStoryChat).toHaveBeenCalled();
      });
    });

    it('does not send on Shift+Enter (creates new line)', async () => {
      const user = userEvent.setup();

      const chatInput = screen.getByPlaceholderText('Ask something about the story…');
      await user.type(chatInput, 'Line one');
      await user.keyboard('{Shift>}{Enter}{/Shift}');
      await user.type(chatInput, 'Line two');

      // Should not have sent the message
      expect(mockSendStoryChat).not.toHaveBeenCalled();
    });

    it('shows sending state when message is being sent', async () => {
      const user = userEvent.setup();
      let resolveSend: (value: { text: string }) => void;
      const sendPromise = new Promise((resolve) => {
        resolveSend = resolve;
      });
      mockSendStoryChat.mockReturnValue(sendPromise);

      const chatInput = screen.getByPlaceholderText('Ask something about the story…');
      await user.type(chatInput, 'Test message');
      await user.click(screen.getByRole('button', { name: /Send/i }));

      expect(screen.getByRole('button', { name: /Sending…/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sending…/i })).toBeDisabled();

      resolveSend!({ text: 'Response' });
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Send/i })).toBeInTheDocument();
      });
    });

    it('disables send button when input is empty', () => {
      const sendButton = screen.getByRole('button', { name: /Send/i });
      expect(sendButton).toBeDisabled();
    });

    it('enables send button when input has content', async () => {
      const user = userEvent.setup();

      const chatInput = screen.getByPlaceholderText('Ask something about the story…');
      await user.type(chatInput, 'Some text');

      const sendButton = screen.getByRole('button', { name: /Send/i });
      expect(sendButton).not.toBeDisabled();
    });

    it('handles chat error response', async () => {
      const user = userEvent.setup();
      mockSendStoryChat.mockResolvedValue(null);

      const chatInput = screen.getByPlaceholderText('Ask something about the story…');
      await user.type(chatInput, 'Test message');
      await user.click(screen.getByRole('button', { name: /Send/i }));

      await waitFor(() => {
        expect(screen.getByText('Error: No response received.')).toBeInTheDocument();
      });
    });

    it('maintains chat history across multiple messages', async () => {
      const user = userEvent.setup();
      mockSendStoryChat.mockResolvedValueOnce({ text: 'First response' });
      mockSendStoryChat.mockResolvedValueOnce({ text: 'Second response' });

      // Send first message
      const chatInput = screen.getByPlaceholderText('Ask something about the story…');
      await user.type(chatInput, 'First question');
      await user.click(screen.getByRole('button', { name: /Send/i }));

      await waitFor(() => {
        expect(screen.getByText('First response')).toBeInTheDocument();
      });

      // Send second message
      await user.type(chatInput, 'Second question');
      await user.click(screen.getByRole('button', { name: /Send/i }));

      await waitFor(() => {
        expect(screen.getByText('Second response')).toBeInTheDocument();
      });

      // Verify both messages are still visible
      expect(screen.getByText('First question')).toBeInTheDocument();
      expect(screen.getByText('First response')).toBeInTheDocument();
      expect(screen.getByText('Second question')).toBeInTheDocument();
      expect(screen.getByText('Second response')).toBeInTheDocument();
    });
  });

  describe('Vocabulary Integration', () => {
    it('builds vocabulary hint for story generation', async () => {
      const user = userEvent.setup();
      mockRequestStory.mockResolvedValue('Story with vocab');

      render(<StoryPage />);
      await user.click(screen.getByRole('button', { name: /Generate/i }));

      await waitFor(() => {
        expect(mockRequestStory).toHaveBeenCalledWith({
          listId: 'test-list-123',
          language: 'Spanish',
          vocabHint: 'Use these vocabulary items where natural: casa = house, perro = dog, gato = cat.',
        });
      });
    });

    it('handles empty vocabulary list', async () => {
      const user = userEvent.setup();
      mockUseOasisData.mockReturnValue({
        ...defaultOasisData,
        words: [],
      });
      mockRequestStory.mockResolvedValue('Story without vocab');

      render(<StoryPage />);
      await user.click(screen.getByRole('button', { name: /Generate/i }));

      await waitFor(() => {
        expect(mockRequestStory).toHaveBeenCalledWith({
          listId: 'test-list-123',
          language: 'Spanish',
          vocabHint: '',
        });
      });
    });

    it('limits vocabulary hint to 20 words maximum', async () => {
      const user = userEvent.setup();
      const manyWords = Array.from({ length: 25 }, (_, i) => ({
        target: `word${i}`,
        english: `english${i}`,
      }));
      
      mockUseOasisData.mockReturnValue({
        ...defaultOasisData,
        words: manyWords,
      });
      mockRequestStory.mockResolvedValue('Story with limited vocab');

      render(<StoryPage />);
      await user.click(screen.getByRole('button', { name: /Generate/i }));

      await waitFor(() => {
        const call = mockRequestStory.mock.calls[0][0];
        // Should only include first 20 words
        const wordCount = (call.vocabHint.match(/word\d+/g) || []).length;
        expect(wordCount).toBe(20);
      });
    });
  });

  describe('Accessibility and UX', () => {
    it('auto-scrolls chat to bottom when new messages are added', async () => {
      const user = userEvent.setup();
      const scrollIntoViewSpy = vi.fn();
      Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
        value: scrollIntoViewSpy,
        writable: true,
      });

      mockRequestStory.mockResolvedValue('Test story');
      mockSendStoryChat.mockResolvedValue({ text: 'Response' });

      render(<StoryPage />);
      
      // Generate story first
      await user.click(screen.getByRole('button', { name: /Generate/i }));
      await waitFor(() => screen.getByDisplayValue('Test story'));

      // Send a chat message
      const chatInput = screen.getByPlaceholderText('Ask something about the story…');
      await user.type(chatInput, 'Test question');
      await user.click(screen.getByRole('button', { name: /Send/i }));

      await waitFor(() => {
        expect(scrollIntoViewSpy).toHaveBeenCalledWith({
          behavior: 'smooth',
          block: 'end',
        });
      });
    });

    it('shows keyboard shortcuts in chat placeholder', () => {
      render(<StoryPage />);

      expect(screen.getByText(/Press/)).toBeInTheDocument();
      expect(screen.getByText('Enter')).toBeInTheDocument();
      expect(screen.getByText('Shift+Enter')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles missing meta information gracefully', () => {
      mockUseOasisData.mockReturnValue({
        ...defaultOasisData,
        meta: null,
      });

      render(<StoryPage />);

      expect(screen.getByText('(Unnamed list)')).toBeInTheDocument();
    });

    it('handles words with missing target or english fields', async () => {
      const user = userEvent.setup();
      mockUseOasisData.mockReturnValue({
        ...defaultOasisData,
        words: [
          { target: 'casa', english: '' },
          { target: '', english: 'dog' },
          { target: 'gato', english: 'cat' },
        ],
      });
      mockRequestStory.mockResolvedValue('Story');

      render(<StoryPage />);
      await user.click(screen.getByRole('button', { name: /Generate/i }));

      await waitFor(() => {
        const call = mockRequestStory.mock.calls[0][0];
        // Should handle empty strings gracefully
        expect(call.vocabHint).toContain('gato = cat');
      });
    });

    it('prevents sending empty or whitespace-only messages', async () => {
      const user = userEvent.setup();
      
      // Generate story first
      mockRequestStory.mockResolvedValue('Test story');
      render(<StoryPage />);
      await user.click(screen.getByRole('button', { name: /Generate/i }));
      await waitFor(() => screen.getByDisplayValue('Test story'));

      const chatInput = screen.getByPlaceholderText('Ask something about the story…');
      
      // Try sending whitespace-only message
      await user.type(chatInput, '   ');
      await user.click(screen.getByRole('button', { name: /Send/i }));

      expect(mockSendStoryChat).not.toHaveBeenCalled();
    });
  });
});
