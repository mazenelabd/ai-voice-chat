# Frontend - Talk Chat Application

Next.js frontend application for the Talk chat interface. Provides a modern, responsive UI for real-time text-to-audio chat.

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local if needed (defaults to ws://localhost:8000)
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

## Starting the Application

### Development Mode
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Production Mode
```bash
npm run build
npm start
```

## Testing

### Unit Tests
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

### E2E Tests
```bash
# Interactive mode
npm run cypress:open

# Headless mode
npm run cypress:run
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run cypress:open` - Open Cypress test runner
- `npm run cypress:run` - Run Cypress tests headlessly
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Features

- Real-time chat interface
- Markdown rendering for AI responses
- Sentence highlighting during audio playback
- Stop generation and audio playback
- Responsive design
- Dark mode support
- Message history management

## Technology Stack

- **Next.js**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- **React Markdown**
- **Cypress**
- **Jest**
