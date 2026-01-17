import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { Toaster, toast } from 'sonner';
import {
    LogOut, LayoutDashboard, Users, FileText, Settings,
    Search, TrendingUp, Clock, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';
import mouraLogo from '../assets/moura-logo.png';
import './Dashboard.css'; 
import { formatSecondsToTime } from '../utils/timeUtils';

// URL da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [adminName, setAdminName] = useState('Administrador');
    
    // Estados de Dados Reais
    const [teamHistory, setTeamHistory] = useState([]);
    const [stats, setStats] = useState({ activeNow: 0, totalEntries: 0 });
    const [isLoading, setIsLoading] = useState(true);

    // Logout
    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/';
    };

    // --- 1. BUSCAR DADOS DO SISTEMA ---
    useEffect(() => {
        // Pega nome do admin salvo
        const storedName = localStorage.getItem('userName');
        if (storedName) setAdminName(storedName);

        fetchTeamData();

        // Atualiza a cada 30 segundos para ser "Tempo Real"
        const interval = setInterval(fetchTeamData, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchTeamData = async () => {
        try {
            // Chama o endpoint que criamos para o Admin (busca TUDO)
            const response = await fetch(`${API_BASE_URL}/times/all`);
            if (response.ok) {
                const data = await response.json();
                
                // Processa os dados
                const formattedData = data.map(entry => ({
                    id: entry.id,
                    name: entry.employee ? entry.employee.name : 'Desconhecido', // Pega nome do funcionário
                    action: entry.endTime ? 'Turno Finalizado' : 'Trabalhando',
                    time: new Date(entry.startTime).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}),
                    date: new Date(entry.startTime).toLocaleDateString('pt-BR'),
                    duration: entry.endTime ? formatSecondsToTime(entry.durationSeconds) : 'Em andamento',
                    isActive: entry.endTime === null,
                    statusColor: entry.endTime ? '#64748b' : '#166534', // Verde se ativo, Cinza se acabou
                    bgColor: entry.endTime ? '#f1f5f9' : '#dcfce7'
                }));

                setTeamHistory(formattedData);

                // Calcula Estatísticas
                const activeCount = formattedData.filter(d => d.isActive).length;
                setStats({
                    activeNow: activeCount,
                    totalEntries: formattedData.length
                });
            }
        } catch (error) {
            console.error("Erro ao buscar dados da equipe:", error);
            toast.error("Erro ao atualizar painel.");
        } finally {
            setIsLoading(false);
        }
    };

    // Configuração do Gráfico (Pode ser integrado no futuro com dados reais de horas totais)
    const chartOptions = {
        chart: { type: 'area', toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
        stroke: { curve: 'smooth', width: 2 },
        dataLabels: { enabled: false },
        xaxis: { categories: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'], labels: { style: { colors: '#64748b', fontSize: '12px' } }, axisBorder: { show: false }, axisTicks: { show: false } },
        yaxis: { labels: { style: { colors: '#64748b' } } },
        grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
        colors: ['#004B8D', '#FFC700'],
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.2, stops: [0, 90, 100] } }
    };
    const chartSeries = [{ name: 'Horas Totais', data: [140, 155, 138, 160, 120] }];

    return (
        <div className="dashboard-container">
            <Toaster position="top-right" richColors />

            <aside className="sidebar">
                <div className="sidebar-header">
                    <img src={mouraLogo} alt="Moura" className="sidebar-logo" />
                    <span style={{fontWeight: 'bold', fontSize: '1.2rem'}}>Moura<span style={{color: '#FFC700'}}>Admin</span></span>
                </div>
                <nav>
                    <div className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                        <LayoutDashboard size={20} /> <span>Visão Geral</span>
                    </div>
                    <div className="nav-item"><Users size={20} /> <span>Colaboradores</span></div>
                    <div className="nav-item"><FileText size={20} /> <span>Relatórios</span></div>
                </nav>
                <div style={{ marginTop: 'auto' }}>
                    <button onClick={handleLogout} className="nav-item" style={{ width: '100%', border: 'none', background: 'transparent', color: 'white' }}>
                        <LogOut size={20} /> <span>Sair</span>
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <div className="header-welcome">
                    <h2 className="welcome-title">Olá, Administrador</h2>
                    <p className="date-display">
                        Painel de Gestão em Tempo Real
                        <span style={{marginLeft: '10px', fontSize: '0.8rem', background: '#dcfce7', padding: '2px 8px', borderRadius: '12px', color: '#166534', fontWeight: 'bold'}}>
                            Sistema Online
                        </span>
                    </p>
                </div>

                <div className="dashboard-grid">
                    {/* COLUNA ESQUERDA */}
                    <div className="left-column">
                        {/* Card de Resumo Dinâmico */}
                        <div className="punch-card" style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', padding: '20px' }}>
                            <div style={{textAlign: 'center'}}>
                                <span style={{display: 'block', fontSize: '2.5rem', fontWeight: 'bold', color: '#166534'}}>
                                    {isLoading ? '-' : stats.activeNow}
                                </span>
                                <span style={{color: '#64748b', fontSize: '0.9rem', display:'flex', alignItems:'center', gap:'5px'}}>
                                    <Loader2 size={14} className={stats.activeNow > 0 ? "spin-slow" : ""} /> Ativos Agora
                                </span>
                            </div>
                            <div style={{height: '50px', width: '1px', background: '#e2e8f0'}}></div>
                            <div style={{textAlign: 'center'}}>
                                <span style={{display: 'block', fontSize: '2.5rem', fontWeight: 'bold', color: '#004B8D'}}>
                                    {isLoading ? '-' : stats.totalEntries}
                                </span>
                                <span style={{color: '#64748b', fontSize: '0.9rem'}}>Registros Hoje</span>
                            </div>
                        </div>

                        {/* Gráfico */}
                        <div className="chart-card">
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '10px'}}>
                                <h3 style={{color: '#004B8D', fontWeight: 'bold'}}>Produtividade da Equipe</h3>
                                <TrendingUp size={18} color="#004B8D"/>
                            </div>
                            <div style={{ flex: 1, width: '100%', minHeight: '220px' }}>
                                <Chart options={chartOptions} series={chartSeries} type="area" height="100%" width="100%" />
                            </div>
                        </div>
                    </div>

                    {/* COLUNA DIREITA - LISTA REAL */}
                    <div className="right-column">
                        <div className="history-card">
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '1.5rem'}}>
                                <h3 style={{color: '#004B8D', fontWeight: 'bold'}}>Atividade Recente</h3>
                                <Search size={18} color="#94a3b8" style={{cursor: 'pointer'}}/>
                            </div>

                            <div className="history-list">
                                {isLoading ? (
                                    <p style={{textAlign:'center', color:'#999'}}>Carregando equipe...</p>
                                ) : teamHistory.length === 0 ? (
                                    <p style={{textAlign:'center', color:'#999'}}>Nenhuma atividade hoje.</p>
                                ) : (
                                    teamHistory.map((record) => (
                                        <div key={record.id} className="history-item">
                                            <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                                                {/* Ícone muda de cor se estiver trabalhando ou saiu */}
                                                <div className="history-icon-box" style={{background: record.bgColor}}>
                                                    <Clock size={20} color={record.statusColor} />
                                                </div>
                                                <div className="history-details">
                                                    <span className="history-date" style={{fontWeight: 'bold', color: '#334155'}}>
                                                        {record.name}
                                                    </span>
                                                    <span style={{fontSize: '0.8rem', color: '#64748b'}}>
                                                        {record.action} • {record.time}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="history-duration" style={{
                                                fontWeight: 'bold', 
                                                color: record.isActive ? '#166534' : '#64748b'
                                            }}>
                                                {record.duration}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                            
                            <div style={{marginTop: 'auto', paddingTop: '15px', borderTop: '1px solid #f1f5f9', textAlign: 'center'}}>
                                <button style={{background: 'none', border: 'none', color: '#004B8D', fontSize: '0.9rem', cursor: 'pointer', fontWeight: '500'}}>
                                    Ver relatório completo
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;