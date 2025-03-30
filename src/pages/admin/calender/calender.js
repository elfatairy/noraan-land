import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction'; // Add this import
import { useGetUpcommingDates } from '../../../hooks/newHooks/getUpcomingDates';
import { useCreateSession } from '../../../hooks/newHooks/createSession';
import { useUpdateSessionDate } from '../../../hooks/newHooks/updateSessionDate';
import { useGetGroups } from '../../../hooks/newHooks/getGroupshook';
import { useGetCoursePrivateStudents } from '../../../hooks/newHooks/getCoursePrivateStudents';
import { useGetCourses } from '../../../hooks/getcourseshook';
import { CreateSessionModal, UpdateSessionModal } from '../sessions/sessions';
import Loading from '../../../components/loading/loading';
import { toast } from 'react-toastify';
import { FaPlus } from 'react-icons/fa';
import './calender.css';
  
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
  const [createSessionData, setCreateSessionData] = useState({
    title: "",
    description: "",
    date: new Date(),
    duration: "60",
    sessionType: "PRIVATE",
    courseId: '', // Add courseId
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
      const events = response.data.dates.map(date => {
        const duration = (new Date(date.endDate) - new Date(date.startDate)) / (1000 * 60);
        let backgroundColor = getStatusColor(date.status, date.changingStatus);
        
        return {
          id: date.id,
          title: getStatusText(date.status),
          start: date.startDate,
          end: date.endDate,
          backgroundColor,
          borderColor: '#95345C',
          extendedProps: {
            ...date.session,
            duration
          }
        };
      });
      setEvents(events);
    } catch (error) {
      if (!error.response?.data?.message?.includes('successfully')) {
        toast.error('Failed to fetch upcoming dates');
      }
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
    setSelectedSlot(selectInfo);
    setCreateSessionData(prev => ({
      ...prev,
      date: selectInfo.start
    }));
    setIsCreateModalOpen(true);
  };

  const handleEventDrop = (dropInfo) => {
    const event = dropInfo.event;
    setSelectedEvent(event);
    setUpdateSessionData({
      newDate: event.start,
      newDuration: event.extendedProps.duration,
      isRecurring: false
    });
    setIsUpdateModalOpen(true);
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      if (createSessionData.courseId) {
        await Promise.all([
          fetchGroups(createSessionData.courseId),
          fetchPrivateStudents(createSessionData.courseId)
        ]);
      }

      const payload = {
        ...createSessionData,
        date: createSessionData.date.toISOString(),
        duration: parseInt(createSessionData.duration),
        groupId: createSessionData.sessionType === 'GROUP' ? 
          parseInt(createSessionData.groupId) : null,
        privateStudentId: createSessionData.sessionType === 'PRIVATE' ? 
          parseInt(createSessionData.privateStudentId) : null
      };

      await createSession(payload);
      toast.success('Session created successfully');
      setIsCreateModalOpen(false);
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

  if (isLoading) return <Loading isVisible={true} />;

  return (
    <div className="calendar-container">
      <div className="calendar-wrapper">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
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
          select={handleDateSelect}
          eventDrop={handleEventDrop}
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
        />
      </div>

      <CreateSessionModal
        isOpen={isCreateModalOpen}
        createSessionData={createSessionData}
        courses={courses} // Add courses prop
        groups={groups}
        privateStudents={privateStudents}
        onSubmit={handleCreateSession}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateDataChange={(field, value) => {
          setCreateSessionData(prev => {
            const newState = { ...prev, [field]: value };
            // Clear groups and students when course changes
            if (field === 'courseId') {
              newState.groupId = '';
              newState.privateStudentId = '';
              // Fetch new groups and students
              fetchGroups(value);
              fetchPrivateStudents(value);
            }
            return newState;
          });
        }}
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
    </div>
  );
};

const renderEventContent = (eventInfo) => {
  return (
    <div className="calendar-event">
      <div className="event-title">{eventInfo.event.title}</div>
      <div className="event-time">
        {new Date(eventInfo.event.start).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </div>
    </div>
  );
};

const getStatusText = (status) => {
  switch (status) {
    case 'DONE':
      return 'Completed';
    case 'AVAILABLE':
      return 'Available';
    default:
      return status;
  }
};

const getStatusColor = (status, changingStatus) => {
  if (changingStatus === 'CANCELED') {
    return '#FF0000';
  }
  if (changingStatus === 'CHANGED') {
    return '#FFD700';
  }
  return status === 'DONE' ? '#95345C' : '#FF8691';
};

export default Calendar;