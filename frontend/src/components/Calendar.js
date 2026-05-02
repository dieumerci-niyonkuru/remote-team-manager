import React, { useState, useEffect } from 'react';
import api from '../api';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const CalendarView = () => {
  const [events, setEvents] = useState([]);
  useEffect(() => {
    api.get('/tasks/').then(res => {
      const tasks = res.data;
      const evts = tasks.filter(t => t.due_date).map(t => ({
        title: t.title,
        start: new Date(t.due_date),
        end: new Date(t.due_date),
        allDay: true
      }));
      setEvents(evts);
    });
  }, []);
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded shadow h-full">
      <h2 className="text-2xl font-bold mb-4 dark:text-white">Team Calendar</h2>
      <BigCalendar localizer={localizer} events={events} startAccessor="start" endAccessor="end" style={{ height: 500 }} />
    </div>
  );
};
export default CalendarView;
