import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { API_URL } from './config';
import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { User, Building2, Phone, Calendar, CreditCard, Mail, Save, AlertCircle, CheckCircle } from 'lucide-react';
const ProfileEditor = () => {
    const { token, user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({});
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch(`${API_URL}/get_profile.php`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (response.ok) {
                    setFormData(data.profile);
                }
                else {
                    setError(data.error || 'Error al cargar perfil');
                }
            }
            catch (err) {
                setError('Error de conexión');
            }
            finally {
                setIsLoading(false);
            }
        };
        if (token) {
            fetchProfile();
        }
    }, [token]);
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
    const handleSubmit = async (e) => {
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
            }
            else {
                setError(data.error || 'Error al guardar perfil');
            }
        }
        catch (err) {
            setError('Error de conexión');
        }
        finally {
            setIsSaving(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    if (isLoading) {
        return _jsx("div", { style: { textAlign: 'center', padding: '50px', color: '#64748B' }, children: "Cargando perfil..." });
    }
    return (_jsx("div", { style: { maxWidth: '800px', margin: '40px auto', padding: '0 20px' }, children: _jsxs("div", { style: { backgroundColor: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', borderBottom: '1px solid #E2E8F0', paddingBottom: '20px' }, children: [_jsx("div", { style: { backgroundColor: '#EEF2FF', padding: '15px', borderRadius: '12px', color: '#4F46E5' }, children: _jsx(User, { size: 32 }) }), _jsxs("div", { children: [_jsx("h2", { style: { margin: '0 0 5px 0', color: '#1E293B' }, children: "Mi Perfil" }), _jsx("p", { style: { margin: 0, color: '#64748B' }, children: "Gestiona tu informaci\u00F3n personal" })] })] }), error && (_jsxs("div", { style: { backgroundColor: '#FEF2F2', color: '#B91C1C', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }, children: [_jsx(AlertCircle, { size: 20 }), " ", error] })), success && (_jsxs("div", { style: { backgroundColor: '#ECFDF5', color: '#047857', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }, children: [_jsx(CheckCircle, { size: 20 }), " ", success] })), _jsxs("form", { onSubmit: handleSubmit, children: [_jsx("h3", { style: { color: '#334155', marginBottom: '20px' }, children: "Informaci\u00F3n de Contacto" }), _jsxs("div", { style: { display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }, children: [_jsxs("div", { style: { flex: '1 1 300px' }, children: [_jsx("label", { style: { display: 'block', marginBottom: '8px', color: '#475569', fontSize: '0.9rem', fontWeight: 'bold' }, children: "Correo Electr\u00F3nico" }), _jsxs("div", { style: { position: 'relative' }, children: [_jsx(Mail, { size: 18, style: { position: 'absolute', left: '12px', top: '12px', color: '#94A3B8' } }), _jsx("input", { type: "email", value: formData.email || '', disabled: true, style: { width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', color: '#64748B' } })] }), _jsx("small", { style: { color: '#94A3B8', marginTop: '5px', display: 'block' }, children: "El correo no puede ser modificado." })] }), _jsxs("div", { style: { flex: '1 1 300px' }, children: [_jsx("label", { style: { display: 'block', marginBottom: '8px', color: '#475569', fontSize: '0.9rem', fontWeight: 'bold' }, children: "Apodo / Nickname *" }), _jsxs("div", { style: { position: 'relative' }, children: [_jsx(User, { size: 18, style: { position: 'absolute', left: '12px', top: '12px', color: '#94A3B8' } }), _jsx("input", { type: "text", name: "nickname", value: formData.nickname || '', onChange: handleChange, required: true, style: { width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #CBD5E1' } })] })] })] }), _jsxs("div", { style: { display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }, children: [_jsxs("div", { style: { flex: '1 1 300px' }, children: [_jsx("label", { style: { display: 'block', marginBottom: '8px', color: '#475569', fontSize: '0.9rem', fontWeight: 'bold' }, children: "Tel\u00E9fono *" }), _jsxs("div", { style: { position: 'relative' }, children: [_jsx(Phone, { size: 18, style: { position: 'absolute', left: '12px', top: '12px', color: '#94A3B8' } }), _jsx("input", { type: "tel", name: "phone_number", value: formData.phone_number || '', onChange: handleChange, required: true, style: { width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #CBD5E1' } })] })] }), _jsxs("div", { style: { flex: '1 1 300px' }, children: [_jsx("label", { style: { display: 'block', marginBottom: '8px', color: '#475569', fontSize: '0.9rem', fontWeight: 'bold' }, children: "URL Imagen de Perfil" }), _jsx("input", { type: "text", name: "profile_image_url", value: formData.profile_image_url || '', onChange: handleChange, placeholder: "https://ejemplo.com/foto.jpg", style: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' } })] })] }), _jsx("h3", { style: { color: '#334155', marginBottom: '20px', borderTop: '1px solid #E2E8F0', paddingTop: '30px' }, children: "Datos Personales" }), _jsxs("div", { style: { display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }, children: [_jsxs("div", { style: { flex: '1 1 300px' }, children: [_jsx("label", { style: { display: 'block', marginBottom: '8px', color: '#475569', fontSize: '0.9rem', fontWeight: 'bold' }, children: "Nombres *" }), _jsx("input", { type: "text", name: "first_name", value: formData.first_name || '', onChange: handleChange, required: true, style: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' } })] }), _jsxs("div", { style: { flex: '1 1 300px' }, children: [_jsx("label", { style: { display: 'block', marginBottom: '8px', color: '#475569', fontSize: '0.9rem', fontWeight: 'bold' }, children: "Apellidos *" }), _jsx("input", { type: "text", name: "last_name", value: formData.last_name || '', onChange: handleChange, required: true, style: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' } })] })] }), _jsxs("div", { style: { display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }, children: [_jsxs("div", { style: { flex: '1 1 300px' }, children: [_jsx("label", { style: { display: 'block', marginBottom: '8px', color: '#475569', fontSize: '0.9rem', fontWeight: 'bold' }, children: "DNI (Nacional) *" }), _jsxs("div", { style: { position: 'relative' }, children: [_jsx(CreditCard, { size: 18, style: { position: 'absolute', left: '12px', top: '12px', color: '#94A3B8' } }), _jsx("input", { type: "text", name: "national_id", value: formData.national_id || '', onChange: handleChange, style: { width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #CBD5E1' } })] })] }), _jsxs("div", { style: { flex: '1 1 300px' }, children: [_jsx("label", { style: { display: 'block', marginBottom: '8px', color: '#475569', fontSize: '0.9rem', fontWeight: 'bold' }, children: "Carnet de Extranjer\u00EDa" }), _jsx("input", { type: "text", name: "foreigners_identity_card", value: formData.foreigners_identity_card || '', onChange: handleChange, style: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' } })] })] }), _jsxs("div", { style: { marginBottom: '30px' }, children: [_jsx("label", { style: { display: 'block', marginBottom: '8px', color: '#475569', fontSize: '0.9rem', fontWeight: 'bold' }, children: "Fecha de Nacimiento *" }), _jsxs("div", { style: { position: 'relative', maxWidth: '300px' }, children: [_jsx(Calendar, { size: 18, style: { position: 'absolute', left: '12px', top: '12px', color: '#94A3B8' } }), _jsx("input", { type: "date", name: "birthday", value: formData.birthday || '', onChange: handleChange, required: true, style: { width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #CBD5E1' } })] })] }), _jsx("div", { style: { borderTop: '1px solid #E2E8F0', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end' }, children: _jsxs("button", { type: "submit", disabled: isSaving, style: {
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
                                }, children: [_jsx(Save, { size: 20 }), isSaving ? 'Guardando...' : 'Guardar Cambios'] }) })] })] }) }));
};
export default ProfileEditor;
//# sourceMappingURL=ProfileEditor.js.map