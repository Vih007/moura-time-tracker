import React, { useState, useEffect, useRef } from 'react';
import { Toaster, toast } from 'sonner';
import {LayoutDashboard, LogOut, History as HistoryIcon, Menu, X, CalendarDays} from 'lucide-react'; // Adicionado Menu e X
import mouraLogo from '../assets/moura-logo.png';
import './Dashboard.css';

import Dashboard from './Dashboard';
import History from './History';
import { getShiftConfig, calculateSecondsSince } from '../utils/timeUtils';
import { useWorkHistory, useCheckIn, useCheckOut } from '../lib/queries/useWork';
import Schedule from "./Schedule.jsx";

const MainLayout = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const SHIFT_CONFIG = getShiftConfig();

    const [user] = useState(() => {
        const stored = localStorage.getItem('moura_user');
        return stored ? JSON.parse(stored) : null;
    });

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
            } else {
                setElapsedTime(0);
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

    const handleNavClick = (tab) => {
        setActiveTab(tab);
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="dashboard-container">
            <Toaster position="top-right" richColors />

            {/* BOTÃO MOBILE HAMBURGUER */}
            <button
                className="mobile-menu-btn"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                <Menu size={24} />
            </button>

            {/* OVERLAY ESCURO (Apenas Mobile) */}
            {isMobileMenuOpen && (
                <div className="sidebar-overlay" onClick={() => setIsMobileMenuOpen(false)} />
            )}

            {/* SIDEBAR (Com classe condicional para mobile) */}
            <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={mouraLogo} alt="Moura" className="sidebar-logo" />
                        <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                            Moura<span style={{ color: '#FFC700' }}>Tech</span>
                        </span>
                    </div>
                    {/* Botão X para fechar dentro da sidebar no mobile */}
                    <button className="mobile-close-btn" onClick={() => setIsMobileMenuOpen(false)}>
                        <X size={24} />
                    </button>
                </div>

                <nav>
                    <div
                        className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => handleNavClick('dashboard')}
                    >
                        <LayoutDashboard size={20} /> <span>Painel</span>
                    </div>
                    <div
                        className={`nav-item ${activeTab === 'schedule' ? 'active' : ''}`}
                        onClick={() => handleNavClick('schedule')}
                    >
                        <CalendarDays size={20} /> <span>Escala</span>
                    </div>
                    <div
                        className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => handleNavClick('history')}
                    >
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
                ) : activeTab === 'schedule' ? (
                        <Schedule />
                    ) : (
                        <History userId={user?.id} SHIFT_CONFIG={SHIFT_CONFIG} />
                    )
                }
            </main>
        </div>
    );
};

export default MainLayout;