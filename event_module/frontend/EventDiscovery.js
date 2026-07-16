import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { API_URL } from './config';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, MapPin, Tag } from 'lucide-react';
import { useAuth } from './AuthContext';
const EventDiscovery = () => {
    const [events, setEvents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [topicFilter, setTopicFilter] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { logout } = useAuth();
    const fetchEvents = async () => {
        setIsLoading(true);
        try {
            let url = `${API_URL}/get_public_events.php?`;
            if (searchQuery)
                url += `q=${encodeURIComponent(searchQuery)}&`;
            if (topicFilter)
                url += `topic=${encodeURIComponent(topicFilter)}`;
            const res = await fetch(url);
            const data = await res.json();
            if (res.ok) {
                setEvents(data.events || []);
            }
        }
        catch (e) {
            console.error(e);
        }
        finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        fetchEvents();
    }, [topicFilter]);
    const handleSearch = (e) => {
        e.preventDefault();
        fetchEvents();
    };
    return (_jsxs("div", { style: { minHeight: '100vh', backgroundColor: '#F8FAFC' }, children: [_jsxs("header", { style: { backgroundColor: 'white', padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 100, flexWrap: 'wrap', gap: '15px' }, children: [_jsx("h1", { style: { color: '#4F46E5', margin: 0, fontSize: '1.5rem', cursor: 'pointer' }, onClick: () => navigate('/explore'), children: "Tiki Events" }), _jsxs("nav", { style: { display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }, children: [_jsx("button", { onClick: () => navigate('/my-tickets'), style: { background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontWeight: '500' }, children: "Mis Entradas" }), _jsx("button", { onClick: () => navigate('/profile'), style: { background: 'none', border: 'none', cursor: 'pointer', color: '#4F46E5', fontWeight: 'bold' }, children: "Mi Perfil" }), _jsx("button", { onClick: () => { logout(); navigate('/login'); }, style: { background: '#F1F5F9', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', color: '#475569', fontWeight: 'bold' }, children: "Cerrar Sesi\u00F3n" })] })] }), _jsxs("div", { style: { background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', padding: '60px 20px', textAlign: 'center', color: 'white' }, children: [_jsx("h2", { style: { fontSize: '2.5rem', marginBottom: '20px' }, children: "Encuentra tu pr\u00F3ximo evento favorito" }), _jsxs("form", { onSubmit: handleSearch, style: { display: 'flex', maxWidth: '600px', margin: '0 auto', gap: '10px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px', backdropFilter: 'blur(10px)' }, children: [_jsxs("div", { style: { flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }, children: [_jsx(Search, { size: 20, style: { position: 'absolute', left: '15px', color: '#94A3B8' } }), _jsx("input", { type: "text", placeholder: "Buscar eventos, lugares, ciudades...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), style: { width: '100%', padding: '12px 12px 12px 45px', border: 'none', borderRadius: '8px', fontSize: '1rem' } })] }), _jsx("button", { type: "submit", style: { padding: '0 25px', backgroundColor: '#10B981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }, children: "Buscar" })] }), _jsx("div", { style: { marginTop: '30px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }, children: ['Música', 'Tecnología', 'Negocios', 'Arte y Teatro', 'Deportes'].map(t => (_jsx("button", { onClick: () => setTopicFilter(t === topicFilter ? '' : t), style: {
                                padding: '8px 16px',
                                borderRadius: '20px',
                                border: '1px solid rgba(255,255,255,0.3)',
                                backgroundColor: topicFilter === t ? 'white' : 'transparent',
                                color: topicFilter === t ? '#4F46E5' : 'white',
                                cursor: 'pointer',
                                fontWeight: '500',
                                transition: 'all 0.2s'
                            }, children: t }, t))) })] }), _jsxs("div", { style: { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }, children: [_jsxs("h3", { style: { fontSize: '1.5rem', color: '#1E293B', marginBottom: '25px' }, children: ["Eventos Destacados ", topicFilter && `en ${topicFilter}`] }), isLoading ? (_jsx("div", { style: { textAlign: 'center', padding: '50px', color: '#64748B' }, children: "Cargando eventos..." })) : events.length === 0 ? (_jsx("div", { style: { textAlign: 'center', padding: '50px', backgroundColor: 'white', borderRadius: '12px', color: '#64748B' }, children: "No se encontraron eventos para esta b\u00FAsqueda." })) : (_jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }, children: events.map(ev => (_jsxs("div", { onClick: () => navigate(`/event/${ev.event_id}`), style: {
                                backgroundColor: 'white',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                            }, onMouseEnter: (e) => e.currentTarget.style.transform = 'translateY(-5px)', onMouseLeave: (e) => e.currentTarget.style.transform = 'translateY(0)', children: [_jsx("div", { style: { height: '180px', backgroundColor: '#E2E8F0', backgroundImage: `url(${ev.cover_image_url || 'https://via.placeholder.com/400x200?text=Sin+Imagen'})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }, children: ev.event_topic && (_jsxs("span", { style: { position: 'absolute', top: '15px', right: '15px', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }, children: [_jsx(Tag, { size: 12, style: { marginRight: '5px', verticalAlign: 'middle' } }), ev.event_topic] })) }), _jsxs("div", { style: { padding: '20px' }, children: [_jsx("h4", { style: { margin: '0 0 10px 0', fontSize: '1.25rem', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }, children: ev.title }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', color: '#64748B', marginBottom: '8px', fontSize: '0.9rem' }, children: [_jsx(Calendar, { size: 16, style: { marginRight: '8px' } }), new Date(ev.event_date_start).toLocaleDateString('es-ES', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', color: '#64748B', fontSize: '0.9rem' }, children: [_jsx(MapPin, { size: 16, style: { marginRight: '8px' } }), ev.city, " ", ev.venue_name ? `- ${ev.venue_name}` : ''] })] })] }, ev.event_id))) }))] })] }));
};
export default EventDiscovery;
//# sourceMappingURL=EventDiscovery.js.map