import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { API_URL } from './config';
import React, { useEffect, useState } from 'react';
import { Users, Ticket, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { useAuth } from './AuthContext';
import './DashboardOverview.css';
const DashboardOverview = () => {
    const { token } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(`${API_URL}/get_dashboard_stats.php`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    setStats(data);
                }
                else {
                    setError(data.error || 'Error fetching stats');
                }
            }
            catch (err) {
                setError('Network error');
            }
            finally {
                setLoading(false);
            }
        };
        if (token)
            fetchStats();
    }, [token]);
    if (loading)
        return _jsx("div", { className: "loading-state", children: "Cargando m\u00E9tricas..." });
    if (error)
        return _jsx("div", { className: "error-state", children: error });
    if (!stats)
        return null;
    return (_jsxs("div", { className: "overview-container", children: [_jsxs("div", { className: "stats-grid", children: [_jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "stat-icon-wrapper", style: { backgroundColor: '#EEF2FF', color: '#4F46E5' }, children: _jsx(Ticket, { size: 24 }) }), _jsxs("div", { className: "stat-content", children: [_jsx("p", { className: "stat-label", children: "Tickets Vendidos" }), _jsx("h3", { className: "stat-value", children: stats.total_tickets_sold })] })] }), _jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "stat-icon-wrapper", style: { backgroundColor: '#ECFDF5', color: '#10B981' }, children: _jsx(DollarSign, { size: 24 }) }), _jsxs("div", { className: "stat-content", children: [_jsx("p", { className: "stat-label", children: "Ingresos Totales" }), _jsxs("h3", { className: "stat-value", children: ["$", stats.total_revenue.toLocaleString()] })] })] }), _jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "stat-icon-wrapper", style: { backgroundColor: '#FEF2F2', color: '#EF4444' }, children: _jsx(Users, { size: 24 }) }), _jsxs("div", { className: "stat-content", children: [_jsx("p", { className: "stat-label", children: "Asistencia Promedio" }), _jsxs("h3", { className: "stat-value", children: [stats.average_attendance, "%"] })] })] })] }), _jsx("div", { className: "charts-section", children: _jsxs("div", { className: "chart-card", children: [_jsx("h3", { children: "Resumen de Ventas por Evento" }), _jsxs("div", { className: "events-progress-list", children: [stats.recent_events_progress.map(event => {
                                    const percent = event.total_capacity > 0 ? (event.tickets_sold / event.total_capacity) * 100 : 0;
                                    return (_jsxs("div", { className: "event-progress-item", style: { marginBottom: '15px' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }, children: [_jsxs("span", { style: { fontWeight: '500' }, children: ["#", event.event_id, " - ", event.title] }), _jsxs("span", { style: { color: '#64748B', fontSize: '0.9rem' }, children: [event.tickets_sold, " / ", event.total_capacity > 0 ? event.total_capacity : '∞', " vendidas"] })] }), _jsx("div", { style: { width: '100%', backgroundColor: '#E2E8F0', borderRadius: '4px', height: '8px', overflow: 'hidden' }, children: _jsx("div", { style: { width: `${percent}%`, backgroundColor: '#4F46E5', height: '100%' } }) })] }, event.event_id));
                                }), stats.recent_events_progress.length === 0 && (_jsxs("div", { style: { padding: '20px', textAlign: 'center', color: '#94A3B8' }, children: [_jsx(Calendar, { size: 48, style: { margin: '0 auto', opacity: 0.5 } }), _jsx("p", { children: "A\u00FAn no hay ventas en tus eventos." })] }))] })] }) })] }));
};
export default DashboardOverview;
//# sourceMappingURL=DashboardOverview.js.map