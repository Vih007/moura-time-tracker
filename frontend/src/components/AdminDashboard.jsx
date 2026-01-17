import React, { useState } from 'react';
import Chart from 'react-apexcharts';
import { Toaster, toast } from 'sonner';
import {
    LogOut, LayoutDashboard, Users, FileText, Settings,
    Search, TrendingUp, AlertCircle, CheckCircle2, Clock
} from 'lucide-react';
import mouraLogo from '../assets/moura-logo.png';
import './Dashboard.css'; // Usando o mesmo CSS para garantir o padrão visual

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');

    // Função de Logout
    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/';
    };

    // --- DADOS MOCKADOS PARA O ADMIN ---
    const teamHistory = [
        { id: 1, name: 'João Silva', action: 'Check-in', time: '08:00', status: 'normal' },
        { id: 2, name: 'Maria Souza', action: 'Check-out', time: '17:05', status: 'extra' },
        { id: 3, name: 'Carlos Lima', action: 'Check-in', time: '08:15', status: 'late' },
    ];

    // Configuração do Gráfico (Produtividade Geral)
    const chartOptions = {
        chart: { type: 'area', toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
        stroke: { curve: 'smooth', width: 2 },
        dataLabels: { enabled: false },
        xaxis: {
            categories: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
            labels: { style: { colors: '#64748b', fontSize: '12px' } },
            axisBorder: { show: false }, axisTicks: { show: false }
        },
        yaxis: { labels: { style: { colors: '#64748b' } } },
        grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
        colors: ['#004B8D', '#FFC700'],
        fill: {
            type: 'gradient',
            gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.2, stops: [0, 90, 100] }
        }
    };

    const chartSeries = [
        { name: 'Horas Totais', data: [140, 155, 138, 160, 120] }
    ];

    return (
        <div className="dashboard-container">
            <Toaster position="top-right" richColors />

            {/* SIDEBAR (Igual, mas com menu de Admin) */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <img src={mouraLogo} alt="Moura" className="sidebar-logo" />
                    <span style={{fontWeight: 'bold', fontSize: '1.2rem'}}>
                        Moura<span style={{color: '#FFC700'}}>Admin</span>
                    </span>
                </div>
                
                <nav>
                    <div className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                        <LayoutDashboard size={20} /> <span>Visão Geral</span>
                    </div>
                    <div className="nav-item">
                        <Users size={20} /> <span>Colaboradores</span>
                    </div>
                    <div className="nav-item">
                        <FileText size={20} /> <span>Relatórios</span>
                    </div>
                    <div className="nav-item">
                        <Settings size={20} /> <span>Configurações</span>
                    </div>
                </nav>

                <div style={{ marginTop: 'auto' }}>
                    <button onClick={handleLogout} className="nav-item" style={{ width: '100%', border: 'none', background: 'transparent', color: 'white' }}>
                        <LogOut size={20} /> <span>Sair</span>
                    </button>
                </div>
            </aside>

            {/* CONTEÚDO PRINCIPAL */}
            <main className="main-content">
                <div className="header-welcome">
                    {/* Mensagem Estática como solicitado */}
                    <h2 className="welcome-title">Olá, Administrador</h2>
                    <p className="date-display">
                        {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        <span style={{marginLeft: '10px', fontSize: '0.8rem', background: '#e2e8f0', padding: '2px 8px', borderRadius: '12px', color: '#64748b'}}>
                            Status do Sistema: Online
                        </span>
                    </p>
                </div>

                <div className="dashboard-grid">

                    {/* COLUNA ESQUERDA */}
                    <div className="left-column">

                        {/* Card de Resumo (Substitui o Punch Card) */}
                        <div className="punch-card" style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', padding: '20px' }}>
                            <div style={{textAlign: 'center'}}>
                                <span style={{display: 'block', fontSize: '2rem', fontWeight: 'bold', color: '#004B8D'}}>24</span>
                                <span style={{color: '#64748b', fontSize: '0.9rem'}}>Ativos Agora</span>
                            </div>
                            <div style={{height: '40px', width: '1px', background: '#e2e8f0'}}></div>
                            <div style={{textAlign: 'center'}}>
                                <span style={{display: 'block', fontSize: '2rem', fontWeight: 'bold', color: '#004B8D'}}>3</span>
                                <span style={{color: '#64748b', fontSize: '0.9rem'}}>Atrasos Hoje</span>
                            </div>
                        </div>

                        {/* Gráfico da Equipe */}
                        <div className="chart-card">
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '10px'}}>
                                <h3 style={{color: '#004B8D', fontWeight: 'bold'}}>Produtividade da Equipe</h3>
                                <button style={{border:'none', background:'transparent', color:'#004B8D', cursor:'pointer'}}>
                                    <TrendingUp size={18} />
                                </button>
                            </div>
                            <div style={{ flex: 1, width: '100%', minHeight: '220px' }}>
                                <Chart options={chartOptions} series={chartSeries} type="area" height="100%" width="100%" />
                            </div>
                        </div>
                    </div>

                    {/* COLUNA DIREITA */}
                    <div className="right-column">
                        <div className="history-card">
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '1.5rem'}}>
                                <h3 style={{color: '#004B8D', fontWeight: 'bold'}}>Registros em Tempo Real</h3>
                                <Search size={18} color="#94a3b8" style={{cursor: 'pointer'}}/>
                            </div>

                            <div className="history-list">
                                {teamHistory.map((record) => (
                                    <div key={record.id} className="history-item">
                                        <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                                            <div className="history-icon-box" style={{background: record.action === 'Check-in' ? '#dcfce7' : '#fee2e2'}}>
                                                <Clock size={20} color={record.action === 'Check-in' ? '#166534' : '#991b1b'} />
                                            </div>
                                            <div className="history-details">
                                                <span className="history-date" style={{fontWeight: 'bold', color: '#334155'}}>{record.name}</span>
                                                <span style={{fontSize: '0.8rem', color: '#64748b'}}>
                                                    {record.action} • {record.status === 'extra' ? 'Hora Extra' : 'Turno Normal'}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="history-duration" style={{fontWeight: 'bold'}}>{record.time}</span>
                                    </div>
                                ))}
                            </div>
                            
                            <div style={{marginTop: 'auto', paddingTop: '15px', borderTop: '1px solid #f1f5f9', textAlign: 'center'}}>
                                <button style={{background: 'none', border: 'none', color: '#004B8D', fontSize: '0.9rem', cursor: 'pointer', fontWeight: '500'}}>
                                    Ver todos os registros
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