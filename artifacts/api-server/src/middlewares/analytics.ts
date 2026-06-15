/**
 * Vercel Analytics middleware for Express
 * 
 * Tracks API requests as page views in Vercel Analytics
 */

import type { Request, Response, NextFunction } from 'express';
import { trackApiRequest } from '../lib/analytics';

/**
 * Middleware to track API requests with Vercel Analytics
 * 
 * This middleware tracks each API request as a custom event in Vercel Analytics.
 * It runs asynchronously and won't block the request/response cycle.
 */
export function analyticsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Track the request asynchronously without blocking
  trackApiRequest(req).catch((error) => {
    // Silently log errors to avoid disrupting the request
    console.error('Analytics tracking error:', error);
  });

  // Continue with the request immediately
  next();
}
