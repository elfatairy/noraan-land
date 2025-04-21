import React, { useState, useEffect, memo, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useGetUpcommingDates } from '../../../hooks/newHooks/getUpcomingDates';
import { useCreateSession } from '../../../hooks/newHooks/createSession';
import { useUpdateSessionDate } from '../../../hooks/newHooks/updateSessionDate';
import { useGetGroups } from '../../../hooks/newHooks/getGroupshook';
import { useGetCoursePrivateStudents } from '../../../hooks/newHooks/getCoursePrivateStudents';
import { useGetCourses } from '../../../hooks/getcourseshook';
import Loading from '../../../components/loading/loading';
import { toast } from 'react-toastify';
import { FaPlus, FaTimes } from 'react-icons/fa';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import './calender.css';

// Create Session Modal Component
const CreateSessionModal = memo(({
  isOpen,
  createSessionData,
  courses,
  groups, 
  privateStudents,
  onSubmit,
  onClose,
  onCreateDataChange,
  onCourseChange
}) => {
  if (!isOpen) return null;

  return (
    <div className="session-modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Session</h2>
          <FaTimes className="close-icon" onClick={onClose} />
        </div>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Course</label>
            <select
              value={createSessionData.courseId || ''}
              onChange={(e) => onCourseChange(e.target.value)}
              required
              className="form-select"
            >
              <option value="">Select a course</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>

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

          {createSessionData.courseId && (
            <div className="form-group">
              <label>
                {createSessionData.sessionType === 'GROUP' ? 'Select Group' : 'Select Student'}
              </label>
              {createSessionData.sessionType === 'GROUP' ? (
                <select
                  value={createSessionData.groupId || ''}
                  onChange={(e) => onCreateDataChange('groupId', e.target.value)}
                  required
                  className="form-select"
                  disabled={!groups.length}
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
                  value={createSessionData.privateStudentId || ''}
                  onChange={(e) => onCreateDataChange('privateStudentId', e.target.value)}
                  required
                  className="form-select"
                  disabled={!privateStudents.length}
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
              {createSessionData.sessionType === 'GROUP' && groups.length === 0 && (
                <p className="helper-text">No groups available for this course</p>
              )}
              {createSessionData.sessionType === 'PRIVATE' && privateStudents.length === 0 && (
                <p className="helper-text">No private students available for this course</p>
              )}
            </div>
          )}

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

// Update Session Modal Component
const UpdateSessionModal = memo(({ 
  isOpen,
  updateSessionData,
  onSubmit,
  onClose,
  onUpdateDataChange
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Update Session</h2>
          <FaTimes className="close-icon" onClick={onClose} />
        </div>
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
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={updateSessionData.isRecurring}
                onChange={(e) => onUpdateDataChange('isRecurring', e.target.checked)}
              />
              <span>Update recurring sessions</span>
            </label>
          </div>
          <div className="modal-buttons">
            <button type="submit" className="submit-btn">Update</button>
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
});

const Calendar = () => { 
  // State
  const [events, setEvents] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [groups, setGroups] = useState([]);
  const [privateStudents, setPrivateStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [currentView, setCurrentView] = useState('timeGridWeek');
  const [draggedEvent, setDraggedEvent] = useState(null);
  const [createSessionData, setCreateSessionData] = useState({
    title: "",
    description: "",
    date: new Date(),
    duration: "60",
    sessionType: "PRIVATE",
    courseId: '',
    groupId: '',
    privateStudentId: '',
    isRecurring: false,
    isFree: false
  });
  const [updateSessionData, setUpdateSessionData] = useState({
    newDate: new Date(),
    newDuration: 60,
    isRecurring: false
  });
  const [updateDateModalData, setUpdateDateModalData] = useState(null);
  const [selectedSessionDetails, setSelectedSessionDetails] = useState(null);
  // Flag to ignore next dateSelect event
  const ignoreNextDateSelect = useRef(false);

  const calendarRef = useRef(null);

  // Hooks
  const { execute: getUpcommingDates, isLoading } = useGetUpcommingDates();
  const { execute: createSession } = useCreateSession();
  const { execute: updateSessionDate } = useUpdateSessionDate();
  const { execute: getGroups } = useGetGroups();
  const { execute: getPrivateStudents } = useGetCoursePrivateStudents();
  const { execute: getCourses } = useGetCourses();

  useEffect(() => {
    fetchEvents();
    fetchCourses();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await getUpcommingDates();
      if (response?.data?.dates) {
        const formattedEvents = response.data.dates.map(date => ({
          id: date.session.id,
          title: date.session.title,
          start: date.startDate,
          end: date.endDate,
          extendedProps: {
            ...date.session,
            status: date.session.status,
            changingStatus: date.changingStatus,
            calendarDate: {
              startDate: date.startDate,
              endDate: date.endDate
            }
          }
        }));
        setEvents(formattedEvents);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await getCourses();
      setCourses(response.data.courses || []);
    } catch (error) {
      toast.error('Failed to fetch courses');
    }
  };

  const fetchGroups = async (courseId) => {
    if (!courseId) return;
    try {
      const response = await getGroups(courseId);
      setGroups(response.data.groups || []);
    } catch (error) {
      toast.error('Failed to fetch groups');
    }
  };

  const fetchPrivateStudents = async (courseId) => {
    if (!courseId) return;
    try {
      const response = await getPrivateStudents(courseId);
      setPrivateStudents(response.data.students || []);
    } catch (error) {
      toast.error('Failed to fetch students');
    }
  };

  const handleDateSelect = (selectInfo) => {
    // Check if we should ignore this event
    if (ignoreNextDateSelect.current) {
      ignoreNextDateSelect.current = false;
      return;
    }
    
    const duration = selectInfo.view.type === 'dayGridMonth' ? 60 : 
      Math.round((selectInfo.end - selectInfo.start) / (1000 * 60));

    setSelectedSlot(selectInfo);
    setCreateSessionData(prev => ({
      ...prev,
      date: selectInfo.start,
      duration: String(duration)
    }));
    setIsCreateModalOpen(true);
  };

  const handleEventDrop = (dropInfo) => {
    const event = dropInfo.event;
    const session = event.extendedProps;
    
    // Store the original event position for reverting if needed
    setDraggedEvent({
      event: dropInfo.event,
      oldStart: dropInfo.oldEvent.start,
      oldEnd: dropInfo.oldEvent.end
    });
    
    // Prevent dragging for certain statuses
    if (['CANCELED', 'ENDED', 'RUNNING'].includes(session.status)) {
      dropInfo.revert();
      return;
    }

    // Calculate new end time and duration based on the drop
    const startDate = new Date(event.start);
    const endDate = new Date(event.end || new Date(startDate.getTime() + session.duration * 60000));
    const duration = Math.round((endDate - startDate) / (1000 * 60));

    setUpdateDateModalData({
      session,
      date: startDate,
      duration: duration
    });
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...createSessionData,
        date: createSessionData.date.toISOString(),
        duration: parseInt(createSessionData.duration),
        courseId: parseInt(createSessionData.courseId),
        groupId: createSessionData.sessionType === 'GROUP' ? 
          parseInt(createSessionData.groupId) : null,
        privateStudentId: createSessionData.sessionType === 'PRIVATE' ? 
          parseInt(createSessionData.privateStudentId) : null
      };

      await createSession( createSessionData.courseId,payload);
      toast.success('Session created successfully');
      setIsCreateModalOpen(false);
      // Reset create session data
      setCreateSessionData({
        title: "",
        description: "",
        date: new Date(),
        duration: "60",
        sessionType: "PRIVATE",
        courseId: '',
        groupId: '',
        privateStudentId: '',
        isRecurring: false,
        isFree: false
      });
      fetchEvents();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create session');
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

      await updateSessionDate(selectedEvent.id, payload);
      toast.success('Session updated successfully');
      setIsUpdateModalOpen(false);
      fetchEvents();
    } catch (error) {
      toast.error('Failed to update session');
    }
  };

  const handleDayViewClick = (date, e) => {
    // Stop propagation immediately to prevent the cell click from triggering date selection
    e.preventDefault();
    e.stopPropagation();
    
    // Set the flag to prevent modal from opening
    ignoreNextDateSelect.current = true;
    
    if (!calendarRef.current) return;
    
    const calendarApi = calendarRef.current.getApi();
    calendarApi.gotoDate(date);
    calendarApi.changeView('timeGridDay');
    setCurrentView('timeGridDay');
  };

  const handleEventClick = (clickInfo) => {
    setSelectedSessionDetails(clickInfo.event.extendedProps);
  };

  const handleViewChange = (viewInfo) => {
    setCurrentView(viewInfo.view.type);
  };

  // Function to revert event position if cancel is clicked or update fails
  const revertEventPosition = () => {
    if (draggedEvent && calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      const event = calendarApi.getEventById(draggedEvent.event.id);
      
      if (event) {
        event.setStart(draggedEvent.oldStart);
        if (draggedEvent.oldEnd) {
          event.setEnd(draggedEvent.oldEnd);
        }
      }
    }
    setDraggedEvent(null);
  };

  // Handler for course change in create session modal
  const handleCourseChange = (courseId) => {
    if (courseId) {
      fetchGroups(courseId);
      fetchPrivateStudents(courseId);
      setCreateSessionData(prev => ({
        ...prev,
        courseId,
        groupId: '',
        privateStudentId: ''
      }));
    } else {
      setCreateSessionData(prev => ({
        ...prev,
        courseId: '',
        groupId: '',
        privateStudentId: ''
      }));
      setGroups([]);
      setPrivateStudents([]);
    }
  };

  // Render custom day cell content
  const renderDayCellContent = (args) => {
    return (
      <div className="day-cell-content">
        <div className="day-number">{args.dayNumberText}</div>
        <div className="view-button-wrapper">
          <button 
            className="day-view-button"
            type="button" 
            onClick={(e) => handleDayViewClick(args.date, e)}
          >
            View
          </button>
        </div>
      </div>
    );
  };

  if (isLoading) return <Loading isVisible={true} />;

  return (
    <div className="calendar-container">
      <div className="calendar-wrapper">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={currentView}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={events}
          height="auto"
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          selectConstraint={{
            startTime: '00:00',
            endTime: '24:00'
          }}
          select={handleDateSelect}
          eventDrop={handleEventDrop}
          eventStartEditable={(info) => {
            // Disable drag for specific status types
            const status = info.extendedProps?.status;
            return !['CANCELED', 'ENDED', 'RUNNING'].includes(status);
          }}
          eventOverlap={false}
          slotEventOverlap={false}
          views={{
            dayGridMonth: {
              // Use our custom renderer for day cells
              dayCellContent: renderDayCellContent
            },
            timeGridWeek: {
              // No view button in week view
              dayHeaderContent: (args) => (
                <div>{args.date.getDate()}</div>
              )
            },
            timeGridDay: {
              dayHeaderContent: (args) => args.date.toLocaleDateString()
            }
          }}
          slotDuration="00:30:00"
          slotMinTime="00:00:00"
          slotMaxTime="24:00:00"
          allDaySlot={false}
          eventContent={renderEventContent}
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }}
          eventClick={handleEventClick}
          eventDurationEditable={false} // Disable duration editing by dragging
          eventClassNames={(arg) => {
            const status = arg.event.extendedProps?.status;
            // Fix for the undefined status error
            return status ? `session-${status.toLowerCase()}` : '';
          }}
          eventConstraint={{
            startTime: '00:00',
            endTime: '24:00'
          }}
          eventDisplay="block" // Make events full-width
          viewDidMount={handleViewChange}
        />
      </div>

      <SessionDetailsModal
        session={selectedSessionDetails}
        isOpen={!!selectedSessionDetails}
        onClose={() => setSelectedSessionDetails(null)}
      />

      <CreateSessionModal
        isOpen={isCreateModalOpen}
        createSessionData={createSessionData}
        courses={courses}
        groups={groups}
        privateStudents={privateStudents}
        onSubmit={handleCreateSession}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateDataChange={(field, value) => {
          setCreateSessionData(prev => {
            const newState = { ...prev, [field]: value };
            return newState;
          });
        }}
        onCourseChange={handleCourseChange}
      />

      <UpdateSessionModal
        isOpen={isUpdateModalOpen}
        updateSessionData={updateSessionData}
        onSubmit={handleUpdateSession}
        onClose={() => setIsUpdateModalOpen(false)}
        onUpdateDataChange={(field, value) => 
          setUpdateSessionData(prev => ({ ...prev, [field]: value }))
        }
      />

      <UpdateDateModal
        isOpen={!!updateDateModalData}
        onClose={() => {
          setUpdateDateModalData(null);
          revertEventPosition(); // Revert position when modal is closed without saving
        }}
        date={updateDateModalData?.date}
        duration={updateDateModalData?.duration}
        onSubmit={async (formData) => {
          try {
            await updateSessionDate(
              updateDateModalData.session.course.id,
              updateDateModalData.session.id,
              {
                newDate: formData.newDate.toISOString(),
                newDuration: formData.newDuration,
                isRecurring: formData.isRecurring
              }
            );
            toast.success('Session date updated successfully');
            setDraggedEvent(null); // Clear dragged event data after successful update
            fetchEvents();
          } catch (error) {
            toast.error('Failed to update session date');
            revertEventPosition(); // Revert position on error
          } finally {
            setUpdateDateModalData(null);
          }
        }}
      />
    </div>
  );
};

const renderEventContent = (eventInfo) => {
  const session = eventInfo.event.extendedProps;
  
  return (
    <div 
      className="calendar-event"
      title={`${session.title}
${new Date(eventInfo.event.start).toLocaleString()}
${session.sessionType}: ${session.sessionType === 'GROUP' ? `Group ${session.groupId}` : `Student ${session.privateStudentId}`}`}
    >
      <div className="event-title">
        {session.title}
      </div>
      <div className="event-time">
        {new Date(eventInfo.event.start).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </div>
    </div>
  );
};

const SessionDetailsModal = memo(({ session, isOpen, onClose }) => {
  if (!isOpen || !session) return null;

  const startDate = new Date(session.calendarDate?.startDate);
  const endDate = new Date(session.calendarDate?.endDate);
  const duration = Math.round((endDate - startDate) / (1000 * 60));

  const getStatusBadgeClass = (status, changingStatus) => {
    if (changingStatus === 'CANCELED') return 'canceled';
    if (changingStatus === 'CHANGED') return 'changed';
    if (status === 'DONE') return 'completed';
    return 'upcoming';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Session Details</h3>
          <FaTimes className="close-icon" onClick={onClose} />
        </div>
        <div className="modal-body">
          <div className="detail-section">
            <h4>Session Information</h4>
            <div className="detail-item">
              <strong>Title:</strong>
              <p>{session.title}</p>
            </div>
            <div className="detail-item">
              <strong>Description:</strong>
              <p>{session.description}</p>
            </div>
            <div className="detail-item">
              <strong>Course:</strong>
              <p>{session.course?.name}</p>
              <p className="detail-subtext">{session.course?.description}</p>
            </div>
            <div className="detail-item">
              <strong>Status:</strong>
              <span className={`status-badge ${getStatusBadgeClass(session.status, session.changingStatus)}`}>
                {session.status} {session.changingStatus !== 'UNCHANGED' && `(${session.changingStatus})`}
              </span>
            </div>
            <div className="detail-item">
              <strong>Type:</strong>
              <p>{session.sessionType} {session.isFree && '(Free)'}</p>
            </div>
            <div className="detail-item">
              <strong>Duration:</strong>
              <p>{duration} minutes</p>
            </div>
            <div className="detail-item">
              <strong>Created:</strong>
              <p>{new Date(session.createdAt).toLocaleString()}</p>
            </div>
            {session.startedAt && (
              <div className="detail-item">
                <strong>Started:</strong>
                <p>{new Date(session.startedAt).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

const UpdateDateModal = memo(({ isOpen, onClose, date, duration, onSubmit }) => {
  const [formData, setFormData] = useState({
    newDate: new Date(),
    newDuration: 60,
    isRecurring: false
  });

  // Update the form data when the props change
  useEffect(() => {
    if (date && duration) {
      setFormData({
        newDate: new Date(date),
        newDuration: duration,
        isRecurring: false
      });
    }
  }, [date, duration]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Update Session Date</h3>
          <FaTimes className="close-icon" onClick={onClose} />
        </div>
        <div className="modal-body">
          <form onSubmit={(e) => {
            e.preventDefault();
            onSubmit(formData);
          }}>
            <div className="form-group">
              <label>Session Date</label>
              <DatePicker
                selected={formData.newDate}
                onChange={(date) => setFormData(prev => ({ ...prev, newDate: date }))}
                showTimeSelect
                dateFormat="MMMM d, yyyy h:mm aa"
                minDate={new Date()}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Duration (minutes)</label>
              <input
                type="number"
                value={formData.newDuration}
                onChange={(e) => setFormData(prev => ({ ...prev, newDuration: parseInt(e.target.value) }))}
                min="15"
                max="480"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                />
                Update recurring sessions
              </label>
            </div>
            <div className="modal-buttons">
              <button type="submit" className="submit-btn">Update</button>
              <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
});

export default Calendar;