import { API_URL } from './config';
import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { User, Building2, Phone, Calendar, CreditCard, Mail, Save, AlertCircle, CheckCircle } from 'lucide-react';

const OrganizerProfileEditor: React.FC = () => {
    const { token } = useAuth();
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
                setSuccess('Perfil corporativo actualizado exitosamente');
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
        return <div style={{ textAlign: 'center', padding: '50px', color: '#64748B' }}>Cargando perfil corporativo...</div>;
    }

    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', borderBottom: '1px solid #E2E8F0', paddingBottom: '20px' }}>
                    <div style={{ backgroundColor: '#EEF2FF', padding: '15px', borderRadius: '12px', color: '#4F46E5' }}>
                        <Building2 size={32} />
                    </div>
                    <div>
                        <h2 style={{ margin: '0 0 5px 0', color: '#1E293B' }}>Datos de Empresa</h2>
                        <p style={{ margin: 0, color: '#64748B' }}>
                            Gestiona la información corporativa y pública de tu organización
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
                                Teléfono Principal *
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

                    <h3 style={{ color: '#334155', marginBottom: '20px', borderTop: '1px solid #E2E8F0', paddingTop: '30px' }}>Datos Corporativos</h3>

                    <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 300px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontSize: '0.9rem', fontWeight: 'bold' }}>RUC *</label>
                            <div style={{ position: 'relative' }}>
                                <CreditCard size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94A3B8' }} />
                                <input 
                                    type="text" 
                                    name="ruc"
                                    value={formData.ruc || ''} 
                                    onChange={handleChange}
                                    required
                                    style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #CBD5E1' }} 
                                />
                            </div>
                        </div>
                        <div style={{ flex: '1 1 300px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontSize: '0.9rem', fontWeight: 'bold' }}>Razón Social *</label>
                            <div style={{ position: 'relative' }}>
                                <Building2 size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94A3B8' }} />
                                <input 
                                    type="text" 
                                    name="company_name"
                                    value={formData.company_name || ''} 
                                    onChange={handleChange}
                                    required
                                    style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #CBD5E1' }} 
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 300px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontSize: '0.9rem', fontWeight: 'bold' }}>Nombre Comercial</label>
                            <input 
                                type="text" 
                                name="trade_name"
                                value={formData.trade_name || ''} 
                                onChange={handleChange}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }} 
                            />
                        </div>
                        <div style={{ flex: '1 1 300px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontSize: '0.9rem', fontWeight: 'bold' }}>Teléfono Corporativo *</label>
                            <div style={{ position: 'relative' }}>
                                <Phone size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94A3B8' }} />
                                <input 
                                    type="tel" 
                                    name="corporate_phone_number"
                                    value={formData.corporate_phone_number || ''} 
                                    onChange={handleChange}
                                    required
                                    style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #CBD5E1' }} 
                                />
                            </div>
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
export default OrganizerProfileEditor;
