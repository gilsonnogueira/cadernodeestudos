import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const { signInWithGoogle } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleLogin() {
        try {
            setError('');
            setLoading(true);
            await signInWithGoogle();
            navigate('/'); // Redirect to dashboard after login
        } catch (err) {
            setError('Falha ao fazer login com Google. Tente novamente.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: '#f3f4f6'
        }}>
            <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                textAlign: 'center',
                maxWidth: '400px',
                width: '100%'
            }}>
                <h1 style={{ marginBottom: '0.5rem', color: '#1f2937' }}>Bem-vindo</h1>
                <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Faça login para acessar seu Caderno de Estudos</p>

                {error && <div style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</div>}

                <button
                    onClick={handleLogin}
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
                        fontSize: '1rem',
                        fontWeight: '500',
                        color: '#374151',
                        transition: 'background 0.2s'
                    }}
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="24" height="24" alt="Google" />
                    {loading ? 'Entrando...' : 'Entrar com Google'}
                </button>
            </div>
        </div>
    );
}
