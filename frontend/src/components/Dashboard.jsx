import React, { useState, useEffect, useRef } from 'react';
import Chart from 'react-apexcharts';
import { Toaster, toast } from 'sonner';
import {
    Clock, LogOut, LayoutDashboard, CalendarDays, History,
    Play, Square, CheckCircle2, AlertCircle, TrendingUp
} from 'lucide-react';
import mouraLogo from '../assets/moura-logo.png';
import './Dashboard.css';
import ConfirmationModal from './ConfirmationModal';
import { formatSecondsToTime, formatMinutesToLabel, getShiftConfig } from '../utils/timeUtils';

const Dashboard = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState('dashboard');

    const SHIFT_CONFIG = getShiftConfig();

    const [workStatus, setWorkStatus] = useState(() => {
        return localStorage.getItem('moura_work_status') || 'idle';
    });

    const [startTime, setStartTime] = useState(() => {
        const saved = localStorage.getItem('moura_start_time');
        return saved ? new Date(saved) : null;
    });

    const [elapsedTime, setElapsedTime] = useState(0);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [history, setHistory] = useState([
        { id: 1, date: '15 Jan 2026', duration: '08:45:00', seconds: 31500 },
        { id: 2, date: '14 Jan 2026', duration: '08:00:00', seconds: 28800 },
    ]);

    const audioFlags = useRef({
        halfPlayed: false,
        fullPlayed: false
    });

    const playSound = (type) => {
        const sounds = {
            start: '/sounds/notification.mp3',
            stop: '/sounds/notification.mp3',
            half: '/sounds/notification.mp3',
            full: '/sounds/successfull.mp3',
        };

        const audio = new Audio(sounds[type]);
        audio.volume = 0.6; // Volume agradável
        audio.play().catch(e => console.warn(`Erro ao tocar som (${type}):`, e));
    };

    useEffect(() => {
        let interval;

        const tick = () => {
            if (startTime) {
                const now = new Date();
                const diff = Math.floor((now - startTime) / 1000);
                const currentSeconds = diff >= 0 ? diff : 0;

                setElapsedTime(currentSeconds);

                const halfTime = SHIFT_CONFIG.seconds / 2;
                if (currentSeconds === halfTime && !audioFlags.current.halfPlayed) {
                    playSound('half');
                    toast.info('Metade do turno atingida. Bom trabalho!', { duration: 4000 });
                    audioFlags.current.halfPlayed = true;
                }

                if (currentSeconds === SHIFT_CONFIG.seconds && !audioFlags.current.fullPlayed) {
                    playSound('full');
                    toast.success('Meta diária alcançada! Parabéns!', { duration: 5000 });
                    audioFlags.current.fullPlayed = true;
                }
            }
        };

        if (workStatus === 'working' && startTime) {
            tick();
            interval = setInterval(tick, 1000);
        } else {
            setElapsedTime(0);
            if (!startTime) {
                audioFlags.current = { halfPlayed: false, fullPlayed: false };
            }
        }

        return () => clearInterval(interval);
    }, [workStatus, startTime]);

    const analyzeShift = (seconds) => {
        const TARGET = SHIFT_CONFIG.seconds;
        const TOLERANCE = 5 * 60;

        if (seconds > TARGET + TOLERANCE) {
            return { label: 'Hora Extra', cssClass: 'status-extra', icon: <TrendingUp size={14} /> };
        }
        else if (seconds >= TARGET - TOLERANCE) {
            return { label: 'Jornada Perfeita', cssClass: 'status-perfect', icon: <CheckCircle2 size={14} /> };
        }
        else {
            return { label: 'Incompleto', cssClass: 'status-incomplete', icon: <AlertCircle size={14} /> };
        }
    };

    // --- AÇÕES DO USUÁRIO ---

    // 1. Iniciar Turno
    const handleCheckIn = () => {
        playSound('start');
        const now = new Date();
        setStartTime(now);
        setWorkStatus('working');

        localStorage.setItem('moura_work_status', 'working');
        localStorage.setItem('moura_start_time', now.toISOString());

        toast.success('Ponto registrado com sucesso!');
    };

    // 2. Solicitar Encerramento (Abre Modal)
    const handleCheckOutRequest = () => {
        setIsModalOpen(true);
    };

    // 3. Confirmar Encerramento (Ação Real)
    const confirmCheckOut = () => {
        playSound('stop');
        setWorkStatus('idle');

        const durationFormatted = formatSecondsToTime(elapsedTime);

        // Salva histórico
        const newRecord = {
            id: Date.now(),
            date: 'Hoje',
            duration: durationFormatted,
            seconds: elapsedTime
        };
        setHistory([newRecord, ...history]);

        // Limpeza de estado e storage
        setStartTime(null);
        setElapsedTime(0);
        localStorage.removeItem('moura_work_status');
        localStorage.removeItem('moura_start_time');
        audioFlags.current = { halfPlayed: false, fullPlayed: false };

        setIsModalOpen(false); // Fecha modal
        toast.success('Expediente finalizado.');
    };

    // --- CONFIGURAÇÃO DO GRÁFICO ---
    const chartOptions = {
        chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
        plotOptions: { bar: { borderRadius: 6, columnWidth: '55%', distributed: true } },
        dataLabels: { enabled: false },
        legend: { show: false },
        xaxis: {
            categories: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
            labels: { style: { colors: '#64748b', fontSize: '12px' } },
            axisBorder: { show: false }, axisTicks: { show: false }
        },
        yaxis: { labels: { style: { colors: '#64748b' } } },
        grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
        tooltip: { theme: 'dark', y: { formatter: (val) => `${val}h` } },
        colors: ['#004B8D', '#004B8D', '#004B8D', '#004B8D', '#004B8D']
    };

    const chartSeries = [{ name: 'Horas', data: [8.1, 7.8, 8.0, 8.5, 6.0] }];

    return (
        <div className="dashboard-container">
            {/* Container de Notificações (Toasts) */}
            <Toaster position="top-right" richColors />

            {/* Modal de Confirmação */}
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmCheckOut}
            />

            {/* SIDEBAR */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <img src={mouraLogo} alt="Moura" className="sidebar-logo" />
                    <span style={{fontWeight: 'bold', fontSize: '1.2rem'}}>Moura<span style={{color: '#FFC700'}}>Tech</span></span>
                </div>
                <nav>
                    <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                        <LayoutDashboard size={20} /> <span>Painel</span>
                    </div>
                    <div className="nav-item"><CalendarDays size={20} /> <span>Escala</span></div>
                    <div className="nav-item"><History size={20} /> <span>Histórico</span></div>
                </nav>
                <div style={{ marginTop: 'auto' }}>
                    <button onClick={onLogout} className="nav-item" style={{ width: '100%', border: 'none', background: 'transparent', color: 'white' }}>
                        <LogOut size={20} /> <span>Sair</span>
                    </button>
                </div>
            </aside>

            {/* CONTEÚDO PRINCIPAL */}
            <main className="main-content">
                <div className="header-welcome">
                    <h2 className="welcome-title">Olá, Colaborador</h2>
                    <p className="date-display">
                        {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        <span style={{marginLeft: '10px', fontSize: '0.8rem', background: '#e2e8f0', padding: '2px 8px', borderRadius: '12px', color: '#64748b'}}>
              Meta Diária: {formatMinutesToLabel(SHIFT_CONFIG.minutes)}
            </span>
                    </p>
                </div>

                <div className="dashboard-grid">

                    {/* COLUNA ESQUERDA */}
                    <div className="left-column">

                        {/* Widget de Ponto */}
                        <div className="punch-card">
                            {workStatus === 'working' && <div className="working-pulse"></div>}

                            <span className="timer-label">
                {workStatus === 'working' ? 'Turno em Andamento' : 'Pronto para iniciar?'}
              </span>

                            <div className="timer-display">{formatSecondsToTime(elapsedTime)}</div>

                            {workStatus === 'idle' ? (
                                <button className="btn-punch btn-checkin" onClick={handleCheckIn}>
                                    <Play size={24} fill="white" /> Fazer Check-in
                                </button>
                            ) : (
                                <button className="btn-punch btn-checkout" onClick={handleCheckOutRequest}>
                                    <Square size={24} fill="white" /> Fazer Check-out
                                </button>
                            )}
                        </div>

                        {/* Widget de Gráfico */}
                        <div className="chart-card">
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '10px'}}>
                                <h3 style={{color: '#004B8D', fontWeight: 'bold'}}>Desempenho Semanal</h3>
                                <span style={{fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px'}}>
                  Últimos 5 dias
                </span>
                            </div>
                            <div style={{ flex: 1, width: '100%', minHeight: '220px' }}>
                                <Chart options={chartOptions} series={chartSeries} type="bar" height="100%" width="100%" />
                            </div>
                        </div>
                    </div>

                    {/* COLUNA DIREITA */}
                    <div className="right-column">
                        <div className="history-card">
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '1.5rem'}}>
                                <h3 style={{color: '#004B8D', fontWeight: 'bold'}}>Últimos Registros</h3>
                                <History size={18} color="#94a3b8"/>
                            </div>

                            <div className="history-list">
                                {history.map((record) => {
                                    const status = analyzeShift(record.seconds);

                                    return (
                                        <div key={record.id} className="history-item">
                                            <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                                                <div className="history-icon-box"><Clock size={20} /></div>
                                                <div className="history-details">
                                                    <span className="history-date">{record.date}</span>
                                                    <span className={`status-badge ${status.cssClass}`} style={{display:'flex', alignItems:'center', gap:'4px'}}>
                            {status.icon} {status.label}
                          </span>
                                                </div>
                                            </div>
                                            <span className="history-duration">{record.duration}</span>
                                        </div>
                                    );
                                })}
                            </div>

                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default Dashboard;