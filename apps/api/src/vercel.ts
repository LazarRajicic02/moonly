import type { Request, Response } from 'express';
import { createNestApp } from './create-app';

let cached: Awaited<ReturnType<typeof createNestApp>> | undefined;

export default async function handler(req: Request, res: Response) {
  if (!cached) {
    cached = await createNestApp();
  }
  return cached(req, res);
}
