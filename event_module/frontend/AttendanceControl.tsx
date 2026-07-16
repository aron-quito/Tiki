import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { ArrowLeft, Camera, Keyboard, CheckCircle, XCircle } from 'lucide-react';
// @ts-ignore
import { Html5Qrcode } from 'html5-qrcode';
import './DashboardOverview.css'; // Reusing styles

interface TicketSearchRes {
    ticket_id: number;
    ticket_number: string;
    tickets_status: string;
    checked_in_at: string | null;
    ticket_type_name: string;
    customer_email: string;
    first_name: string;
    last_name: string;
}

const AttendanceControl: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { token } = useAuth();
    const navigate = useNavigate();
    
    const [mode, setMode] = useState<'camera' | 'manual'>('camera');
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Búsqueda Manual
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<TicketSearchRes[]>([]);
    
    // UI State
    const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

    const html5QrCodeRef = useRef<Html5Qrcode | null>(null);



    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setMessage(null);
            
            try {
                let scanner = html5QrCodeRef.current;
                if (!scanner) {
                    scanner = new Html5Qrcode("hidden-reader");
                    html5QrCodeRef.current = scanner;
                }
                
                const decodedText = await scanner.scanFile(file as any, true);
                handleRegisterAttendance(decodedText);
            } catch (err) {
                setMessage({ type: 'error', text: 'No se pudo leer el código QR en la imagen. Intenta tomar la foto más nítida.' });
            }
            
            // Clear the input so the same file can be selected again
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRegisterAttendance = async (identifier: string) => {
        setMessage(null);
        try {
            const res = await fetch(`http://localhost:8000/register_attendance.php`, {
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
                if (mode === 'manual') handleSearch(); // Refresh list if manual
            } else {
                setMessage({ type: 'error', text: data.error || 'Error desconocido' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Error de red' });
        }
    };

    const handleRemoveAttendance = async (ticket_id: number) => {
        if (!window.confirm("¿Estás seguro de que quieres anular el ingreso de este ticket?")) return;
        
        try {
            const res = await fetch(`http://localhost:8000/remove_attendance.php`, {
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
            } else {
                setMessage({ type: 'error', text: data.error || 'Error desconocido' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Error de red' });
        }
    };

    const handleSearch = async (e?: React.FormEvent) => {
        if(e) e.preventDefault();
        try {
            const res = await fetch(`http://localhost:8000/search_ticket.php?event_id=${id}&q=${encodeURIComponent(searchQuery)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setSearchResults(data.results || []);
            }
        } catch (err) {
            console.error("Error buscando ticket", err);
        }
    };

    // Cargar últimos 10 tickets por defecto en modo manual
    useEffect(() => {
        if (mode === 'manual') {
            handleSearch();
        }
    }, [mode]);

    return (
        <div className="overview-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
            {/* Div oculto permanente para procesar la imagen sin que react lo destruya */}
            <div id="hidden-reader" style={{ position: 'absolute', top: '-9999px', width: '300px', height: '300px' }}></div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                <button onClick={() => navigate('/events')} className="btn-ghost" style={{ padding: '8px' }}>
                    <ArrowLeft size={20} />
                </button>
                <h2>Control de Asistencia - Evento #{id}</h2>
            </div>

            {/* Mode Switcher */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button 
                    onClick={() => { setMode('camera'); setMessage(null); }} 
                    style={{ flex: 1, padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', borderRadius: '8px', border: '1px solid', borderColor: mode === 'camera' ? '#4F46E5' : '#CBD5E1', backgroundColor: mode === 'camera' ? '#EEF2FF' : 'white', color: mode === 'camera' ? '#4F46E5' : '#475569', cursor: 'pointer', fontWeight: '500' }}
                >
                    <Camera size={20} /> Escáner QR
                </button>
                <button 
                    onClick={() => { setMode('manual'); setMessage(null); }}
                    style={{ flex: 1, padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', borderRadius: '8px', border: '1px solid', borderColor: mode === 'manual' ? '#4F46E5' : '#CBD5E1', backgroundColor: mode === 'manual' ? '#EEF2FF' : 'white', color: mode === 'manual' ? '#4F46E5' : '#475569', cursor: 'pointer', fontWeight: '500' }}
                >
                    <Keyboard size={20} /> Ingreso Manual
                </button>
            </div>

            {/* Message Banner */}
            {message && (
                <div style={{ padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: message.type === 'success' ? '#ECFDF5' : '#FEF2F2', color: message.type === 'success' ? '#047857' : '#B91C1C', border: `1px solid ${message.type === 'success' ? '#A7F3D0' : '#FECACA'}` }}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                    <span style={{ fontWeight: '500' }}>{message.text}</span>
                </div>
            )}

            {/* Camera Mode */}
            {mode === 'camera' && (
                <div className="section-card" style={{ padding: '40px 20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                    
                    <Camera size={48} style={{ color: '#4F46E5', marginBottom: '20px' }} />
                    <h3 style={{ margin: '0 0 10px 0', color: '#1E293B' }}>Escanear Ticket</h3>
                    <p style={{ color: '#64748B', marginBottom: '30px' }}>
                        Toma una foto del código QR o selecciona una imagen de tu galería para registrar la asistencia.
                    </p>
                    
                    <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        style={{ display: 'none' }} 
                    />
                    
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        style={{ padding: '15px 30px', backgroundColor: '#4F46E5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 6px rgba(79, 70, 229, 0.3)' }}
                    >
                        <Camera size={24} />
                        Abrir Cámara / Galería
                    </button>
                </div>
            )}

            {/* Manual Mode */}
            {mode === 'manual' && (
                <div className="section-card" style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                        <input 
                            type="text" 
                            placeholder="Buscar N° ticket, email, nombre o código QR..." 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{ flex: 1, padding: '10px 15px', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                        />
                        <button type="submit" className="btn-primary">Buscar</button>
                    </form>

                    <div className="table-responsive-wrapper">
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#F8FAFC', color: '#475569' }}>
                                    <th style={{ padding: '12px' }}>Ticket</th>
                                    <th style={{ padding: '12px' }}>Cliente</th>
                                    <th style={{ padding: '12px' }}>Estado</th>
                                    <th style={{ padding: '12px', textAlign: 'right' }}>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {searchResults.map(res => (
                                    <tr key={res.ticket_id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                        <td style={{ padding: '12px', fontFamily: 'monospace' }}>
                                            {res.ticket_number}<br/>
                                            <span style={{ fontSize: '0.8rem', color: '#64748B', fontFamily: 'sans-serif' }}>{res.ticket_type_name}</span>
                                        </td>
                                        <td style={{ padding: '12px' }}>{res.first_name} {res.last_name}<br/><span style={{ fontSize: '0.8rem', color: '#64748B' }}>{res.customer_email}</span></td>
                                        <td style={{ padding: '12px' }}>
                                            {res.checked_in_at ? 
                                                <span style={{ color: '#047857', backgroundColor: '#ECFDF5', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '500' }}>Ingresó</span> :
                                                <span style={{ color: '#475569', backgroundColor: '#F1F5F9', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '500' }}>Por Ingresar</span>
                                            }
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'right' }}>
                                            {!res.checked_in_at ? (
                                                <button onClick={() => handleRegisterAttendance(res.ticket_number)} style={{ padding: '6px 12px', backgroundColor: '#10B981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>Dar Ingreso</button>
                                            ) : (
                                                <button onClick={() => handleRemoveAttendance(res.ticket_id)} style={{ padding: '6px 12px', backgroundColor: '#FEE2E2', color: '#B91C1C', border: '1px solid #FCA5A5', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>Revocar</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {searchResults.length === 0 && (
                                    <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#64748B' }}>No se encontraron tickets.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendanceControl;
