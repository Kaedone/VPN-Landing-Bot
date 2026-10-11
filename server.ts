import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './src/server/routes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env if present
try {
  process.loadEnvFile?.();
} catch {
  // Ignore if .env is absent
}

async function startServer() {
  const app = express();
  const port = parseInt(process.env.PORT || '3000', 10);
  const host = '0.0.0.0';

  // Request body parsing
  app.use(express.json({ limit: '100kb' }));

  // API Routes mounted on /api
  app.use('/api', apiRouter);

  if (process.env.NODE_ENV !== 'production') {
    // Mount Vite dev middleware in development mode
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving from dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, host, () => {
    console.log(`AdultVPN full-stack server running on http://${host}:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
