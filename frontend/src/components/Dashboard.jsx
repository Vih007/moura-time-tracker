import React, { useState, useEffect, useRef } from 'react';
import Chart from 'react-apexcharts';
import { Toaster, toast } from 'sonner';
import {
    Clock, LogOut, LayoutDashboard, CalendarDays, History,
    Play, Square, CheckCircle2, AlertCircle, TrendingUp, Loader2
} from 'lucide-react';
import mouraLogo from '../assets/moura-logo.png';
import './Dashboard.css';
import ConfirmationModal from './ConfirmationModal';
import { formatSecondsToTime, formatMinutesToLabel, getShiftConfig } from '../utils/timeUtils';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const Dashboard = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const SHIFT_CONFIG = getShiftConfig();

    const [userName, setUserName] = useState('Colaborador');
    const [userId, setUserId] = useState(null);
    
    // --- NOVO: Estado para guardar a escala que vem do banco ---
    const [userSchedule, setUserSchedule] = useState({ start: '08:00', end: '17:00' });
    // -----------------------------------------------------------

    const [isLoading, setIsLoading] = useState(true);
    const [workStatus, setWorkStatus] = useState('idle');
    const [startTime, setStartTime] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [history, setHistory] = useState([]);
    const audioFlags = useRef({ halfPlayed: false, fullPlayed: false });

    // --- HELPER PARA REQUISIÇÕES ---
    const authFetch = async (url, options = {}) => {
        const token = localStorage.getItem('moura_token');
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };
        return fetch(url, { ...options, headers });
    };

    useEffect(() => {
        const loadUserData = async () => {
            const storedUser = localStorage.getItem('moura_user');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUserName(parsedUser.name);
                setUserId(parsedUser.id);
                
                // 1. Busca Histórico
                await fetchHistory(parsedUser.id);

                // 2. Busca Dados Atualizados do Funcionário (Para pegar a Escala Nova)
                await fetchLatestEmployeeData(parsedUser.id);
            }
        };
        loadUserData();
    }, []);

    // --- NOVA FUNÇÃO: Busca a escala no Backend ---
    const fetchLatestEmployeeData = async (id) => {
        try {
            const response = await authFetch(`${API_BASE_URL}/employees/${id}`);
            if (response.ok) {
                const data = await response.json();
                // Atualiza o estado com o horário que veio do banco
                setUserSchedule({
                    start: data.workStartTime || '08:00',
                    end: data.workEndTime || '17:00'
                });
            }
        } catch (error) {
            console.error("Erro ao buscar dados atualizados do funcionário", error);
        }
    };
    // ----------------------------------------------

    const fetchHistory = async (id) => {
        try {
            const response = await authFetch(`${API_BASE_URL}/times/my-history?employeeId=${id}`);
            
            if (response.ok) {
                const data = await response.json();
                
                const formattedHistory = data.map(entry => ({
                    id: entry.id,
                    date: new Date(entry.startTime).toLocaleDateString('pt-BR'),
                    startTimeOnly: new Date(entry.startTime).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}),
                    endTimeOnly: entry.endTime ? new Date(entry.endTime).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}) : '-',
                    duration: entry.endTime ? formatSecondsToTime(entry.durationSeconds) : 'Em andamento',
                    seconds: entry.durationSeconds || 0,
                    isActive: entry.endTime === null,
                    rawStartTime: entry.startTime
                }));

                setHistory(formattedHistory);

                const activeShift = formattedHistory.find(h => h.isActive);
                if (activeShift) {
                    setWorkStatus('working');
                    setStartTime(new Date(activeShift.rawStartTime));
                } else {
                    setWorkStatus('idle');
                    setStartTime(null);
                    setElapsedTime(0);
                }
            }
        } catch (error) {
            console.error("Erro ao buscar histórico:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // --- CRONÔMETRO ---
    const playSound = (type) => {
        const sounds = {
            start: '/sounds/notification.mp3',
            stop: '/sounds/notification.mp3',
            half: '/sounds/notification.mp3',
            full: '/sounds/successfull.mp3',
        };
        const audio = new Audio(sounds[type]);
        audio.volume = 0.6;
        audio.play().catch(e => console.warn(`Erro som:`, e));
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
                    toast.info('Metade do turno atingida!');
                    audioFlags.current.halfPlayed = true;
                }
                if (currentSeconds === SHIFT_CONFIG.seconds && !audioFlags.current.fullPlayed) {
                    playSound('full');
                    toast.success('Meta diária alcançada!');
                    audioFlags.current.fullPlayed = true;
                }
            }
        };

        if (workStatus === 'working' && startTime) {
            tick();
            interval = setInterval(tick, 1000);
        } else {
            if (!startTime) setElapsedTime(0);
        }
        return () => clearInterval(interval);
    }, [workStatus, startTime]);

    const analyzeShift = (seconds, isActive) => {
        if (isActive) return { label: 'Em Andamento', cssClass: 'status-working', icon: <Loader2 size={14} className="spin-slow"/> };
        const TARGET = SHIFT_CONFIG.seconds;
        const TOLERANCE = 5 * 60; 
        if (seconds > TARGET + TOLERANCE) return { label: 'Hora Extra', cssClass: 'status-extra', icon: <TrendingUp size={14} /> };
        if (seconds >= TARGET - TOLERANCE) return { label: 'Jornada Perfeita', cssClass: 'status-perfect', icon: <CheckCircle2 size={14} /> };
        return { label: 'Incompleto', cssClass: 'status-incomplete', icon: <AlertCircle size={14} /> };
    };

    // --- AÇÕES DO USUÁRIO ---
    const handleCheckIn = async () => {
        try {
            const response = await authFetch(`${API_BASE_URL}/times/clock-in?employeeId=${userId}`, { method: 'POST' });
            
            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || 'Erro ao registrar ponto');
            }

            playSound('start');
            const now = new Date();
            setStartTime(now);
            setWorkStatus('working');
            
            fetchHistory(userId); 
            toast.success('Ponto iniciado no sistema!');

        } catch (error) {
            console.error(error);
            toast.error("Falha ao registrar entrada.");
        }
    };

    const handleCheckOutRequest = () => setIsModalOpen(true);

    const confirmCheckOut = async () => {
        try {
            const response = await authFetch(`${API_BASE_URL}/times/clock-out?employeeId=${userId}`, { method: 'POST' });
            
            if (!response.ok) throw new Error('Erro ao finalizar ponto');

            playSound('stop');
            setWorkStatus('idle');
            setStartTime(null);
            setElapsedTime(0);
            audioFlags.current = { halfPlayed: false, fullPlayed: false };
            setIsModalOpen(false);
            
            toast.success('Expediente finalizado e salvo!');
            fetchHistory(userId); 

        } catch (error) {
            toast.error("Falha ao registrar saída.");
        }
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
    const chartSeries = [{ name: 'Horas', data: [8.1, 7.8, 8.0, 8.5, 6.0] }];

    // --- SUB-TELAS ---

    // 1. Componente da Escala (AGORA DINÂMICA)
    const ScheduleView = () => {
        // Usa o estado userSchedule que veio do banco
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

    // 2. Componente de Histórico
    const HistoryView = () => {
        return (
            <div className="fade-in-up">
                <h3 style={{color: '#004B8D', marginBottom: '20px', display:'flex', alignItems:'center', gap:'10px'}}>
                    <History size={24}/> Histórico Detalhado
                </h3>
                <div style={{background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden'}}>
                    <table style={{width: '100%', borderCollapse: 'collapse'}}>
                        <thead>
                            <tr style={{background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left'}}>
                                <th style={{padding: '16px', color: '#64748b', fontWeight: '600'}}>Data</th>
                                <th style={{padding: '16px', color: '#64748b', fontWeight: '600'}}>Entrada</th>
                                <th style={{padding: '16px', color: '#64748b', fontWeight: '600'}}>Saída</th>
                                <th style={{padding: '16px', color: '#64748b', fontWeight: '600'}}>Duração</th>
                                <th style={{padding: '16px', color: '#64748b', fontWeight: '600'}}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{padding: '20px', textAlign: 'center', color: '#94a3b8'}}>
                                        Nenhum registro encontrado.
                                    </td>
                                </tr>
                            ) : (
                                history.map((record) => {
                                    const status = analyzeShift(record.seconds, record.isActive);
                                    return (
                                        <tr key={record.id} style={{borderBottom: '1px solid #f1f5f9'}}>
                                            <td style={{padding: '16px', color: '#334155'}}>{record.date}</td>
                                            <td style={{padding: '16px', color: '#64748b'}}>{record.startTimeOnly}</td>
                                            <td style={{padding: '16px', color: '#64748b'}}>{record.endTimeOnly}</td>
                                            <td style={{padding: '16px', fontWeight: 'bold', color: '#004B8D'}}>{record.duration}</td>
                                            <td style={{padding: '16px'}}>
                                                <span className={`status-badge ${status.cssClass}`} style={{display: 'inline-flex', gap: '5px', fontSize: '0.8rem'}}>
                                                    {status.icon} {status.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'schedule':
                return <ScheduleView />;
            case 'history':
                return <HistoryView />;
            case 'dashboard':
            default:
                return (
                    <div className="dashboard-grid">
                        <div className="left-column">
                            <div className="punch-card">
                                {workStatus === 'working' && <div className="working-pulse"></div>}
                                <span className="timer-label">{workStatus === 'working' ? 'Turno em Andamento' : 'Pronto para iniciar?'}</span>
                                <div className="timer-display">{formatSecondsToTime(elapsedTime)}</div>
                                
                                {workStatus === 'idle' ? (
                                    <button className="btn-punch btn-checkin" onClick={handleCheckIn} disabled={isLoading}>
                                        <Play size={24} fill="white" /> Fazer Check-in
                                    </button>
                                ) : (
                                    <button className="btn-punch btn-checkout" onClick={handleCheckOutRequest} disabled={isLoading}>
                                        <Square size={24} fill="white" /> Fazer Check-out
                                    </button>
                                )}
                            </div>

                            <div className="chart-card">
                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '10px'}}>
                                    <h3 style={{color: '#004B8D', fontWeight: 'bold'}}>Desempenho Semanal</h3>
                                </div>
                                <div style={{ flex: 1, width: '100%', minHeight: '220px' }}>
                                    <Chart options={chartOptions} series={chartSeries} type="bar" height="100%" width="100%" />
                                </div>
                            </div>
                        </div>

                        <div className="right-column">
                            <div className="history-card">
                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '1.5rem'}}>
                                    <h3 style={{color: '#004B8D', fontWeight: 'bold'}}>Últimos Registros</h3>
                                    <History size={18} color="#94a3b8"/>
                                </div>
                                <div className="history-list">
                                    {isLoading ? (
                                        <p style={{textAlign: 'center', color: '#999'}}>Carregando...</p>
                                    ) : history.length === 0 ? (
                                        <p style={{textAlign: 'center', color: '#999'}}>Nenhum registro encontrado.</p>
                                    ) : (
                                        history.slice(0, 5).map((record) => {
                                            const status = analyzeShift(record.seconds, record.isActive);
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
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="dashboard-container">
            <Toaster position="top-right" richColors />
            <ConfirmationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={confirmCheckOut} />

            <aside className="sidebar">
                <div className="sidebar-header">
                    <img src={mouraLogo} alt="Moura" className="sidebar-logo" />
                    <span style={{fontWeight: 'bold', fontSize: '1.2rem'}}>Moura<span style={{color: '#FFC700'}}>Tech</span></span>
                </div>
                <nav>
                    <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                        <LayoutDashboard size={20} /> <span>Painel</span>
                    </div>
                    <div className={`nav-item ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>
                        <CalendarDays size={20} /> <span>Escala</span>
                    </div>
                    <div className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
                        <History size={20} /> <span>Histórico</span>
                    </div>
                </nav>
                <div style={{ marginTop: 'auto' }}>
                    <button onClick={onLogout} className="nav-item" style={{ width: '100%', border: 'none', background: 'transparent', color: 'white' }}>
                        <LogOut size={20} /> <span>Sair</span>
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <div className="header-welcome">
                    <h2 className="welcome-title">Olá, {userName}</h2>
                    <p className="date-display">
                        {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        <span style={{marginLeft: '10px', fontSize: '0.8rem', background: '#e2e8f0', padding: '2px 8px', borderRadius: '12px', color: '#64748b'}}>
                            Meta Diária: {formatMinutesToLabel(SHIFT_CONFIG.minutes)}
                        </span>
                    </p>
                </div>

                {renderContent()}
                
            </main>
        </div>
    );
};

export default Dashboard;