import React, { useState, useEffect } from 'react';
import { useGetNextWeekDates } from '../../../hooks/nextweekdates';
import { useStartMeeting } from '../../../hooks/startsessionmeeting';
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
  // State
  const [sessions, setSessions] = useState([]);
  const [timeFilter, setTimeFilter] = useState('next-week');
  const [selectedSession, setSelectedSession] = useState(null);
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);

  // Hooks
  const { execute: getNextWeekDates, isLoading } = useGetNextWeekDates();
  const { execute: startMeeting, isLoading: isLoadingStart } = useStartMeeting();

  useEffect(() => {
    fetchSessions();
  }, [timeFilter]); // Add timeFilter as dependency

  const fetchSessions = async () => {
    try {
      const response = await getNextWeekDates();
      const sortedDates = response.data.dates.sort((a, b) => 
        new Date(a.startDate) - new Date(b.startDate)
      );
      
      if (timeFilter === 'today') {
        const today = new Date().setHours(0,0,0,0);
        const filteredDates = sortedDates.filter(date => {
          const sessionDate = new Date(date.startDate).setHours(0,0,0,0);
          return sessionDate === today;
        });
        setSessions(filteredDates);
      } else {
        setSessions(sortedDates);
      }
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

  const handleStartMeeting = async (session) => {
    try {
      const response = await startMeeting(session.id);
      window.open(response.data.zoomLink, '_blank');
    } catch (error) {
      toast.error('Failed to start meeting');
    }
  };

  if (isLoading) return <Loading isVisible={true} />;

  return (
    <div className="upcoming-sessions-container">
      <div className="header">
        <h2>Upcoming Sessions</h2>
        <ToggleButton 
          value={timeFilter} 
          onChange={(value) => {
            setTimeFilter(value);
          }} 
        />
      </div>
      <div className="sessions-list">
        {sessions.map((date) => (
          <div key={date.id} className="session-card">
            <div className="card-header">
              <div className="title-section">
                <h3>{date.session.title}</h3>
                {date.session.isFree && <span className="free-badge">FREE</span>}
              </div>
              <div className="badges">
                <span className={`type-badge ${date.session.sessionType}`}>
                  {date.session.sessionType === 'GROUP' ? 'GROUP' : 'PRIVATE'}
                </span>
                <span className={`status-badge ${date.session.status}`}>
                  {date.session.status}
                </span>
                {date.changingStatus !== 'UNCHANGED' && (
                  <span className="change-badge">RESCHEDULED</span>
                )}
              </div>
            </div>
            <div className="session-details">
              <p><strong>Start:</strong> {formatDate(date.startDate)}</p>
              <p><strong>Duration:</strong> {date.duration} minutes</p>
              {date.session.description && (
                <p><strong>Description:</strong> {date.session.description}</p>
              )}
            </div>
            <div className="session-actions">
              {date.session.status === 'UPCOMING' && (
                <button 
                  className="action-button-upcoming start"
                  onClick={() => {
                    setSelectedSession(date);
                    setIsStartModalOpen(true);
                  }}
                >
                  Start Meeting
                </button>
              )}
              <a 
                href={`/admin/courses/${date.session.courseId}/sessions?${new URLSearchParams({
                  sessionId: date.session.id,
                  ...(date.session.course.zoomLink && { zoomUrl: date.session.course.zoomLink })
                }).toString()}`}
                className="action-button-upcoming view"
              >
                View Session
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Start Meeting Modal */}
      {isStartModalOpen && (
        <div className="modal-overlay">
          <div className="modal confirmation">
            <h2>Start Meeting</h2>
            <p>Are you sure you want to start this meeting?</p>
            <div className="modal-buttons">
              <button onClick={() => handleStartMeeting(selectedSession.session)}>
                Start
              </button>
              <button onClick={() => setIsStartModalOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingSessions;