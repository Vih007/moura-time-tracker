import { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return localStorage.getItem('moura_auth') === 'true';
    });

    const handleLogin = () => {
        localStorage.setItem('moura_auth', 'true');
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('moura_auth');
        setIsAuthenticated(false);
    };

    return (
        <div className="app">
            {isAuthenticated ? (
                <Dashboard onLogout={handleLogout} />
            ) : (
                <Login onLoginSuccess={handleLogin} />
            )}
        </div>
    );
}

export default App;