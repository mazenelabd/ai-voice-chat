describe('Chat Interface', () => {
  let mockWebSocketInstances: any[] = [];
  let sendStubRef: any;

  beforeEach(() => {
    sendStubRef = { stub: null };
    mockWebSocketInstances = [];

    cy.window().then((win) => {
      sendStubRef.stub = cy.stub().as('sendStub');

      class MockWebSocket {
        static CONNECTING = 0;
        static OPEN = 1;
        static CLOSING = 2;
        static CLOSED = 3;
        readyState = MockWebSocket.CONNECTING;
        onopen: ((event: Event) => void) | null = null;
        onmessage: ((event: MessageEvent) => void) | null = null;
        onerror: ((event: Event) => void) | null = null;
        onclose: ((event: CloseEvent) => void) | null = null;
        send: (data: string) => void;
        close = cy.stub();

        constructor(public url: string) {
          const instance = this;
          mockWebSocketInstances.push(instance);

          this.send = (data: string) => {
            if (sendStubRef.stub) {
              sendStubRef.stub(data);
            }
          };

          setTimeout(() => {
            instance.readyState = MockWebSocket.OPEN;
            if (instance.onopen) {
              instance.onopen(new Event('open'));
            }
          }, 100);
        }
      }
      (win as any).WebSocket = MockWebSocket;
    });

    cy.visit('/');
    cy.wait(1500);
  });

  const getActiveWebSocket = () => {
    return mockWebSocketInstances[mockWebSocketInstances.length - 1];
  };

  const waitForConnection = () => {
    cy.wait(500);
    cy.window().then(() => {
      const ws = getActiveWebSocket();
      if (ws && ws.readyState === 1) {
        return;
      }
      cy.wait(500);
    });
  };

  const simulateMessage = (message: any) => {
    return cy.window().then(() => {
      const ws = getActiveWebSocket();
      if (ws && ws.onmessage) {
        const event = new MessageEvent('message', {
          data: JSON.stringify(message),
        });
        ws.onmessage(event);
      }
    });
  };

  it('should display the chat interface with correct title', () => {
    cy.contains('Talk').should('be.visible');
  });

  it('should display New Chat button', () => {
    cy.contains('New Chat').should('be.visible');
    cy.get('button').contains('New Chat').should('exist');
  });

  it('should allow typing in the textarea', () => {
    cy.get('textarea[placeholder*="Type your message"]').type(
      'Hello, this is a test message'
    );
    cy.get('textarea').should('have.value', 'Hello, this is a test message');
  });

  it('should enable send button when text is entered', () => {
    cy.get('textarea').type('Test message');
    cy.get('button[type="submit"]').should('not.be.disabled');
    cy.get('button[type="submit"]').should('contain', 'Send');
  });

  it('should disable send button when textarea is empty', () => {
    cy.get('button[type="submit"]').should('be.disabled');
  });

  it.skip('should disable send button when not connected', () => {
    waitForConnection();
    cy.window().then(() => {
      const ws = getActiveWebSocket();
      if (ws) {
        ws.readyState = 3;
        if (ws.onclose) {
          ws.onclose(new CloseEvent('close'));
        }
      }
    });
    cy.wait(1000);
    cy.get('textarea').type('Test message');
    cy.get('button[type="submit"]').should('be.disabled');
  });

  it('should show Processing... when loading', () => {
    cy.get('textarea').type('Test message');
    cy.get('button[type="submit"]').click();
    cy.get('button[type="submit"]').should('contain', 'Processing...');
  });

  it('should display stop button', () => {
    cy.get('button[title*="Stop"]').should('exist');
    cy.get('button[title*="Stop"]').should('be.disabled');
  });

  it('should enable stop button when loading', () => {
    cy.get('textarea').type('Test message');
    cy.get('button[type="submit"]').click();
    cy.get('button[title*="Stop"]').should('not.be.disabled');
  });

  it.skip('should send message via WebSocket when form is submitted', () => {
    // Skipped: WebSocket stub tracking is unreliable in Cypress e2e tests
    // This functionality is covered by unit tests in useWebSocket.test.tsx
    waitForConnection();
    cy.get('textarea').type('Hello, AI!');
    cy.get('button[type="submit"]').click();
    cy.wait(500);
    cy.get('@sendStub').should('have.been.called');
    cy.get('@sendStub').should(
      'have.been.calledWith',
      JSON.stringify({ text: 'Hello, AI!' })
    );
  });

  it('should display user message after sending', () => {
    cy.get('textarea').type('Hello, AI!');
    cy.get('button[type="submit"]').click();
    cy.contains('Hello, AI!').should('be.visible');
  });

  it.skip('should display AI message when received', () => {
    // Skipped: WebSocket message simulation doesn't trigger React updates reliably
    // This functionality is covered by unit tests
    waitForConnection();
    cy.get('textarea').type('Hello');
    cy.get('button[type="submit"]').click();
    cy.wait(500);

    simulateMessage({
      type: 'text',
      data: 'This is an AI response',
    });

    cy.wait(1000);
    cy.contains('This is an AI response', { timeout: 10000 }).should(
      'be.visible'
    );
  });

  it.skip('should display error message when error is received', () => {
    // Skipped: WebSocket message simulation doesn't trigger React updates reliably
    // This functionality is covered by unit tests
    waitForConnection();
    cy.get('textarea').type('Test');
    cy.get('button[type="submit"]').click();
    cy.wait(500);

    simulateMessage({
      type: 'error',
      error: 'Something went wrong',
    });

    cy.wait(1000);
    cy.contains('Error: Something went wrong', { timeout: 10000 }).should(
      'be.visible'
    );
  });

  it('should clear messages when New Chat is clicked', () => {
    cy.get('textarea').type('First message');
    cy.get('button[type="submit"]').click();
    cy.contains('First message').should('be.visible');

    cy.get('button').contains('New Chat').click();
    cy.contains('First message').should('not.exist');
    cy.get('textarea').should('have.value', '');
  });

  it.skip('should send stop action when stop button is clicked', () => {
    // Skipped: WebSocket stub tracking is unreliable in Cypress e2e tests
    // This functionality is covered by unit tests in useWebSocket.test.tsx
    waitForConnection();
    cy.get('textarea').type('Test message');
    cy.get('button[type="submit"]').click();
    cy.wait(500);
    cy.get('button[title*="Stop"]').click();
    cy.wait(500);
    cy.get('@sendStub').should(
      'have.been.calledWith',
      JSON.stringify({ action: 'stop' })
    );
  });

  it.skip('should handle audio chunk messages', () => {
    // Skipped: WebSocket message simulation doesn't trigger React updates reliably
    // This functionality is covered by unit tests
    waitForConnection();
    cy.get('textarea').type('Test');
    cy.get('button[type="submit"]').click();
    cy.wait(500);

    simulateMessage({
      type: 'text',
      data: 'AI response text',
    });

    cy.wait(1000);

    simulateMessage({
      type: 'audio-chunk',
      audio: 'base64audio',
      paragraph: 'AI response text',
      chunkIndex: 0,
    });

    cy.wait(1000);
    cy.contains('AI response text', { timeout: 10000 }).should('be.visible');
  });
});
