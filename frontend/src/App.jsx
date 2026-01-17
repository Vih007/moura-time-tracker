import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Importando os componentes
import Login from './components/Login';
import MainLayout from './components/MainLayout';
import AdminDashboard from './components/AdminDashboard';

import './App.css';

function App() {
    const handleLogout = () => {
        localStorage.removeItem('moura_auth');
        localStorage.removeItem('moura_token');
        localStorage.removeItem('moura_user');
        localStorage.removeItem('moura_role');
        localStorage.removeItem('userName');
        localStorage.removeItem('moura_work_status');
        localStorage.removeItem('moura_start_time');

        window.location.href = '/';
    };

    return (
        <BrowserRouter>
            <Routes>
                {/* ROTA 1: Login */}
                <Route path="/" element={<Login />} />

                {/* ROTA 2: Painel do Colaborador (Usa o MainLayout) */}
                <Route
                    path="/dashboard"
                    element={<MainLayout onLogout={handleLogout} />}
                />

                {/* ROTA 3: Painel do Administrador (Usa o componente específico) */}
                <Route
                    path="/admin/dashboard"
                    element={<AdminDashboard />}
                />

                {/* ROTA DE SEGURANÇA */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;