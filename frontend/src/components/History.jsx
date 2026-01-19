import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import {
    Download, AlertCircle, Briefcase, Coffee, LogOut,
    Utensils, Stethoscope, MoreHorizontal, ChevronLeft, ChevronRight, Loader2, PlayCircle
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useWorkHistory } from '../lib/queries/useWork';
import './History.css';

const History = ({ userId, SHIFT_CONFIG }) => {
    const [page, setPage] = useState(0);

    const [dateValue, setDateValue] = useState(new Date());
    const formattedDate = dateValue.toLocaleDateString('en-CA')

    // --- HOOK ---
    const { data, isLoading, isPreviousData } = useWorkHistory({
        employeeId: userId,
        page: page,
        size: 5,
        date: formattedDate
    });

    const historyList = data?.content || [];
    const totalPages = data?.totalPages || 0;
    const totalElements = data?.totalElements || 0;

    // --- CONFIGURAÇÃO VISUAL ---
    const getEventConfig = (type) => {
        const configs = {
            start_work: { label: 'Entrada / Retorno', icon: PlayCircle, color: '#10b981', bg: '#ecfdf5', dotClass: 'dot-start' },
            lunch_start: { label: 'Saída para Almoço', icon: Utensils, color: '#f59e0b', bg: '#fffbeb', dotClass: 'dot-lunch' },
            break_start: { label: 'Pausa / Café', icon: Coffee, color: '#8b5cf6', bg: '#f3e8ff', dotClass: 'dot-break' },
            meeting_start: { label: 'Reunião Externa', icon: Briefcase, color: '#10b981', bg: '#d1fae5', dotClass: 'dot-meeting' },
            medical: { label: 'Consulta Médica', icon: Stethoscope, color: '#3b82f6', bg: '#dbeafe', dotClass: 'dot-medical' },
            other: { label: 'Outros', icon: MoreHorizontal, color: '#64748b', bg: '#f1f5f9', dotClass: 'dot-other' },
            end_shift: { label: 'Fim de Expediente', icon: LogOut, color: '#ef4444', bg: '#fef2f2', dotClass: 'dot-end' },
            default: { label: 'Registro', icon: Briefcase, color: '#64748b', bg: '#f8fafc', dotClass: 'dot-default' }
        };
        return configs[type] || configs.default;
    };

    // --- PDF ---
    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.text(`Relatório de Ponto`, 14, 20);
        if (dateValue) doc.text(`Referência: ${dateValue.toLocaleDateString('pt-BR')}`, 14, 28);

        autoTable(doc, {
            head: [['Data', 'Entrada', 'Saída', 'Motivo', 'Duração']],
            body: historyList.map(r => [
                new Date(r.date).toLocaleDateString('pt-BR'),
                r.checkin_time?.substring(0, 5),
                r.checkout_time?.substring(0, 5) || '---',
                r.reason_label || '-',
                r.duration || '-'
            ]),
            startY: 40,
        });
        doc.save('historico_visualizacao.pdf');
    };

    // --- HANDLERS ---
    const handleDateChange = (val) => {
        setDateValue(val);
        setPage(0);
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
                            onChange={handleDateChange}
                            value={dateValue}
                            locale="pt-BR"
                            className="custom-calendar"
                        />
                        <div className="monthly-summary">
                            <div style={{marginBottom: '1rem'}}>
                                <h4>Data Selecionada:</h4>
                                <p style={{color:'#004B8D', fontWeight:'bold', marginBottom:'10px'}}>
                                    {dateValue.toLocaleDateString('pt-BR')}
                                </p>
                            </div>

                            <button className="btn-export-pdf" onClick={handleExportPDF} disabled={historyList.length === 0}>
                                <Download size={18} /> Baixar PDF
                            </button>
                        </div>
                    </div>
                </div>

                {/* COLUNA 2: LISTA */}
                <div className="timeline-column">
                    <div className="day-header">
                        <h3>
                            {dateValue
                                ? dateValue.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
                                : "Todos os Registros"}
                        </h3>
                        {/* Exibe total de registros encontrados pelo backend */}
                        <span className="page-info" style={{fontSize: '0.8rem'}}>
                            {totalElements} registro(s)
                        </span>
                    </div>

                    <div className="day-timeline-content" style={{display:'flex', flexDirection:'column', flex: 1}}>
                        {isLoading ? (
                            <div className="empty-state">
                                <Loader2 className="spin-slow" size={32} color="#004B8D"/>
                                <p>Buscando dados...</p>
                            </div>
                        ) : historyList.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon"><AlertCircle size={32} /></div>
                                <p>Nenhum registro encontrado.</p>
                                {dateValue && <span style={{fontSize:'0.8rem'}}>Tente selecionar outra data.</span>}
                            </div>
                        ) : (
                            <div className="timeline-vertical" style={{flex: 1}}>
                                {historyList.map((record, index) => {
                                    const typeKey = record.reason_id || 'start_work';
                                    const config = getEventConfig(typeKey);
                                    const Icon = config.icon;
                                    const title = record.reason_label || (record.checkout_time ? config.label : "Entrada / Em andamento");

                                    return (
                                        <div key={record.id} className="timeline-row">
                                            <div className="time-col">
                                                <span>{record.checkin_time?.substring(0, 5)}</span>
                                                {record.checkout_time && (
                                                    <span className="time-end">
                                                        {record.checkout_time.substring(0, 5)}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="timeline-divider">
                                                <div className={`dot ${config.dotClass}`} style={{borderColor: config.color, background: config.color}}></div>
                                                {index !== historyList.length - 1 && <div className="line"></div>}
                                            </div>

                                            <div className="timeline-card" style={{borderLeftColor: config.color, backgroundColor: config.bg}}>
                                                <div className="card-header">
                                                    <h4 style={{color: '#334155'}}>{title}</h4>
                                                    <Icon size={16} color={config.color}/>
                                                </div>
                                                <p>
                                                    {record.duration ? `Duração: ${record.duration}` : 'Em andamento'}
                                                    {record.details && <><br/><span style={{fontSize:'0.8rem', fontStyle:'italic'}}>Obs: {record.details}</span></>}
                                                </p>
                                                <span style={{fontSize:'0.75rem', color:'#64748b', display: 'block', marginTop: '4px'}}>
                                                    {new Date(record.date).toLocaleDateString('pt-BR')}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* CONTROLES DE PAGINAÇÃO */}
                        {!isLoading && totalPages > 1 && (
                            <div className="pagination-controls">
                                <button
                                    className="btn-page"
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                >
                                    <ChevronLeft size={16}/> Anterior
                                </button>

                                <span className="page-info">
                                    Página <b>{page + 1}</b> de <b>{totalPages}</b>
                                </span>

                                <button
                                    className="btn-page"
                                    onClick={() => {
                                        if (!isPreviousData && page < totalPages - 1) {
                                            setPage(p => p + 1);
                                        }
                                    }}
                                    disabled={isPreviousData || page >= totalPages - 1}
                                >
                                    Próximo <ChevronRight size={16}/>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default History;