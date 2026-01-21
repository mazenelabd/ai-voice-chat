# Talk - Text-to-Audio Chat Application

A real-time WebSocket-based chat application that uses OpenAI to generate responses and convert them to speech. Features a modern, responsive UI with markdown rendering and sentence highlighting during audio playback.

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key (optional - test key included)

### Installation

1. **Backend**:
```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

2. **Frontend**:
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local if needed (defaults to ws://localhost:8000)
```

### Running the Application

1. **Start Backend** (from `backend` directory):
```bash
npm run dev
```
Server runs on `http://localhost:8000`

2. **Start Frontend** (from `frontend` directory):
```bash
npm run dev
```
App available at `http://localhost:3000`

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
# Unit tests
npm test

# E2E tests
npm run cypress:run
```

## Project Structure

```
text-audio-chat-app/
├── backend/           # WebSocket server
│   ├── src/
│   │   ├── services/  # WebSocket & OpenAI services
│   │   ├── utils/     # Text processing utilities
│   │   └── types/     # TypeScript definitions
│   └── README.md
├── frontend/          # Next.js application
│   ├── app/           # App router
│   ├── components/    # React components
│   ├── hooks/         # Custom React hooks
│   ├── cypress/       # E2E tests
│   └── README.md
└── README.md
```

## Features

- ✅ Real-time WebSocket communication
- ✅ OpenAI GPT-4o-mini integration
- ✅ Text-to-speech conversion
- ✅ Markdown rendering for AI responses
- ✅ Sentence highlighting during audio playback
- ✅ Stop generation and audio playback
- ✅ Responsive design with dark mode
- ✅ Comprehensive test coverage

## Technology Stack

**Backend**: TypeScript, Node.js, WebSocket (ws), OpenAI SDK, Jest  
**Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui, React Markdown, Cypress, Jest

## Environment Variables

### Backend (optional)
```bash
PORT=8000
OPENAI_API_KEY=your_key_here
```

### Frontend (optional)
```bash
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

## License

ISC

