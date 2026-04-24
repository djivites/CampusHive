import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import API from '../api/axios';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState({});
  const [loading, setLoading] = useState(true);

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const [tasksRes, vivasRes] = await Promise.all([
        API.get('/tasks'),
        API.get('/viva')
      ]);

      const eventMap = {};

      tasksRes.data.forEach(task => {
        if (task.dueDate) {
          const day = new Date(task.dueDate).getDate();
          const month = new Date(task.dueDate).getMonth();
          const year = new Date(task.dueDate).getFullYear();
          const key = `${year}-${month}-${day}`;
          if (!eventMap[key]) eventMap[key] = [];
          eventMap[key].push({ title: task.title, type: 'task' });
        }
      });

      vivasRes.data.forEach(viva => {
        const day = new Date(viva.date).getDate();
        const month = new Date(viva.date).getMonth();
        const year = new Date(viva.date).getFullYear();
        const key = `${year}-${month}-${day}`;
        if (!eventMap[key]) eventMap[key] = [];
        eventMap[key].push({ title: viva.title, type: 'viva' });
      });

      setEvents(eventMap);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    } finally {
      setLoading(false);
    }
  };

  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month, year) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Adjust for Monday start
  };

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const numDays = daysInMonth(month, year);
  const startDay = firstDayOfMonth(month, year);

  const days = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let i = 1; i <= numDays; i++) days.push(i);

  return (
    <div className="container-fluid p-0 pb-5">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h2 className="fw-bold mb-1">Calendar</h2>
          <p className="text-muted small mb-0">Live timeline of your tasks and milestones</p>
        </div>
        <div className="d-flex gap-3 align-items-center">
          <div className="d-flex align-items-center bg-dark bg-opacity-25 rounded-pill p-1 border border-secondary border-opacity-10">
            <button onClick={() => setCurrentDate(new Date(year, month - 1))} className="btn btn-link text-muted p-2"><ChevronLeft size={20} /></button>
            <span className="px-3 fw-bold small text-white" style={{ minWidth: '120px', textAlign: 'center' }}>
              {monthNames[month]} {year}
            </span>
            <button onClick={() => setCurrentDate(new Date(year, month + 1))} className="btn btn-link text-muted p-2"><ChevronRight size={20} /></button>
          </div>
        </div>
      </div>

      <div className="card-custom p-0 overflow-hidden border-secondary border-opacity-10 shadow-lg">
        <div className="row g-0 border-bottom border-secondary border-opacity-10 bg-dark bg-opacity-25">
          {weekDays.map(day => (
            <div key={day} className="col text-center py-3">
              <span className="text-muted extra-small fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>{day}</span>
            </div>
          ))}
        </div>
        <div className="row g-0" style={{ minHeight: '600px' }}>
          {days.map((day, i) => {
            const key = `${year}-${month}-${day}`;
            const dayEvents = events[key] || [];
            const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

            return (
              <div key={i} className={`col-14 border-end border-bottom border-secondary border-opacity-10 p-2 p-md-3 transition-all ${day ? 'hover-bg-dark' : 'bg-dark bg-opacity-10'}`} style={{ width: '14.28%', minHeight: '120px' }}>
                {day && (
                  <>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className={`fw-bold small d-flex align-items-center justify-content-center ${isToday ? 'bg-primary text-white rounded-circle shadow-sm' : 'text-muted'}`} style={isToday ? {width: '24px', height: '24px'} : {}}>
                        {day}
                      </span>
                    </div>
                    <div className="d-flex flex-column gap-1">
                      {dayEvents.map((ev, idx) => (
                        <div key={idx} className={`p-1 px-2 rounded-2 extra-small fw-bold border border-opacity-10 text-truncate ${ev.type === 'viva' ? 'bg-danger bg-opacity-10 text-danger border-danger' : 'bg-primary bg-opacity-10 text-primary border-primary'}`} title={ev.title}>
                          {ev.title}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
