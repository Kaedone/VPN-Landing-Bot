import express from 'express';
import { apiRouter } from '../src/server/routes';

const app = express();
app.use(express.json({ limit: '100kb' }));
app.use('/api', apiRouter);

export default app;
