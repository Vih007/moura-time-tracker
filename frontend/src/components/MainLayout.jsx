import React, { useState, useEffect, useRef } from 'react';
import { Toaster, toast } from 'sonner';
import { LayoutDashboard, CalendarDays, LogOut, History as HistoryIcon } from 'lucide-react';
import mouraLogo from '../assets/moura-logo.png';
import './Dashboard.css';

import Dashboard from './Dashboard';
import History from './History';
import { getShiftConfig, formatSecondsToTime } from '../utils/timeUtils';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const MainLayout = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const SHIFT_CONFIG = getShiftConfig();

    const [userName, setUserName] = useState('Colaborador');
    const [userId, setUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const [workStatus, setWorkStatus] = useState(() => localStorage.getItem('moura_work_status') || 'idle');
    const [startTime, setStartTime] = useState(() => {
        const saved = localStorage.getItem('moura_start_time');
        return saved ? new Date(saved) : null;
    });
    const [elapsedTime, setElapsedTime] = useState(0);

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

    // --- CARREGAMENTO INICIAL ---
    useEffect(() => {
        const loadUserData = async () => {
            const storedUser = localStorage.getItem('moura_user');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUserName(parsedUser.name);
                setUserId(parsedUser.id);

                // Busca o histórico real do backend para saber se já tem checkin aberto
                await checkCurrentStatus(parsedUser.id);
            }
        };
        loadUserData();
    }, []);

    const checkCurrentStatus = async (id) => {
        try {
            const response = await authFetch(`${API_BASE_URL}/times/my-history?employeeId=${id}`);
            if (response.ok) {
                const data = await response.json();
                // Procura registro com endTime null
                const activeShift = data.find(h => h.endTime === null);

                if (activeShift) {
                    setWorkStatus('working');
                    setStartTime(new Date(activeShift.startTime));
                } else {
                    setWorkStatus('idle');
                    setStartTime(null);
                    setElapsedTime(0);
                }
            }
        } catch (error) {
            console.error("Erro ao verificar status:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // --- ÁUDIO ---
    const playSound = (type) => {
        const sounds = {
            start: '/sounds/notification.mp3',
            stop: '/sounds/notification.mp3',
            half: '/sounds/notification.mp3',
            full: '/sounds/successfull.mp3',
        };
        const audio = new Audio(sounds[type]);
        audio.volume = 0.6;
        audio.play().catch(e => console.warn(e));
    };

    // --- LÓGICA DO CRONÔMETRO (GLOBAL) ---
    useEffect(() => {
        let interval;
        const tick = () => {
            if (startTime) {
                const now = new Date();
                const diff = Math.floor((now - startTime) / 1000);
                const currentSeconds = diff >= 0 ? diff : 0;
                setElapsedTime(currentSeconds);

                // Checagens de Áudio
                const halfTime = SHIFT_CONFIG.seconds / 2;
                if (currentSeconds === halfTime && !audioFlags.current.halfPlayed) {
                    playSound('half');
                    toast.info('Metade do turno atingida.', { duration: 4000 });
                    audioFlags.current.halfPlayed = true;
                }
                if (currentSeconds === SHIFT_CONFIG.seconds && !audioFlags.current.fullPlayed) {
                    playSound('full');
                    toast.success('Meta diária alcançada!', { duration: 5000 });
                    audioFlags.current.fullPlayed = true;
                }
            }
        };

        if (workStatus === 'working' && startTime) {
            tick();
            interval = setInterval(tick, 1000);
        } else {
            if(!startTime) setElapsedTime(0);
        }
        return () => clearInterval(interval);
    }, [workStatus, startTime]);

    // --- FUNÇÕES DE CONTROLE (API CALLS) ---
    const handleStartTimer = async () => {
        if (!userId) return;
        setIsLoading(true);
        try {
            const response = await authFetch(`${API_BASE_URL}/times/clock-in?employeeId=${userId}`, { method: 'POST' });
            if (!response.ok) throw new Error('Erro ao registrar ponto');

            playSound('start');
            const now = new Date();
            setStartTime(now);
            setWorkStatus('working');

            // Persistência local como backup
            localStorage.setItem('moura_work_status', 'working');
            localStorage.setItem('moura_start_time', now.toISOString());

            toast.success('Ponto iniciado no sistema.');
        } catch (error) {
            toast.error("Falha ao registrar entrada.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleStopTimer = async () => {
        if (!userId) return;
        setIsLoading(true);
        try {
            const response = await authFetch(`${API_BASE_URL}/times/clock-out?employeeId=${userId}`, { method: 'POST' });
            if (!response.ok) throw new Error('Erro ao finalizar ponto');

            playSound('stop');
            setWorkStatus('idle');
            setStartTime(null);
            setElapsedTime(0);

            localStorage.removeItem('moura_work_status');
            localStorage.removeItem('moura_start_time');
            audioFlags.current = { halfPlayed: false, fullPlayed: false };

            toast.success('Expediente finalizado no sistema.');
        } catch (error) {
            toast.error("Falha ao registrar saída.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <Toaster position="top-right" richColors />

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
                    {/* Placeholder para Escala se quiser reativar no futuro */}
                    {/* <div className={`nav-item ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>
                        <CalendarDays size={20} /> <span>Escala</span>
                    </div> */}
                    <div className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
                        <HistoryIcon size={20} /> <span>Histórico</span>
                    </div>
                </nav>
                <div style={{ marginTop: 'auto' }}>
                    <button onClick={onLogout} className="nav-item" style={{ width: '100%', border: 'none', background: 'transparent', color: 'white' }}>
                        <LogOut size={20} /> <span>Sair</span>
                    </button>
                </div>
            </aside>

            {/* CONTEÚDO PRINCIPAL */}
            <main className="main-content">
                {activeTab === 'dashboard' ? (
                    <Dashboard
                        workStatus={workStatus}
                        elapsedTime={elapsedTime}
                        onCheckIn={handleStartTimer}
                        onCheckOut={handleStopTimer}
                        SHIFT_CONFIG={SHIFT_CONFIG}
                        startTime={startTime}
                        isLoading={isLoading}
                    />
                ) : (
                    <History />
                )}
            </main>
        </div>
    );
};

export default MainLayout;