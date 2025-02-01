import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { useGetBusyDates } from '../../../hooks/getbusydates';
import Loading from '../../../components/loading/loading';
import { toast } from 'react-toastify';
import './calender.css';

const Calendar = () => {
  const [busyDates, setBusyDates] = useState([]);
  const [searchDate, setSearchDate] = useState('');
  const [searchTime, setSearchTime] = useState('');
  const [searchDuration, setSearchDuration] = useState(60);
  
  const { execute: getBusyDates, isLoading } = useGetBusyDates();

  useEffect(() => {
    fetchBusyDates();
  }, []);

  const fetchBusyDates = async () => {
    try {
      const response = await getBusyDates();
      const events = response.data.dates.map(date => ({
        start: date.startDate,
        end: date.endDate,
        title: 'Busy',
        backgroundColor: '#FF8691',
        borderColor: '#95345C'
      }));
      setBusyDates(events);
    } catch (error) {
      toast.error('Failed to fetch busy dates');
    }
  };

  const checkAvailability = () => {
    const searchDateTime = new Date(`${searchDate}T${searchTime}`);
    const searchEndTime = new Date(searchDateTime.getTime() + searchDuration * 60000);

    const isConflict = busyDates.some(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      return searchDateTime < eventEnd && searchEndTime > eventStart;
    });

    toast.info(isConflict ? 'Time slot is busy' : 'Time slot is available!', {
      icon: isConflict ? '🚫' : '✅'
    });
  };

  if (isLoading) return <Loading isVisible={true} />;

  return (
    <div className="calendar-container">
      <div className="search-container">
        <input
          type="date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
        />
        <input
          type="time"
          value={searchTime}
          onChange={(e) => setSearchTime(e.target.value)}
        />
        <input
          type="number"
          placeholder="Duration (minutes)"
          value={searchDuration}
          onChange={(e) => setSearchDuration(e.target.value)}
          min="30"
        />
        <button onClick={checkAvailability}>Check Availability</button>
      </div>
      
      <div className="calendar-wrapper">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={busyDates}
          height="auto"
          slotMinTime="00:00:00"
          slotMaxTime="24:00:00"
        />
      </div>
    </div>
  );
};

export default Calendar;