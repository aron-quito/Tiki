import { API_URL } from './config';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { ArrowLeft, Calendar, MapPin, Ticket } from 'lucide-react';
// @ts-ignore
import { QRCodeSVG } from 'qrcode.react';
const MyTickets: React.FC = () => {
    const [tickets, setTickets] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    const { token, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const res = await fetch(`${API_URL}/get_my_tickets.php`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                
                if (res.ok) {
                    setTickets(data.tickets || []);
                } else {
                    setError(data.error);
                }
            } catch (err: any) {
                setError('Error al cargar mis entradas');
            } finally {
                setIsLoading(false);
            }
        };
        fetchTickets();
    }, [token]);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
            <header style={{ backgroundColor: 'white', padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 100, flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button onClick={() => navigate('/explore')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#64748B', fontWeight: 'bold' }}>
                        <ArrowLeft size={20} style={{ marginRight: '5px' }} /> Explorar
                    </button>
                    <h1 style={{ color: '#4F46E5', margin: 0, fontSize: '1.5rem' }}>Mis Entradas</h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                    <button onClick={() => navigate('/profile')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#4F46E5', fontWeight: 'bold' }}>Mi Perfil</button>
                    <button onClick={() => { logout(); navigate('/login'); }} style={{ background: '#F1F5F9', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', color: '#475569', fontWeight: 'bold' }}>Cerrar Sesión</button>
                </div>
            </header>

            <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '50px', color: '#64748B' }}>Cargando tus entradas...</div>
                ) : error ? (
                    <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>{error}</div>
                ) : tickets.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '50px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <Ticket size={48} style={{ color: '#CBD5E1', marginBottom: '20px' }} />
                        <h3 style={{ color: '#1E293B', margin: '0 0 10px 0' }}>Aún no tienes entradas</h3>
                        <p style={{ color: '#64748B', marginBottom: '20px' }}>Descubre eventos increíbles y asegura tu lugar.</p>
                        <button onClick={() => navigate('/explore')} style={{ padding: '10px 20px', backgroundColor: '#4F46E5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Explorar Eventos</button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px' }}>
                        {tickets.map(t => (
                            <div key={t.ticket_id} style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ height: '120px', backgroundImage: `url(${t.cover_image_url || 'https://via.placeholder.com/400x150?text=Tiki'})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}></div>
                                    <h3 style={{ position: 'absolute', bottom: '15px', left: '20px', margin: 0, color: 'white', fontSize: '1.2rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{t.event_title}</h3>
                                </div>
                                
                                <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px dashed #E2E8F0' }}>
                                    <div>
                                        <div style={{ color: '#10B981', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '5px' }}>{t.ticket_type_name}</div>
                                        <div style={{ color: '#64748B', fontSize: '0.85rem' }}>Orden: {t.order_number}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>${t.price}</div>
                                    </div>
                                </div>
                                
                                <div className="flex-col-mobile" style={{ padding: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                                    <div style={{ flex: 1, width: '100%' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', color: '#475569', marginBottom: '10px', fontSize: '0.9rem' }}>
                                            <Calendar size={16} style={{ marginRight: '8px', color: '#4F46E5' }} />
                                            {new Date(t.event_date_start).toLocaleString()}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', color: '#475569', fontSize: '0.9rem', marginBottom: '15px' }}>
                                            <MapPin size={16} style={{ marginRight: '8px', color: '#4F46E5' }} />
                                            {t.city} {t.venue_name ? `- ${t.venue_name}` : ''}
                                        </div>
                                        <div style={{ backgroundColor: '#F1F5F9', padding: '10px', borderRadius: '6px', textAlign: 'center', fontSize: '0.8rem', color: '#64748B', fontFamily: 'monospace' }}>
                                            ID: {t.ticket_number}
                                        </div>
                                    </div>
                                    
                                    <div style={{ backgroundColor: '#F8FAFC', padding: '10px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', alignItems: 'center', width: 'fit-content' }}>
                                        <QRCodeSVG value={t.qr_code} size={100} />
                                        <span style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '8px' }}>Escanear ingreso</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyTickets;
