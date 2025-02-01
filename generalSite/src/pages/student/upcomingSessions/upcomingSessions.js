import React, { useState, useEffect } from 'react';
import { useGetNextWeekDates } from '../../../hooks/nextweekdates';
import { useEndSession } from '../../../hooks/endsessionmeeting';
import { useStartMeeting } from '../../../hooks/startsessionmeeting';
import Loading from '../../../components/loading/loading';
import { toast } from 'react-toastify';
import { FaVideo } from 'react-icons/fa';
import './upcomingSessions.css';

const UpcomingSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [subscriptionStatus, setSubscriptionStatus] = useState('');
  const { execute: getNextWeekDates, isLoading } = useGetNextWeekDates();
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [endSessionData, setEndSessionData] = useState({ sessionContent: '', notes: '' });
  const { execute: endSession, isLoading: isLoadingEnd } = useEndSession();
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const { execute: startMeeting, isLoading: isLoadingStart } = useStartMeeting();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await getNextWeekDates();
      setSubscriptionStatus(response.data.subscribtionStatus);
      setSessions(response.data.sessions);
    } catch (error) {
      toast.error('Failed to fetch upcoming sessions');
    }
  };

  const formatDate = (dateString) => {
    console.log(dateString);
    if (!dateString) return 'Not started';
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSessionTypeDisplay = (type) => {
    return type === 'GROUP_SESSION' ? 'Group' : 'Individual';
  };

  const handleEndSession = async (e) => {
    e.preventDefault();
    try {
      const sessionType = selectedSession.session.userId ? 'INDIVIDUAL' : 'GROUP';
      const payload = {
        sessionContent: endSessionData.sessionContent,
        notes: sessionType === 'GROUP' ? 
          [{ userId: selectedSession.session.userId, notes: endSessionData.notes }] : 
          endSessionData.notes
      };
      
      await endSession(sessionType, selectedSession.session.id, payload);
      toast.success('Session ended successfully');
      fetchSessions();
      setIsEndModalOpen(false);
      setEndSessionData({ sessionContent: '', notes: '' });
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to end session');
    }
  };

  const handleStartMeeting = async (session) => {
    try {
      const sessionType = session.userId ? 'INDIVIDUAL' : 'GROUP';
      const response = await startMeeting(sessionType, session.id);
      window.open(response.data.startUrl, '_blank');
    } catch (error) {
      toast.error('Failed to start meeting');
    }
    setIsStartModalOpen(false);
  };

  if (isLoading) return <Loading isVisible={true} />;

  return (
    <div className="upcoming-sessions-container">
      <h2>Upcoming Sessions</h2>
      <div className="sessions-list">
        {sessions.map((session) => (
          <div key={session.id} className="session-card">
            <div className="card-header">
              <div className="title-section">
                <h3>{session.title}</h3>
                {session.isFree && <span className="free-badge">FREE</span>}
              </div>
              <div className="badges">
                <span className={`status-badge ${session.status}`}>
                  {session.status}
                </span>
              </div>
            </div>
            <div className="session-details">
              <p><strong>Start:</strong> { formatDate(session.startedAt) }</p>
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
              {session.status === 'UPCOMING' && (
                <button 
                  className="action-button start"
                  onClick={() => {
                    setSelectedSession(session);
                    setIsStartModalOpen(true);
                  }}
                >
                  Start Meeting
                </button>
              )}
              {session.status === 'RUNNING' && (
                <button 
                  className="action-button end"
                  onClick={() => {
                    setSelectedSession(session);
                    setIsEndModalOpen(true);
                  }}
                >
                  End Session
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

   
    </div>
  );
};

export default UpcomingSessions;