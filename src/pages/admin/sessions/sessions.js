import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGetCourseSessions } from '../../../hooks/getcoursesessionshook';
import { useCreateGroupSession } from '../../../hooks/createcoursesessiongroup';
import { useCreateIndividualSession } from '../../../hooks/createcoursesessionindividual';
import { useStartMeeting } from '../../../hooks/startsessionmeeting';
import { useEndSession } from '../../../hooks/endsessionmeeting';
import { useUploadRecords } from '../../../hooks/uploadsessionrecords';
import Loading from '../../../components/loading/loading';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { toast } from 'react-toastify';
import './sessions.css';

const Sessions = () => {
  const { id: courseId } = useParams();
  const [sessions, setSessions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isIndividualModalOpen, setIsIndividualModalOpen] = useState(false);
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [endSessionData, setEndSessionData] = useState({ sessionContent: '', notes: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date(),
    duration: 0,
    userId: ''
  });

  const { execute: getSessions, isLoading } = useGetCourseSessions();
  const { execute: createGroup, isLoading: isLoadingGroup } = useCreateGroupSession();
  const { execute: createIndividual, isLoading: isLoadingIndividual } = useCreateIndividualSession();
  const { execute: startMeeting, isLoading: isLoadingStart } = useStartMeeting();
  const { execute: endSession, isLoading: isLoadingEnd } = useEndSession();
  const { execute: uploadRecordings, isLoading: isLoadingUpload } = useUploadRecords();

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

  const handleCreateGroupSession = async (e) => {
    e.preventDefault();
    try {
      await createGroup({
        ...formData,
        courseId: parseInt(courseId)
      });
      toast.success('Group session created successfully');
      setIsGroupModalOpen(false);
      fetchSessions();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create session');
    }
  };

  const handleCreateIndividualSession = async (e) => {
    e.preventDefault();
    try {
      await createIndividual({
        ...formData,
        courseId: parseInt(courseId)
      });
      toast.success('Individual session created successfully');
      setIsIndividualModalOpen(false);
      fetchSessions();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create session');
    }
  };

  const handleStartMeeting = async (session) => {
    try {
      const sessionType = session.userId ? 'individual' : 'GROUP';
      const response = await startMeeting(sessionType, session.id);
      window.open(response.data.startUrl, '_blank');
    } catch (error) {
      toast.error('Failed to start meeting');
    }
    setIsStartModalOpen(false);
  };
  
  const handleEndSession = async (e) => {
    e.preventDefault();
    try {
      const sessionType = selectedSession.userId ? 'INDIVIDUAL' : 'GROUP';
      const payload = {
        sessionContent: endSessionData.sessionContent,
        notes: sessionType === 'GROUP' ? 
          [{ userId: selectedSession.userId, notes: endSessionData.notes }] : 
          endSessionData.notes
      };
      
      await endSession(sessionType, selectedSession.id, payload);
      toast.success('Session ended successfully');
      fetchSessions();
      setIsEndModalOpen(false);
      setEndSessionData({ sessionContent: '', notes: '' });
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to end session');
    }
  };


  const handleUploadRecords = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }
  
    const formData = new FormData();
    // Change from append to append as array element
    formData.append('files', selectedFile);
    // or formData.append('files', selectedFile);
  
    try {
      const sessionType = selectedSession.userId ? 'INDIVIDUAL' : 'GROUP';
      await uploadRecordings(sessionType, selectedSession.id, formData);
      toast.success('Records uploaded successfully');
      fetchSessions();
      setIsUploadModalOpen(false);
      setSelectedFile(null);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload records');
    }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || 
      (filterType === 'group' && !session.userId) || 
      (filterType === 'individual' && session.userId);
    return matchesSearch && matchesFilter;
  });

  if (isLoading || isLoadingGroup || isLoadingIndividual || isLoadingStart || isLoadingEnd || isLoadingUpload) {
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
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Sessions</option>
            <option value="group">Group Sessions</option>
            <option value="individual">Individual Sessions</option>
          </select>
        </div>
        <div className="create-buttons">
          <button onClick={() => setIsGroupModalOpen(true)}>Create Group Session</button>
          <button onClick={() => setIsIndividualModalOpen(true)}>Create Individual Session</button>
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
              <span>Type: {session.userId ? 'Individual' : 'Group'}</span>
            </div>
            <div className="session-actions">
              <button 
                className="action-button start"
                onClick={() => {
                  setSelectedSession(session);
                  setIsStartModalOpen(true);
                }}
              >
                Start Meeting
              </button>
              <button 
                className="action-button end"
                onClick={() => {
                  setSelectedSession(session);
                  setIsEndModalOpen(true);
                }}
              >
                End Session
              </button>
              <button 
                className="action-button upload"
                onClick={() => {
                  setSelectedSession(session);
                  setIsUploadModalOpen(true);
                }}
              >
                Upload Records
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Group Session Modal */}
      {isGroupModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Create Group Session</h2>
            <form onSubmit={handleCreateGroupSession}>
              <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
              <DatePicker
                selected={formData.date}
                onChange={(date) => setFormData({...formData, date})}
                showTimeSelect
                dateFormat="Pp"
                minDate={new Date()}
              />
              <input
                type="number"
                placeholder="Duration (minutes)"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                min="30"
                required
              />
              <div className="modal-buttons">
                <button type="submit">Create</button>
                <button type="button" onClick={() => setIsGroupModalOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Individual Session Modal */}
      {isIndividualModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Create Individual Session</h2>
            <form onSubmit={handleCreateIndividualSession}>
              <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
              <DatePicker
                selected={formData.date}
                onChange={(date) => setFormData({...formData, date})}
                showTimeSelect
                dateFormat="Pp"
                minDate={new Date()}
              />
              <input
                type="number"
                placeholder="Duration (minutes)"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                min="30"
                required
              />
              <input
                type="number"
                placeholder="User ID"
                value={formData.userId}
                onChange={(e) => setFormData({...formData, userId: parseInt(e.target.value)})}
                required
              />
              <div className="modal-buttons">
                <button type="submit">Create</button>
                <button type="button" onClick={() => setIsIndividualModalOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Start Meeting Modal */}
      {isStartModalOpen && (
        <div className="modal-overlay">
          <div className="modal confirmation">
            <h2>Start Meeting</h2>
            <p>Are you sure you want to start this meeting?</p>
            <div className="modal-buttons">
              <button onClick={() => handleStartMeeting(selectedSession)}>Start</button>
              <button onClick={() => setIsStartModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* End Session Modal */}
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
          placeholder={selectedSession?.userId ? 
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

      {/* Upload Records Modal */}
      {isUploadModalOpen && (
        <div className="modal-overlay">
          <div className="modal upload">
            <h2>Upload Session Records</h2>
            <form onSubmit={handleUploadRecords}>
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                required
              />
              <div className="modal-buttons">
                <button type="submit">Upload</button>
                <button type="button" onClick={() => setIsUploadModalOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sessions;