import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from './config';
const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('customer');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth.php`, {
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
                }
                else {
                    navigate('/explore'); // new client route
                }
            }
            else {
                setError(data.error || 'Error al iniciar sesión');
            }
        }
        catch (err) {
            setError('Error de conexión con el servidor.');
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { style: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', padding: '20px' }, children: _jsxs("div", { style: { background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', padding: '40px', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', width: '100%', maxWidth: '400px' }, children: [_jsxs("div", { style: { textAlign: 'center', marginBottom: '30px' }, children: [_jsx("h2", { style: { fontSize: '2rem', color: '#1E293B', marginBottom: '10px' }, children: "Iniciar Sesi\u00F3n" }), _jsx("p", { style: { color: '#64748B' }, children: "Bienvenido de nuevo" })] }), _jsxs("div", { style: { display: 'flex', marginBottom: '25px', backgroundColor: '#F1F5F9', borderRadius: '8px', padding: '4px' }, children: [_jsx("button", { type: "button", onClick: () => setRole('customer'), style: { flex: 1, padding: '10px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.3s', backgroundColor: role === 'customer' ? 'white' : 'transparent', color: role === 'customer' ? '#4F46E5' : '#64748B', boxShadow: role === 'customer' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }, children: "Soy Cliente" }), _jsx("button", { type: "button", onClick: () => setRole('organizer'), style: { flex: 1, padding: '10px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.3s', backgroundColor: role === 'organizer' ? 'white' : 'transparent', color: role === 'organizer' ? '#4F46E5' : '#64748B', boxShadow: role === 'organizer' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }, children: "Soy Organizador" })] }), error && _jsx("div", { style: { backgroundColor: '#FEE2E2', color: '#B91C1C', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }, children: error }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { style: { marginBottom: '15px' }, children: [_jsx("label", { style: { display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#475569' }, children: "Correo Electr\u00F3nico" }), _jsx("input", { type: "email", value: email, onChange: e => setEmail(e.target.value), required: true, style: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1' } })] }), _jsxs("div", { style: { marginBottom: '25px' }, children: [_jsx("label", { style: { display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#475569' }, children: "Contrase\u00F1a" }), _jsx("input", { type: "password", value: password, onChange: e => setPassword(e.target.value), required: true, style: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1' } })] }), _jsx("button", { type: "submit", disabled: isLoading, style: { width: '100%', padding: '14px', backgroundColor: '#4F46E5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'background 0.3s' }, children: isLoading ? 'Iniciando sesión...' : 'Ingresar' }), _jsxs("div", { style: { textAlign: 'center', marginTop: '20px', fontSize: '0.9rem' }, children: [_jsx("span", { style: { color: '#64748B' }, children: "\u00BFNo tienes cuenta? " }), _jsx(Link, { to: "/register", style: { color: '#4F46E5', textDecoration: 'none', fontWeight: 'bold' }, children: "Reg\u00EDstrate aqu\u00ED" })] })] })] }) }));
};
export default Login;
//# sourceMappingURL=Login.js.map