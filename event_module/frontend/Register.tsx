import { API_URL } from './config';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register: React.FC = () => {
    const [role, setRole] = useState<'customer' | 'organizer'>('customer');
    const [formData, setFormData] = useState({
        email: '', password: '', nickname: '', phone_number: '',
        first_name: '', last_name: '', national_id: '', foreigners_identity_card: '', birthday: '',
        company_name: '', ruc: '', trade_name: '', corporate_phone_number: ''
    });
    
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);
        try {
            const payload = { action: 'register', role, ...formData };
            const response = await fetch(`${API_URL}/auth.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (response.ok) {
                setSuccess(data.message);
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError(data.error || 'Error al registrar');
            }
        } catch (err) {
            setError('Error de conexión con el servidor.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', padding: '20px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', padding: '40px', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', width: '100%', maxWidth: '600px' }}>
                
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '2rem', color: '#1E293B', marginBottom: '10px' }}>Crear una cuenta</h2>
                    <p style={{ color: '#64748B' }}>Únete a la mejor plataforma de eventos</p>
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
                {success && <div style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>{success}</div>}

                <form onSubmit={handleSubmit}>
                    
                    <h4 style={{ color: '#334155', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px', marginBottom: '15px' }}>Datos de la Cuenta</h4>
                    <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#475569' }}>Correo Electrónico *</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#475569' }}>Contraseña *</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
                        </div>
                    </div>

                    <h4 style={{ color: '#334155', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px', marginBottom: '15px', marginTop: '25px' }}>Datos Personales / Corporativos</h4>
                    
                    {role === 'customer' && (
                        <>
                            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#475569' }}>Nombres *</label>
                                    <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#475569' }}>Apellidos *</label>
                                    <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#475569' }}>DNI (Opcional si tiene C.E.)</label>
                                    <input type="text" name="national_id" value={formData.national_id} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#475569' }}>Carnet Extranjería (Opcional)</label>
                                    <input type="text" name="foreigners_identity_card" value={formData.foreigners_identity_card} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#475569' }}>Fecha de Nacimiento</label>
                                    <input type="date" name="birthday" value={formData.birthday} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#475569' }}>Teléfono Móvil *</label>
                                    <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
                                </div>
                            </div>
                        </>
                    )}

                    {role === 'organizer' && (
                        <>
                            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#475569' }}>RUC *</label>
                                    <input type="text" name="ruc" value={formData.ruc} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#475569' }}>Nombre de Empresa *</label>
                                    <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#475569' }}>Nombre Comercial</label>
                                    <input type="text" name="trade_name" value={formData.trade_name} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#475569' }}>Teléfono Corporativo *</label>
                                    <input type="tel" name="corporate_phone_number" value={formData.corporate_phone_number} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
                                </div>
                            </div>
                        </>
                    )}

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        style={{ width: '100%', padding: '14px', backgroundColor: '#4F46E5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: isLoading ? 'not-allowed' : 'pointer', marginTop: '20px', transition: 'background 0.3s' }}
                    >
                        {isLoading ? 'Creando cuenta...' : 'Registrarse'}
                    </button>
                    
                    <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem' }}>
                        <span style={{ color: '#64748B' }}>¿Ya tienes cuenta? </span>
                        <Link to="/login" style={{ color: '#4F46E5', textDecoration: 'none', fontWeight: 'bold' }}>Inicia sesión aquí</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
