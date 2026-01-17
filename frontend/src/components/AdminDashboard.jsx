import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { Toaster, toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    LogOut, LayoutDashboard, FileText,
    TrendingUp, Clock, Loader2,
    Edit2, Save, X, User, CalendarDays, Download, Filter, Trophy, BarChart3
} from 'lucide-react';
import mouraLogo from '../assets/moura-logo.png';
import './Dashboard.css'; 
import { formatSecondsToTime } from '../utils/timeUtils';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    
    // General Data
    const [teamHistory, setTeamHistory] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [stats, setStats] = useState({ activeNow: 0, totalEntries: 0 });
    const [isLoading, setIsLoading] = useState(true);

    // --- CHART & RANKING STATES ---
    const [chartData, setChartData] = useState({ categories: [], series: [] });
    const [rankingData, setRankingData] = useState([]); // Stores ranking list
    const [showRanking, setShowRanking] = useState(false); // Toggle state

    // Schedule Editing State
    const [editingId, setEditingId] = useState(null);
    const [tempSchedule, setTempSchedule] = useState({ start: '', end: '' });

    // Report States
    const [reportFilters, setReportFilters] = useState({
        employeeId: '',
        startDate: new Date().toISOString().split('T')[0], 
        endDate: new Date().toISOString().split('T')[0]
    });
    const [reportData, setReportData] = useState([]);
    const [reportLoading, setReportLoading] = useState(false);

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/';
    };

    // --- DATA LOADING ---
    useEffect(() => {
        if (activeTab === 'overview') {
            fetchTeamData();
            fetchChartData();
            fetchRankingData(); // <-- Fetch ranking data

            const interval = setInterval(() => {
                fetchTeamData();
                fetchChartData();
                fetchRankingData();
            }, 30000);
            return () => clearInterval(interval);
        } else if (activeTab === 'schedule' || activeTab === 'reports') {
            fetchEmployees();
        }
    }, [activeTab]);

    // 1. Fetch Dashboard Data
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
        } catch (error) { console.error(error); } finally { setIsLoading(false); }
    };

    // --- CHART DATA ---
    const fetchChartData = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/times/weekly-summary`);
            if (response.ok) {
                const data = await response.json();
                setChartData({
                    categories: data.categories,
                    series: [{ name: 'Horas Totais', data: data.series }]
                });
            }
        } catch (error) { console.error("Erro gráfico:", error); }
    };

    // --- NEW: RANKING DATA ---
    const fetchRankingData = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/times/ranking`);
            if (response.ok) {
                setRankingData(await response.json());
            }
        } catch (error) { console.error("Erro ranking:", error); }
    };

    // 2. Fetch Employees
    const fetchEmployees = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/employees`);
            if (response.ok) setEmployees(await response.json());
        } catch (error) { toast.error("Erro ao carregar colaboradores."); }
    };

    // --- SCHEDULE LOGIC ---
    const startEditing = (employee) => {
        setEditingId(employee.id);
        setTempSchedule({ start: employee.workStartTime || '08:00', end: employee.workEndTime || '17:00' });
    };

    const saveSchedule = async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/employees/${id}/schedule`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ workStartTime: tempSchedule.start, workEndTime: tempSchedule.end })
            });
            if (response.ok) {
                toast.success("Escala atualizada!");
                setEditingId(null);
                fetchEmployees();
            }
        } catch (error) { toast.error("Erro ao salvar."); }
    };

    // --- REPORT LOGIC ---
    const generateReport = async () => {
        if (!reportFilters.employeeId) {
            toast.warning("Selecione um colaborador.");
            return;
        }
        setReportLoading(true);
        try {
            const query = `?employeeId=${reportFilters.employeeId}&startDate=${reportFilters.startDate}&endDate=${reportFilters.endDate}`;
            const response = await fetch(`${API_BASE_URL}/times/report${query}`);
            
            if (response.ok) {
                const data = await response.json();
                const processed = data.map(item => ({
                    date: new Date(item.startTime).toLocaleDateString('pt-BR'),
                    start: new Date(item.startTime).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}),
                    end: item.endTime ? new Date(item.endTime).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}) : 'Em andamento',
                    durationHours: item.durationSeconds ? (item.durationSeconds / 3600).toFixed(2) : 0, 
                    durationLabel: item.durationSeconds ? formatSecondsToTime(item.durationSeconds) : '-'
                }));
                setReportData(processed);
                if(processed.length === 0) toast.info("Nenhum registro encontrado no período.");
            } else {
                toast.error("Erro ao gerar relatório.");
            }
        } catch (error) {
            toast.error("Erro de conexão.");
        } finally {
            setReportLoading(false);
        }
    };

    const downloadPDF = () => {
        if (!reportData || reportData.length === 0) {
            toast.warning("Gere o relatório na tela antes de baixar o PDF.");
            return;
        }
        try {
            const doc = new jsPDF();
            const selectedId = Number(reportFilters.employeeId);
            const employeeObj = employees.find(e => e.id === selectedId);
            const empName = employeeObj ? employeeObj.name : "Relatorio";

            doc.setFontSize(18);
            doc.setTextColor(0, 75, 141);
            doc.text("Relatório de Ponto - MouraTech", 14, 22);
            doc.setFontSize(12);
            doc.setTextColor(100);
            doc.text(`Colaborador: ${empName}`, 14, 32);
            const startStr = new Date(reportFilters.startDate).toLocaleDateString('pt-BR');
            const endStr = new Date(reportFilters.endDate).toLocaleDateString('pt-BR');
            doc.text(`Período: ${startStr} a ${endStr}`, 14, 38);

            const tableColumn = ["Data", "Entrada", "Saída", "Duração"];
            const tableRows = reportData.map(row => [row.date, row.start, row.end, row.durationLabel]);

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 45,
                theme: 'grid',
                headStyles: { fillColor: [0, 75, 141] },
                alternateRowStyles: { fillColor: [240, 240, 240] }
            });

            const safeFileName = empName.replace(/[^a-z0-9]/gi, '_'); 
            doc.save(`Relatorio_${safeFileName}.pdf`);
            toast.success("PDF baixado com sucesso!");
        } catch (error) {
            console.error("Erro detalhado PDF:", error);
            toast.error("Erro ao criar arquivo PDF.");
        }
    };

    // --- VIEWS ---

    const OverviewView = () => (
        <div className="dashboard-grid fade-in-up">
            <div className="left-column">
                <div className="punch-card" style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', padding: '20px' }}>
                    <div style={{textAlign: 'center'}}>
                        <span style={{display: 'block', fontSize: '2.5rem', fontWeight: 'bold', color: '#166534'}}>{isLoading ? '-' : stats.activeNow}</span>
                        <span style={{color: '#64748b', fontSize: '0.9rem'}}>Ativos Agora</span>
                    </div>
                    <div style={{height: '50px', width: '1px', background: '#e2e8f0'}}></div>
                    <div style={{textAlign: 'center'}}>
                        <span style={{display: 'block', fontSize: '2.5rem', fontWeight: 'bold', color: '#004B8D'}}>{isLoading ? '-' : stats.totalEntries}</span>
                        <span style={{color: '#64748b', fontSize: '0.9rem'}}>Registros Hoje</span>
                    </div>
                </div>

                {/* --- CHART CARD WITH RANKING TOGGLE --- */}
                <div className="chart-card">
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '10px'}}>
                        <h3 style={{color: '#004B8D', fontWeight: 'bold'}}>
                            {showRanking ? 'Ranking de Produtividade (7 dias)' : 'Atividade Geral (7 dias)'}
                        </h3>
                        
                        {/* TOGGLE BUTTON */}
                        <button 
                            onClick={() => setShowRanking(!showRanking)}
                            title={showRanking ? "Ver Gráfico" : "Ver Ranking"}
                            style={{
                                background: '#f1f5f9', border:'none', padding:'8px 12px', borderRadius:'8px', cursor:'pointer', 
                                color:'#004B8D', display:'flex', alignItems:'center', gap:'6px', fontWeight:'600', fontSize:'0.85rem'
                            }}
                        >
                            {showRanking ? <BarChart3 size={18}/> : <Trophy size={18}/>}
                            {showRanking ? "Ver Gráfico" : "Ver Ranking"}
                        </button>
                    </div>

                    <div style={{ flex: 1, width: '100%', minHeight: '220px', overflowY: 'auto' }}>
                        {showRanking ? (
                            // --- RANKING VIEW ---
                            <div className="ranking-list">
                                {rankingData.length === 0 ? 
                                    <p style={{textAlign:'center', color:'#999', marginTop:'50px'}}>Sem dados recentes.</p> :
                                    rankingData.map((item, index) => (
                                        <div key={index} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid #f1f5f9'}}>
                                            <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                                                <div style={{
                                                    width:'28px', height:'28px', borderRadius:'50%', 
                                                    background: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#f1f5f9',
                                                    color: index < 3 ? 'white' : '#64748b', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold', fontSize:'0.8rem', 
                                                    boxShadow: index < 3 ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                                                }}>
                                                    {index + 1}
                                                </div>
                                                <span style={{fontWeight:'600', color:'#334155'}}>{item.name}</span>
                                            </div>
                                            <span style={{fontWeight:'bold', color:'#004B8D', background:'#e0f2fe', padding:'4px 10px', borderRadius:'12px', fontSize:'0.85rem'}}>
                                                {item.totalHours} h
                                            </span>
                                        </div>
                                    ))
                                }
                            </div>
                        ) : (
                            // --- CHART VIEW ---
                            <Chart 
                                options={{
                                    chart: { type: 'area', toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
                                    stroke: { curve: 'smooth', width: 2 },
                                    colors: ['#004B8D'],
                                    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.2 } },
                                    xaxis: { categories: chartData.categories, labels: { style: { colors: '#64748b', fontSize: '12px' } }, axisBorder: { show: false }, axisTicks: { show: false } },
                                    yaxis: { labels: { style: { colors: '#64748b' } } },
                                    grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
                                    tooltip: { y: { formatter: (val) => `${val}h` } }
                                }} 
                                series={chartData.series} 
                                type="area" 
                                height="100%" 
                                width="100%" 
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className="right-column">
                <div className="history-card">
                    <h3 style={{color: '#004B8D', fontWeight: 'bold', marginBottom: '1rem'}}>Últimas Ações</h3>
                    <div className="history-list">
                        {teamHistory.slice(0,6).map(r => (
                            <div key={r.id} className="history-item">
                                <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                                    <div className="history-icon-box" style={{background: r.bgColor}}><Clock size={18} color={r.statusColor}/></div>
                                    <div>
                                        <span style={{display:'block', fontWeight:'bold', fontSize:'0.9rem'}}>{r.name}</span>
                                        <span style={{fontSize:'0.75rem', color:'#666'}}>{r.action} • {r.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const ScheduleManagementView = () => (
        <div className="fade-in-up">
            <h3 style={{color: '#004B8D', marginBottom: '20px', display:'flex', alignItems:'center', gap:'10px'}}>
                <CalendarDays /> Gestão de Escala
            </h3>
            <div style={{display: 'grid', gap: '15px'}}>
                {employees.map(emp => (
                    <div key={emp.id} style={{background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                            <div style={{width: '40px', height: '40px', background: '#e0f2fe', borderRadius: '50%', display:'flex', alignItems:'center', justifyContent:'center', color:'#0284c7'}}><User size={20} /></div>
                            <div><span style={{display:'block', fontWeight: 'bold', color: '#1e293b'}}>{emp.name}</span><span style={{fontSize: '0.85rem', color: '#64748b'}}>{emp.email}</span></div>
                        </div>
                        <div style={{display: 'flex', alignItems: 'center', gap: '20px', background: '#f8fafc', padding: '10px 20px', borderRadius: '8px'}}>
                            {editingId === emp.id ? (
                                <>
                                    <input type="time" value={tempSchedule.start} onChange={(e) => setTempSchedule({...tempSchedule, start: e.target.value})} style={{border: '1px solid #cbd5e1', borderRadius: '4px', padding: '2px 5px'}}/>
                                    <span>-</span>
                                    <input type="time" value={tempSchedule.end} onChange={(e) => setTempSchedule({...tempSchedule, end: e.target.value})} style={{border: '1px solid #cbd5e1', borderRadius: '4px', padding: '2px 5px'}}/>
                                    <button onClick={() => saveSchedule(emp.id)} className="action-btn" style={{color: 'green', background:'none', border:'none', cursor:'pointer'}}><Save size={20}/></button>
                                    <button onClick={() => setEditingId(null)} className="action-btn" style={{color: 'red', background:'none', border:'none', cursor:'pointer'}}><X size={20}/></button>
                                </>
                            ) : (
                                <>
                                    <span style={{fontWeight:'bold', color: '#334155'}}>{emp.workStartTime || '08:00'} - {emp.workEndTime || '17:00'}</span>
                                    <button onClick={() => startEditing(emp)} className="action-btn" style={{color: '#004B8D', background:'none', border:'none', cursor:'pointer'}}><Edit2 size={18} /></button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const ReportsView = () => (
        <div className="fade-in-up">
            <h3 style={{color: '#004B8D', marginBottom: '20px', display:'flex', alignItems:'center', gap:'10px'}}>
                <FileText /> Relatórios Detalhados
            </h3>
            <div style={{background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'end', flexWrap: 'wrap'}}>
                <div style={{display:'flex', flexDirection:'column', gap:'5px', flex: 1, minWidth: '200px'}}>
                    <label style={{fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b'}}>Colaborador</label>
                    <select className="custom-select" value={reportFilters.employeeId} onChange={(e) => setReportFilters({...reportFilters, employeeId: e.target.value})} style={{padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1'}}>
                        <option value="">Selecione um funcionário...</option>
                        {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                    </select>
                </div>
                <div style={{display:'flex', flexDirection:'column', gap:'5px'}}>
                    <label style={{fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b'}}>De</label>
                    <input type="date" value={reportFilters.startDate} onChange={e => setReportFilters({...reportFilters, startDate: e.target.value})} style={{padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1'}}/>
                </div>
                <div style={{display:'flex', flexDirection:'column', gap:'5px'}}>
                    <label style={{fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b'}}>Até</label>
                    <input type="date" value={reportFilters.endDate} onChange={e => setReportFilters({...reportFilters, endDate: e.target.value})} style={{padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1'}}/>
                </div>
                <button onClick={generateReport} style={{height: '42px', padding: '0 20px', background: '#004B8D', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'}}>
                    {reportLoading ? <Loader2 className="spin-slow" size={18}/> : <Filter size={18}/>} Gerar
                </button>
            </div>
            {reportData.length > 0 && (
                <div className="dashboard-grid">
                    <div className="left-column">
                        <div className="chart-card">
                            <h3 style={{color: '#004B8D', fontWeight: 'bold', marginBottom: '10px'}}>Horas Trabalhadas</h3>
                            <div style={{ height: '300px' }}>
                                <Chart 
                                    options={{
                                        chart: { type: 'bar', toolbar: { show: false } },
                                        xaxis: { categories: reportData.map(r => r.date.substring(0, 5)) }, 
                                        colors: ['#004B8D'],
                                        plotOptions: { bar: { borderRadius: 4, columnWidth: '50%' } },
                                        tooltip: { y: { formatter: (val) => `${val} h` } }
                                    }} 
                                    series={[{ name: 'Horas', data: reportData.map(r => Number(r.durationHours)) }]} 
                                    type="bar" height="100%" 
                                />
                            </div>
                        </div>
                    </div>
                    <div className="right-column">
                        <div className="history-card">
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '1rem'}}>
                                <h3 style={{color: '#004B8D', fontWeight: 'bold'}}>Registros</h3>
                                <button onClick={downloadPDF} title="Baixar PDF" style={{background: '#166534', color: 'white', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'}}>
                                    <Download size={16}/> PDF
                                </button>
                            </div>
                            <div className="history-list" style={{maxHeight: '300px', overflowY: 'auto'}}>
                                {reportData.map((row, i) => (
                                    <div key={i} className="history-item">
                                        <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center'}}>
                                            <div>
                                                <span style={{fontWeight: 'bold', display: 'block', fontSize: '0.9rem', color: '#334155'}}>{row.date}</span>
                                                <span style={{fontSize: '0.8rem', color: '#666'}}>{row.start} - {row.end}</span>
                                            </div>
                                            <span style={{fontWeight: 'bold', color: '#004B8D'}}>{row.durationLabel}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
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
                    <div className={`nav-item ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>
                        <CalendarDays size={20} /> <span>Escala</span>
                    </div>
                    <div className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
                        <FileText size={20} /> <span>Relatórios</span>
                    </div>
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
                        <span style={{marginLeft: '10px', fontSize: '0.8rem', background: '#dcfce7', padding: '2px 8px', borderRadius: '12px', color: '#166534', fontWeight: 'bold'}}>Sistema Online</span>
                    </p>
                </div>
                {activeTab === 'overview' ? <OverviewView /> : null}
                {activeTab === 'schedule' ? <ScheduleManagementView /> : null}
                {activeTab === 'reports' ? <ReportsView /> : null}
            </main>
        </div>
    );
};

export default AdminDashboard;