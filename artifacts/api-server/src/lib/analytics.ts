/**
 * Vercel Analytics integration for server-side tracking
 * 
 * This module provides utilities for tracking custom events and API usage
 * with Vercel Web Analytics from the server side.
 */

import { track } from '@vercel/analytics/server';
import type { Request } from 'express';

/**
 * Track a custom event with Vercel Analytics
 * 
 * @param eventName - Name of the event to track
 * @param properties - Optional properties to attach to the event
 * @returns Promise that resolves when the event is tracked
 * 
 * @example
 * ```typescript
 * await trackEvent('user_signup', { source: 'api' });
 * ```
 */
export async function trackEvent(
  eventName: string,
  properties?: Record<string, string | number | boolean | null>
): Promise<void> {
  try {
    await track(eventName, properties);
  } catch (error) {
    // Log error but don't throw to avoid disrupting the application
    console.error('Failed to track analytics event:', error);
  }
}

/**
 * Track an API request with Vercel Analytics
 * 
 * @param req - Express request object
 * @param eventName - Optional custom event name (defaults to 'api_request')
 * @returns Promise that resolves when the event is tracked
 * 
 * @example
 * ```typescript
 * await trackApiRequest(req);
 * ```
 */
export async function trackApiRequest(
  req: Request,
  eventName: string = 'api_request'
): Promise<void> {
  const properties = {
    method: req.method,
    path: req.path,
    endpoint: `${req.method} ${req.path}`,
  };

  await trackEvent(eventName, properties);
}
