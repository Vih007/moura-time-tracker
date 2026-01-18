import React, { useState, useEffect, useRef } from 'react';
import { Toaster, toast } from 'sonner';
import { LayoutDashboard, LogOut, History as HistoryIcon } from 'lucide-react';
import mouraLogo from '../assets/moura-logo.png';
import './Dashboard.css';

import Dashboard from './Dashboard';
import History from './History';
import { getShiftConfig, calculateSecondsSince } from '../utils/timeUtils';

// IMPORTS ATUALIZADOS
import { useWorkHistory, useCheckIn, useCheckOut } from '../lib/queries/useWork';

const MainLayout = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const SHIFT_CONFIG = getShiftConfig();

    const [user] = useState(() => {
        const stored = localStorage.getItem('moura_user');
        return stored ? JSON.parse(stored) : null;
    });

    // --- BUSCA GLOBAL (Para o Timer) ---
    // Busca os 20 últimos para identificar se tem turno aberto recentemente
    const { data: historyPage } = useWorkHistory({
        employeeId: user?.id,
        page: 0,
        size: 20
    });

    const recentRecords = historyPage?.content || [];

    const checkInMutation = useCheckIn();
    const checkOutMutation = useCheckOut();

    const activeShift = recentRecords.find(record => record.checkout_time === null);
    const workStatus = activeShift ? 'working' : 'idle';

    const [elapsedTime, setElapsedTime] = useState(0);
    const audioFlags = useRef({ halfPlayed: false, fullPlayed: false });

    const playNotificationSound = () => {
        new Audio('/sounds/notification.mp3').play().catch(() => {});
    };

    useEffect(() => {
        let interval;

        const tick = () => {
            if (activeShift?.checkin_time && activeShift?.date) {
                const currentSeconds = calculateSecondsSince(activeShift.date, activeShift.checkin_time);
                setElapsedTime(currentSeconds);

                const halfTime = SHIFT_CONFIG.seconds / 2;

                if (currentSeconds === halfTime && !audioFlags.current.halfPlayed) {
                    playNotificationSound();
                    toast.info('Metade do turno atingida.');
                    audioFlags.current.halfPlayed = true;
                }
                if (currentSeconds === SHIFT_CONFIG.seconds && !audioFlags.current.fullPlayed) {
                    new Audio('/sounds/successfull.mp3').play().catch(() => {});
                    toast.success('Meta diária alcançada!');
                    audioFlags.current.fullPlayed = true;
                }
            } else {
                setElapsedTime(0);
                audioFlags.current = { halfPlayed: false, fullPlayed: false };
            }
        };

        if (workStatus === 'working') {
            tick();
            interval = setInterval(tick, 1000);
        } else {
            if (!activeShift) setElapsedTime(0);
        }

        return () => clearInterval(interval);
    }, [workStatus, activeShift, SHIFT_CONFIG]);


    const handleStartTimer = () => {
        if (!user?.id) return;
        playNotificationSound();
        checkInMutation.mutate(user.id);
    };

    const handleStopTimer = (modalData) => {
        if (!user?.id) return;
        playNotificationSound();
        checkOutMutation.mutate({
            employeeId: user.id,
            reason_id: modalData.reasonId,
            details: modalData.details
        });
    };

    return (
        <div className="dashboard-container">
            <Toaster position="top-right" richColors />

            <aside className="sidebar">
                <div className="sidebar-header">
                    <img src={mouraLogo} alt="Moura" className="sidebar-logo" />
                    <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                        Moura<span style={{ color: '#FFC700' }}>Tech</span>
                    </span>
                </div>
                <nav>
                    <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                        <LayoutDashboard size={20} /> <span>Painel</span>
                    </div>
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

            <main className="main-content">
                {activeTab === 'dashboard' ? (
                    <Dashboard
                        userName={user?.name || 'Colaborador'}
                        userId={user?.id}
                        workStatus={workStatus}
                        elapsedTime={elapsedTime}
                        isLoading={checkInMutation.isPending || checkOutMutation.isPending}
                        SHIFT_CONFIG={SHIFT_CONFIG}
                        onCheckIn={handleStartTimer}
                        onCheckOut={handleStopTimer}
                    />
                ) : (
                    <History userId={user?.id} SHIFT_CONFIG={SHIFT_CONFIG} />
                )}
            </main>
        </div>
    );
};

export default MainLayout;