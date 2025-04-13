import React, { useState, useEffect, useCallback, memo } from "react";
import { useParams, useLocation, useSearchParams } from "react-router-dom";
import { useGetCourseSessions } from "../../../hooks/getcoursesessionshook";
import { useCreateSession } from "../../../hooks/newHooks/createSession";
import { useStartMeeting } from "../../../hooks/startsessionmeeting";
import { useEndSession } from "../../../hooks/endsessionmeeting";
import { useUploadRecords } from "../../../hooks/uploadsessionrecords";
import { useGetGroups } from "../../../hooks/newHooks/getGroupshook";
import { useGetCourseGroupStudents } from "../../../hooks/newHooks/getCourseGroupStudents";
import { useGetCoursePrivateStudents } from "../../../hooks/newHooks/getCoursePrivateStudents";
import { useUpdateSessionDate } from "../../../hooks/newHooks/updateSessionDate";
import { useCancelSession } from "../../../hooks/newHooks/cancelSession";
import { FaEdit, FaTrash ,FaTimes } from "react-icons/fa";
import Loading from "../../../components/loading/loading";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import "./sessions.css";
import styles from '../students/studentCourse/studentCourse.module.css';

// Memoized EndSessionModal component
export const EndSessionModal = memo(({ 
  isOpen, 
  selectedSession, 
  courseId,
  privateStudents,
  endSessionData,
  onClose,
  onSubmit,
  onReportChange
}) => {
  const [students, setStudents] = useState([]);
  const { execute: getCourseGroupStudents } = useGetCourseGroupStudents();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        if (selectedSession?.sessionType === "GROUP") {
          const response = await getCourseGroupStudents(courseId, selectedSession.groupId);
          setStudents(response.data.students || []);
        } else if (selectedSession) {
          const student = privateStudents.find(s => s.studentId === selectedSession.privateStudentId);
          setStudents(student ? [student] : []);
        }
      } catch (error) {
        toast.error("Failed to fetch students");
      }
    };

    if (isOpen && selectedSession) {
      fetchStudents();
    }
  }, [isOpen, selectedSession, courseId, privateStudents]);

  if (!isOpen || !selectedSession) return null;

  return (
    <div className="modal-overlay">
      <div className="modal end-session-modal">
        <h2>End Session</h2>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Session Content</label>
            <textarea
              value={endSessionData.sessionContent || ''}
              onChange={(e) => onReportChange('sessionContent', null, null, e.target.value)}
              placeholder="Enter session content..."
              required
              className="form-textarea"
            />
          </div>

          <div className="students-reports">
            {students.map(student => (
              <div key={student.id} className="student-report">
                <h3>{student.student.name}</h3>
                <div className="form-group">
                  <label>Attendance</label>
                  <select
                    value={endSessionData.reports[student.studentId]?.attendence || 'PRESENT'}
                    onChange={(e) => onReportChange('reports', student.studentId, 'attendence', e.target.value)}
                    className="form-select"
                  >
                    <option value="PRESENT">Present</option>
                    <option value="ABSENT">Absent</option>
                    <option value="EXCUSED">Excused</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Tardy (minutes)</label>
                  <input
                    type="number"
                    min="0"
                    value={endSessionData.reports[student.studentId]?.tardy || 0}
                    onChange={(e) => onReportChange('reports', student.studentId, 'tardy', parseInt(e.target.value))}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Homework</label>
                  <input
                    type="text"
                    value={endSessionData.reports[student.studentId]?.homeWork || ''}
                    onChange={(e) => onReportChange('reports', student.studentId, 'homeWork', e.target.value)}
                    placeholder="Assign homework..."
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    value={endSessionData.reports[student.studentId]?.notes || ''}
                    onChange={(e) => onReportChange('reports', student.studentId, 'notes', e.target.value)}
                    placeholder="Add notes about the student..."
                    className="form-textarea"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="modal-buttons">
            <button type="submit" className="submit-btn">End Session</button>
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

// Update the UpdateSessionModal
export const UpdateSessionModal = memo(({ 
  isOpen,
  updateSessionData,
  onSubmit,
  onClose,
  onUpdateDataChange
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Update Session</h2>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Session Date</label>
            <DatePicker
              selected={updateSessionData.newDate}
              onChange={(date) => onUpdateDataChange('newDate', date)}
              showTimeSelect
              dateFormat="MMMM d, yyyy h:mm aa"
              minDate={new Date()}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Duration (minutes)</label>
            <input
              type="number"
              value={updateSessionData.newDuration}
              onChange={(e) => onUpdateDataChange('newDuration', parseInt(e.target.value))}
              min="15"
              max="480"
              required
              className="form-input"
            />
          </div>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={updateSessionData.isRecurring}
              onChange={(e) => onUpdateDataChange('isRecurring', e.target.checked)}
            />
            <span>Update recurring sessions</span>
          </label>
          <div className="modal-buttons">
            <button type="submit" className="submit-btn">Update</button>
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
});

export const CreateSessionModal = memo(({
  isOpen,
  createSessionData,
  groups, 
  privateStudents,
  onSubmit,
  onClose,
  onCreateDataChange
}) => {
  if (!isOpen) return null;

  return (
    <div className="session-modal-overlay show" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Create New Session</h2>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Session Type</label>
            <select
              value={createSessionData.sessionType}
              onChange={(e) => onCreateDataChange('sessionType', e.target.value)}
              required
              className="form-select"
            >
              <option value="PRIVATE">Private Session</option>
              <option value="GROUP">Group Session</option>
            </select>
          </div>

          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={createSessionData.title}
              onChange={(e) => onCreateDataChange('title', e.target.value)}
              placeholder="Enter session title"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={createSessionData.description}
              onChange={(e) => onCreateDataChange('description', e.target.value)}
              placeholder="Enter session description"
              required
              className="form-textarea"
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label>Session Date</label>
              <DatePicker
                selected={createSessionData.date}
                onChange={(date) => onCreateDataChange('date', date)}
                showTimeSelect
                dateFormat="MMMM d, yyyy h:mm aa"
                minDate={new Date()}
                className="form-control"
                required
              />
            </div>

            <div className="form-group flex-1">
              <label>Duration (minutes)</label>
              <input
                type="text"
                value={createSessionData.duration}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (parseInt(value) <= 480 || value === '') {
                    onCreateDataChange('duration', value);
                  }
                }}
                placeholder="60"
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              {createSessionData.sessionType === 'GROUP' ? 'Select Group' : 'Select Student'}
            </label>
            {createSessionData.sessionType === 'GROUP' ? (
              <select
                value={createSessionData.groupId}
                onChange={(e) => onCreateDataChange('groupId', e.target.value)}
                required
                className="form-select"
              >
                <option value="">Choose a group</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name} ({group.studentsCount} students)
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={createSessionData.privateStudentId}
                onChange={(e) => onCreateDataChange('privateStudentId', e.target.value)}
                required
                className="form-select"
              >
                <option value="">Choose a student</option>
                {privateStudents
                  .filter(student => student.hours !== null && !student.groupId)
                  .map(student => (
                    <option key={student.id} value={student.studentId}>
                      {student.student.name}
                    </option>
                  ))}
              </select>
            )}
          </div>


          <div className="form-group">
            <label>Payment Type</label>
            <select
              value={createSessionData.isFree ? 'free' : 'paid'}
              onChange={(e) => onCreateDataChange('isFree', e.target.value === 'free')}
              required
              className="form-select"
            >
              <option value="paid">Paid Session</option>
              <option value="free">Free Session</option>
            </select>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={createSessionData.isRecurring}
                onChange={(e) => onCreateDataChange('isRecurring', e.target.checked)}
              />
              <span>Recurring Session</span>
            </label>
          </div>
          
          <div className="modal-buttons">
            <button type="submit" className="submit-btn">Create Session</button>
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
});
// Update the UploadRecordsModal
export const UploadRecordsModal = memo(({
  isOpen,
  selectedFile,
  onFileChange,
  onSubmit,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal upload-modal">
        <h2>Upload Session Records</h2>
        <form onSubmit={onSubmit} className="upload-form">
          <div className="form-group">
            <label className="file-input-label">
              <input
                type="file"
                onChange={onFileChange} // Pass the event directly
                multiple
                className="file-input"
                required
                accept="video/*" // Optional: restrict to video files
              />
              <span>Choose Video Files</span>
            </label>
            {selectedFile && (
              <div className="selected-files">
                {Array.from(selectedFile).map((file, index) => (
                  <div key={index} className="file-name">
                    {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="modal-buttons">
            <button type="submit" className="submit-btn">Upload</button>
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
});

// Add this component near other modal components
const SessionDetailsModal = memo(({ session, isOpen, onClose, groups, privateStudents }) => {
  if (!isOpen) return null;

  const startDate = new Date(session.calendarDate.startDate);
  const endDate = new Date(session.calendarDate.endDate);
  const durationInMinutes = Math.round((endDate - startDate) / (1000 * 60));

  const getParticipantName = (session) => {
    if (session.sessionType === "GROUP") {
      const group = groups.find((g) => g.id === session.groupId);
      return group ? group.name : "Unknown Group";
    } else {
      const student = privateStudents.find((s) => s.studentId === session.privateStudentId);
      return student ? student.student.name : "Unknown Student";
    }
  };

  return (
    <div className={styles.reportModal}>
      <div className={styles.reportModalContent}>
        <div className={styles.reportDetailHeader}>
          <h3>Session Details</h3>
          <FaTimes className={styles.closeIcon} onClick={onClose} />
        </div>
        <div className={styles.modalBody}>
          <div className={styles.reportDetailItem}>
            <strong>Title:</strong>
            <p>{session.title}</p>
          </div>
          <div className={styles.reportDetailItem}>
            <strong>Description:</strong>
            <p>{session.description}</p>
          </div>
          <div className={styles.reportDetailItem}>
            <strong>Session Type:</strong>
            <p>{session.sessionType}</p>
          </div>
          <div className={styles.reportDetailItem}>
            <strong>Participant:</strong>
            <p>{getParticipantName(session)}</p>
          </div>
          <div className={styles.reportDetailItem}>
            <strong>Start Date:</strong>
            <p>{startDate.toLocaleString()}</p>
          </div>
          <div className={styles.reportDetailItem}>
            <strong>Duration:</strong>
            <p>{durationInMinutes} minutes</p>
          </div>
          {session.startedAt && (
            <div className={styles.reportDetailItem}>
              <strong>Started At:</strong>
              <p>{new Date(session.startedAt).toLocaleString()}</p>
            </div>
          )}
          <div className={styles.reportDetailItem}>
            <strong>Payment:</strong>
            <p>{session.isFree ? 'Free Session' : 'Paid Session'}</p>
          </div>
        </div>
      </div>
    </div>
  );
});

const RecordingsModal = memo(({ recordings, isOpen, onClose }) => {
  if (!isOpen || !recordings?.length) return null;

  return (
    <div className={styles.reportModal}>
      <div className={styles.reportModalContent}>
        <div className={styles.reportDetailHeader}>
          <h3>Session Recordings</h3>
          <FaTimes className={styles.closeIcon} onClick={onClose} />
        </div>
        <div className={styles.modalBody}>
          {recordings.map((recordingId, index) => (
            <div key={recordingId} className={styles.reportDetailItem}>
              <h4>Recording {index + 1}</h4>
              <iframe
                src={`https://iframe.mediadelivery.net/embed/366620/${recordingId}`}
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
});

const Sessions = () => {
  const { id: courseId } = useParams();
  const [sessions, setSessions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isIndividualModalOpen, setIsIndividualModalOpen] = useState(false);
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [endSessionData, setEndSessionData] = useState({
    sessionContent: "",
    reports: {},
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: new Date(),
    duration: 0,
    userId: "",
  });
  const [groups, setGroups] = useState([]);
  const [privateStudents, setPrivateStudents] = useState([]);
  const [updateSessionData, setUpdateSessionData] = useState({
    newDate: new Date(),
    newDuration: 60,
    isRecurring: false,
  });
  const [createSessionData, setCreateSessionData] = useState({
    title: "",
    description: "",
    date: new Date(),
    duration: "60",
    sessionType: "PRIVATE",
    groupId: '',  // Use empty string instead of null
    privateStudentId: '',  // Use empty string instead of null
    isRecurring: false,
    isFree: false
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSessionDetails, setSelectedSessionDetails] = useState(null);
  const [selectedRecordings, setSelectedRecordings] = useState(null);

  const { execute: getSessions, isLoading } = useGetCourseSessions();
  const { execute: startMeeting, isLoading: isLoadingStart } =
    useStartMeeting();
  const { execute: endSession, isLoading: isLoadingEnd } = useEndSession();
  const { execute: uploadRecordings, isLoading: isLoadingUpload } =
    useUploadRecords();
  const { execute: getGroups } = useGetGroups();
  const { execute: getPrivateStudents } = useGetCoursePrivateStudents();
  const { execute: updateSessionDate } = useUpdateSessionDate();
  const { execute: cancelSession , isLoading:isLoadingCancel } = useCancelSession();
  const { execute: createSession } = useCreateSession();
  const { execute: getCourseGroupStudents } = useGetCourseGroupStudents();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const groupIdFromUrl = queryParams.get("groupId");
  const [searchParams] = useSearchParams();
  const sessionIdFromUrl = searchParams.get("sessionId");
  const zoomUrlFromParams = searchParams.get("zoomUrl");

  useEffect(() => {
    fetchSessions();
    fetchGroups();
    fetchPrivateStudents();
  }, [courseId]);

  const fetchSessions = async () => {
    try {
      const response = await getSessions(courseId);
      const sessions = response.data.sessions.sort(
        (a, b) =>
          new Date(a.startedAt || a.date) - new Date(b.startedAt || b.date)
      );
      setSessions(sessions);
    } catch (error) {
      toast.error("Failed to fetch sessions");
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await getGroups(courseId);
      setGroups(response.data.groups || []);
    } catch (error) {
      toast.error("Failed to fetch groups");
    }
  };

  const fetchPrivateStudents = async () => {
    try {
      const response = await getPrivateStudents(courseId);
      setPrivateStudents(response.data.students || []);
    } catch (error) {
      toast.error("Failed to fetch students");
    }
  };

  const handleStartMeeting = async (sessionId) => {
    try {
      // If we have a zoomUrl parameter, use that instead of getting a new URL
      if (zoomUrlFromParams) {
        await startMeeting(sessionId); // Still notify backend that session started
        window.open(zoomUrlFromParams, "_blank");
      } else {
      toast.error("Failed to start meeting");

      }
    } catch (error) {
      toast.error("Failed to start meeting");
    }
  };

  const handleEndSession = useCallback((session) => {
    setSelectedSession(session);
    setIsEndModalOpen(true);
  }, []);

  const handleEndSessionSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!selectedSession) return;

    try {
      await endSession(selectedSession.id, endSessionData);
      setIsEndModalOpen(false);
      setSelectedSession(null);
      setEndSessionData({
        sessionContent: "",
        reports: {},
      });
      // Refresh sessions list
      getSessions(courseId);
    } catch (error) {
      toast.error("Failed to end session");
    }
  }, [selectedSession, endSessionData, endSession, courseId, getSessions]);

  const handleUploadRecords = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please select a file");
      return;
    }

    const formData = new FormData();
    for (let file of selectedFile) {
      formData.append("files", file);
    }

    try {
      await uploadRecordings(selectedSession.id, formData);
      toast.success("Records uploaded successfully");
      setIsUploadModalOpen(false);
      fetchSessions();
    } catch (error) {
      toast.error("Failed to upload records");
    }
  };

  const handleUpdateSession = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        newDate: updateSessionData.newDate.toISOString(),
        newDuration: updateSessionData.newDuration,
        isRecurring: updateSessionData.isRecurring
      };

      await updateSessionDate(courseId, selectedSession.id, payload);
      toast.success("Session updated successfully");
      handleCloseUpdateModal(); // Use the new close handler
      fetchSessions();
    } catch (error) {
      if (error?.response?.data?.name === 'DATE_NOT_AVAILABLE') {
        toast.error("This date is not available, please choose another date/duration");
      } else {
        toast.error("Failed to update session");
      }
    }
  };

  const handleCancelSession = async (sessionId) => {
    if (window.confirm("Are you sure you want to cancel this session?")) {
      try {
        await cancelSession(courseId, sessionId);
        toast.success("Session cancelled successfully");
        fetchSessions();
      } catch (error) {
        toast.error("Failed to cancel session");
      }
    }
  };

  // Update the handleEditClick function
const handleEditClick = (session) => {
  setSelectedSession(session);
  // Calculate duration in minutes from start and end date
  const startDate = new Date(session.calendarDate.startDate);
  const endDate = new Date(session.calendarDate.endDate);
  const durationInMinutes = Math.round((endDate - startDate) / (1000 * 60));

  setUpdateSessionData({
    newDate: startDate, // Use the calendar start date
    newDuration: durationInMinutes,
    isRecurring: false,
  });
  setIsUpdateModalOpen(true);
};

// Add cleanup when closing the modal
const handleCloseUpdateModal = () => {
  setIsUpdateModalOpen(false);
  setUpdateSessionData({
    newDate: new Date(),
    newDuration: 60,
    isRecurring: false
  });
  setSelectedSession(null);
};

  const handleReportChange = useCallback((field, studentId, subfield, value) => {
    setEndSessionData(prev => {
      if (field === 'sessionContent') {
        return { ...prev, sessionContent: value }; // Now correctly handling sessionContent
      }
      
      return {
        ...prev,
        reports: {
          ...prev.reports,
          [studentId]: {
            ...prev.reports[studentId],
            // Initialize with defaults if not exists
            attendence: prev.reports[studentId]?.attendence || 'PRESENT',
            homeWork: prev.reports[studentId]?.homeWork || '',
            notes: prev.reports[studentId]?.notes || '',
            tardy: prev.reports[studentId]?.tardy || 0,
            // Update the specific field
            [subfield]: value
          }
        }
      };
    });
  }, []);

const handleCreateDataChange = useCallback((field, value) => {
  setCreateSessionData(prev => {
    // Create base state update
    const newState = {
      ...prev,
      [field]: ['groupId', 'privateStudentId'].includes(field) ? 
        (value ? parseInt(value) : '') : value
    };
    
    // Handle session type changes
    if (field === 'sessionType') {
      newState.groupId = '';
      newState.privateStudentId = '';
      // Preserve the date when switching types
      newState.date = prev.date;
    }
    
    return newState;
  });
}, []);

const handleCreateSession = async (e) => {
  e.preventDefault();
  try {
    const payload = {
      ...createSessionData,
      date: createSessionData.date.toISOString(),
      duration: parseInt(createSessionData.duration || "60"),
      courseId: parseInt(courseId),
      // Convert IDs to numbers or null based on session type
      groupId: createSessionData.sessionType === 'GROUP' ? 
        parseInt(createSessionData.groupId) : null,
      privateStudentId: createSessionData.sessionType === 'PRIVATE' ? 
        parseInt(createSessionData.privateStudentId) : null
    };

    await createSession(courseId, payload);
    toast.success("Session created successfully");
    setIsCreateModalOpen(false);
    setCreateSessionData({
      title: "",
      description: "",
      date: new Date(),
      duration: "60",
      sessionType: "PRIVATE",
      groupId: '',
      privateStudentId: '',
      isRecurring: false,
      isFree: false
    });
    fetchSessions();
  } catch (error) {
    toast.error(error?.response?.data?.message || "Failed to create session");
  }
};

  const handleUpdateDataChange = useCallback((field, value) => {
    setUpdateSessionData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleFileChange = useCallback((e) => {
    if (e.target.files) {
      setSelectedFile(e.target.files);
    }
  }, []);

  const handleUploadClick = useCallback((session) => {
    setSelectedSession(session);
    setSelectedFile(null); // Reset any previously selected files
    setIsUploadModalOpen(true);
  }, []); // Empty dependency array since we only need the setters

  const filteredSessions = sessions.filter((session) => {
    // If we have a sessionId filter, only show that session
    if (sessionIdFromUrl) {
      return session.id === parseInt(sessionIdFromUrl);
    }
    
    // If we have a zoomUrl, only show UPCOMING sessions
    if (zoomUrlFromParams) {
      return session.status === "UPCOMING";
    }

    // Regular filters - these will only apply when no URL params are present
    const matchesSearch = session.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterType === "All" ||
      (filterType === "GROUP" && session.sessionType === "GROUP") ||
      (filterType === "PRIVATE" && session.sessionType === "PRIVATE");
    const matchesGroup =
      !groupIdFromUrl || session.groupId === parseInt(groupIdFromUrl);
    return matchesSearch && matchesFilter && matchesGroup;
  });

  const getSessionParticipant = (session) => {
    if (session.sessionType === "GROUP") {
      const group = groups.find((g) => g.id === session.groupId);
      return group ? group.name : "Unknown Group";
    } else {
      const student = privateStudents.find(
        (s) => s.studentId === session.privateStudentId
      );
      return student ? student.student.name : "Unknown Student";
    }
  };

  if (isLoading || isLoadingStart || isLoadingEnd || isLoadingUpload) {
    return <Loading isVisible={true} />;
  }

  // Update the renderUpdateSessionModal function
const renderUpdateSessionModal = () => {
  if (!isUpdateModalOpen) return null;

  return (
    <UpdateSessionModal
      isOpen={isUpdateModalOpen}
      updateSessionData={updateSessionData}
      onSubmit={handleUpdateSession}
      onClose={handleCloseUpdateModal} // Use the new close handler
      onUpdateDataChange={handleUpdateDataChange}
    />
  );
};

  const renderCreateSessionModal = () => {
    if (!isCreateModalOpen) return null;

    return (
      <CreateSessionModal
        isOpen={isCreateModalOpen}
        createSessionData={createSessionData}
        groups={groups}
        privateStudents={privateStudents}
        onSubmit={handleCreateSession}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateDataChange={setCreateSessionData}
      />
    );
  };

  const renderUploadRecordsModal = () => {
    if (!isUploadModalOpen) return null;

    return (
      <UploadRecordsModal
        isOpen={isUploadModalOpen}
        selectedFile={selectedFile}
        onSubmit={handleUploadRecords}
        onClose={() => setIsUploadModalOpen(false)}
        onFileChange={handleFileChange}
      />
    );
  };

  const showFilters = !sessionIdFromUrl && !zoomUrlFromParams;

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
            <option value="All">All Sessions</option>
            <option value="GROUP">Group Sessions</option>
            <option value="PRIVATE">Private Sessions</option>
          </select>
        </div>
        <div className="create-buttons">
          <button onClick={() => setIsCreateModalOpen(true)}>
            Create Session
          </button>
        </div>
      </div>

      <div className="sessions-list">
        {filteredSessions.map((session) => (
          <div key={session.id} className="session-card">
            <div className="card-header">
              <h3>{session.title}</h3>
              <span className={`status-badge ${session.status}`}>
                {session.status}
              </span>
            </div>
            
            <p className="session-description">{session.description}</p>
            
            <div className="session-actions">
              <button
                className="action-button-session details"
                onClick={() => setSelectedSessionDetails(session)}
              >
                View Details
              </button>

              {session.status === 'UPCOMING' && (
                <>
                  <button
                    className="action-button-session start"
                    onClick={() => handleStartMeeting(session.id)}
                    disabled={isLoadingStart}
                  >
                    {isLoadingStart ? <Loading /> : 'Start Meeting'}
                  </button>
                  <FaEdit
                    className="edit-icon"
                    onClick={() => handleEditClick(session)}
                  />
                  <FaTrash
                    className="delete-icon"
                    onClick={() => handleCancelSession(session.id)}
                  />
                </>
              )}

              {session.status === 'RUNNING' && (
                <button
                  className="action-button-session end"
                  onClick={() => handleEndSession(session)}
                  disabled={isLoadingEnd}
                >
                  {isLoadingEnd ? <Loading /> : 'End Session'}
                </button>
              )}

              {session.status === 'ENDED' && (
                <>
                  <button
                    className="action-button-session upload"
                    onClick={() => handleUploadClick(session)}
                  >
                    Upload Records
                  </button>
                  {session.recordings?.length > 0 && (
                    <button
                      className="action-button-session view-records"
                      onClick={() => setSelectedRecordings(session.recordings)}
                    >
                      View Recordings
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}

        {/* Add the new modals */}
        <SessionDetailsModal
          session={selectedSessionDetails}
          isOpen={!!selectedSessionDetails}
          onClose={() => setSelectedSessionDetails(null)}
          groups={groups}
          privateStudents={privateStudents}
        />

        <RecordingsModal
          recordings={selectedRecordings}
          isOpen={!!selectedRecordings}
          onClose={() => setSelectedRecordings(null)}
        />
      </div>

      {/* Start Meeting Modal */}
      {isStartModalOpen && (
        <div className="modal-overlay">
          <div className="modal confirmation">
            <h2>Start Meeting</h2>
            <p>Are you sure you want to start this meeting?</p>
            <div className="modal-buttons">
              <button onClick={() => handleStartMeeting(selectedSession)}>
                Start
              </button>
              <button onClick={() => setIsStartModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* End Session Modal */}
      {isEndModalOpen && (
        <EndSessionModal
          isOpen={isEndModalOpen}
          selectedSession={selectedSession}
          courseId={courseId}
          privateStudents={privateStudents}
          endSessionData={endSessionData}
          onClose={() => setIsEndModalOpen(false)}
          onSubmit={handleEndSessionSubmit}
          onReportChange={handleReportChange}
        />
      )}

      {/* Upload Records Modal */}
      {renderUploadRecordsModal()}

      {/* Update Session Modal */}
      {renderUpdateSessionModal()}

      {/* Create Session Modal */}
      <CreateSessionModal
  isOpen={isCreateModalOpen}
  createSessionData={createSessionData}
  groups={groups}
  privateStudents={privateStudents}
  onSubmit={handleCreateSession}
  onClose={() => setIsCreateModalOpen(false)}
  onCreateDataChange={handleCreateDataChange}
/>
    </div>
  );
};

export default Sessions;
