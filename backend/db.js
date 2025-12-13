import bcrypt from 'bcrypt';
import Database from 'better-sqlite3';
import fp from 'fastify-plugin';
import { invoices, customers, revenue, users } from './placeholder-data.js';
import { randomUUID } from 'crypto';

async function dbPlugin(fastify, options) {
    const db = new Database(options.path || 'mydb.sqlite');

    db.exec(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
      )`);

    const insertUser = db.prepare(`
      INSERT OR IGNORE INTO users (id, name, email, password)
      VALUES (?, ?, ?, ?)
    `)

    const insertedUsers = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        const userId = user.id || randomUUID();
        return insertUser.run(userId, user.name, user.email, hashedPassword);
      })
    );

    console.log(`Inserted ${insertedUsers.length} users into the database.`);

    db.exec(`CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      amount INTEGER NOT NULL,
      status TEXT NOT NULL,
      date TEXT NOT NULL
    )`);

    const insertInvoice = db.prepare(`
      INSERT OR IGNORE INTO invoices (id, customer_id, amount, status, date) VALUES (?, ?, ?, ?, ?)
    `);

    const insertedInvoices = invoices.map((invoice) => {
      const invoiceId = randomUUID();
      return insertInvoice.run(
        invoiceId,
        invoice.customer_id,
        invoice.amount,
        invoice.status,
        invoice.date
      );
    })

    console.log(`Inserted ${insertedInvoices.length} invoices into the database.`);

    db.exec(`CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      image_url TEXT NOT NULL
      )`);

    const insertCustomer = db.prepare(`INSERT OR IGNORE INTO customers (id, name, email, image_url) VALUES (?, ?, ?, ?)`);

    const insertedCustomers = customers.map((customer) => {
      const customerId = customer.id || randomUUID();
      return insertCustomer.run(
        customerId,
        customer.name,
        customer.email,
        customer.image_url
      );
    })

    console.log(`Inserted ${insertedCustomers.length} customers into the database.`);

    db.exec(`CREATE TABLE IF NOT EXISTS revenue (
      month TEXT NOT NULL PRIMARY KEY,
      revenue INTEGER NOT NULL
    )`);

    const insertRevenue = db.prepare(`INSERT OR IGNORE INTO revenue (month, revenue) VALUES (?, ?)`);

    const insertedRevenue = revenue.map((rev) => {
      return insertRevenue.run(
        rev.month,
        rev.revenue
      );
    })

    console.log(`Inserted ${insertedRevenue.length} revenue records into the database.`);

    fastify.decorate('db', db);

    fastify.addHook('onClose', (instance, done) => {
      db.close();
      done();
    });
}

export default fp(dbPlugin);