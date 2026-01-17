import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Briefcase, Coffee, Users, Check, Circle } from 'lucide-react';
import './Schedule.css';

const Schedule = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Função para navegar entre dias
    const changeDate = (days) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() + days);
        setSelectedDate(newDate);
    };

    // Formatadores de data
    const formatDateTitle = (date) => {
        return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
    };

    const formatDateWeek = (date) => {
        return date.toLocaleDateString('pt-BR', { weekday: 'long' });
    };

    // Geração de Eventos Mockados (Simulação)
    // Se o dia for par, mostra uma agenda, se ímpar mostra outra.
    const getEventsForDate = (date) => {
        const isEven = date.getDate() % 2 === 0;

        if (date.getDay() === 0 || date.getDay() === 6) {
            return [{ id: 99, time: 'Folga', title: 'Fim de Semana', type: 'break', desc: 'Aproveite seu descanso!', status: 'future' }];
        }

        if (isEven) {
            return [
                { id: 1, time: '08:00', title: 'Início de Expediente', type: 'work', desc: 'Registro de ponto obrigatório', status: 'completed' },
                { id: 2, time: '10:00', title: 'Daily Meeting', type: 'meeting', desc: 'Sincronização com time de desenvolvimento', status: 'completed' },
                { id: 3, time: '12:00', title: 'Almoço', type: 'break', desc: 'Intervalo de 1 hora', status: 'current' },
                { id: 4, time: '13:00', title: 'Retorno', type: 'work', desc: 'Focar nas tarefas do Sprint', status: 'future' },
                { id: 5, time: '17:00', title: 'Fim de Expediente', type: 'work', desc: 'Check-out e relatório diário', status: 'future' },
            ];
        } else {
            return [
                { id: 1, time: '08:00', title: 'Início de Expediente', type: 'work', desc: 'Registro de ponto obrigatório', status: 'completed' },
                { id: 2, time: '09:30', title: 'Code Review', type: 'meeting', desc: 'Revisão de PRs do time', status: 'completed' },
                { id: 3, time: '12:00', title: 'Almoço', type: 'break', desc: 'Intervalo de 1 hora', status: 'future' },
                { id: 4, time: '14:00', title: 'Reunião de Planejamento', type: 'meeting', desc: 'Planejamento Q1 Moura Tech', status: 'future' },
                { id: 5, time: '17:00', title: 'Fim de Expediente', type: 'work', desc: 'Check-out', status: 'future' },
            ];
        }
    };

    const events = getEventsForDate(selectedDate);

    return (
        <div className="schedule-container">

            {/* 1. Seletor de Data */}
            <div className="date-selector">
                <button className="date-nav-btn" onClick={() => changeDate(-1)}>
                    <ChevronLeft size={20} />
                </button>

                <div className="current-date-display">
                    <h3>{formatDateTitle(selectedDate)}</h3>
                    <span>{formatDateWeek(selectedDate)}</span>
                </div>

                <button className="date-nav-btn" onClick={() => changeDate(1)}>
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* 2. Timeline Vertical */}
            <div className="timeline">
                {events.map((event) => (
                    <div key={event.id} className="timeline-item">
                        {/* Bolinha Indicadora */}
                        <div className={`timeline-dot ${event.status}`}></div>

                        {/* Conteúdo do Card */}
                        <div className={`timeline-content type-${event.type}`}>
                            <span className="time-badge">{event.time}</span>

                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                                <div>
                                    <h4 className="event-title">{event.title}</h4>
                                    <p className="event-desc">{event.desc}</p>
                                </div>

                                {/* Ícone contextual */}
                                <div style={{color: '#94a3b8'}}>
                                    {event.type === 'work' && <Briefcase size={18} />}
                                    {event.type === 'break' && <Coffee size={18} />}
                                    {event.type === 'meeting' && <Users size={18} />}
                                </div>
                            </div>

                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Schedule;