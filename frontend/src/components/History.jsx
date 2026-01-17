import React, { useState } from 'react';
import Calendar from 'react-calendar'; // A biblioteca
import 'react-calendar/dist/Calendar.css'; // CSS base da lib
import { Clock, Briefcase, Coffee, AlertCircle } from 'lucide-react';
import './History.css'; // Vamos criar esse CSS específico

const History = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());

    const getHistoryForDate = (date) => {
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        if (isWeekend) return [];

        const isEven = date.getDate() % 2 === 0;
        if (isEven) {
            return [
                { id: 1, type: 'work', time: '08:00', title: 'Check-in', desc: 'Início do expediente' },
                { id: 2, type: 'break', time: '12:00', title: 'Almoço', desc: 'Saída para intervalo' },
                { id: 3, type: 'break', time: '13:00', title: 'Retorno', desc: 'Volta do intervalo' },
                { id: 4, type: 'work', time: '17:05', title: 'Check-out', desc: 'Fim do expediente (Perfeito)' },
            ];
        } else {
            return [
                { id: 1, type: 'work', time: '08:15', title: 'Check-in', desc: 'Início (Atraso justificado)' },
                { id: 2, type: 'work', time: '17:00', title: 'Check-out', desc: 'Fim do expediente' },
            ];
        }
    };

    const records = getHistoryForDate(selectedDate);
    const totalHours = records.length > 0 ? "8h 05m" : "0h"; // Mockado

    return (
        <div className="history-page-container">

            <div className="header-welcome">
                <h2 className="welcome-title">Histórico de Ponto</h2>
                <p className="date-display">Selecione um dia para ver os detalhes</p>
            </div>

            <div className="history-grid-layout">

                {/* COLUNA 1: CALENDÁRIO (Fixo e visível) */}
                <div className="calendar-column">
                    <div className="calendar-card">
                        <Calendar
                            onChange={setSelectedDate}
                            value={selectedDate}
                            locale="pt-BR"
                            className="custom-calendar"
                        />

                        <div className="monthly-summary">
                            <h4>Resumo do Mês</h4>
                            <div className="summary-item">
                                <span>Horas Totais</span>
                                <strong>160h</strong>
                            </div>
                            <div className="summary-item">
                                <span>Horas Extras</span>
                                <strong style={{color: '#8b5cf6'}}>+12h</strong>
                            </div>
                        </div>
                    </div>
                </div>

                {/* COLUNA 2: TIMELINE DO DIA */}
                <div className="timeline-column">
                    <div className="day-header">
                        <h3>{selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
                        {records.length > 0 && <span className="day-total-badge">Total: {totalHours}</span>}
                    </div>

                    <div className="day-timeline-content">
                        {records.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon"><AlertCircle size={32} /></div>
                                <p>Nenhum registro encontrado para este dia.</p>
                                <span>(Folga ou falta não justificada)</span>
                            </div>
                        ) : (
                            <div className="timeline-vertical">
                                {records.map((record, index) => (
                                    <div key={record.id} className="timeline-row">
                                        <div className="time-col">{record.time}</div>

                                        <div className="timeline-divider">
                                            <div className="dot"></div>
                                            {index !== records.length - 1 && <div className="line"></div>}
                                        </div>

                                        <div className={`timeline-card type-${record.type}`}>
                                            <div className="card-header">
                                                <h4>{record.title}</h4>
                                                {record.type === 'work' ? <Briefcase size={16}/> : <Coffee size={16}/>}
                                            </div>
                                            <p>{record.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default History;