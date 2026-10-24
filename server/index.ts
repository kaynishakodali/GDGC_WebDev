import 'dotenv/config';
import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import express from 'express';
import app from './app.js';
import { prisma } from './db.js';

const port = Number(process.env.PORT || 4000);
const host = process.env.HOST || '0.0.0.0';
const dist = resolve(process.cwd(), 'dist');
const server = createServer(app);
if (existsSync(dist)) {
  app.use((req, res, next) => {
    if (req.path === '/seed/seed.json' || req.path.startsWith('/assets/aistudio/')) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Not found.' } });
      return;
    }
    next();
  });
  app.use(express.static(dist, { index: false, dotfiles: 'deny', maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0 }));
  app.get('*path', (req, res, next) => { if (req.path.startsWith('/api/') || req.path === '/seed/seed.json' || req.path.startsWith('/assets/aistudio/')) return next(); res.sendFile(resolve(dist, 'index.html')); });
}

async function start() {
  await prisma.$connect();
  server.listen(port, host, () => console.info(`OBSURA API listening on http://${host}:${port}`));
}
start().catch(() => {
  console.error('OBSURA could not start. Check DATABASE_URL and PostgreSQL availability.');
  process.exitCode = 1;
});
async function shutdown(signal: string) {
  console.info(`Received ${signal}; shutting down.`);
  server.close(async () => { await prisma.$disconnect(); process.exit(0); });
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
