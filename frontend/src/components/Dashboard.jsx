import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts'; // Biblioteca de Gráficos
import {
    Clock, LogOut, LayoutDashboard, CalendarDays, History,
    Play, Square, CheckCircle2, AlertCircle, TrendingUp
} from 'lucide-react';
import mouraLogo from '../assets/moura-logo.png';
import './Dashboard.css';

const Dashboard = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState('dashboard');

    const [workStatus, setWorkStatus] = useState(() => {
        return localStorage.getItem('moura_work_status') || 'idle';
    });

    const [startTime, setStartTime] = useState(() => {
        const savedTime = localStorage.getItem('moura_start_time');
        return savedTime ? new Date(savedTime) : null;
    });

    const [elapsedTime, setElapsedTime] = useState(0);

    const [history, setHistory] = useState([
        { id: 1, date: '15 Jan 2026', duration: '08:45:00', seconds: 31500 },
        { id: 2, date: '14 Jan 2026', duration: '08:02:10', seconds: 28930 },
        { id: 3, date: '13 Jan 2026', duration: '06:30:00', seconds: 23400 },
    ]);

    useEffect(() => {
        let interval;

        const calculateTime = () => {
            if (startTime) {
                const now = new Date();
                const diff = Math.floor((now - startTime) / 1000);
                setElapsedTime(diff >= 0 ? diff : 0);
            }
        };

        if (workStatus === 'working' && startTime) {
            calculateTime();
            interval = setInterval(calculateTime, 1000);
        } else {
            setElapsedTime(0);
        }

        return () => clearInterval(interval);
    }, [workStatus, startTime]);

    // Formata segundos para HH:MM:SS
    const formatTime = (totalSeconds) => {
        const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    // --- LÓGICA DE ANÁLISE DE JORNADA ---
    const analyzeShift = (seconds) => {
        const TARGET_HOURS = 8 * 3600;
        const TOLERANCE = 5 * 60;

        const MIN_PERFECT = TARGET_HOURS - TOLERANCE;
        const MAX_PERFECT = TARGET_HOURS + TOLERANCE;

        if (seconds > MAX_PERFECT) {
            return { label: 'Hora Extra', cssClass: 'status-extra', icon: <TrendingUp size={14} /> };
        }
        else if (seconds >= MIN_PERFECT && seconds <= MAX_PERFECT) {
            return { label: 'Jornada Perfeita', cssClass: 'status-perfect', icon: <CheckCircle2 size={14} /> };
        }
        else {
            return { label: 'Incompleto', cssClass: 'status-incomplete', icon: <AlertCircle size={14} /> };
        }
    };

    // --- AÇÕES DO USUÁRIO ---
    const handleCheckIn = () => {
        const now = new Date();
        setStartTime(now);
        setWorkStatus('working');

        // Salva estado para persistência
        localStorage.setItem('moura_work_status', 'working');
        localStorage.setItem('moura_start_time', now.toISOString());
    };

    const handleCheckOut = () => {
        setWorkStatus('idle');
        const durationFormatted = formatTime(elapsedTime);

        // Adiciona ao topo do histórico
        const newRecord = {
            id: Date.now(),
            date: 'Hoje',
            duration: durationFormatted,
            seconds: elapsedTime
        };

        setHistory([newRecord, ...history]);

        // Limpa estado e LocalStorage
        setStartTime(null);
        setElapsedTime(0);
        localStorage.removeItem('moura_work_status');
        localStorage.removeItem('moura_start_time');
    };

    // --- CONFIGURAÇÃO DO GRÁFICO (APEXCHARTS) ---
    const chartOptions = {
        chart: {
            type: 'bar',
            toolbar: { show: false },
            fontFamily: 'Inter, sans-serif',
        },
        plotOptions: {
            bar: {
                borderRadius: 6,
                columnWidth: '55%',
                distributed: true,
            }
        },
        dataLabels: { enabled: false },
        legend: { show: false },
        xaxis: {
            categories: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
            labels: { style: { colors: '#64748b', fontSize: '12px' } },
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            labels: { style: { colors: '#64748b' } },
        },
        grid: {
            borderColor: '#f1f5f9',
            strokeDashArray: 4,
        },
        tooltip: {
            theme: 'dark',
            y: { formatter: (val) => `${val}h` }
        },
        colors: ['#004B8D', '#004B8D', '#004B8D', '#004B8D', '#004B8D']
    };

    const chartSeries = [{
        name: 'Horas',
        data: [8.1, 7.8, 8.0, 8.5, 6.0]
    }];

    return (
        <div className="dashboard-container">
            {/* --- SIDEBAR --- */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <img src={mouraLogo} alt="Moura" className="sidebar-logo" />
                    <span style={{fontWeight: 'bold', fontSize: '1.2rem'}}>Moura<span style={{color: '#FFC700'}}>Tech</span></span>
                </div>

                <nav>
                    <div
                        className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        <LayoutDashboard size={20} />
                        <span>Painel</span>
                    </div>
                    <div className="nav-item">
                        <CalendarDays size={20} />
                        <span>Escala</span>
                    </div>
                    <div className="nav-item">
                        <History size={20} />
                        <span>Histórico</span>
                    </div>
                </nav>

                <div style={{ marginTop: 'auto' }}>
                    <button onClick={onLogout} className="nav-item" style={{ width: '100%', border: 'none', background: 'transparent', color: 'white' }}>
                        <LogOut size={20} />
                        <span>Sair</span>
                    </button>
                </div>
            </aside>

            {/* --- CONTEÚDO PRINCIPAL --- */}
            <main className="main-content">
                <div className="header-welcome">
                    <h2 className="welcome-title">Olá, Colaborador</h2>
                    <p className="date-display">
                        {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                </div>

                <div className="dashboard-grid">
                    <div className="left-column">
                        <div className="punch-card">
                            {workStatus === 'working' && <div className="working-pulse"></div>}

                            <span className="timer-label">
                {workStatus === 'working' ? 'Turno em Andamento' : 'Pronto para iniciar?'}
              </span>

                            <div className="timer-display">
                                {formatTime(elapsedTime)}
                            </div>

                            {workStatus === 'idle' ? (
                                <button className="btn-punch btn-checkin" onClick={handleCheckIn}>
                                    <Play size={24} fill="white" />
                                    Fazer Check-in
                                </button>
                            ) : (
                                <button className="btn-punch btn-checkout" onClick={handleCheckOut}>
                                    <Square size={24} fill="white" />
                                    Fazer Check-out
                                </button>
                            )}
                        </div>

                        <div className="chart-card">
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '10px'}}>
                                <h3 style={{color: '#004B8D', fontWeight: 'bold'}}>Desempenho Semanal</h3>
                                <span style={{fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px'}}>
                  Últimos 5 dias
                </span>
                            </div>

                            <div style={{ flex: 1, width: '100%', minHeight: '220px' }}>
                                <Chart
                                    options={chartOptions}
                                    series={chartSeries}
                                    type="bar"
                                    height="100%"
                                    width="100%"
                                />
                            </div>
                        </div>

                    </div>

                    {/* COLUNA DIREITA (Histórico) */}
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
                                                <div className="history-icon-box">
                                                    <Clock size={20} />
                                                </div>
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