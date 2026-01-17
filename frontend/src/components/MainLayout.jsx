import React, { useState, useEffect, useRef } from 'react';
import { Toaster, toast } from 'sonner';
import { LayoutDashboard, LogOut, History as HistoryIcon } from 'lucide-react';
import mouraLogo from '../assets/moura-logo.png';
import './Dashboard.css';

import Dashboard from './Dashboard';
import History from './History';
import { getShiftConfig } from '../utils/timeUtils';

// Imports do React Query
import { useMyHistory, useCheckIn, useCheckOut } from '../lib/queries/useWork';

const MainLayout = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const SHIFT_CONFIG = getShiftConfig();

    // Recupera usuário (apenas ID e Nome são necessários localmente)
    const [user] = useState(() => {
        const stored = localStorage.getItem('moura_user');
        return stored ? JSON.parse(stored) : null;
    });

    // --- REACT QUERY (A Fonte da Verdade) ---
    const { data: history = [], isLoading: isLoadingHistory } = useMyHistory(user?.id);
    const checkInMutation = useCheckIn();
    const checkOutMutation = useCheckOut();

    // Lógica: Se o registro mais recente (índice 0, pois a API ordena DESC) não tem checkout, estou trabalhando.
    // Nota: O backend retorna ordenado. Vamos procurar se existe algum sem checkout.
    const activeShift = history.find(record => record.checkout_time === null);
    const workStatus = activeShift ? 'working' : 'idle';

    // --- TIMER LOCAL (Visual) ---
    const [elapsedTime, setElapsedTime] = useState(0);
    const audioFlags = useRef({ halfPlayed: false, fullPlayed: false });

    useEffect(() => {
        let interval;

        const tick = () => {
            if (activeShift?.checkin_time && activeShift?.date) {

                // 1. Quebra a string vinda do servidor
                const [year, month, day] = activeShift.date.split('-').map(Number);
                const [hours, minutes, seconds] = activeShift.checkin_time.split(':').map(Number);

                // 2. Cria a data tratando os dados como UTC
                // Date.UTC retorna o timestamp em milissegundos
                // Note: month - 1 continua necessário pois Janeiro = 0
                const startTimeMs = Date.UTC(year, month - 1, day, hours, minutes, seconds);

                const now = new Date();

                // 3. Cálculo da diferença
                // 'now' já sabe lidar com fuso, e startTimeMs agora é um timestamp universal
                const diff = Math.floor((now.getTime() - startTimeMs) / 1000);

                const currentSeconds = diff >= 0 ? diff : 0;
                setElapsedTime(currentSeconds);

                // --- ÁUDIO E NOTIFICAÇÕES (Mantido igual) ---
                const halfTime = SHIFT_CONFIG.seconds / 2;
                if (currentSeconds === halfTime && !audioFlags.current.halfPlayed) {
                    new Audio('/sounds/notification.mp3').play().catch(() => {});
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

    // --- HANDLERS (Ações) ---

    const handleStartTimer = () => {
        if (!user?.id) return;
        checkInMutation.mutate(user.id);
    };

    // Recebe os dados do Modal (vindo do Dashboard)
    const handleStopTimer = (modalData) => {
        if (!user?.id) return;

        checkOutMutation.mutate({
            employeeId: user.id,
            reason_id: modalData.reasonId, // "medical", "other", etc.
            details: modalData.details     // Texto opcional
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
                        // Estado
                        userName={user?.name || 'Colaborador'}
                        workStatus={workStatus}
                        elapsedTime={elapsedTime}
                        historyData={history} // Passamos o histórico real para o gráfico/lista
                        isLoading={checkInMutation.isPending || checkOutMutation.isPending || isLoadingHistory}
                        SHIFT_CONFIG={SHIFT_CONFIG}

                        // Ações
                        onCheckIn={handleStartTimer}
                        onCheckOut={handleStopTimer} // Dashboard chamará isso após o Modal
                    />
                ) : (
                    // Reutiliza os dados já carregados para evitar refetch
                    <History historyData={history} />
                )}
            </main>
        </div>
    );
};

export default MainLayout;