import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { API_URL } from './config';
import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Users, Activity, ClipboardCheck } from 'lucide-react';
import './EventList.css';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
const EventList = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useAuth();
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch(`${API_URL}/get_events.php`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || 'Error fetching events');
                }
                setEvents(data.events || []);
            }
            catch (err) {
                setError(err.message);
            }
            finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, [token]);
    const formatDate = (dateString) => {
        const options = {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    };
    const getStatusBadge = (status) => {
        switch (status) {
            case 'published': return _jsx("span", { className: "badge badge-success", children: "Publicado" });
            case 'draft': return _jsx("span", { className: "badge badge-warning", children: "Borrador" });
            case 'cancelled': return _jsx("span", { className: "badge badge-danger", children: "Cancelado" });
            case 'completed': return _jsx("span", { className: "badge badge-info", style: { backgroundColor: '#E0F2FE', color: '#0369A1' }, children: "Finalizado" });
            default: return _jsx("span", { className: "badge", children: status });
        }
    };
    if (loading)
        return _jsx("div", { className: "loading-state", children: "Cargando eventos..." });
    if (error)
        return _jsxs("div", { className: "error-state", children: ["Error: ", error] });
    const activeEvents = events.filter(e => e.status !== 'completed' && e.status !== 'cancelled');
    const pastEvents = events.filter(e => e.status === 'completed' || e.status === 'cancelled');
    return (_jsxs("div", { className: "event-list-container", children: [_jsxs("div", { className: "list-header", children: [_jsx("h2", { children: "Todos los Eventos" }), _jsx(Link, { to: "/events/new", className: "btn-primary", children: "Crear Evento" })] }), events.length === 0 ? (_jsxs("div", { className: "empty-state", children: [_jsx(Calendar, { size: 48, color: "#CBD5E1" }), _jsx("h3", { children: "No hay eventos creados" }), _jsx("p", { children: "A\u00FAn no has creado ning\u00FAn evento. Comienza creando tu primer evento empresarial." })] })) : (_jsxs(_Fragment, { children: [_jsx("h3", { style: { marginTop: '20px', marginBottom: '15px', color: '#1E293B' }, children: "Eventos Activos" }), _jsxs("div", { className: "events-grid", children: [activeEvents.map(event => (_jsxs("div", { className: "event-card", children: [_jsxs("div", { className: "event-card-header", children: [_jsx("h3", { children: event.title }), getStatusBadge(event.status)] }), _jsxs("div", { className: "event-card-body", children: [_jsxs("div", { className: "event-detail", children: [_jsx(Calendar, { size: 16 }), _jsx("span", { children: formatDate(event.event_date_start) })] }), _jsxs("div", { className: "event-detail", children: [_jsx(MapPin, { size: 16 }), _jsx("span", { children: event.venue_name ? `${event.venue_name}, ${event.city}` : 'Ubicación por definir' })] }), _jsxs("div", { className: "event-detail", children: [_jsx(Users, { size: 16 }), _jsxs("span", { children: ["Aforo: ", event.total_capacity || 0, " personas"] })] })] }), _jsxs("div", { className: "event-card-footer", children: [_jsxs(Link, { to: `/events/${event.event_id}/attendance`, className: "btn-ghost", style: { display: 'flex', alignItems: 'center', gap: '5px' }, children: [_jsx(ClipboardCheck, { size: 16 }), " Asistencia"] }), _jsx(Link, { to: `/events/edit/${event.event_id}`, className: "btn-ghost", children: event.status === 'draft' ? 'Continuar Editando' : 'Ver Detalles' })] })] }, event.event_id))), activeEvents.length === 0 && _jsx("p", { style: { color: '#64748B' }, children: "No hay eventos activos." })] }), pastEvents.length > 0 && (_jsxs(_Fragment, { children: [_jsx("h3", { style: { marginTop: '40px', marginBottom: '15px', color: '#1E293B' }, children: "Eventos Finalizados o Cancelados" }), _jsx("div", { className: "events-grid", style: { opacity: 0.8 }, children: pastEvents.map(event => (_jsxs("div", { className: "event-card", children: [_jsxs("div", { className: "event-card-header", children: [_jsx("h3", { children: event.title }), getStatusBadge(event.status)] }), _jsxs("div", { className: "event-card-body", children: [_jsxs("div", { className: "event-detail", children: [_jsx(Calendar, { size: 16 }), _jsx("span", { children: formatDate(event.event_date_start) })] }), _jsxs("div", { className: "event-detail", children: [_jsx(MapPin, { size: 16 }), _jsx("span", { children: event.venue_name ? `${event.venue_name}, ${event.city}` : 'Ubicación por definir' })] }), _jsxs("div", { className: "event-detail", children: [_jsx(Users, { size: 16 }), _jsxs("span", { children: ["Aforo: ", event.total_capacity || 0, " personas"] })] })] }), _jsx("div", { className: "event-card-footer", children: _jsx(Link, { to: `/events/edit/${event.event_id}`, className: "btn-ghost", children: "Ver Detalles" }) })] }, event.event_id))) })] }))] }))] }));
};
export default EventList;
//# sourceMappingURL=EventList.js.map