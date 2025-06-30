import { NextResponse } from 'next/server';
import { Client } from 'pg';

export async function GET() {
  const client = new Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_NAME,
  });

  try {
    await client.connect();
    const res = await client.query('SELECT * FROM record_data'); // ชื่อ table จริงของคุณ
    await client.end();
    return NextResponse.json(res.rows);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }
}
