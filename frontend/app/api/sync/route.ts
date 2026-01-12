import { NextRequest, NextResponse } from 'next/server';
import { fullSync, syncAllUsersToPrisma, syncFriendshipsToPrisma } from '@/app/lib/sync';

/**
 * Manual Sync API Route
 *
 * This endpoint allows triggering a database sync manually.
 * Protected by a secret token to prevent unauthorized access.
 *
 * Usage:
 *   POST /api/sync
 *   Headers:
 *     Authorization: Bearer <SYNC_SECRET>
 *   Body (optional):
 *     { "type": "full" | "users" | "friendships" }
 *
 * Examples:
 *   curl -X POST http://localhost:3001/api/sync \
 *     -H "Authorization: Bearer your-secret-here" \
 *     -H "Content-Type: application/json" \
 *     -d '{"type": "full"}'
 */

export async function POST(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.SYNC_SECRET || 'dev-secret-change-in-production'}`;

    if (authHeader !== expectedAuth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    let syncType = 'full';
    try {
      const body = await request.json();
      syncType = body.type || 'full';
    } catch {
      // No body or invalid JSON, use default
    }

    // Validate sync type
    if (!['full', 'users', 'friendships'].includes(syncType)) {
      return NextResponse.json(
        { error: 'Invalid sync type. Must be: full, users, or friendships' },
        { status: 400 }
      );
    }

    console.log(`[Sync API] Starting ${syncType} sync...`);
    const startTime = Date.now();

    let result;

    switch (syncType) {
      case 'users':
        result = {
          users: await syncAllUsersToPrisma(),
          friendships: { synced: 0, errors: 0 },
        };
        break;

      case 'friendships':
        result = {
          users: { synced: 0, errors: 0 },
          friendships: await syncFriendshipsToPrisma(),
        };
        break;

      case 'full':
      default:
        result = await fullSync();
        break;
    }

    const duration = Date.now() - startTime;

    console.log(`[Sync API] Sync completed in ${duration}ms`);
    console.log(`[Sync API] Users: ${result.users.synced} synced, ${result.users.errors} errors`);
    console.log(`[Sync API] Friendships: ${result.friendships.synced} synced, ${result.friendships.errors} errors`);

    return NextResponse.json({
      success: true,
      type: syncType,
      result,
      duration,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Sync API] Error:', error);

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

// GET endpoint for health check
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Sync API endpoint',
    methods: ['POST'],
    usage: 'POST with Authorization header and optional body: { "type": "full" | "users" | "friendships" }',
  });
}
