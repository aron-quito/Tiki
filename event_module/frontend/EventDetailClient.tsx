import { API_URL } from './config';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Tag, ArrowLeft, Clock, CreditCard, ShieldCheck, XCircle } from 'lucide-react';
import { useAuth } from './AuthContext';

const EventDetailClient: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token, isAuthenticated } = useAuth();
    
    const [event, setEvent] = useState<any>(null);
    const [tickets, setTickets] = useState<any[]>([]);
    const [selections, setSelections] = useState<Record<number, number>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Checkout State
    const [showCheckout, setShowCheckout] = useState(false);
    const [reservation, setReservation] = useState<any>(null);
    const [timeLeft, setTimeLeft] = useState(60);
    const [isPaying, setIsPaying] = useState(false);
    
    const timerRef = useRef<any>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                // 1. Get Event Details
                const resEvent = await fetch(`${API_URL}/get_event_details.php?event_id=${id}`);
                const dataEvent = await resEvent.json();
                
                if (!resEvent.ok) throw new Error(dataEvent.error);
                setEvent(dataEvent);
                
                // 2. Get Available Tickets
                const resTix = await fetch(`${API_URL}/get_available_tickets.php?event_id=${id}`);
                const dataTix = await resTix.json();
                
                if (resTix.ok && dataTix.tickets) {
                    setTickets(dataTix.tickets.filter((t: any) => t.ticket_type_status === 'active' && t.available_quantity > 0));
                }
            } catch (err: any) {
                setError(err.message || 'Error al cargar evento');
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    useEffect(() => {
        if (showCheckout && timeLeft > 0) {
            timerRef.current = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (timeLeft <= 0) {
            clearInterval(timerRef.current);
            if (showCheckout && !isPaying) {
                // Auto expire
                alert("El tiempo de reserva ha expirado. Las entradas han sido liberadas.");
                setShowCheckout(false);
                setReservation(null);
                // Refresh availability
                window.location.reload(); 
            }
        }
        return () => clearInterval(timerRef.current);
    }, [showCheckout, timeLeft, isPaying]);

    const handleSelect = (ttId: number, qty: number, max: number) => {
        if (qty < 0) qty = 0;
        if (qty > max) qty = max;
        setSelections(prev => ({ ...prev, [ttId]: qty }));
    };

    const getTotalQty = () => Object.values(selections).reduce((a, b) => a + b, 0);
    
    const getTotalPrice = () => {
        let total = 0;
        tickets.forEach(t => {
            total += (selections[t.ticket_type_id] || 0) * t.price;
        });
        return total;
    };

    const handleReserve = async () => {
        if (!isAuthenticated) {
            alert("Debes iniciar sesión para comprar entradas.");
            navigate('/login');
            return;
        }
        
        const selectedTickets = Object.keys(selections)
            .filter(k => (selections[Number(k)] || 0) > 0)
            .map(k => ({ ticket_type_id: Number(k), quantity: (selections[Number(k)] || 0) }));
            
        if (selectedTickets.length === 0) return;
        
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/reserve_tickets.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ event_id: id, tickets: selectedTickets })
            });
            const data = await res.json();
            if (res.ok) {
                setReservation(data);
                setTimeLeft(60); // 1 minute
                setShowCheckout(true);
            } else {
                alert(data.error);
            }
        } catch (e) {
            alert('Error de conexión');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleConfirmPayment = async () => {
        if (timeLeft <= 0) return;
        
        setIsPaying(true);
        try {
            const res = await fetch(`${API_URL}/confirm_purchase.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ order_id: reservation.order_id })
            });
            const data = await res.json();
            if (res.ok) {
                alert("¡Compra exitosa! Revisa tus entradas en 'Mis Entradas'.");
                navigate('/my-tickets');
            } else {
                alert(data.error);
                setShowCheckout(false);
                window.location.reload();
            }
        } catch (e) {
            alert('Error al confirmar pago');
        } finally {
            setIsPaying(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!reservation) return;
        
        try {
            const res = await fetch(`${API_URL}/cancel_order.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ order_id: reservation.order_id })
            });
            const data = await res.json();
            if (res.ok) {
                clearInterval(timerRef.current);
                setShowCheckout(false);
                setReservation(null);
                setSelections({});
            } else {
                alert(data.error);
            }
        } catch (e) {
            alert('Error al cancelar la orden');
        }
    };

    if (isLoading && !event) return <div style={{ padding: '50px', textAlign: 'center' }}>Cargando...</div>;
    if (error) return <div style={{ padding: '50px', textAlign: 'center', color: 'red' }}>{error}</div>;
    if (!event) return null;

    return (
        <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', paddingBottom: '50px' }}>
            {/* Nav */}
            <div style={{ padding: '15px 40px', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 10 }}>
                <button onClick={() => navigate('/explore')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#64748B', fontWeight: 'bold' }}>
                    <ArrowLeft size={20} style={{ marginRight: '5px' }} /> Explorar Eventos
                </button>
            </div>

            {/* Banner */}
            <div style={{ width: '100%', height: '350px', backgroundImage: `url(${event.banner_image_url || 'https://via.placeholder.com/1200x400?text=Banner'})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', padding: '40px' }}>
                    {event.event_topic && (
                        <span style={{ backgroundColor: '#10B981', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '10px', display: 'inline-block' }}>{event.event_topic}</span>
                    )}
                    <h1 style={{ color: 'white', margin: '0 0 10px 0', fontSize: '2.5rem' }}>{event.title}</h1>
                    <div style={{ display: 'flex', gap: '20px', color: '#CBD5E1' }}>
                        <span style={{ display: 'flex', alignItems: 'center' }}><Calendar size={18} style={{ marginRight: '5px' }} /> {new Date(event.event_date_start).toLocaleString()}</span>
                        <span style={{ display: 'flex', alignItems: 'center' }}><MapPin size={18} style={{ marginRight: '5px' }} /> {event.venue_name} - {event.city}</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-col-mobile" style={{ maxWidth: '1000px', margin: '40px auto', display: 'flex', gap: '30px', padding: '0 20px' }}>
                {/* Tickets Selection */}
                <div style={{ flex: 2 }}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ margin: '0 0 20px 0', color: '#1E293B', borderBottom: '1px solid #E2E8F0', paddingBottom: '15px' }}>Comprar Entradas</h2>
                        
                        {tickets.length === 0 ? (
                            <div style={{ padding: '20px', backgroundColor: '#FEF2F2', color: '#991B1B', borderRadius: '8px' }}>No hay entradas disponibles en este momento o el evento está agotado.</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {tickets.map(t => (
                                    <div key={t.ticket_type_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                                        <div>
                                            <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: '#334155' }}>{t.ticket_type_name}</h4>
                                            <div style={{ color: '#10B981', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                                ${parseFloat(t.price).toFixed(2)} {t.currency}
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '5px' }}>Disponibles: {t.available_quantity}</div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <button 
                                                onClick={() => handleSelect(t.ticket_type_id, (selections[t.ticket_type_id] || 0) - 1, t.available_quantity)}
                                                style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #CBD5E1', backgroundColor: 'white', cursor: 'pointer', fontSize: '1.2rem' }}
                                            >-</button>
                                            <span style={{ width: '30px', textAlign: 'center', fontWeight: 'bold' }}>{selections[t.ticket_type_id] || 0}</span>
                                            <button 
                                                onClick={() => handleSelect(t.ticket_type_id, (selections[t.ticket_type_id] || 0) + 1, Math.min(t.available_quantity, t.max_per_order || 10))}
                                                style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #CBD5E1', backgroundColor: 'white', cursor: 'pointer', fontSize: '1.2rem' }}
                                            >+</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div style={{ flex: 1 }}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', position: 'sticky', top: '80px' }}>
                        <h3 style={{ margin: '0 0 20px 0', color: '#1E293B' }}>Resumen</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#475569' }}>
                            <span>Entradas seleccionadas:</span>
                            <span style={{ fontWeight: 'bold' }}>{getTotalQty()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '1.2rem', color: '#0F172A', fontWeight: 'bold', borderTop: '1px solid #E2E8F0', paddingTop: '15px' }}>
                            <span>Total a Pagar:</span>
                            <span>${getTotalPrice().toFixed(2)}</span>
                        </div>
                        
                        <button 
                            onClick={handleReserve}
                            disabled={getTotalQty() === 0 || isLoading}
                            style={{ width: '100%', padding: '14px', backgroundColor: getTotalQty() > 0 ? '#4F46E5' : '#94A3B8', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: getTotalQty() > 0 && !isLoading ? 'pointer' : 'not-allowed', transition: 'background 0.3s' }}
                        >
                            {isLoading ? 'Procesando...' : 'Reservar y Pagar'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Checkout Modal (Pasarela Simulada) */}
            {showCheckout && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
                    <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '16px', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        
                        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#FEF2F2', color: '#EF4444', marginBottom: '15px' }}>
                                <Clock size={30} />
                            </div>
                            <h2 style={{ margin: '0 0 10px 0', color: '#1E293B' }}>Completa tu Pago</h2>
                            <p style={{ color: '#64748B', margin: 0 }}>Tus entradas están reservadas por 1 minuto.</p>
                        </div>
                        
                        <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '20px', textAlign: 'center', marginBottom: '25px' }}>
                            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: timeLeft <= 15 ? '#EF4444' : '#10B981', fontVariantNumeric: 'tabular-nums' }}>
                                00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                            </div>
                            <div style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '5px' }}>Tiempo restante para pagar</div>
                        </div>

                        <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '15px', marginBottom: '25px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span style={{ color: '#475569' }}>Orden #:</span>
                                <span style={{ fontWeight: 'bold', color: '#0F172A' }}>{reservation?.order_number}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #CBD5E1', paddingTop: '10px' }}>
                                <span style={{ color: '#475569' }}>Total a pagar:</span>
                                <span style={{ fontWeight: 'bold', color: '#10B981', fontSize: '1.2rem' }}>${reservation?.total_amount}</span>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#F0FDF4', padding: '12px', borderRadius: '8px', color: '#166534', fontSize: '0.85rem', marginBottom: '25px' }}>
                            <ShieldCheck size={20} />
                            <span>Pasarela de Pago Simulada Segura. Haz clic en pagar para confirmar.</span>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button 
                                onClick={handleCancelOrder}
                                disabled={isPaying}
                                style={{ flex: 1, padding: '16px', backgroundColor: 'white', color: '#DC2626', border: '2px solid #FCA5A5', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: isPaying ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.2s' }}
                            >
                                <XCircle size={20} />
                                Cancelar
                            </button>
                            <button 
                                onClick={handleConfirmPayment}
                                disabled={isPaying || timeLeft <= 0}
                                style={{ flex: 2, padding: '16px', backgroundColor: '#4F46E5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: (isPaying || timeLeft <= 0) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                            >
                                <CreditCard size={20} />
                                {isPaying ? 'Procesando...' : `Pagar $${reservation?.total_amount}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventDetailClient;
