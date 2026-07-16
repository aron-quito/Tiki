import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { API_URL } from './config';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { ArrowLeft, Camera, Keyboard, CheckCircle, XCircle } from 'lucide-react';
// @ts-ignore
import { Html5Qrcode } from 'html5-qrcode';
import './DashboardOverview.css'; // Reusing styles
const AttendanceControl = () => {
    const { id } = useParams();
    const { token } = useAuth();
    const navigate = useNavigate();
    const [mode, setMode] = useState('camera');
    const fileInputRef = useRef(null);
    // Búsqueda Manual
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    // UI State
    const [message, setMessage] = useState(null);
    const html5QrCodeRef = useRef(null);
    const handleFileChange = async (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setMessage(null);
            try {
                let scanner = html5QrCodeRef.current;
                if (!scanner) {
                    scanner = new Html5Qrcode("hidden-reader");
                    html5QrCodeRef.current = scanner;
                }
                const decodedText = await scanner.scanFile(file, true);
                handleRegisterAttendance(decodedText);
            }
            catch (err) {
                setMessage({ type: 'error', text: 'No se pudo leer el código QR en la imagen. Intenta tomar la foto más nítida.' });
            }
            // Clear the input so the same file can be selected again
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };
    const handleRegisterAttendance = async (identifier) => {
        setMessage(null);
        try {
            const res = await fetch(`${API_URL}/register_attendance.php`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ event_id: id, ticket_identifier: identifier })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: `¡Acceso concedido! ${data.message}` });
                if (mode === 'manual')
                    handleSearch(); // Refresh list if manual
            }
            else {
                setMessage({ type: 'error', text: data.error || 'Error desconocido' });
            }
        }
        catch (err) {
            setMessage({ type: 'error', text: 'Error de red' });
        }
    };
    const handleRemoveAttendance = async (ticket_id) => {
        if (!window.confirm("¿Estás seguro de que quieres anular el ingreso de este ticket?"))
            return;
        try {
            const res = await fetch(`${API_URL}/remove_attendance.php`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ event_id: id, ticket_id })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: `Asistencia anulada correctamente.` });
                handleSearch(); // Refresh list
            }
            else {
                setMessage({ type: 'error', text: data.error || 'Error desconocido' });
            }
        }
        catch (err) {
            setMessage({ type: 'error', text: 'Error de red' });
        }
    };
    const handleSearch = async (e) => {
        if (e)
            e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/search_ticket.php?event_id=${id}&q=${encodeURIComponent(searchQuery)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setSearchResults(data.results || []);
            }
        }
        catch (err) {
            console.error("Error buscando ticket", err);
        }
    };
    // Cargar últimos 10 tickets por defecto en modo manual
    useEffect(() => {
        if (mode === 'manual') {
            handleSearch();
        }
    }, [mode]);
    return (_jsxs("div", { className: "overview-container", style: { padding: '20px', maxWidth: '800px', margin: '0 auto', position: 'relative' }, children: [_jsx("div", { id: "hidden-reader", style: { position: 'absolute', top: '-9999px', width: '300px', height: '300px' } }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }, children: [_jsx("button", { onClick: () => navigate('/events'), className: "btn-ghost", style: { padding: '8px' }, children: _jsx(ArrowLeft, { size: 20 }) }), _jsxs("h2", { children: ["Control de Asistencia - Evento #", id] })] }), _jsxs("div", { style: { display: 'flex', gap: '10px', marginBottom: '20px' }, children: [_jsxs("button", { onClick: () => { setMode('camera'); setMessage(null); }, style: { flex: 1, padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', borderRadius: '8px', border: '1px solid', borderColor: mode === 'camera' ? '#4F46E5' : '#CBD5E1', backgroundColor: mode === 'camera' ? '#EEF2FF' : 'white', color: mode === 'camera' ? '#4F46E5' : '#475569', cursor: 'pointer', fontWeight: '500' }, children: [_jsx(Camera, { size: 20 }), " Esc\u00E1ner QR"] }), _jsxs("button", { onClick: () => { setMode('manual'); setMessage(null); }, style: { flex: 1, padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', borderRadius: '8px', border: '1px solid', borderColor: mode === 'manual' ? '#4F46E5' : '#CBD5E1', backgroundColor: mode === 'manual' ? '#EEF2FF' : 'white', color: mode === 'manual' ? '#4F46E5' : '#475569', cursor: 'pointer', fontWeight: '500' }, children: [_jsx(Keyboard, { size: 20 }), " Ingreso Manual"] })] }), message && (_jsxs("div", { style: { padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: message.type === 'success' ? '#ECFDF5' : '#FEF2F2', color: message.type === 'success' ? '#047857' : '#B91C1C', border: `1px solid ${message.type === 'success' ? '#A7F3D0' : '#FECACA'}` }, children: [message.type === 'success' ? _jsx(CheckCircle, { size: 20 }) : _jsx(XCircle, { size: 20 }), _jsx("span", { style: { fontWeight: '500' }, children: message.text })] })), mode === 'camera' && (_jsxs("div", { className: "section-card", style: { padding: '40px 20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }, children: [_jsx(Camera, { size: 48, style: { color: '#4F46E5', marginBottom: '20px' } }), _jsx("h3", { style: { margin: '0 0 10px 0', color: '#1E293B' }, children: "Escanear Ticket" }), _jsx("p", { style: { color: '#64748B', marginBottom: '30px' }, children: "Toma una foto del c\u00F3digo QR o selecciona una imagen de tu galer\u00EDa para registrar la asistencia." }), _jsx("input", { type: "file", accept: "image/*", capture: "environment", ref: fileInputRef, onChange: handleFileChange, style: { display: 'none' } }), _jsxs("button", { onClick: () => fileInputRef.current?.click(), style: { padding: '15px 30px', backgroundColor: '#4F46E5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 6px rgba(79, 70, 229, 0.3)' }, children: [_jsx(Camera, { size: 24 }), "Abrir C\u00E1mara / Galer\u00EDa"] })] })), mode === 'manual' && (_jsxs("div", { className: "section-card", style: { padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }, children: [_jsxs("form", { onSubmit: handleSearch, style: { display: 'flex', gap: '10px', marginBottom: '20px' }, children: [_jsx("input", { type: "text", placeholder: "Buscar N\u00B0 ticket, email, nombre o c\u00F3digo QR...", value: searchQuery, onChange: e => setSearchQuery(e.target.value), style: { flex: 1, padding: '10px 15px', borderRadius: '4px', border: '1px solid #CBD5E1' } }), _jsx("button", { type: "submit", className: "btn-primary", children: "Buscar" })] }), _jsx("div", { className: "table-responsive-wrapper", children: _jsxs("table", { style: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }, children: [_jsx("thead", { children: _jsxs("tr", { style: { backgroundColor: '#F8FAFC', color: '#475569' }, children: [_jsx("th", { style: { padding: '12px' }, children: "Ticket" }), _jsx("th", { style: { padding: '12px' }, children: "Cliente" }), _jsx("th", { style: { padding: '12px' }, children: "Estado" }), _jsx("th", { style: { padding: '12px', textAlign: 'right' }, children: "Acci\u00F3n" })] }) }), _jsxs("tbody", { children: [searchResults.map(res => (_jsxs("tr", { style: { borderBottom: '1px solid #F1F5F9' }, children: [_jsxs("td", { style: { padding: '12px', fontFamily: 'monospace' }, children: [res.ticket_number, _jsx("br", {}), _jsx("span", { style: { fontSize: '0.8rem', color: '#64748B', fontFamily: 'sans-serif' }, children: res.ticket_type_name })] }), _jsxs("td", { style: { padding: '12px' }, children: [res.first_name, " ", res.last_name, _jsx("br", {}), _jsx("span", { style: { fontSize: '0.8rem', color: '#64748B' }, children: res.customer_email })] }), _jsx("td", { style: { padding: '12px' }, children: res.checked_in_at ?
                                                        _jsx("span", { style: { color: '#047857', backgroundColor: '#ECFDF5', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '500' }, children: "Ingres\u00F3" }) :
                                                        _jsx("span", { style: { color: '#475569', backgroundColor: '#F1F5F9', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '500' }, children: "Por Ingresar" }) }), _jsx("td", { style: { padding: '12px', textAlign: 'right' }, children: !res.checked_in_at ? (_jsx("button", { onClick: () => handleRegisterAttendance(res.ticket_number), style: { padding: '6px 12px', backgroundColor: '#10B981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }, children: "Dar Ingreso" })) : (_jsx("button", { onClick: () => handleRemoveAttendance(res.ticket_id), style: { padding: '6px 12px', backgroundColor: '#FEE2E2', color: '#B91C1C', border: '1px solid #FCA5A5', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }, children: "Revocar" })) })] }, res.ticket_id))), searchResults.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 4, style: { padding: '20px', textAlign: 'center', color: '#64748B' }, children: "No se encontraron tickets." }) }))] })] }) })] }))] }));
};
export default AttendanceControl;
//# sourceMappingURL=AttendanceControl.js.map