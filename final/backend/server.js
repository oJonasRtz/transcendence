import Fastify from 'fastify';
import dbPlugin from './db.js';

const fastify = Fastify({ logger: true });

await fastify.register(dbPlugin, { path: 'mydb.sqlite' });

fastify.post('/users', async (request, reply) => {
    const { username, nickname } = request.body;

    const insert = fastify.db.prepare('INSERT INTO users (username, nickname) VALUES (?, ?)');
    const result = insert.run(username, nickname);

    const getUser = fastify.db.prepare('SELECT * FROM users WHERE id = ?');
    const user = getUser.get(result.lastInsertRowid);

    return reply.status(201).send(user);
});

fastify.get('/users', async (request, reply) => {
    const users = fastify.db.prepare('SELECT * FROM users').all();
    return { users };
});

fastify.get('/query', async (request, reply) => {
  const data = fastify.db.prepare(`
    SELECT invoices.amount, customers.name
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE invoices.amount = 666;`).all();
    return { data };
});

fastify.get('/revenue', async (request, reply) => {
  const data = fastify.db.prepare('SELECT * FROM revenue;').all();
  return { data };
});

fastify.get('/invoices', async (request, reply) => {
  const data = fastify.db.prepare(`
    SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      ORDER BY invoices.date DESC
      LIMIT 5`).all();
    return data;

})

fastify.get('/card', async (request, reply) => {
  try {
    const invoiceCount = fastify.db.prepare('SELECT COUNT(*) as count FROM invoices;').get();
    const customerCount = fastify.db.prepare('SELECT COUNT(*) as count FROM customers;').get();
    const invoiceStatus = fastify.db.prepare(`
      SELECT 
        SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
      FROM invoices;`).get();

    const numberOfInvoices = invoiceCount.count || 0;
    const numberOfCustomers = customerCount.count || 0;
    const totalPaidInvoices = invoiceStatus.paid || 0;
    const totalPendingInvoices = invoiceStatus.pending || 0;

    return { numberOfInvoices, numberOfCustomers, totalPaidInvoices, totalPendingInvoices };

  } catch (error) {
    console.error('Error fetching card data:', error);
    throw new Error('Failed to fetch card data');
  }
});

await fastify.listen({ port: 3002, host: '0.0.0.0' });
