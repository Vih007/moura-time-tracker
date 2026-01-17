import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Importando os 3 componentes principais
import Login from './components/Login';
import Dashboard from './components/Dashboard';      // Colaborador
import AdminDashboard from './components/AdminDashboard'; // Chefe (Novo)

import './App.css';

function App() {

    // Função Central de Logout
    // Ela limpa TUDO o que foi salvo no navegador e volta para o login
    const handleLogout = () => {
        localStorage.removeItem('moura_auth');
        localStorage.removeItem('moura_token');
        localStorage.removeItem('moura_user');
        localStorage.removeItem('moura_role');
        localStorage.removeItem('userName');
        
        // Força o navegador a ir para a página inicial
        window.location.href = '/';
    };

    return (
        // O BrowserRouter habilita a navegação por URLs
        <BrowserRouter>
            <Routes>
                {/* ROTA 1: Tela de Login (É a raiz "/") */}
                {/* Não precisa mais passar props, o Login se vira sozinho agora */}
                <Route path="/" element={<Login />} />

                {/* ROTA 2: Painel do Colaborador */}
                <Route 
                    path="/dashboard" 
                    element={<Dashboard onLogout={handleLogout} />} 
                />

                {/* ROTA 3: Painel do Administrador */}
                <Route 
                    path="/admin/dashboard" 
                    element={<AdminDashboard />} 
                />

                {/* ROTA DE SEGURANÇA: Se digitar URL errada, volta pro Login */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;