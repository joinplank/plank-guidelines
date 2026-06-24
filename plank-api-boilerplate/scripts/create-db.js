const { Client } = require('pg');

async function main() {
  const url = new URL(process.env.DATABASE_URL);
  const dbName = url.pathname.slice(1);

  url.pathname = '/postgres';

  const client = new Client({ connectionString: url.toString() });
  await client.connect();

  const { rows } = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
  if (rows.length === 0) {
    await client.query(`CREATE DATABASE "${dbName}"`);
    console.log(`Database "${dbName}" created.`);
  }

  await client.end();
}

main().catch((err) => {
  console.error('Failed to ensure database exists:', err.message);
  process.exit(1);
});
