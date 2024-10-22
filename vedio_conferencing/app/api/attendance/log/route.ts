import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root', // Your MySQL username
  password: '', // Your MySQL password
  database: 'zoom_clone', // Your database name
};

export async function POST(request: Request) {
  const { userId, meetingId, loginTime } = await request.json();
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // Check for existing attendance entry
    const [existingRows] = await connection.execute(
      'SELECT * FROM attendance WHERE userId = ? AND meetingId = ? AND logoutTime IS NULL',
      [userId, meetingId]
    );

    // If no existing entry, insert new attendance record
    if (existingRows.length === 0) {
      await connection.execute(
        'INSERT INTO attendance (userId, meetingId, loginTime) VALUES (?, ?, ?)',
        [userId, meetingId, loginTime]
      );
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: 'Attendance already logged for this meeting' });
    }
  } catch (error) {
    console.error('Error logging attendance:', error);
    return NextResponse.json({ success: false, error: 'Failed to log attendance' });
  } finally {
    await connection.end();
  }
}
