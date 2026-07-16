import { API_URL } from './config';
import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { User, Building2, Phone, Calendar, CreditCard, Mail, Save, AlertCircle, CheckCircle } from 'lucide-react';

const ProfileEditor: React.FC = () => {
    const { token, user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch(`${API_URL}/get_profile.php`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                
                if (response.ok) {
                    setFormData(data.profile);
                } else {
                    setError(data.error || 'Error al cargar perfil');
                }
            } catch (err) {
                setError('Error de conexión');
            } finally {
                setIsLoading(false);
            }
        };

        if (token) {
            fetchProfile();
        }
    }, [token]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`${API_URL}/update_profile.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            const data = await response.json();

            if (response.ok) {
                setSuccess('Perfil actualizado exitosamente');
            } else {
                setError(data.error || 'Error al guardar perfil');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setIsSaving(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (isLoading) {
        return <div style={{ textAlign: 'center', padding: '50px', color: '#64748B' }}>Cargando perfil...</div>;
    }

    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', borderBottom: '1px solid #E2E8F0', paddingBottom: '20px' }}>
                    <div style={{ backgroundColor: '#EEF2FF', padding: '15px', borderRadius: '12px', color: '#4F46E5' }}>
                        <User size={32} />
                    </div>
                    <div>
                        <h2 style={{ margin: '0 0 5px 0', color: '#1E293B' }}>Mi Perfil</h2>
                        <p style={{ margin: 0, color: '#64748B' }}>
                            Gestiona tu información personal
                        </p>
                    </div>
                </div>

                {error && (
                    <div style={{ backgroundColor: '#FEF2F2', color: '#B91C1C', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <AlertCircle size={20} /> {error}
                    </div>
                )}

                {success && (
                    <div style={{ backgroundColor: '#ECFDF5', color: '#047857', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <CheckCircle size={20} /> {success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <h3 style={{ color: '#334155', marginBottom: '20px' }}>Información de Contacto</h3>
                    
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 300px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                Correo Electrónico
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94A3B8' }} />
                                <input 
                                    type="email" 
                                    value={formData.email || ''} 
                                    disabled
                                    style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', color: '#64748B' }} 
                                />
                            </div>
                            <small style={{ color: '#94A3B8', marginTop: '5px', display: 'block' }}>El correo no puede ser modificado.</small>
                        </div>
                        
                        <div style={{ flex: '1 1 300px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                Apodo / Nickname *
                            </label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94A3B8' }} />
                                <input 
                                    type="text" 
                                    name="nickname"
                                    value={formData.nickname || ''} 
                                    onChange={handleChange}
                                    required
                                    style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #CBD5E1' }} 
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 300px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                Teléfono *
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Phone size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94A3B8' }} />
                                <input 
                                    type="tel" 
                                    name="phone_number"
                                    value={formData.phone_number || ''} 
                                    onChange={handleChange}
                                    required
                                    style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #CBD5E1' }} 
                                />
                            </div>
                        </div>

                        <div style={{ flex: '1 1 300px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                URL Imagen de Perfil
                            </label>
                            <input 
                                type="text" 
                                name="profile_image_url"
                                value={formData.profile_image_url || ''} 
                                onChange={handleChange}
                                placeholder="https://ejemplo.com/foto.jpg"
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }} 
                            />
                        </div>
                    </div>

                    <h3 style={{ color: '#334155', marginBottom: '20px', borderTop: '1px solid #E2E8F0', paddingTop: '30px' }}>
                        Datos Personales
                    </h3>

                    <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 300px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontSize: '0.9rem', fontWeight: 'bold' }}>Nombres *</label>
                            <input 
                                type="text" 
                                name="first_name"
                                value={formData.first_name || ''} 
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }} 
                            />
                        </div>
                        <div style={{ flex: '1 1 300px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontSize: '0.9rem', fontWeight: 'bold' }}>Apellidos *</label>
                            <input 
                                type="text" 
                                name="last_name"
                                value={formData.last_name || ''} 
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }} 
                            />
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 300px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontSize: '0.9rem', fontWeight: 'bold' }}>DNI (Nacional) *</label>
                            <div style={{ position: 'relative' }}>
                                <CreditCard size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94A3B8' }} />
                                <input 
                                    type="text" 
                                    name="national_id"
                                    value={formData.national_id || ''} 
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #CBD5E1' }} 
                                />
                            </div>
                        </div>
                        <div style={{ flex: '1 1 300px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontSize: '0.9rem', fontWeight: 'bold' }}>Carnet de Extranjería</label>
                            <input 
                                type="text" 
                                name="foreigners_identity_card"
                                value={formData.foreigners_identity_card || ''} 
                                onChange={handleChange}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }} 
                            />
                        </div>
                    </div>
                    
                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontSize: '0.9rem', fontWeight: 'bold' }}>Fecha de Nacimiento *</label>
                        <div style={{ position: 'relative', maxWidth: '300px' }}>
                            <Calendar size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94A3B8' }} />
                            <input 
                                type="date" 
                                name="birthday"
                                value={formData.birthday || ''} 
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #CBD5E1' }} 
                            />
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button 
                            type="submit" 
                            disabled={isSaving}
                            style={{ 
                                padding: '12px 30px', 
                                backgroundColor: '#4F46E5', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '8px', 
                                fontSize: '1rem', 
                                fontWeight: 'bold', 
                                cursor: isSaving ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                transition: 'background-color 0.3s'
                            }}
                        >
                            <Save size={20} />
                            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileEditor;
