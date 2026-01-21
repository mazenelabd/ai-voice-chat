  # Backend - WebSocket Server

WebSocket server for the Talk chat application. Handles real-time communication between clients and OpenAI APIs for text generation and text-to-speech conversion.

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your OpenAI API key
PORT=8000
OPENAI_API_KEY=your_openai_api_key_here
```

**Note**: The `.env` file is required. Copy `.env.example` to `.env` and add your API key.

## Starting the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

The server will start on port 8000 (or the port specified in `PORT` environment variable).

## Testing

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Architecture

### Services
- **WebSocket Service** (`src/services/websocket.service.ts`) - Handles WebSocket connections and message routing
- **OpenAI Service** (`src/services/openai.service.ts`) - Interfaces with OpenAI APIs (Chat Completions and TTS)

### Utilities
- **Text Processing** (`src/utils/textProcessing.ts`) - Utilities for text splitting and processing
- **Stream Processor** (`src/utils/stream-processor.ts`) - Processes streaming chat completions and extracts sentences
- **Response Builder** (`src/utils/response-builder.ts`) - Builds WebSocket response messages
- **Error Handler** (`src/utils/error-handler.ts`) - Error detection and handling utilities

### Constants
- **OpenAI Constants** (`src/constants/openai.constants.ts`) - OpenAI configuration (models, limits, tokens)
- **WebSocket Constants** (`src/constants/websocket.constants.ts`) - WebSocket configuration
- **System Constants** (`src/constants/system.constants.ts`) - System message content
- **Error Constants** (`src/constants/errors.constants.ts`) - Centralized error messages

## Features

- Real-time WebSocket communication
- OpenAI GPT-4o-mini integration
- Text-to-speech conversion
- Streaming audio chunks to clients
- Request cancellation support
- Modular architecture with extracted constants and utilities
- Comprehensive error handling

