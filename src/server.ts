import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env';
import { getClient } from './db/connection';

const app = express();

// Security Middleware
app.use(helmet()); // Sets secure HTTP headers
app.use(cors()); // Configure this more strictly for production later
app.use(express.json()); // Parses incoming JSON payloads securely

// Healthcheck Route (used by Docker or reverse proxies)
app.get('/health', async (req, res) => {
  try {
    const client = await getClient();
    client.release();
    res.status(200).json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Database connection failed during healthcheck:', error);
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

// Global Error Handler (prevents stack traces from leaking to the client)
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err.message);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(env.PORT, () => {
  console.log(`🚀 Switchboard server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
});