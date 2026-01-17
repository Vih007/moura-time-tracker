import React, { useState, useMemo } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import {
    Download, AlertCircle, Briefcase, Coffee, LogOut,
    ArrowRight, Utensils, Stethoscope, MoreHorizontal, PlayCircle
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './History.css';
import { formatSecondsToTime, formatTimeBalance } from '../utils/timeUtils';

const History = ({ historyData = [], SHIFT_CONFIG = { seconds: 28800 } }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());

    // --- CONFIGURAÇÃO DE CORES E ÍCONES (Igual ao Dashboard) ---
    const getEventConfig = (type) => {
        const configs = {
            // Eventos de Entrada
            start_work: { label: 'Entrada / Retorno', icon: PlayCircle, color: '#10b981', bg: '#ecfdf5', dotClass: 'dot-start' },

            // Eventos de Saída (Motivos)
            lunch_start: { label: 'Saída para Almoço', icon: Utensils, color: '#f59e0b', bg: '#fffbeb', dotClass: 'dot-lunch' },
            break_start: { label: 'Pausa / Café', icon: Coffee, color: '#8b5cf6', bg: '#f3e8ff', dotClass: 'dot-break' },
            meeting_start: { label: 'Reunião Externa', icon: Briefcase, color: '#10b981', bg: '#d1fae5', dotClass: 'dot-meeting' },
            medical: { label: 'Consulta Médica', icon: Stethoscope, color: '#3b82f6', bg: '#dbeafe', dotClass: 'dot-medical' }, // AZUL
            other: { label: 'Outros', icon: MoreHorizontal, color: '#64748b', bg: '#f1f5f9', dotClass: 'dot-other' },
            end_shift: { label: 'Fim de Expediente', icon: LogOut, color: '#ef4444', bg: '#fef2f2', dotClass: 'dot-end' },

            // Fallback
            default: { label: 'Registro', icon: Briefcase, color: '#64748b', bg: '#f8fafc', dotClass: 'dot-default' }
        };
        return configs[type] || configs.default;
    };

    // --- 1. PROCESSAMENTO DA TIMELINE ---
    const dayEvents = useMemo(() => {
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const dateKey = `${year}-${month}-${day}`;

        const records = historyData.filter(r => r.date === dateKey);
        records.sort((a, b) => a.checkin_time.localeCompare(b.checkin_time));

        const events = [];

        records.forEach(record => {
            // 1. EVENTO DE ENTRADA (Sempre Verde/Start)
            events.push({
                id: `in-${record.id}`,
                time: record.checkin_time.substring(0, 5),
                typeKey: 'start_work', // Chave para pegar a cor
                desc: 'Início de atividade',
                rawRecord: record
            });

            // 2. EVENTO DE SAÍDA (Se houver)
            if (record.checkout_time) {
                // A cor depende do motivo (reason_id)
                const reasonKey = record.reason_id || 'end_shift';

                events.push({
                    id: `out-${record.id}`,
                    time: record.checkout_time.substring(0, 5),
                    typeKey: reasonKey, // Chave dinâmica (medical, lunch, etc)
                    desc: record.details || `Duração: ${record.duration}`,
                    rawRecord: record,
                    isCheckout: true
                });
            }
        });

        // Ordena tudo por horário
        return events.sort((a, b) => a.time.localeCompare(b.time));
    }, [selectedDate, historyData]);

    // --- 2. CÁLCULOS (Mantidos) ---
    const dayTotalSeconds = useMemo(() => {
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const dateKey = `${year}-${month}-${day}`;
        return historyData
            .filter(r => r.date === dateKey)
            .reduce((acc, curr) => acc + (curr.duration_seconds || 0), 0);
    }, [selectedDate, historyData]);

    const monthlyStats = useMemo(() => {
        const currentMonth = selectedDate.getMonth();
        const currentYear = selectedDate.getFullYear();
        const monthRecords = historyData.filter(r => {
            const d = new Date(r.date + 'T12:00:00');
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });
        const totalSeconds = monthRecords.reduce((acc, curr) => acc + (curr.duration_seconds || 0), 0);
        const workedDays = new Set(monthRecords.map(r => r.date)).size;
        const targetSeconds = workedDays * SHIFT_CONFIG.seconds;

        return {
            totalFormatted: Math.floor(totalSeconds / 3600),
            balanceFormatted: formatTimeBalance(totalSeconds, targetSeconds),
            isPositive: totalSeconds >= targetSeconds,
            monthName: selectedDate.toLocaleDateString('pt-BR', { month: 'long' })
        };
    }, [selectedDate, historyData, SHIFT_CONFIG]);

    // --- 3. EXPORTAR PDF (Mantido) ---
    const handleExportPDF = () => {
        const doc = new jsPDF();
        const monthName = selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

        doc.setFontSize(18);
        doc.setTextColor(0, 75, 141);
        doc.text(`Relatório de Ponto - ${monthName}`, 14, 22);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("Gerado pelo Sistema MouraTech", 14, 28);

        const currentMonth = selectedDate.getMonth();
        const monthRecords = historyData
            .filter(r => {
                const d = new Date(r.date + 'T12:00:00');
                return d.getMonth() === currentMonth;
            })
            .sort((a, b) => a.date.localeCompare(b.date) || a.checkin_time.localeCompare(b.checkin_time));

        const tableData = monthRecords.map(r => [
            new Date(r.date).toLocaleDateString('pt-BR'),
            r.checkin_time?.substring(0, 5),
            r.checkout_time?.substring(0, 5) || '---',
            r.reason_label || 'Trabalho',
            r.duration || '-'
        ]);

        autoTable(doc, {
            head: [['Data', 'Entrada', 'Saída', 'Motivo', 'Duração']],
            body: tableData,
            startY: 35,
            theme: 'grid',
            headStyles: { fillColor: [0, 75, 141] },
            styles: { fontSize: 9, cellPadding: 3 },
        });

        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(11);
        doc.setTextColor(0);
        doc.text(`Total de Horas: ${monthlyStats.totalFormatted}h`, 14, finalY);
        doc.text(`Saldo do Mês: ${monthlyStats.balanceFormatted}`, 14, finalY + 6);

        doc.save(`Ponto_Moura_${monthName}.pdf`);
    };

    return (
        <div className="history-page-container">
            <div className="header-welcome">
                <h2 className="welcome-title">Histórico de Ponto</h2>
                <p className="date-display">Selecione um dia para visualizar a linha do tempo</p>
            </div>

            <div className="history-grid-layout">
                {/* COLUNA 1: CALENDÁRIO */}
                <div className="calendar-column">
                    <div className="calendar-card">
                        <Calendar
                            onChange={setSelectedDate}
                            value={selectedDate}
                            locale="pt-BR"
                            className="custom-calendar"
                        />
                        <div className="monthly-summary">
                            <h4>Resumo de {monthlyStats.monthName}</h4>
                            <div className="summary-item">
                                <span>Horas Trabalhadas</span>
                                <strong>{monthlyStats.totalFormatted}h</strong>
                            </div>
                            <div className="summary-item">
                                <span>Saldo de Banco</span>
                                <strong style={{color: monthlyStats.isPositive ? '#10b981' : '#ef4444'}}>
                                    {monthlyStats.balanceFormatted}
                                </strong>
                            </div>
                            <button className="btn-export-pdf" onClick={handleExportPDF}>
                                <Download size={18} /> Baixar PDF
                            </button>
                        </div>
                    </div>
                </div>

                {/* COLUNA 2: TIMELINE */}
                <div className="timeline-column">
                    <div className="day-header">
                        <h3>{selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
                        {dayEvents.length > 0 && (
                            <span className="day-total-badge">
                                Total: {formatSecondsToTime(dayTotalSeconds)}
                            </span>
                        )}
                    </div>

                    <div className="day-timeline-content">
                        {dayEvents.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon"><AlertCircle size={32} /></div>
                                <p>Nenhum registro neste dia.</p>
                                <span>Selecione outra data no calendário.</span>
                            </div>
                        ) : (
                            <div className="timeline-vertical">
                                {dayEvents.map((event, index) => {
                                    // Pega a config baseada no tipo (Medical, Lunch, etc)
                                    const config = getEventConfig(event.typeKey);
                                    const Icon = config.icon;

                                    // Sobrescreve label se vier do banco (ex: "Fim de Expediente")
                                    const title = event.isCheckout
                                        ? (event.rawRecord.reason_label || config.label)
                                        : config.label;

                                    return (
                                        <div key={event.id} className="timeline-row">
                                            {/* Hora */}
                                            <div className="time-col">{event.time}</div>

                                            {/* Linha e Ponto */}
                                            <div className="timeline-divider">
                                                <div className={`dot ${config.dotClass}`} style={{borderColor: config.color}}></div>
                                                {/* A linha conecta até o próximo item */}
                                                {index !== dayEvents.length - 1 && <div className="line"></div>}
                                            </div>

                                            {/* Card de Conteúdo */}
                                            <div className="timeline-card" style={{borderLeftColor: config.color, backgroundColor: config.bg}}>
                                                <div className="card-header">
                                                    <h4 style={{color: '#334155'}}>{title}</h4>
                                                    <Icon size={16} color={config.color}/>
                                                </div>
                                                <p>{event.desc}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default History;