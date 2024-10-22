// app/api/attendance/download/route.ts
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root', // Your MySQL username
  password: '', // Your MySQL password
  database: 'zoom_clone', // Your database name
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const meetingId = searchParams.get('meetingId');

  const connection = await mysql.createConnection(dbConfig);
  
  try {
    const [rows] = await connection.execute(
      'SELECT * FROM attendance WHERE meetingId = ?',
      [meetingId]
    );

    const csvData = rows.map(row => {
      return `${row.userId},${row.meetingId},${row.loginTime},${row.logoutTime}`;
    }).join('\n');

    const csvHeader = 'UserId,MeetingId,LoginTime,LogoutTime\n';
    const csvContent = csvHeader + csvData;

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=attendance_${meetingId}.csv`,
      },
    });
  } catch (error) {
    console.error('Error downloading attendance:', error);
    return NextResponse.json({ success: false, error: 'Failed to download attendance' });
  } finally {
    await connection.end();
  }
}
