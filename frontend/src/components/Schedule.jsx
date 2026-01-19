import React, { useState } from 'react';
import {ChevronLeft, ChevronRight, Briefcase, Coffee, Users, Check, Circle, CalendarDays} from 'lucide-react';
import './Schedule.css';

const Schedule = () => {
    const [userSchedule, setUserSchedule] = useState({ start: '08:00', end: '17:00' });
    const dynamicHours = `${userSchedule.start} - ${userSchedule.end}`;

    const schedule = [
        { day: 'Segunda-feira', hours: dynamicHours, type: 'work' },
        { day: 'Terça-feira', hours: dynamicHours, type: 'work' },
        { day: 'Quarta-feira', hours: dynamicHours, type: 'work' },
        { day: 'Quinta-feira', hours: dynamicHours, type: 'work' },
        { day: 'Sexta-feira', hours: dynamicHours, type: 'work' }, // Pode ajustar sexta se quiser
        { day: 'Sábado', hours: 'Folga', type: 'off' },
        { day: 'Domingo', hours: 'Folga', type: 'off' },
    ];

    // const events = getEventsForDate(selectedDate);

    return (
        <div className="fade-in-up">
            <h3 style={{color: '#004B8D', marginBottom: '20px', display:'flex', alignItems:'center', gap:'10px'}}>
                <CalendarDays size={24}/> Minha Escala Semanal
            </h3>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px'}}>
                {schedule.map((item, index) => (
                    <div key={index} style={{
                        background: item.type === 'work' ? 'white' : '#f8fafc',
                        padding: '20px',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        borderLeft: item.type === 'work' ? '4px solid #004B8D' : '4px solid #cbd5e1'
                    }}>
                            <span style={{display:'block', fontWeight: 'bold', color: '#1e293b', marginBottom: '5px'}}>
                                {item.day}
                            </span>
                        <span style={{color: item.type === 'work' ? '#166534' : '#64748b', fontWeight: '500'}}>
                                {item.hours}
                            </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Schedule;
