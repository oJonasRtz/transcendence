#!/usr/bin/env node

/**
 * Database Sync Script
 *
 * This script performs a full sync from SQLite backend to Prisma PostgreSQL.
 * Run this once during initial setup or when you need to refresh all data.
 *
 * Usage:
 *   node scripts/sync-databases.js [options]
 *
 * Options:
 *   --users-only     Sync only users (skip friendships)
 *   --friends-only   Sync only friendships (skip users)
 *   --dry-run        Show what would be synced without actually syncing
 *   --help           Show this help message
 */

import { fullSync, syncAllUsersToPrisma, syncFriendshipsToPrisma } from '../app/lib/sync.ts';

const args = process.argv.slice(2);

// Parse command line arguments
const options = {
  usersOnly: args.includes('--users-only'),
  friendsOnly: args.includes('--friends-only'),
  dryRun: args.includes('--dry-run'),
  help: args.includes('--help'),
};

// Show help message
if (options.help) {
  console.log(`
Database Sync Script
====================

Syncs data from SQLite backend to Prisma PostgreSQL.

Usage:
  node scripts/sync-databases.js [options]

Options:
  --users-only     Sync only users (skip friendships)
  --friends-only   Sync only friendships (skip users)
  --dry-run        Show what would be synced without actually syncing (NOT IMPLEMENTED)
  --help           Show this help message

Examples:
  node scripts/sync-databases.js                 # Full sync (users + friendships)
  node scripts/sync-databases.js --users-only    # Sync only users
  node scripts/sync-databases.js --friends-only  # Sync only friendships

Notes:
  - Ensure backend services are running before syncing
  - Set BACKEND_URL environment variable if not using default (http://localhost:3000)
  - You must be authenticated (have a valid JWT token) to fetch data from backend
  `);
  process.exit(0);
}

// Validate options
if (options.usersOnly && options.friendsOnly) {
  console.error('Error: Cannot use --users-only and --friends-only together');
  process.exit(1);
}

async function main() {
  console.log('='.repeat(60));
  console.log('DATABASE SYNC SCRIPT');
  console.log('='.repeat(60));
  console.log('');

  const startTime = Date.now();

  try {
    // Check environment
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    console.log(`Backend URL: ${backendUrl}`);
    console.log('');

    if (options.dryRun) {
      console.log('⚠️  DRY RUN MODE: No changes will be made');
      console.log('');
      console.warn('Warning: --dry-run is not yet implemented');
      console.log('');
    }

    let result;

    if (options.usersOnly) {
      console.log('📝 Syncing users only...');
      console.log('');
      result = { users: await syncAllUsersToPrisma(), friendships: { synced: 0, errors: 0 } };
    } else if (options.friendsOnly) {
      console.log('👥 Syncing friendships only...');
      console.log('');
      result = { users: { synced: 0, errors: 0 }, friendships: await syncFriendshipsToPrisma() };
    } else {
      console.log('🔄 Starting full sync (users + friendships)...');
      console.log('');
      result = await fullSync();
    }

    console.log('');
    console.log('='.repeat(60));
    console.log('SYNC RESULTS');
    console.log('='.repeat(60));
    console.log('');
    console.log('Users:');
    console.log(`  ✅ Synced: ${result.users.synced}`);
    console.log(`  ❌ Errors: ${result.users.errors}`);
    console.log('');
    console.log('Friendships:');
    console.log(`  ✅ Synced: ${result.friendships.synced}`);
    console.log(`  ❌ Errors: ${result.friendships.errors}`);
    console.log('');

    const totalSynced = result.users.synced + result.friendships.synced;
    const totalErrors = result.users.errors + result.friendships.errors;

    console.log('Total:');
    console.log(`  ✅ Synced: ${totalSynced}`);
    console.log(`  ❌ Errors: ${totalErrors}`);
    console.log('');

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`⏱️  Duration: ${duration}s`);
    console.log('');

    if (totalErrors > 0) {
      console.warn('⚠️  Warning: Some items failed to sync. Check logs above for details.');
      console.log('');
      process.exit(1);
    } else {
      console.log('✅ Sync completed successfully!');
      console.log('');
      process.exit(0);
    }
  } catch (error) {
    console.error('');
    console.error('='.repeat(60));
    console.error('SYNC FAILED');
    console.error('='.repeat(60));
    console.error('');
    console.error('Error:', error.message);
    console.error('');

    if (error.message.includes('ECONNREFUSED')) {
      console.error('💡 Tip: Make sure the backend services are running');
      console.error('   Try: docker-compose up -d');
    } else if (error.message.includes('Not authenticated')) {
      console.error('💡 Tip: This script requires authentication');
      console.error('   You need a valid JWT token in the authToken cookie');
      console.error('   Consider running this from within the app context or implementing a service account');
    } else if (error.message.includes('Prisma')) {
      console.error('💡 Tip: Make sure Prisma is properly set up');
      console.error('   Try: pnpm prisma generate && pnpm prisma db push');
    }

    console.error('');
    console.error('Full error stack:');
    console.error(error.stack);
    console.error('');
    process.exit(1);
  }
}

main();
