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
      // Sort by start date
      const sortedDates = response.data.dates.sort((a, b) => 
        new Date(a.startDate) - new Date(b.startDate)
      );
      setSessions(sortedDates);
    } catch (error) {
      toast.error('Failed to fetch upcoming sessions');
    }
  };

  const formatDate = (dateString) => {
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
        {sessions.map((date) => (
          <div key={date.id} className="session-card">
            <div className="card-header">
              <div className="title-section">
                <h3>{date.session.title}</h3>
                {date.session.isFree && <span className="free-badge">FREE</span>}
              </div>
              <div className="badges">
                <span className={`type-badge ${date.type}`}>
                  {getSessionTypeDisplay(date.type)}
                </span>
                <span className={`status-badge ${date.session.status}`}>
                  {date.session.status}
                </span>
              </div>
            </div>
            <div className="session-details">
              <p><strong>Start:</strong> {formatDate(date.startDate)}</p>
              <p><strong>End:</strong> {formatDate(date.endDate)}</p>
              <p><strong>Duration:</strong> {date.duration} minutes</p>
              {date.session.description && (
                <p><strong>Description:</strong> {date.session.description}</p>
              )}
            </div>
            <div className="session-actions">
              {date.session.meetingId && (
                <a 
                  href={`https://zoom.us/j/${date.session.meetingId}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="action-button zoom"
                >
                  <FaVideo /> Join Meeting
                </a>
              )}
              {date.session.status === 'UPCOMING' && (
                <button 
                  className="action-button start"
                  onClick={() => {
                    setSelectedSession(date);
                    setIsStartModalOpen(true);
                  }}
                >
                  Start Meeting
                </button>
              )}
              {date.session.status === 'RUNNING' && (
                <button 
                  className="action-button end"
                  onClick={() => {
                    setSelectedSession(date);
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

      {isEndModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>End Session</h2>
            <form onSubmit={handleEndSession}>
              <textarea
                placeholder="Session Content"
                value={endSessionData.sessionContent}
                onChange={(e) => setEndSessionData({...endSessionData, sessionContent: e.target.value})}
                maxLength="255"
                required
              />
              <textarea
                placeholder={selectedSession?.session.userId ? 
                  "Individual Session Notes" : 
                  "Group Session Notes"}
                value={endSessionData.notes}
                onChange={(e) => setEndSessionData({...endSessionData, notes: e.target.value})}
                required
              />
              <div className="modal-buttons">
                <button type="submit">End Session</button>
                <button type="button" onClick={() => setIsEndModalOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isStartModalOpen && (
        <div className="modal-overlay">
          <div className="modal confirmation">
            <h2>Start Meeting</h2>
            <p>Are you sure you want to start this meeting?</p>
            <div className="modal-buttons">
              <button onClick={() => handleStartMeeting(selectedSession.session)}>Start</button>
              <button onClick={() => setIsStartModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingSessions;