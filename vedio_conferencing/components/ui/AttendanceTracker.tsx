// components/AttendanceTracker.tsx
import { useState } from 'react';

const AttendanceTracker = () => {
    const [meetingId, setMeetingId] = useState('');
    const [userId, setUserId] = useState('');
    const [attendanceRecords, setAttendanceRecords] = useState([]);

    const joinMeeting = async () => {
        const response = await fetch('/api/logJoin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ meeting_id: meetingId, user_id: userId }),
        });

        const data = await response.json();
        alert(data.message);
    };

    const leaveMeeting = async () => {
        const response = await fetch('/api/logLeave', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ meeting_id: meetingId, user_id: userId }),
        });

        const data = await response.json();
        alert(data.message);
    };

    const fetchAttendance = async () => {
        const response = await fetch(`/api/getAttendance?meeting_id=${meetingId}`);
        const data = await response.json();
        setAttendanceRecords(data.data);
    };

    return (
        <div>
            <h1>Attendance Tracker</h1>
            <input
                type="text"
                placeholder="Meeting ID"
                value={meetingId}
                onChange={(e) => setMeetingId(e.target.value)}
            />
            <input
                type="text"
                placeholder="User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
            />
            <button onClick={joinMeeting}>Join Meeting</button>
            <button onClick={leaveMeeting}>Leave Meeting</button>
            <button onClick={fetchAttendance}>Fetch Attendance</button>

            <h2>Attendance Records</h2>
            <ul>
                {attendanceRecords.map((record) => (
                    <li key={record.id}>
                        User ID: {record.user_id} | Joined: {record.join_time} | Left: {record.leave_time}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AttendanceTracker;
