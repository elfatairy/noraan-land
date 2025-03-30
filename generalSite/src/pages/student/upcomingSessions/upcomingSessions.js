import React, { useState, useEffect } from 'react';
import { useGetStudentUpcomingSessions } from '../../../hooks/userupcommingcourses';
import { useJoinSession } from '../../../hooks/joinSession';
import Loading from '../../../components/loading/loading';
import { toast } from 'react-toastify';
import { FaVideo } from 'react-icons/fa';
import './upcomingSessions.css';

const ToggleButton = ({ value, onChange }) => {
  return (
    <div className="toggle-container">
      <button 
        className={`toggle-button ${value === 'today' ? 'active' : ''}`}
        onClick={() => onChange('today')}
      >
        Today
      </button>
      <button 
        className={`toggle-button ${value === 'next-week' ? 'active' : ''}`}
        onClick={() => onChange('next-week')}
      >
        Next Week
      </button>
    </div>
  );
};

const UpcomingSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [timeFilter, setTimeFilter] = useState('next-week');
  const { execute: getUpcomingSessions, isLoading } = useGetStudentUpcomingSessions();
  const { execute: joinSession } = useJoinSession();

  useEffect(() => {
    fetchSessions();
  }, [timeFilter]);

  const fetchSessions = async () => {
    try {
      const response = await getUpcomingSessions();
      if (response?.data?.sessions) {
        // Sort sessions by startDate
        const sortedSessions = response.data.sessions.sort((a, b) => 
          new Date(a.startedAt || a.createdAt) - new Date(b.startedAt || b.createdAt)
        );

        // Filter sessions based on timeFilter
        if (timeFilter === 'today') {
          const today = new Date().setHours(0,0,0,0);
          const filteredSessions = sortedSessions.filter(session => {
            const sessionDate = new Date(session.startedAt || session.createdAt).setHours(0,0,0,0);
            return sessionDate === today;
          });
          setSessions(filteredSessions);
        } else {
          setSessions(sortedSessions);
        }
      }
    } catch (error) {
      toast.error('Failed to fetch upcoming sessions');
    }
  };

  const handleJoinSession = async (courseId, sessionId, zoomLink) => {
    try {
      await joinSession(courseId, sessionId);
      window.open(zoomLink, '_blank');
    } catch (error) {
      toast.error('Failed to join session');
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
      <div className="header">
        <h2>Upcoming Sessions</h2>
      </div>
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
                {session.showLink && session.zoomLink && (
                  <button 
                    className="action-button zoom"
                    onClick={() => handleJoinSession(session.courseId, session.id, session.zoomLink)}
                  >
                    <FaVideo /> Join Meeting
                  </button>
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