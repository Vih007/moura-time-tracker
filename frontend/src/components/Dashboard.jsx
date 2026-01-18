import React, { useState, useEffect, useMemo, memo } from 'react';
import Chart from 'react-apexcharts';
import {
    Play, Square, History,
    LogOut, Utensils, Coffee, Briefcase, Stethoscope, MoreHorizontal, ArrowRight, Loader2,
    CheckCircle2, AlertTriangle, TrendingUp
} from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';
import { formatSecondsToTime, formatMinutesToLabel, calculateSecondsSince, formatTimeBalance } from '../utils/timeUtils';

import { useWorkHistory } from '../lib/queries/useWork';

// --- HELPER: Formatar Horas Decimais ---
const formatDecimalToTime = (val) => {
    if (!val) return "00:00";
    const hours = Math.floor(val);
    const minutes = Math.round((val - hours) * 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

// ==========================================
// 1. COMPONENTE DE ITEM DO HISTÓRICO
// ==========================================
const HistoryItem = memo(({ record, dailyTotalSeconds, isLatestOfDay, SHIFT_CONFIG }) => {
    const isClosed = !!record.checkout_time;

    // Se aberto, calcula dinamicamente. Se fechado, usa o estático.
    const [currentDuration, setCurrentDuration] = useState(() => {
        if (isClosed) return record.duration_seconds || 0;
        return calculateSecondsSince(record.date, record.checkin_time);
    });

    useEffect(() => {
        if (isClosed) return;
        const interval = setInterval(() => {
            setCurrentDuration(calculateSecondsSince(record.date, record.checkin_time));
        }, 1000);
        return () => clearInterval(interval);
    }, [isClosed, record.date, record.checkin_time]);

    // Configuração de ícones e cores
    const getReasonConfig = (type) => {
        const configs = {
            lunch_start: { icon: Utensils, color: '#f59e0b', bg: '#fffbeb' },
            break_start: { icon: Coffee, color: '#8b5cf6', bg: '#f3e8ff' },
            meeting_start: { icon: Briefcase, color: '#10b981', bg: '#d1fae5' },
            medical: { icon: Stethoscope, color: '#3b82f6', bg: '#dbeafe' },
            other: { icon: MoreHorizontal, color: '#64748b', bg: '#f1f5f9' },
            end_shift: { icon: LogOut, color: '#ef4444', bg: '#fee2e2' }
        };
        return configs[type] || configs.end_shift;
    };

    // --- NOVA LÓGICA DE STATUS ---
    const getStatusInfo = () => {
        // 1. Se o turno está aberto, mostra "Em andamento"
        if (!isClosed) {
            return {
                label: 'Em Andamento',
                cssClass: 'status-working',
                icon: <Loader2 size={12} className="spin-slow"/>
            };
        }

        // 2. Se não for "Fim de Expediente", não mostra saldo
        if (record.reason_id !== 'end_shift') return null;

        // 3. Só mostra o saldo acumulado se for o ÚLTIMO registro daquele dia
        // Isso evita que cada pequena saída mostre "Saída Antecipada" repetidamente.
        if (!isLatestOfDay) return null;

        // 4. Cálculo baseado no TOTAL DO DIA (dailyTotalSeconds)
        // Se houver um turno em aberto no dia, somamos o tempo dele também
        const totalConsidered = dailyTotalSeconds + (isClosed ? 0 : currentDuration);

        const TARGET = SHIFT_CONFIG.seconds;
        const diff = totalConsidered - TARGET;
        const tolerance = 300; // 5 minutos

        if (Math.abs(diff) <= tolerance) {
            return { label: 'Jornada Normal', cssClass: 'status-perfect', icon: <CheckCircle2 size={12}/> };
        }
        if (diff > tolerance) {
            return { label: `Hora Extra ${formatTimeBalance(totalConsidered, TARGET)}`, cssClass: 'status-extra', icon: <TrendingUp size={12}/> };
        }
        return { label: `Saldo: ${formatTimeBalance(totalConsidered, TARGET)}`, cssClass: 'status-incomplete', icon: <AlertTriangle size={12}/> };
    };

    const config = getReasonConfig(record.reason_id);
    const IconComponent = config.icon;
    const status = getStatusInfo();

    return (
        <div className="history-item">
            <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                <div className="history-icon-box" style={{ backgroundColor: config.bg, color: config.color }}>
                    <IconComponent size={20} />
                </div>
                <div className="history-details">
                    <span className="history-date">
                        {new Date(record.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: config.color, display: 'block' }}>
                        {record.reason_label || 'Ponto'}
                    </span>
                    <div style={{display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#64748b', marginTop: '2px'}}>
                        <span>{record.checkin_time?.substring(0, 5)}</span>
                        <ArrowRight size={10} />
                        <span>{record.checkout_time?.substring(0, 5) || '--:--'}</span>
                    </div>
                </div>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
                <span className={`history-duration ${!isClosed ? 'active-timer-text' : ''}`}>
                    {formatSecondsToTime(currentDuration)}
                </span>

                {status && (
                    <span className={`status-badge ${status.cssClass}`} style={{marginTop: '4px', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '4px'}}>
                        {status.icon} {status.label}
                    </span>
                )}
            </div>
        </div>
    );
});

// ==========================================
// 2. COMPONENTE DE GRÁFICO (MANTIDO)
// ==========================================
const WeeklyChart = memo(({ historyData }) => {
    // ... (Código do gráfico permanece idêntico ao anterior)
    const { chartCategories, chartSeriesData } = useMemo(() => {
        const days = [];
        const today = new Date();
        const dataMap = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const dateKey = `${year}-${month}-${day}`;
            days.push({ dateObj: d, dateKey });
            dataMap[dateKey] = 0;
        }
        historyData.forEach(record => {
            if (!record.date || !record.duration_seconds) return;
            if (dataMap[record.date] !== undefined) {
                dataMap[record.date] += record.duration_seconds / 3600;
            }
        });
        const categories = days.map(item => {
            const dayName = item.dateObj.toLocaleDateString('pt-BR', { weekday: 'short' });
            return dayName.charAt(0).toUpperCase() + dayName.slice(1, 3);
        });
        const series = days.map(item => Number(dataMap[item.dateKey]));
        return { chartCategories: categories, chartSeriesData: series };
    }, [historyData]);

    const chartOptions = {
        chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
        plotOptions: { bar: { borderRadius: 6, columnWidth: '55%', distributed: true } },
        dataLabels: { enabled: false },
        legend: { show: false },
        xaxis: { categories: chartCategories, labels: { style: { colors: '#64748b', fontSize: '12px' } }, axisBorder: { show: false }, axisTicks: { show: false } },
        yaxis: { labels: { style: { colors: '#64748b' }, formatter: (val) => formatDecimalToTime(val) } },
        tooltip: { y: { formatter: (val) => formatDecimalToTime(val) + "h" } },
        grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
        colors: Array(7).fill('#004B8D')
    };
    const chartSeries = [{ name: 'Tempo', data: chartSeriesData }];

    return (
        <div className="chart-card">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '10px'}}>
                <h3 style={{color: '#004B8D', fontWeight: 'bold'}}>Desempenho Semanal</h3>
                <span style={{fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px'}}>
                    Últimos 7 dias
                </span>
            </div>
            <div style={{ flex: 1, width: '100%', minHeight: '220px' }}>
                <Chart options={chartOptions} series={chartSeries} type="bar" height="100%" width="100%" />
            </div>
        </div>
    );
}, (prev, next) => prev.historyData === next.historyData);

// ==========================================
// 3. LISTA DE HISTÓRICO (CORRIGIDA)
// ==========================================
const RecentHistory = memo(({ historyData, SHIFT_CONFIG }) => {

    // 1. AUMENTAMOS O LIMITE DE EXIBIÇÃO
    // De slice(0, 5) para slice(0, 30) para garantir que o usuário veja o dia todo
    const recentRecords = historyData.slice(0, 30);

    // 2. CALCULAR O TOTAL ACUMULADO POR DIA
    const dailyTotalsMap = useMemo(() => {
        const map = {};
        historyData.forEach(record => {
            if (!map[record.date]) map[record.date] = 0;
            if (record.duration_seconds) {
                map[record.date] += record.duration_seconds;
            }
        });
        return map;
    }, [historyData]);

    // 3. IDENTIFICAR O "ÚLTIMO" REGISTRO DE CADA DIA
    const recordsWithMeta = useMemo(() => {
        const processedDates = new Set();

        return recentRecords.map(record => {
            const isLatestOfDay = !processedDates.has(record.date);
            if (isLatestOfDay) {
                processedDates.add(record.date);
            }
            return { ...record, isLatestOfDay };
        });
    }, [recentRecords]);

    return (
        <div className="history-card">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '1.5rem'}}>
                <h3 style={{color: '#004B8D', fontWeight: 'bold'}}>Últimos Registros</h3>
                <History size={18} color="#94a3b8"/>
            </div>

            <div className="history-list">
                {recordsWithMeta.length === 0 ? (
                    <p style={{textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem', padding: '20px'}}>Nenhum registro recente.</p>
                ) : (
                    recordsWithMeta.map((record) => (
                        <HistoryItem
                            key={record.id}
                            record={record}
                            // Passa o total SOMADO do dia para o cálculo correto
                            dailyTotalSeconds={dailyTotalsMap[record.date] || 0}
                            isLatestOfDay={record.isLatestOfDay}
                            SHIFT_CONFIG={SHIFT_CONFIG}
                        />
                    ))
                )}
            </div>
        </div>
    );
});

// ==========================================
// 4. COMPONENTE DE TIMER PRINCIPAL (MANTIDO)
// ==========================================
const PunchClock = ({ workStatus, elapsedTime, onCheckIn, onRequestCheckOut, isLoading }) => {
    return (
        <div className="punch-card">
            {workStatus === 'working' && <div className="working-pulse"></div>}
            <span className="timer-label">{workStatus === 'working' ? 'Turno em Andamento' : 'Pronto para iniciar?'}</span>
            <div className="timer-display">{formatSecondsToTime(elapsedTime)}</div>

            {workStatus === 'idle' ? (
                <button className="btn-punch btn-checkin" onClick={onCheckIn} disabled={isLoading}>
                    {isLoading ? <Loader2 className="spin-slow" /> : <><Play size={24} fill="white" /> Fazer Check-in</>}
                </button>
            ) : (
                <button className="btn-punch btn-checkout" onClick={onRequestCheckOut} disabled={isLoading}>
                    {isLoading ? <Loader2 className="spin-slow" /> : <><Square size={24} fill="white" /> Fazer Check-out</>}
                </button>
            )}
        </div>
    );
};

// ==========================================
// 5. DASHBOARD PRINCIPAL (ATUALIZADO)
// ==========================================
const Dashboard = ({
                       userName,
                       userId, // <--- NOVA PROP: Precisamos do ID para buscar os dados
                       workStatus,
                       elapsedTime,
                       onCheckIn,
                       onCheckOut,
                       SHIFT_CONFIG,
                       isLoading
                       // historyData REMOVIDA
                   }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: historyPage } = useWorkHistory({
        employeeId: userId,
        page: 0,
        size: 20
    });

    const historyData = historyPage?.content || [];

    const handleConfirmCheckOut = (modalData) => {
        setIsModalOpen(false);
        onCheckOut(modalData);
    };

    return (
        <>
            <ConfirmationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleConfirmCheckOut} />

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
                <div className="left-column">
                    <PunchClock
                        workStatus={workStatus}
                        elapsedTime={elapsedTime}
                        onCheckIn={onCheckIn}
                        onRequestCheckOut={() => setIsModalOpen(true)}
                        isLoading={isLoading}
                    />
                    <WeeklyChart historyData={historyData} />
                </div>

                <div className="right-column">
                    <RecentHistory historyData={historyData} SHIFT_CONFIG={SHIFT_CONFIG} />
                </div>
            </div>
        </>
    );
};

export default Dashboard;