#!/usr/bin/env node

import supertest from 'supertest';
import fastify from './index.js';

async function runSimpleTests() {
  console.log('🚀 Starting Simple Relations API Tests...\n');
  
  let server;
  try {
    // Start the server
    server = await fastify.ready();
    console.log('✅ Server ready\n');

    const tests = [
      {
        name: 'GET /api/friends/friends/invalid (should return 400)',
        test: () => supertest(fastify.server).get('/api/friends/friends/invalid').expect(400)
      },
      {
        name: 'POST /api/friends/request/invalid (should return 400)',
        test: () => supertest(fastify.server).post('/api/friends/request/invalid').send({ targetUserId: 2 }).expect(400)
      },
      {
        name: 'POST /api/friends/request/1 with self (should return 400)',
        test: () => supertest(fastify.server).post('/api/friends/request/1').send({ targetUserId: 1 }).expect(400)
      },
      {
        name: 'GET /api/friends/status/invalid (should return 400)',
        test: () => supertest(fastify.server).get('/api/friends/status/invalid').expect(400)
      }
    ];

    let passed = 0;
    let failed = 0;

    for (const { name, test } of tests) {
      try {
        console.log(`🧪 Testing: ${name}`);
        await test();
        console.log('✅ PASSED\n');
        passed++;
      } catch (error) {
        console.log(`❌ FAILED: ${error.message}\n`);
        failed++;
      }
    }

    console.log('📊 Test Results:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

    if (failed === 0) {
      console.log('\n🎉 All tests passed! Relations API is working correctly.');
    } else {
      console.log('\n⚠️  Some tests failed. Check the output above.');
    }

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
  } finally {
    // Close the server
    if (server) {
      await fastify.close();
      console.log('\n🔒 Server closed');
    }
    process.exit(0);
  }
}

// Run the tests
runSimpleTests().catch(console.error);
