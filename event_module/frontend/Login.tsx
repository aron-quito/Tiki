import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'customer'|'organizer'>('customer');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8000/auth.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'login', email, password, role })
            });
            const data = await response.json();
            if (response.ok) {
                login(data.token, data.user);
                // Redirect based on role
                if (role === 'organizer') {
                    navigate('/dashboard'); // or wherever dashboard root is
                } else {
                    navigate('/explore'); // new client route
                }
            } else {
                setError(data.error || 'Error al iniciar sesión');
            }
        } catch (err) {
            setError('Error de conexión con el servidor.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', padding: '20px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', padding: '40px', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', width: '100%', maxWidth: '400px' }}>
                
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '2rem', color: '#1E293B', marginBottom: '10px' }}>Iniciar Sesión</h2>
                    <p style={{ color: '#64748B' }}>Bienvenido de nuevo</p>
                </div>

                <div style={{ display: 'flex', marginBottom: '25px', backgroundColor: '#F1F5F9', borderRadius: '8px', padding: '4px' }}>
                    <button 
                        type="button"
                        onClick={() => setRole('customer')}
                        style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.3s', backgroundColor: role === 'customer' ? 'white' : 'transparent', color: role === 'customer' ? '#4F46E5' : '#64748B', boxShadow: role === 'customer' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
                    >
                        Soy Cliente
                    </button>
                    <button 
                        type="button"
                        onClick={() => setRole('organizer')}
                        style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.3s', backgroundColor: role === 'organizer' ? 'white' : 'transparent', color: role === 'organizer' ? '#4F46E5' : '#64748B', boxShadow: role === 'organizer' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
                    >
                        Soy Organizador
                    </button>
                </div>

                {error && <div style={{ backgroundColor: '#FEE2E2', color: '#B91C1C', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#475569' }}>Correo Electrónico</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
                    </div>
                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#475569' }}>Contraseña</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        style={{ width: '100%', padding: '14px', backgroundColor: '#4F46E5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'background 0.3s' }}
                    >
                        {isLoading ? 'Iniciando sesión...' : 'Ingresar'}
                    </button>
                    
                    <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem' }}>
                        <span style={{ color: '#64748B' }}>¿No tienes cuenta? </span>
                        <Link to="/register" style={{ color: '#4F46E5', textDecoration: 'none', fontWeight: 'bold' }}>Regístrate aquí</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
