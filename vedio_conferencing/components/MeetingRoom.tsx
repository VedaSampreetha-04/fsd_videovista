'use client';

import { useEffect, useState } from 'react';
import {
  CallControls,
  CallParticipantsList,
  CallStatsButton,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, LayoutList, Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import Loader from './Loader';
import EndCallButton from './EndCallButton';
import { cn } from '@/lib/utils';
import { useAuth } from '@clerk/nextjs'; // Import the useAuth hook from Clerk

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

const MeetingRoom = () => {
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get('personal');
  const router = useRouter();
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);
  const { useCallCallingState } = useCallStateHooks();

  // Get user ID from Clerk
  const { userId } = useAuth(); 
  const meetingId = searchParams.get('meetingId') || 'meeting123'; // Use dynamic meeting ID

  // State to hold user information
  const [user, setUser] = useState(null);
  const [attendanceLogged, setAttendanceLogged] = useState(false); // Track attendance logging status
  const [meetingEnded, setMeetingEnded] = useState(false); // Track if meeting has ended

  // Get calling state
  const callingState = useCallCallingState();

  // Fetch user data dynamically from API
  const fetchUser = async () => {
    if (!userId) return; // Ensure userId exists
    try {
      const response = await fetch(`/api/getUser?userId=${userId}`);
      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Log attendance
  const logAttendance = async () => {
    if (!userId || !meetingId || attendanceLogged) return; // Prevent duplicate logging

    const loginTime = new Date().toISOString(); // Correct timestamp format
    try {
      const response = await fetch('/api/attendance/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, meetingId, loginTime }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setAttendanceLogged(true); // Set attendance logged to true
      } else {
        console.error(result.error); // Handle error
      }
    } catch (error) {
      console.error('Error logging attendance:', error);
    }
  };

  // Download attendance
  const downloadAttendance = async () => {
    try {
      const response = await fetch(`/api/attendance/download?meetingId=${meetingId}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `attendance_${meetingId}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading attendance:', error);
    }
  };

  // Check calling state and show loader if not joined
  useEffect(() => {
    console.log("Current calling state:", callingState); // Debugging log

    if (callingState === CallingState.JOINED) {
      console.log("Meeting has joined, fetching user and logging attendance.");
      fetchUser(); // Fetch user data
      logAttendance(); // Log attendance when the user joins
    }

    if (callingState === CallingState.ENDED) {
      console.log("Meeting has ended, showing the download button.");
      setMeetingEnded(true); // Set meetingEnded to true when the meeting ends
    }
  }, [callingState, userId, meetingId]); // Dependencies to trigger effect

  // Fallback mechanism for testing (Remove this after debugging)
  useEffect(() => {
    setTimeout(() => {
      console.log("Fallback: Manually setting meetingEnded to true.");
      setMeetingEnded(true); // Manually set meetingEnded after 10 seconds
    }, 10000); // 10 seconds delay
  }, []);

  // Call layout component based on selected layout
  const CallLayout = () => {
    switch (layout) {
      case 'grid':
        return <PaginatedGridLayout />;
      case 'speaker-right':
        return <SpeakerLayout participantsBarPosition="left" />;
      default:
        return <SpeakerLayout participantsBarPosition="right" />;
    }
  };

  if (callingState !== CallingState.JOINED) {
    return <Loader />; // Show loader if not joined
  }

  return (
    <section className="relative h-screen w-full overflow-hidden pt-4 text-white">
      <div className="relative flex size-full items-center justify-center">
        <div className="flex size-full max-w-[1000px] items-center">
          <CallLayout />
        </div>
        <div className={cn('h-[calc(100vh-86px)] hidden ml-2', { 'show-block': showParticipants })}>
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      </div>
      {/* Video layout and call controls */}
      <div className="fixed bottom-0 flex w-full items-center justify-center gap-5">
        <CallControls onLeave={() => router.push(`/`)} />
        <DropdownMenu>
          <div className="flex items-center">
            <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
              <LayoutList size={20} className="text-white" />
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent className="border-dark-1 bg-dark-1 text-white">
            {['Grid', 'Speaker-Left', 'Speaker-Right'].map((item, index) => (
              <div key={index}>
                <DropdownMenuItem
                  onClick={() => setLayout(item.toLowerCase() as CallLayoutType)}
                >
                  {item}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="border-dark-1" />
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <CallStatsButton />
        <button onClick={() => setShowParticipants((prev) => !prev)}>
          <div className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
            <Users size={20} className="text-white" />
          </div>
        </button>
        {!isPersonalRoom && <EndCallButton />}
        {/* Download Attendance Button */}
        {console.log("meetingEnded state:", meetingEnded)} {/* Log the meetingEnded state */}
        {meetingEnded && ( // Show button only after meeting ends
          <button onClick={downloadAttendance} className="cursor-pointer rounded-3xl bg-blue-600 p-2">
            <Download className="mr-2 h-4 w-4" />
            Download Attendance
          </button>
        )}
      </div>
    </section>
  );
};

export default MeetingRoom;
