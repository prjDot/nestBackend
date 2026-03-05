import type { NextFunction, Request, Response } from 'express';

export function normalizePathMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const [path, query] = req.url.split('?');
  const normalizedPath = path.replace(/\/{2,}/g, '/');
  req.url = query ? `${normalizedPath}?${query}` : normalizedPath;
  next();
}
