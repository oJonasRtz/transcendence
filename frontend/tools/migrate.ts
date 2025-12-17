/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   migrate.ts                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: josfelip <josfelip@student.42sp.org.br>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/12/17 12:51:49 by josfelip          #+#    #+#             */
/*   Updated: 2025/12/17 12:54:35 by josfelip         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// Use this script to create or migrate the database schema.
// Run it with: `npx tsx migrate.ts`

import postgres from 'postgres';
import 'dotenv/config';

console.log(`POSTGRES_URL: ${process.env.POSTGRES_URL}`);

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

async function testConnection() {
  try {
    const result = await sql`SELECT NOW()`;
    console.log('Database connected successfully!');
    console.log('Current time:', result[0].now);
    await sql.end();
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

testConnection();