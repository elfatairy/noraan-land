import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useGetCourseSessions } from '../../../hooks/getcoursesessionshook';
import Loading from '../../../components/loading/loading';
import { toast } from 'react-toastify';
import { FaVideo, FaPlayCircle, FaBook, FaTimes, FaLink } from 'react-icons/fa';
import './sessions.css';

const Sessions = () => {
  const { id: courseId } = useParams();
  const [searchParams] = useSearchParams();
  const sessionType = searchParams.get('sessionType');
  const groupId = searchParams.get('groupId');
  const studentId = searchParams.get('studentId');
  const [sessions, setSessions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedRecordings, setSelectedRecordings] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const { execute: getSessions, isLoading } = useGetCourseSessions();

  useEffect(() => {
    fetchSessions();
  }, [courseId]);

  const fetchSessions = async () => {
    try {
      const response = await getSessions(courseId);
      if (response?.data?.sessions) {
        let filteredSessions = response.data.sessions;
        
        if (sessionType === 'GROUP' && groupId) {
          filteredSessions = filteredSessions.filter(session => 
            session.sessionType === 'GROUP' && session.groupId === parseInt(groupId)
          );
        } else if (sessionType === 'PRIVATE' && studentId) {
          filteredSessions = filteredSessions.filter(session => 
            session.sessionType === 'PRIVATE' && session.privateStudentId === parseInt(studentId)
          );
        }

        setSessions(filteredSessions);
      }
    } catch (error) {
      toast.error('Failed to fetch sessions');
    }
  };

  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || session.status.toLowerCase() === statusFilter;
      
      if (selectedMonth) {
        const sessionMonth = new Date(session.calendarDate.startDate).getMonth();
        return matchesSearch && matchesStatus && sessionMonth === parseInt(selectedMonth);
      }
      return matchesSearch && matchesStatus;
    });
  }, [sessions, searchTerm, selectedMonth, statusFilter]);

  if (isLoading) return <Loading isVisible={true} />;

  return (
    <div className="sessions-container">
      <div className="sessions-header">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Status</option>
            <option value="running">Running</option>
            <option value="upcoming">Upcoming</option>
            <option value="ended">Ended</option>
          </select>
        </div>
      </div>

      <div className="sessions-list">
        {filteredSessions.map(session => (
          <div key={session.id} className="session-card">
            <div className="card-header">
              <h3>{session.title}</h3>
              <div className="badges">
                <span className={`status-badge ${session.status.toLowerCase()}`}>
                  {session.status}
                </span>
                {session.isFree && (
                  <span className="status-badge free">Free</span>
                )}
              </div>
            </div>
            <p className="session-description">{session.description}</p>

            <div className="session-actions">
              {session.status === 'RUNNING' && session.zoomLink && (
                <a 
                  href={session.zoomLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="action-button-sessionStudent join"
                >
                  <FaLink /> Join Session
                </a>
              )}
              {session.status === 'ENDED' && (
                <>
                  {session.recordings?.length > 0 && (
                    <button 
                      className="action-button-sessionStudent recordings"
                      onClick={() => setSelectedRecordings(session.recordings)}
                    >
                      <FaPlayCircle /> View Recording
                    </button>
                  )}
                  {session.report && (
                    <button 
                      className="action-button-sessionStudent report"
                      onClick={() => setSelectedReport({...session.report, sessionTitle: session.title})}
                    >
                      <FaBook /> View Report
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <RecordingsModal
        recordings={selectedRecordings}
        isOpen={!!selectedRecordings}
        onClose={() => setSelectedRecordings(null)}
      />

      <ReportDetailsModal
        report={selectedReport}
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </div>
  );
};

const RecordingsModal = ({ recordings, isOpen, onClose }) => {
  if (!isOpen || !recordings?.length) return null;

  return (
    <div className="report-modal">
      <div className="report-modal-content">
        <div className="report-detail-header">
          <h3>Session Recordings</h3>
          <FaTimes className="close-icon" onClick={onClose} />
        </div>
        <div className="modal-body">
          {recordings.map((recordingId, index) => (
            <div key={recordingId} className="report-detail-item">
              <h4>Recording {index + 1}</h4>
              <iframe
               // src={`https://iframe.mediadelivery.net/embed/366620/${recordingId}`}
                src={`https://nooranland.com/videos/${recordingId}`}
                //src={`http://localhost:3000/videos/${recordingId}`}
                loading="lazy"
                style={{ border: 'none', width: '100%', aspectRatio: '16/9' }}
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                allowFullScreen={true}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ReportDetailsModal = ({ report, isOpen, onClose }) => {
  if (!isOpen || !report) return null;

  return (
    <div className="report-modal">
      <div className="report-modal-content">
        <div className="report-detail-header">
          <h3>Report Details</h3>
          <FaTimes className="close-icon" onClick={onClose} />
        </div>
        <div className="modal-body">
          <div className="report-detail-item">
            <strong>Session:</strong>
            <p>{report.sessionTitle}</p>
          </div>
          {report.notes && (
            <div className="report-detail-item">
              <strong>Notes:</strong>
              <p>{report.notes}</p>
            </div>
          )}
          {report.homeWork && (
            <div className="report-detail-item">
              <strong>Homework:</strong>
              <p>{report.homeWork}</p>
            </div>
          )}
          {report.tardy > 0 && (
            <div className="report-detail-item">
              <strong>Tardy:</strong>
              <p>{report.tardy} minutes</p>
            </div>
          )}
          <div className="report-detail-item">
            <strong>Attendance:</strong>
            <p>{report.attendence}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sessions;