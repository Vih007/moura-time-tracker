import React, { useState } from 'react';
import { User, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import mouraLogo from '../assets/moura-logo.png';
import './Login.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const Login = ({ onLoginSuccess } ) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha na autenticação');
            }

            const data = await response.json();
            
            // Armazenar token e dados do usuário
            localStorage.setItem('moura_auth', 'true');
            localStorage.setItem('moura_token', data.token);
            localStorage.setItem('moura_user', JSON.stringify({
                id: data.id,
                name: data.name,
                email: data.email,
            }));

            onLoginSuccess();
        } catch (err) {
            setError(err.message || 'Email ou senha inválidos. Tente novamente.');
            setIsLoading(false);
        }
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
                        <label className="input-label">Email</label>
                        <div className="input-field-wrapper">
                            <input
                                type="email"
                                className="input-field"
                                placeholder="seu.email@moura.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                required
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
                                required
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