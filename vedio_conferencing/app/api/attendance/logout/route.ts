// app/api/attendance/logout/route.ts
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root', // Your MySQL username
  password: '', // Your MySQL password
  database: 'zoom_clone', // Your database name
};

export async function POST(request: Request) {
  const { userId, meetingId, logoutTime } = await request.json();
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    await connection.execute(
      'UPDATE attendance SET logoutTime = ? WHERE userId = ? AND meetingId = ? AND logoutTime IS NULL',
      [logoutTime, userId, meetingId]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging logout:', error);
    return NextResponse.json({ success: false, error: 'Failed to log logout' });
  } finally {
    await connection.end();
  }
}
