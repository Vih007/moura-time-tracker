import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { Toaster, toast } from 'sonner';
import {
    LogOut, LayoutDashboard, FileText, Settings,
    Search, TrendingUp, Clock, CheckCircle2, AlertCircle, Loader2,
    Edit2, Save, X, User, CalendarDays // Added CalendarDays icon
} from 'lucide-react';
import mouraLogo from '../assets/moura-logo.png';
import './Dashboard.css'; 
import { formatSecondsToTime } from '../utils/timeUtils';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const AdminDashboard = () => {
    // Tabs: 'overview', 'schedule', 'reports'
    // Changed 'employees' to 'schedule' to match the new UI label
    const [activeTab, setActiveTab] = useState('overview');
    
    // General Data States
    const [teamHistory, setTeamHistory] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [stats, setStats] = useState({ activeNow: 0, totalEntries: 0 });
    const [isLoading, setIsLoading] = useState(true);

    // Schedule Editing State
    const [editingId, setEditingId] = useState(null);
    const [tempSchedule, setTempSchedule] = useState({ start: '', end: '' });

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/';
    };

    // --- DATA LOADING ---
    useEffect(() => {
        if (activeTab === 'overview') {
            fetchTeamData();
            const interval = setInterval(fetchTeamData, 30000);
            return () => clearInterval(interval);
        } else if (activeTab === 'schedule') { // Updated logic for the new tab name
            fetchEmployees();
        }
    }, [activeTab]);

    // 1. Fetch Dashboard Data (Overview)
    const fetchTeamData = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/times/all`);
            if (response.ok) {
                const data = await response.json();
                
                const formattedData = data.map(entry => ({
                    id: entry.id,
                    name: entry.employee ? entry.employee.name : 'Desconhecido',
                    action: entry.endTime ? 'Turno Finalizado' : 'Trabalhando',
                    time: new Date(entry.startTime).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}),
                    duration: entry.endTime ? formatSecondsToTime(entry.durationSeconds) : 'Em andamento',
                    isActive: entry.endTime === null,
                    statusColor: entry.endTime ? '#64748b' : '#166534',
                    bgColor: entry.endTime ? '#f1f5f9' : '#dcfce7'
                }));

                setTeamHistory(formattedData);
                const activeCount = formattedData.filter(d => d.isActive).length;
                setStats({ activeNow: activeCount, totalEntries: formattedData.length });
            }
        } catch (error) {
            console.error("Erro dashboard:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // 2. Fetch Employee List
    const fetchEmployees = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/employees`);
            if (response.ok) {
                const data = await response.json();
                setEmployees(data);
            } else {
                toast.error("Erro ao carregar lista.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro de conexão.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- SCHEDULE EDITING LOGIC ---

    const startEditing = (employee) => {
        setEditingId(employee.id);
        setTempSchedule({
            start: employee.workStartTime || '08:00',
            end: employee.workEndTime || '17:00'
        });
    };

    const cancelEditing = () => {
        setEditingId(null);
        setTempSchedule({ start: '', end: '' });
    };

    const saveSchedule = async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/employees/${id}/schedule`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workStartTime: tempSchedule.start,
                    workEndTime: tempSchedule.end
                })
            });

            if (response.ok) {
                toast.success("Escala atualizada com sucesso!");
                setEditingId(null);
                fetchEmployees();
            } else {
                toast.error("Erro ao salvar escala.");
            }
        } catch (error) {
            toast.error("Erro de conexão.");
        }
    };

    // --- VISUAL COMPONENTS ---

    const OverviewView = () => (
        <div className="dashboard-grid fade-in-up">
            <div className="left-column">
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

                <div className="chart-card">
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '10px'}}>
                        <h3 style={{color: '#004B8D', fontWeight: 'bold'}}>Produtividade da Equipe</h3>
                        <TrendingUp size={18} color="#004B8D"/>
                    </div>
                    <div style={{ flex: 1, width: '100%', minHeight: '220px' }}>
                        <Chart 
                            options={{
                                chart: { type: 'area', toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
                                stroke: { curve: 'smooth', width: 2 },
                                colors: ['#004B8D'],
                                fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.2 } }
                            }} 
                            series={[{ name: 'Horas Totais', data: [140, 155, 138, 160, 120] }]} 
                            type="area" height="100%" width="100%" 
                        />
                    </div>
                </div>
            </div>

            <div className="right-column">
                <div className="history-card">
                    <h3 style={{color: '#004B8D', fontWeight: 'bold', marginBottom: '1.5rem'}}>Atividade Recente</h3>
                    <div className="history-list">
                        {teamHistory.length === 0 ? (
                            <p style={{textAlign:'center', color:'#999'}}>Nenhuma atividade hoje.</p>
                        ) : (
                            teamHistory.map((record) => (
                                <div key={record.id} className="history-item">
                                    <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                                        <div className="history-icon-box" style={{background: record.bgColor}}>
                                            <Clock size={20} color={record.statusColor} />
                                        </div>
                                        <div className="history-details">
                                            <span className="history-date" style={{fontWeight: 'bold', color: '#334155'}}>{record.name}</span>
                                            <span style={{fontSize: '0.8rem', color: '#64748b'}}>{record.action} • {record.time}</span>
                                        </div>
                                    </div>
                                    <span className="history-duration" style={{fontWeight: 'bold', color: record.isActive ? '#166534' : '#64748b'}}>
                                        {record.duration}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    // Renamed component to reflect new purpose
    const ScheduleManagementView = () => (
        <div className="fade-in-up">
            {/* --- CHANGED TITLE HERE --- */}
            <h3 style={{color: '#004B8D', marginBottom: '20px', display:'flex', alignItems:'center', gap:'10px'}}>
                <CalendarDays /> Gestão de Escala
            </h3>
            {/* --------------------------- */}
            <div style={{display: 'grid', gap: '15px'}}>
                {employees.map(emp => (
                    <div key={emp.id} style={{
                        background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px'
                    }}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                            <div style={{width: '40px', height: '40px', background: '#e0f2fe', borderRadius: '50%', display:'flex', alignItems:'center', justifyContent:'center', color:'#0284c7'}}>
                                <User size={20} />
                            </div>
                            <div>
                                <span style={{display:'block', fontWeight: 'bold', color: '#1e293b'}}>{emp.name}</span>
                                <span style={{fontSize: '0.85rem', color: '#64748b'}}>{emp.email}</span>
                            </div>
                        </div>

                        <div style={{display: 'flex', alignItems: 'center', gap: '20px', background: '#f8fafc', padding: '10px 20px', borderRadius: '8px'}}>
                            {editingId === emp.id ? (
                                <>
                                    <div style={{display:'flex', flexDirection:'column'}}>
                                        <label style={{fontSize:'0.7rem', color:'#64748b'}}>Entrada</label>
                                        <input 
                                            type="time" 
                                            value={tempSchedule.start} 
                                            onChange={(e) => setTempSchedule({...tempSchedule, start: e.target.value})}
                                            style={{border: '1px solid #cbd5e1', borderRadius: '4px', padding: '2px 5px'}}
                                        />
                                    </div>
                                    <div style={{display:'flex', flexDirection:'column'}}>
                                        <label style={{fontSize:'0.7rem', color:'#64748b'}}>Saída</label>
                                        <input 
                                            type="time" 
                                            value={tempSchedule.end} 
                                            onChange={(e) => setTempSchedule({...tempSchedule, end: e.target.value})}
                                            style={{border: '1px solid #cbd5e1', borderRadius: '4px', padding: '2px 5px'}}
                                        />
                                    </div>
                                    <div style={{display:'flex', gap: '5px'}}>
                                        <button onClick={() => saveSchedule(emp.id)} className="action-btn save-btn" title="Salvar" style={{border: 'none', background: 'transparent', cursor: 'pointer', color: '#166534'}}><Save size={20}/></button>
                                        <button onClick={cancelEditing} className="action-btn cancel-btn" title="Cancelar" style={{border: 'none', background: 'transparent', cursor: 'pointer', color: '#dc2626'}}><X size={20}/></button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div style={{textAlign: 'center'}}>
                                        <span style={{display:'block', fontSize:'0.75rem', color:'#94a3b8', textTransform:'uppercase'}}>Horário</span>
                                        <span style={{fontWeight:'bold', color: '#334155'}}>
                                            {emp.workStartTime || '08:00'} - {emp.workEndTime || '17:00'}
                                        </span>
                                    </div>
                                    <button onClick={() => startEditing(emp)} className="action-btn edit-btn" title="Editar Escala" style={{border: 'none', background: 'transparent', cursor: 'pointer', color: '#004B8D'}}>
                                        <Edit2 size={18} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

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
                    
                    {/* --- MENU ALTERADO AQUI --- */}
                    <div className={`nav-item ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>
                        <CalendarDays size={20} /> <span>Escala</span>
                    </div>
                    {/* -------------------------- */}
                    
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

                {activeTab === 'overview' ? <OverviewView /> : null}
                {activeTab === 'schedule' ? <ScheduleManagementView /> : null}

            </main>
        </div>
    );
};

export default AdminDashboard;