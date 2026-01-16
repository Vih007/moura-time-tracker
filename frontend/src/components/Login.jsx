import React, { useState } from 'react';
import { User, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import mouraLogo from '../assets/moura-logo.png';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        setTimeout(() => {
            if (username === 'admin' && password === '123456') {
                onLoginSuccess();
            } else {
                setError('Credenciais inválidas. Tente novamente.');
                setIsLoading(false);
            }
        }, 1500);
    };

    return (
        <div className="login-wrapper">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>

            <div className="login-card">
                <div className="login-header stagger-1">
                    <img src={mouraLogo} alt="Moura Logo" className="logo-image" />
                    <h1 className="brand-title">Moura<span className="brand-highlight">Tech</span></h1>
                    <p className="brand-subtitle">Portal do Colaborador</p>
                </div>

                <form onSubmit={handleLogin} className="stagger-2">

                    {error && (
                        <div className="error-message">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="input-group">
                        <label className="input-label">Usuário</label>
                        <div className="input-field-wrapper">
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Ex: admin"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={isLoading}
                            />
                            <User size={20} className="input-icon" />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Senha</label>
                        <div className="input-field-wrapper">
                            <input
                                type="password"
                                className="input-field"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                            />
                            <Lock size={20} className="input-icon" />
                        </div>
                    </div>

                    <div className="stagger-3">
                        <button type="submit" className="btn-login" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 size={20} className="spinner" />
                                    Validando...
                                </>
                            ) : (
                                <>
                                    Acessar Sistema
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <div className="footer-text stagger-3">
                    © 2026 Moura Tech Solutions • v1.0.3
                </div>
            </div>
        </div>
    );
};

export default Login;