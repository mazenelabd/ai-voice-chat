import dotenv from 'dotenv';
import { WebSocketService } from './services/websocket.service';

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('ERROR: OPENAI_API_KEY environment variable is required');
  console.error('Please set OPENAI_API_KEY in your .env file');
  process.exit(1);
}

const wsService = new WebSocketService(PORT, OPENAI_API_KEY);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down WebSocket server...');
  wsService.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down WebSocket server...');
  wsService.close();
  process.exit(0);
});

