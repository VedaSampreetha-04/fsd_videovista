// app/api/attendance/log/route.ts
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Create a MySQL connection
const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root', // your MySQL username
    password: '', // your MySQL password
    database: 'zoom_clone',
});

export async function POST(request: Request) {
    const { userId, userName, meetingId } = await request.json();

    if (!userId || !userName || !meetingId) {
        return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    try {
        await connection.execute(
            'INSERT INTO attendance (user_id, user_name, meeting_id) VALUES (?, ?, ?)',
            [userId, userName, meetingId]
        );

        return NextResponse.json({ message: 'Attendance logged successfully' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Error logging attendance' }, { status: 500 });
    }
}
