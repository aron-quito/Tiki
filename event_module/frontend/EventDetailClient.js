import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { API_URL } from './config';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Tag, ArrowLeft, Clock, CreditCard, ShieldCheck, XCircle } from 'lucide-react';
import { useAuth } from './AuthContext';
const EventDetailClient = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token, isAuthenticated } = useAuth();
    const [event, setEvent] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [selections, setSelections] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    // Checkout State
    const [showCheckout, setShowCheckout] = useState(false);
    const [reservation, setReservation] = useState(null);
    const [timeLeft, setTimeLeft] = useState(60);
    const [isPaying, setIsPaying] = useState(false);
    const timerRef = useRef(null);
    useEffect(() => {
        const fetchDetails = async () => {
            try {
                // 1. Get Event Details
                const resEvent = await fetch(`${API_URL}/get_event_details.php?event_id=${id}`);
                const dataEvent = await resEvent.json();
                if (!resEvent.ok)
                    throw new Error(dataEvent.error);
                setEvent(dataEvent);
                // 2. Get Available Tickets
                const resTix = await fetch(`${API_URL}/get_available_tickets.php?event_id=${id}`);
                const dataTix = await resTix.json();
                if (resTix.ok && dataTix.tickets) {
                    setTickets(dataTix.tickets.filter((t) => t.ticket_type_status === 'active' && t.available_quantity > 0));
                }
            }
            catch (err) {
                setError(err.message || 'Error al cargar evento');
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchDetails();
    }, [id]);
    useEffect(() => {
        if (showCheckout && timeLeft > 0) {
            timerRef.current = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        }
        else if (timeLeft <= 0) {
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
    const handleSelect = (ttId, qty, max) => {
        if (qty < 0)
            qty = 0;
        if (qty > max)
            qty = max;
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
        if (selectedTickets.length === 0)
            return;
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
            }
            else {
                alert(data.error);
            }
        }
        catch (e) {
            alert('Error de conexión');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleConfirmPayment = async () => {
        if (timeLeft <= 0)
            return;
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
            }
            else {
                alert(data.error);
                setShowCheckout(false);
                window.location.reload();
            }
        }
        catch (e) {
            alert('Error al confirmar pago');
        }
        finally {
            setIsPaying(false);
        }
    };
    const handleCancelOrder = async () => {
        if (!reservation)
            return;
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
            }
            else {
                alert(data.error);
            }
        }
        catch (e) {
            alert('Error al cancelar la orden');
        }
    };
    if (isLoading && !event)
        return _jsx("div", { style: { padding: '50px', textAlign: 'center' }, children: "Cargando..." });
    if (error)
        return _jsx("div", { style: { padding: '50px', textAlign: 'center', color: 'red' }, children: error });
    if (!event)
        return null;
    return (_jsxs("div", { style: { backgroundColor: '#F8FAFC', minHeight: '100vh', paddingBottom: '50px' }, children: [_jsx("div", { style: { padding: '15px 40px', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 10 }, children: _jsxs("button", { onClick: () => navigate('/explore'), style: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#64748B', fontWeight: 'bold' }, children: [_jsx(ArrowLeft, { size: 20, style: { marginRight: '5px' } }), " Explorar Eventos"] }) }), _jsx("div", { style: { width: '100%', height: '350px', backgroundImage: `url(${event.banner_image_url || 'https://via.placeholder.com/1200x400?text=Banner'})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }, children: _jsxs("div", { style: { position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', padding: '40px' }, children: [event.event_topic && (_jsx("span", { style: { backgroundColor: '#10B981', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '10px', display: 'inline-block' }, children: event.event_topic })), _jsx("h1", { style: { color: 'white', margin: '0 0 10px 0', fontSize: '2.5rem' }, children: event.title }), _jsxs("div", { style: { display: 'flex', gap: '20px', color: '#CBD5E1' }, children: [_jsxs("span", { style: { display: 'flex', alignItems: 'center' }, children: [_jsx(Calendar, { size: 18, style: { marginRight: '5px' } }), " ", new Date(event.event_date_start).toLocaleString()] }), _jsxs("span", { style: { display: 'flex', alignItems: 'center' }, children: [_jsx(MapPin, { size: 18, style: { marginRight: '5px' } }), " ", event.venue_name, " - ", event.city] })] })] }) }), _jsxs("div", { className: "flex-col-mobile", style: { maxWidth: '1000px', margin: '40px auto', display: 'flex', gap: '30px', padding: '0 20px' }, children: [_jsx("div", { style: { flex: 2 }, children: _jsxs("div", { style: { backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }, children: [_jsx("h2", { style: { margin: '0 0 20px 0', color: '#1E293B', borderBottom: '1px solid #E2E8F0', paddingBottom: '15px' }, children: "Comprar Entradas" }), tickets.length === 0 ? (_jsx("div", { style: { padding: '20px', backgroundColor: '#FEF2F2', color: '#991B1B', borderRadius: '8px' }, children: "No hay entradas disponibles en este momento o el evento est\u00E1 agotado." })) : (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '15px' }, children: tickets.map(t => (_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', border: '1px solid #E2E8F0', borderRadius: '8px' }, children: [_jsxs("div", { children: [_jsx("h4", { style: { margin: '0 0 5px 0', fontSize: '1.1rem', color: '#334155' }, children: t.ticket_type_name }), _jsxs("div", { style: { color: '#10B981', fontWeight: 'bold', fontSize: '1.2rem' }, children: ["$", parseFloat(t.price).toFixed(2), " ", t.currency] }), _jsxs("div", { style: { fontSize: '0.85rem', color: '#64748B', marginTop: '5px' }, children: ["Disponibles: ", t.available_quantity] })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '10px' }, children: [_jsx("button", { onClick: () => handleSelect(t.ticket_type_id, (selections[t.ticket_type_id] || 0) - 1, t.available_quantity), style: { width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #CBD5E1', backgroundColor: 'white', cursor: 'pointer', fontSize: '1.2rem' }, children: "-" }), _jsx("span", { style: { width: '30px', textAlign: 'center', fontWeight: 'bold' }, children: selections[t.ticket_type_id] || 0 }), _jsx("button", { onClick: () => handleSelect(t.ticket_type_id, (selections[t.ticket_type_id] || 0) + 1, Math.min(t.available_quantity, t.max_per_order || 10)), style: { width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #CBD5E1', backgroundColor: 'white', cursor: 'pointer', fontSize: '1.2rem' }, children: "+" })] })] }, t.ticket_type_id))) }))] }) }), _jsx("div", { style: { flex: 1 }, children: _jsxs("div", { style: { backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', position: 'sticky', top: '80px' }, children: [_jsx("h3", { style: { margin: '0 0 20px 0', color: '#1E293B' }, children: "Resumen" }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#475569' }, children: [_jsx("span", { children: "Entradas seleccionadas:" }), _jsx("span", { style: { fontWeight: 'bold' }, children: getTotalQty() })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '1.2rem', color: '#0F172A', fontWeight: 'bold', borderTop: '1px solid #E2E8F0', paddingTop: '15px' }, children: [_jsx("span", { children: "Total a Pagar:" }), _jsxs("span", { children: ["$", getTotalPrice().toFixed(2)] })] }), _jsx("button", { onClick: handleReserve, disabled: getTotalQty() === 0 || isLoading, style: { width: '100%', padding: '14px', backgroundColor: getTotalQty() > 0 ? '#4F46E5' : '#94A3B8', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: getTotalQty() > 0 && !isLoading ? 'pointer' : 'not-allowed', transition: 'background 0.3s' }, children: isLoading ? 'Procesando...' : 'Reservar y Pagar' })] }) })] }), showCheckout && (_jsx("div", { style: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }, children: _jsxs("div", { style: { backgroundColor: 'white', padding: '40px', borderRadius: '16px', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }, children: [_jsxs("div", { style: { textAlign: 'center', marginBottom: '30px' }, children: [_jsx("div", { style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#FEF2F2', color: '#EF4444', marginBottom: '15px' }, children: _jsx(Clock, { size: 30 }) }), _jsx("h2", { style: { margin: '0 0 10px 0', color: '#1E293B' }, children: "Completa tu Pago" }), _jsx("p", { style: { color: '#64748B', margin: 0 }, children: "Tus entradas est\u00E1n reservadas por 1 minuto." })] }), _jsxs("div", { style: { backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '20px', textAlign: 'center', marginBottom: '25px' }, children: [_jsxs("div", { style: { fontSize: '3rem', fontWeight: 'bold', color: timeLeft <= 15 ? '#EF4444' : '#10B981', fontVariantNumeric: 'tabular-nums' }, children: ["00:", timeLeft < 10 ? `0${timeLeft}` : timeLeft] }), _jsx("div", { style: { color: '#64748B', fontSize: '0.9rem', marginTop: '5px' }, children: "Tiempo restante para pagar" })] }), _jsxs("div", { style: { border: '1px solid #E2E8F0', borderRadius: '8px', padding: '15px', marginBottom: '25px' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }, children: [_jsx("span", { style: { color: '#475569' }, children: "Orden #:" }), _jsx("span", { style: { fontWeight: 'bold', color: '#0F172A' }, children: reservation?.order_number })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #CBD5E1', paddingTop: '10px' }, children: [_jsx("span", { style: { color: '#475569' }, children: "Total a pagar:" }), _jsxs("span", { style: { fontWeight: 'bold', color: '#10B981', fontSize: '1.2rem' }, children: ["$", reservation?.total_amount] })] })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#F0FDF4', padding: '12px', borderRadius: '8px', color: '#166534', fontSize: '0.85rem', marginBottom: '25px' }, children: [_jsx(ShieldCheck, { size: 20 }), _jsx("span", { children: "Pasarela de Pago Simulada Segura. Haz clic en pagar para confirmar." })] }), _jsxs("div", { style: { display: 'flex', gap: '12px' }, children: [_jsxs("button", { onClick: handleCancelOrder, disabled: isPaying, style: { flex: 1, padding: '16px', backgroundColor: 'white', color: '#DC2626', border: '2px solid #FCA5A5', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: isPaying ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.2s' }, children: [_jsx(XCircle, { size: 20 }), "Cancelar"] }), _jsxs("button", { onClick: handleConfirmPayment, disabled: isPaying || timeLeft <= 0, style: { flex: 2, padding: '16px', backgroundColor: '#4F46E5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: (isPaying || timeLeft <= 0) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }, children: [_jsx(CreditCard, { size: 20 }), isPaying ? 'Procesando...' : `Pagar $${reservation?.total_amount}`] })] })] }) }))] }));
};
export default EventDetailClient;
//# sourceMappingURL=EventDetailClient.js.map