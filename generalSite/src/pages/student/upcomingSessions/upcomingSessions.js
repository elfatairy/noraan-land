import React, { useState, useEffect } from 'react';
import { useGetStudentUpcomingSessions } from '../../../hooks/userupcommingcourses';
import Loading from '../../../components/loading/loading';
import { toast } from 'react-toastify';
import { FaVideo } from 'react-icons/fa';
import './upcomingSessions.css';

const UpcomingSessions = () => {
  const [sessions, setSessions] = useState([]);
  const { execute: getUpcomingSessions, isLoading } = useGetStudentUpcomingSessions();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await getUpcomingSessions();
      if (response?.data?.sessions) {
        // Sort sessions by startDate
        const sortedSessions = response.data.sessions.sort((a, b) => 
          new Date(a.startedAt || a.createdAt) - new Date(b.startedAt || b.createdAt)
        );
        setSessions(sortedSessions);
      }
    } catch (error) {
      toast.error('Failed to fetch upcoming sessions');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) return <Loading isVisible={true} />;

  return (
    <div className="upcoming-sessions-container">
      <h2>Upcoming Sessions</h2>
      <div className="sessions-list">
        {sessions.length > 0 ? (
          sessions.map((session) => (
            <div key={session.id} className="session-card">
              <div className="card-header">
                <div className="title-section">
                  <h3>{session.title}</h3>
                  {session.isFree && <span className="free-badge">FREE</span>}
                </div>
                <div className="badges">
                  <span className={`status-badge ${session.status.toLowerCase()}`}>
                    {session.status}
                  </span>
                </div>
              </div>
              <div className="session-details">
                <p><strong>Course:</strong> {session.courseName}</p>
                <p><strong>Start Time:</strong> {formatDate(session.startedAt)}</p>
                {session.description && (
                  <p><strong>Description:</strong> {session.description}</p>
                )}
              </div>
              <div className="session-actions">
                {session.status === 'RUNNING' && session.meetingId && (
                  <a 
                    href={`https://zoom.us/j/${session.meetingId}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="action-button zoom"
                  >
                    <FaVideo /> Join Meeting
                  </a>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-sessions">
            <p>No upcoming sessions found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingSessions;