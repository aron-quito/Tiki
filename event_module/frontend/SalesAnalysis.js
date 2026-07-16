import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { API_URL } from './config';
import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { BarChart2, Search, Calendar, Users, DollarSign } from 'lucide-react';
import './DashboardOverview.css'; // Reutilizamos estilos
const SalesAnalysis = () => {
    const { token } = useAuth();
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState('');
    const [analysisData, setAnalysisData] = useState(null);
    const [loading, setLoading] = useState(false);
    // Búsqueda
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    // 1. Obtener lista de eventos
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await fetch(`${API_URL}/get_events.php`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok && data.events) {
                    setEvents(data.events);
                    if (data.events.length > 0) {
                        setSelectedEventId(data.events[0].event_id.toString());
                    }
                }
            }
            catch (err) {
                console.error("Error al obtener eventos", err);
            }
        };
        fetchEvents();
    }, [token]);
    // 2. Obtener análisis del evento seleccionado
    useEffect(() => {
        if (!selectedEventId)
            return;
        const fetchAnalysis = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_URL}/get_sales_analysis.php?event_id=${selectedEventId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok) {
                    setAnalysisData(data);
                }
            }
            catch (err) {
                console.error("Error al obtener análisis", err);
            }
            finally {
                setLoading(false);
            }
        };
        fetchAnalysis();
        setSearchQuery('');
        // Cargar lista por defecto (últimos 10)
        handleSearch(undefined, '');
    }, [selectedEventId, token]);
    // 3. Buscar tickets
    const handleSearch = async (e, customQuery) => {
        if (e)
            e.preventDefault();
        if (!selectedEventId)
            return;
        const q = customQuery !== undefined ? customQuery : searchQuery;
        setSearching(true);
        try {
            const res = await fetch(`${API_URL}/search_ticket.php?event_id=${selectedEventId}&q=${encodeURIComponent(q)}`, {
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
        finally {
            setSearching(false);
        }
    };
    return (_jsxs("div", { className: "overview-container", style: { padding: '20px' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }, children: [_jsx("h2", { children: "An\u00E1lisis de Ventas" }), _jsxs("select", { value: selectedEventId, onChange: e => setSelectedEventId(e.target.value), style: { padding: '10px', borderRadius: '4px', border: '1px solid #CBD5E1', minWidth: '250px' }, children: [events.length === 0 ? _jsx("option", { value: "", children: "No hay eventos disponibles" }) : null, events.map(ev => (_jsx("option", { value: ev.event_id, children: ev.title }, ev.event_id)))] })] }), loading && _jsx("div", { className: "loading-state", children: "Cargando datos del evento..." }), !loading && analysisData && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "stats-grid", style: { marginBottom: '30px' }, children: [_jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "stat-icon-wrapper", style: { backgroundColor: '#ECFDF5', color: '#10B981' }, children: _jsx(DollarSign, { size: 24 }) }), _jsxs("div", { className: "stat-content", children: [_jsx("p", { className: "stat-label", children: "Recaudaci\u00F3n Total" }), _jsxs("h3", { className: "stat-value", children: ["$", analysisData.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })] })] })] }), _jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "stat-icon-wrapper", style: { backgroundColor: '#FFFBEB', color: '#F59E0B' }, children: _jsx(Users, { size: 24 }) }), _jsxs("div", { className: "stat-content", children: [_jsx("p", { className: "stat-label", children: "Asistencia Real (Checked In)" }), _jsxs("h3", { className: "stat-value", children: [analysisData.total_checked_in, " / ", analysisData.total_sold] })] })] }), _jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "stat-icon-wrapper", style: { backgroundColor: '#EEF2FF', color: '#4F46E5' }, children: _jsx(BarChart2, { size: 24 }) }), _jsxs("div", { className: "stat-content", children: [_jsx("p", { className: "stat-label", children: "Tickets Vendidos (Total)" }), _jsxs("h3", { className: "stat-value", children: [analysisData.total_sold, " / ", analysisData.total_capacity] })] })] })] }), _jsxs("div", { className: "section-card", style: { marginBottom: '30px', padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }, children: [_jsx("h3", { style: { marginBottom: '20px', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }, children: "Ventas por Tipo de Ticket" }), _jsx("div", { className: "table-responsive-wrapper", children: _jsxs("table", { style: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' }, children: [_jsx("thead", { children: _jsxs("tr", { style: { backgroundColor: '#F8FAFC', color: '#475569' }, children: [_jsx("th", { style: { padding: '12px' }, children: "Tipo de Ticket" }), _jsx("th", { style: { padding: '12px' }, children: "Precio" }), _jsx("th", { style: { padding: '12px' }, children: "Vendidos / Aforo" }), _jsx("th", { style: { padding: '12px' }, children: "Asistencia" }), _jsx("th", { style: { padding: '12px' }, children: "Progreso de Venta" }), _jsx("th", { style: { padding: '12px' }, children: "Recaudado" })] }) }), _jsxs("tbody", { children: [analysisData.ticket_types.map(tt => {
                                                    const percent = tt.quantity_total > 0 ? (tt.quantity_sold / tt.quantity_total) * 100 : 0;
                                                    return (_jsxs("tr", { style: { borderBottom: '1px solid #F1F5F9' }, children: [_jsx("td", { style: { padding: '12px', fontWeight: '500' }, children: tt.ticket_type_name }), _jsxs("td", { style: { padding: '12px' }, children: ["$", parseFloat(tt.price).toFixed(2)] }), _jsxs("td", { style: { padding: '12px' }, children: [tt.quantity_sold, " / ", tt.quantity_total > 0 ? tt.quantity_total : '∞'] }), _jsxs("td", { style: { padding: '12px', minWidth: '100px' }, children: [_jsx("span", { style: { color: '#10B981', fontWeight: '500' }, children: tt.quantity_checked_in }), " / ", tt.quantity_sold] }), _jsx("td", { style: { padding: '12px', minWidth: '150px' }, children: _jsx("div", { style: { width: '100%', backgroundColor: '#E2E8F0', borderRadius: '4px', height: '6px' }, children: _jsx("div", { style: { width: `${percent}%`, backgroundColor: percent >= 100 ? '#10B981' : '#4F46E5', height: '100%', borderRadius: '4px' } }) }) }), _jsxs("td", { style: { padding: '12px', fontWeight: '600', color: '#10B981' }, children: ["$", parseFloat(tt.revenue).toFixed(2)] })] }, tt.ticket_type_id));
                                                }), analysisData.ticket_types.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 5, style: { padding: '20px', textAlign: 'center' }, children: "No hay tipos de tickets configurados" }) }))] })] }) })] }), _jsxs("div", { className: "section-card", style: { padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }, children: [_jsx("h3", { style: { marginBottom: '20px' }, children: "Buscador de Compradores" }), _jsxs("form", { onSubmit: handleSearch, style: { display: 'flex', gap: '10px', marginBottom: '20px' }, children: [_jsxs("div", { style: { flex: 1, position: 'relative' }, children: [_jsx(Search, { size: 18, style: { position: 'absolute', left: '10px', top: '10px', color: '#94A3B8' } }), _jsx("input", { type: "text", placeholder: "Buscar por correo, nombre, N\u00B0 de ticket u orden...", value: searchQuery, onChange: e => setSearchQuery(e.target.value), style: { width: '100%', padding: '10px 10px 10px 35px', borderRadius: '4px', border: '1px solid #CBD5E1' } })] }), _jsx("button", { type: "submit", disabled: searching, style: { padding: '10px 20px', backgroundColor: '#4F46E5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }, children: searching ? 'Buscando...' : 'Buscar' })] }), searchResults.length > 0 && (_jsx("div", { className: "table-responsive-wrapper", children: _jsxs("table", { style: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }, children: [_jsx("thead", { children: _jsxs("tr", { style: { backgroundColor: '#F8FAFC', color: '#475569' }, children: [_jsx("th", { style: { padding: '10px' }, children: "Cliente" }), _jsx("th", { style: { padding: '10px' }, children: "Email" }), _jsx("th", { style: { padding: '10px' }, children: "Ticket" }), _jsx("th", { style: { padding: '10px' }, children: "Tipo" }), _jsx("th", { style: { padding: '10px' }, children: "Estado" })] }) }), _jsx("tbody", { children: searchResults.map((res, i) => (_jsxs("tr", { style: { borderBottom: '1px solid #F1F5F9' }, children: [_jsxs("td", { style: { padding: '10px' }, children: [res.first_name, " ", res.last_name] }), _jsx("td", { style: { padding: '10px' }, children: res.customer_email }), _jsx("td", { style: { padding: '10px', fontFamily: 'monospace' }, children: res.ticket_number }), _jsx("td", { style: { padding: '10px' }, children: res.ticket_type_name }), _jsx("td", { style: { padding: '10px' }, children: _jsx("span", { style: {
                                                                padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem',
                                                                backgroundColor: res.tickets_status === 'valid' ? '#DCFCE7' : '#F1F5F9',
                                                                color: res.tickets_status === 'valid' ? '#166534' : '#475569'
                                                            }, children: res.tickets_status.toUpperCase() }) })] }, i))) })] }) })), searchResults.length === 0 && searchQuery !== '' && !searching && (_jsx("p", { style: { color: '#64748B', textAlign: 'center', padding: '20px' }, children: "No se encontraron tickets con esa b\u00FAsqueda." }))] })] }))] }));
};
export default SalesAnalysis;
//# sourceMappingURL=SalesAnalysis.js.map