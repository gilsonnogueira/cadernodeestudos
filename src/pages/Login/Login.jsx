import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react';

export default function Login() {
    const { signInWithGoogle, login, signup } = useAuth();
    const navigate = useNavigate();

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    async function handleGoogleLogin() {
        try {
            setError('');
            setLoading(true);
            await signInWithGoogle();
            navigate('/');
        } catch (err) {
            setError('Falha ao entrar com Google');
        } finally {
            setLoading(false);
        }
    }

    async function handleEmailAuth(e) {
        e.preventDefault();
        if (!email || !password) return setError("Preencha todos os campos");

        try {
            setError('');
            setLoading(true);

            if (isRegistering) {
                await signup(email, password);
            } else {
                await login(email, password);
            }
            navigate('/');
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/invalid-credential') setError("E-mail ou senha incorretos");
            else if (err.code === 'auth/email-already-in-use') setError("Este e-mail já está cadastrado");
            else if (err.code === 'auth/weak-password') setError("A senha deve ter pelo menos 6 caracteres");
            else setError('Falha na autenticação: ' + err.code);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-container" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: '#f3f4f6',
            padding: '20px'
        }}>
            <div style={{
                background: 'white',
                padding: '2.5rem',
                borderRadius: '16px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                maxWidth: '400px',
                width: '100%'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
                        {isRegistering ? 'Criar Conta' : 'Bem-vindo'}
                    </h1>
                    <p style={{ color: '#6b7280' }}>
                        {isRegistering ? 'Preencha seus dados para começar' : 'Faça login para acessar suas questões'}
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: '#fee2e2',
                        color: '#991b1b',
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.875rem'
                    }}>
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        background: 'white',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        color: '#374151',
                        transition: 'all 0.2s',
                        marginBottom: '1.5rem'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#f9fafb'}
                    onMouseOut={(e) => e.target.style.background = 'white'}
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20" height="20" alt="Google" />
                    Entrar com Google
                </button>

                <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
                    <div style={{ flex: 1, borderTop: '1px solid #e5e7eb' }}></div>
                    <span style={{ padding: '0 10px', color: '#9ca3af', fontSize: '0.875rem' }}>OU</span>
                    <div style={{ flex: 1, borderTop: '1px solid #e5e7eb' }}></div>
                </div>

                <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Mail size={20} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="email"
                            placeholder="Seu e-mail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '12px 12px 12px 40px',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                outline: 'none',
                                fontSize: '0.95rem',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock size={20} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="password"
                            placeholder="Sua senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '12px 12px 12px 40px',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                outline: 'none',
                                fontSize: '0.95rem',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: 'none',
                            borderRadius: '8px',
                            background: '#2563eb',
                            color: 'white',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            marginTop: '0.5rem'
                        }}
                    >
                        {loading && <Loader2 size={18} className="animate-spin" />}
                        {isRegistering ? 'Criar Conta' : 'Entrar'}
                    </button>
                </form>

                <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: '#6b7280' }}>
                    {isRegistering ? 'Já tem uma conta?' : 'Não tem uma conta?'}
                    <button
                        onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#2563eb',
                            fontWeight: '600',
                            cursor: 'pointer',
                            marginLeft: '4px'
                        }}
                    >
                        {isRegistering ? 'Fazer Login' : 'Cadastre-se'}
                    </button>
                </p>
            </div>
        </div>
    );
}
