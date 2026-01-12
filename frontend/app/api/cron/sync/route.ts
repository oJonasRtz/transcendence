import { NextRequest, NextResponse } from 'next/server';
import { syncAllUsersToPrisma } from '@/app/lib/sync';

/**
 * Background Sync Cron Job
 *
 * This endpoint is designed to be called periodically by a cron service
 * (e.g., Vercel Cron, GitHub Actions, or external cron-job.org).
 *
 * It syncs only basic user data (not friendships) to keep it lightweight.
 * Friendships are synced on-demand when users add/remove friends.
 *
 * Recommended schedule: Every 5 minutes
 *
 * Usage with Vercel Cron:
 *   Add to vercel.json:
 *   {
 *     "crons": [{
 *       "path": "/api/cron/sync",
 *       "schedule": "every 5 minutes"
 *     }]
 *   }
 *
 * Manual trigger:
 *   curl -X GET http://localhost:3001/api/cron/sync \
 *     -H "Authorization: Bearer <CRON_SECRET>"
 */

export async function GET(request: NextRequest) {
  try {
    // Verify authorization
    // In production, Vercel Cron automatically adds this header
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET || 'dev-cron-secret'}`;

    if (authHeader !== expectedAuth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Cron Sync] Starting background user sync...');
    const startTime = Date.now();

    // Only sync users (lightweight operation)
    // Friendships are synced on-demand
    const result = await syncAllUsersToPrisma();

    const duration = Date.now() - startTime;

    console.log(`[Cron Sync] Completed in ${duration}ms`);
    console.log(`[Cron Sync] Users: ${result.synced} synced, ${result.errors} errors`);

    return NextResponse.json({
      success: true,
      result,
      duration,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cron Sync] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
