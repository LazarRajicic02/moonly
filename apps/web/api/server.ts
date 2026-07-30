import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Express } from 'express';

export const config = {
  maxDuration: 60,
  memory: 1024,
};

let cached: Express | undefined;

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (!cached) {
    const { createNestApp } = await import('../../api/dist/create-app.js');
    cached = await createNestApp();
  }
  cached(req, res);
}
