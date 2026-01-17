import React, { useState, useMemo } from 'react';
import Chart from 'react-apexcharts';
import {
    Clock, Play, Square, CheckCircle2, AlertCircle, TrendingUp, History,
    LogOut, Utensils, Coffee, Briefcase, Stethoscope, MoreHorizontal, ArrowRight, Loader2
} from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';
import { formatSecondsToTime, formatMinutesToLabel } from '../utils/timeUtils';

const Dashboard = ({
                       userName,
                       workStatus,
                       elapsedTime,
                       onCheckIn,
                       onCheckOut,
                       SHIFT_CONFIG,
                       isLoading,
                       historyData = [] // Recebe do React Query via MainLayout
                   }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // --- PROCESSAMENTO DE DADOS (Adapter Backend -> Frontend) ---
    // Transforma o DTO do Java em formato amigável para a UI
    const processedHistory = useMemo(() => {
        // Pega apenas os 5 últimos registros para o Dashboard não ficar gigante
        return historyData.slice(0, 5).map(record => ({
            id: record.id,
            date: new Date(record.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), // "17/01"
            fullDate: record.date, // "2026-01-17" para o gráfico
            duration: record.duration,
            seconds: record.duration_seconds || 0,
            type: record.reason_id || 'end_shift', // Fallback
            label: record.reason_label || 'Em andamento',
            times: {
                start: record.checkin_time?.substring(0, 5), // "08:00"
                end: record.checkout_time?.substring(0, 5) || '--:--'
            },
            isClosed: !!record.checkout_time
        }));
    }, [historyData]);

    // --- CÁLCULO DINÂMICO DO GRÁFICO (Semanal) ---
    const weeklyData = useMemo(() => {
        const data = [0, 0, 0, 0, 0]; // Seg a Sex

        // Itera sobre TODO o histórico disponível (não só os 5 recentes)
        historyData.forEach(record => {
            if (!record.date || !record.duration_seconds) return;

            // Corrige fuso horário adicionando 'T00:00' para garantir dia correto
            const dateObj = new Date(record.date + 'T00:00:00');
            const day = dateObj.getDay(); // 0=Dom, 1=Seg...

            if (day >= 1 && day <= 5) {
                const hours = record.duration_seconds / 3600;
                data[day - 1] += hours;
            }
        });

        return data.map(val => Number(val.toFixed(1)));
    }, [historyData]);

    // --- CONFIGURAÇÕES VISUAIS ---
    const getReasonConfig = (type) => {
        switch (type) {
            case 'lunch_start': return { icon: Utensils, color: '#f59e0b', bg: '#fffbeb' };
            case 'break_start': return { icon: Coffee, color: '#8b5cf6', bg: '#f3e8ff' };
            case 'meeting_start': return { icon: Briefcase, color: '#10b981', bg: '#d1fae5' };
            case 'medical': return { icon: Stethoscope, color: '#3b82f6', bg: '#dbeafe' };
            case 'other': return { icon: MoreHorizontal, color: '#64748b', bg: '#f1f5f9' };
            case 'end_shift':
            default: return { icon: LogOut, color: '#ef4444', bg: '#fee2e2' };
        }
    };

    const analyzeShift = (seconds, isClosed) => {
        if (!isClosed) return { label: 'Em Andamento', cssClass: 'status-working', icon: <Loader2 size={14} className="spin-slow"/> };

        const TARGET = SHIFT_CONFIG.seconds;
        const TOLERANCE = 300; // 5 min de tolerância
        if (seconds > TARGET + TOLERANCE) return { label: 'Hora Extra', cssClass: 'status-extra', icon: <TrendingUp size={14} /> };
        if (seconds >= TARGET - TOLERANCE) return { label: 'Jornada Normal', cssClass: 'status-perfect', icon: <CheckCircle2 size={14} /> };
        return { label: 'Incompleto', cssClass: 'status-incomplete', icon: <AlertCircle size={14} /> };
    };

    // --- CONFIRMAÇÃO DO MODAL ---
    const confirmCheckOut = (modalData) => {
        // modalData = { reasonId: '...', details: '...' }
        setIsModalOpen(false);
        // Passa para o pai (MainLayout) realizar a mutation
        onCheckOut(modalData);
    };

    const chartOptions = {
        chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
        plotOptions: { bar: { borderRadius: 6, columnWidth: '55%', distributed: true } },
        dataLabels: { enabled: false },
        legend: { show: false },
        xaxis: { categories: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'], labels: { style: { colors: '#64748b', fontSize: '12px' } }, axisBorder: { show: false }, axisTicks: { show: false } },
        yaxis: { labels: { style: { colors: '#64748b' } } },
        grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
        colors: ['#004B8D', '#004B8D', '#004B8D', '#004B8D', '#004B8D']
    };

    const chartSeries = [{ name: 'Horas', data: weeklyData }];

    return (
        <>
            <ConfirmationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={confirmCheckOut} />

            <div className="header-welcome">
                <h2 className="welcome-title">Olá, {userName}</h2>
                <p className="date-display">
                    {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    <span style={{marginLeft: '10px', fontSize: '0.8rem', background: '#e2e8f0', padding: '2px 8px', borderRadius: '12px', color: '#64748b'}}>
                        Meta Diária: {formatMinutesToLabel(SHIFT_CONFIG.minutes)}
                    </span>
                </p>
            </div>

            <div className="dashboard-grid">
                {/* COLUNA ESQUERDA: TIMER + GRÁFICO */}
                <div className="left-column">
                    <div className="punch-card">
                        {workStatus === 'working' && <div className="working-pulse"></div>}
                        <span className="timer-label">{workStatus === 'working' ? 'Turno em Andamento' : 'Pronto para iniciar?'}</span>
                        <div className="timer-display">{formatSecondsToTime(elapsedTime)}</div>

                        {workStatus === 'idle' ? (
                            <button className="btn-punch btn-checkin" onClick={onCheckIn} disabled={isLoading}>
                                {isLoading ? <Loader2 className="spin-slow" /> : <><Play size={24} fill="white" /> Fazer Check-in</>}
                            </button>
                        ) : (
                            <button className="btn-punch btn-checkout" onClick={() => setIsModalOpen(true)} disabled={isLoading}>
                                {isLoading ? <Loader2 className="spin-slow" /> : <><Square size={24} fill="white" /> Fazer Check-out</>}
                            </button>
                        )}
                    </div>

                    <div className="chart-card">
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '10px'}}>
                            <h3 style={{color: '#004B8D', fontWeight: 'bold'}}>Desempenho Semanal</h3>
                            <span style={{fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px'}}>
                                Seg - Sex
                            </span>
                        </div>

                        <div style={{ flex: 1, width: '100%', minHeight: '220px' }}>
                            <Chart options={chartOptions} series={chartSeries} type="bar" height="100%" width="100%" />
                        </div>
                    </div>
                </div>

                {/* COLUNA DIREITA: LISTA RECENTE */}
                <div className="right-column">
                    <div className="history-card">
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '1.5rem'}}>
                            <h3 style={{color: '#004B8D', fontWeight: 'bold'}}>Últimos Registros</h3>
                            <History size={18} color="#94a3b8"/>
                        </div>

                        <div className="history-list">
                            {processedHistory.length === 0 ? (
                                <p style={{textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem', padding: '20px'}}>Nenhum registro recente.</p>
                            ) : (
                                processedHistory.map((record) => {
                                    const config = getReasonConfig(record.type);
                                    const IconComponent = config.icon;
                                    const timeStatus = analyzeShift(record.seconds, record.isClosed);

                                    return (
                                        <div key={record.id} className="history-item">
                                            <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                                                <div className="history-icon-box" style={{ backgroundColor: config.bg, color: config.color }}>
                                                    <IconComponent size={20} />
                                                </div>

                                                <div className="history-details">
                                                    <span className="history-date">{record.date}</span>
                                                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: config.color, display: 'block' }}>
                                                        {record.label}
                                                    </span>

                                                    <div style={{display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#64748b', marginTop: '2px'}}>
                                                        <span>{record.times.start}</span>
                                                        <ArrowRight size={10} />
                                                        <span>{record.times.end}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
                                                <span className="history-duration">{record.duration}</span>
                                                {record.isClosed && (
                                                    <span className={`status-badge ${timeStatus.cssClass}`} style={{marginTop: '4px', fontSize: '0.65rem'}}>
                                                        {timeStatus.label}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;