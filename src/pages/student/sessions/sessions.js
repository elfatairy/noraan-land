import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGetCourseSessions } from '../../../hooks/getcoursesessionshook';
import { useJoinSession } from '../../../hooks/joinsessionhook';
import Loading from '../../../components/loading/loading';
import { toast } from 'react-toastify';
import { FaVideo, FaPlayCircle } from 'react-icons/fa';
import './sessions.css';

const Sessions = () => {
  const { id: courseId } = useParams();
  const [sessions, setSessions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { execute: getSessions, isLoading } = useGetCourseSessions();
  const { execute: joinSession, isLoading: isLoadingJoin } = useJoinSession();

  useEffect(() => {
    fetchSessions();
  }, [courseId]);

  const fetchSessions = async () => {
    try {
      const response = await getSessions(courseId);
      setSessions(response.data.sessions.sort((a, b) => 
        new Date(a.startedAt || a.date) - new Date(b.startedAt || b.date)
      ));
    } catch (error) {
      toast.error('Failed to fetch sessions');
    }
  };

  const handleJoinSession = async (sessionId) => {
    try {
      const response = await joinSession(courseId, sessionId);
      window.open(response.data.join_url, '_blank');
    } catch (error) {
      toast.error('Failed to join session');
    }
  };

  const filteredSessions = sessions.filter(session => 
    session.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading || isLoadingJoin) {
    return <Loading isVisible={true} />;
  }

  return (
    <div className="sessions-container">
      <div className="sessions-header">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="sessions-list">
        {filteredSessions.map(session => (
          <div key={session.id} className="session-card">
            <div className="card-header">
              <h3>{session.title}</h3>
              <span className={`status-badge ${session.status}`}>{session.status}</span>
            </div>
            <p>{session.description}</p>
            <div className="session-info">
              <span>Started: {new Date(session.startedAt).toLocaleString()}</span>
            </div>
            <div className="session-actions">
              {session.status === 'UPCOMING' && (
                <button 
                  className="action-button join"
                  onClick={() => handleJoinSession(session.id)}
                >
                  <FaVideo /> Join Session
                </button>
              )}
              {session.recordings?.length > 0 && (
                <button 
                  className="action-button recordings"
                  onClick={() => window.open(session.recordings[0], '_blank')}
                >
                  <FaPlayCircle /> View Recording
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sessions;