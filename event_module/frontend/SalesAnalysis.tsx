import { API_URL } from './config';
import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { BarChart2, Search, Calendar, Users, DollarSign } from 'lucide-react';
import './DashboardOverview.css'; // Reutilizamos estilos

interface EventOption {
    event_id: number;
    title: string;
}

interface TicketTypeSales {
    ticket_type_id: number;
    ticket_type_name: string;
    price: string;
    quantity_total: number;
    quantity_sold: number;
    quantity_checked_in: number;
    revenue: string;
}

interface SalesAnalysisData {
    event_title: string;
    total_revenue: number;
    total_sold: number;
    total_capacity: number;
    total_checked_in: number;
    ticket_types: TicketTypeSales[];
}

interface SearchResult {
    ticket_number: string;
    tickets_status: string;
    ticket_type_name: string;
    customer_email: string;
    first_name: string;
    last_name: string;
    order_number: string;
    purchase_date: string;
}

const SalesAnalysis: React.FC = () => {
    const { token } = useAuth();
    const [events, setEvents] = useState<EventOption[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string>('');
    const [analysisData, setAnalysisData] = useState<SalesAnalysisData | null>(null);
    const [loading, setLoading] = useState(false);
    
    // Búsqueda
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
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
            } catch (err) {
                console.error("Error al obtener eventos", err);
            }
        };
        fetchEvents();
    }, [token]);

    // 2. Obtener análisis del evento seleccionado
    useEffect(() => {
        if (!selectedEventId) return;
        
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
            } catch (err) {
                console.error("Error al obtener análisis", err);
            } finally {
                setLoading(false);
            }
        };
        
        fetchAnalysis();
        setSearchQuery('');
        // Cargar lista por defecto (últimos 10)
        handleSearch(undefined, '');
    }, [selectedEventId, token]);

    // 3. Buscar tickets
    const handleSearch = async (e?: React.FormEvent, customQuery?: string) => {
        if (e) e.preventDefault();
        if (!selectedEventId) return;
        
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
        } catch (err) {
            console.error("Error buscando ticket", err);
        } finally {
            setSearching(false);
        }
    };

    return (
        <div className="overview-container" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Análisis de Ventas</h2>
                <select 
                    value={selectedEventId} 
                    onChange={e => setSelectedEventId(e.target.value)}
                    style={{ padding: '10px', borderRadius: '4px', border: '1px solid #CBD5E1', minWidth: '250px' }}
                >
                    {events.length === 0 ? <option value="">No hay eventos disponibles</option> : null}
                    {events.map(ev => (
                        <option key={ev.event_id} value={ev.event_id}>{ev.title}</option>
                    ))}
                </select>
            </div>

            {loading && <div className="loading-state">Cargando datos del evento...</div>}
            
            {!loading && analysisData && (
                <>
                    {/* Resumen del Evento */}
                    <div className="stats-grid" style={{ marginBottom: '30px' }}>
                        <div className="stat-card">
                            <div className="stat-icon-wrapper" style={{ backgroundColor: '#ECFDF5', color: '#10B981' }}>
                                <DollarSign size={24} />
                            </div>
                            <div className="stat-content">
                                <p className="stat-label">Recaudación Total</p>
                                <h3 className="stat-value">${analysisData.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon-wrapper" style={{ backgroundColor: '#FFFBEB', color: '#F59E0B' }}>
                                <Users size={24} />
                            </div>
                            <div className="stat-content">
                                <p className="stat-label">Asistencia Real (Checked In)</p>
                                <h3 className="stat-value">{analysisData.total_checked_in} / {analysisData.total_sold}</h3>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon-wrapper" style={{ backgroundColor: '#EEF2FF', color: '#4F46E5' }}>
                                <BarChart2 size={24} />
                            </div>
                            <div className="stat-content">
                                <p className="stat-label">Tickets Vendidos (Total)</p>
                                <h3 className="stat-value">{analysisData.total_sold} / {analysisData.total_capacity > 0 ? analysisData.total_capacity : '∞'}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Desglose por Tipo de Ticket */}
                    <div className="section-card" style={{ marginBottom: '30px', padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ marginBottom: '20px', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>Ventas por Tipo de Ticket</h3>
                        <div className="table-responsive-wrapper">
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#F8FAFC', color: '#475569' }}>
                                        <th style={{ padding: '12px' }}>Tipo de Ticket</th>
                                        <th style={{ padding: '12px' }}>Precio</th>
                                        <th style={{ padding: '12px' }}>Vendidos / Aforo</th>
                                        <th style={{ padding: '12px' }}>Asistencia</th>
                                        <th style={{ padding: '12px' }}>Progreso de Venta</th>
                                        <th style={{ padding: '12px' }}>Recaudado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analysisData.ticket_types.map(tt => {
                                        const percent = tt.quantity_total > 0 ? (tt.quantity_sold / tt.quantity_total) * 100 : 0;
                                        return (
                                            <tr key={tt.ticket_type_id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                <td style={{ padding: '12px', fontWeight: '500' }}>{tt.ticket_type_name}</td>
                                                <td style={{ padding: '12px' }}>${parseFloat(tt.price).toFixed(2)}</td>
                                                <td style={{ padding: '12px' }}>{tt.quantity_sold} / {tt.quantity_total > 0 ? tt.quantity_total : '∞'}</td>
                                                <td style={{ padding: '12px', minWidth: '100px' }}>
                                                    <span style={{ color: '#10B981', fontWeight: '500' }}>{tt.quantity_checked_in}</span> / {tt.quantity_sold}
                                                </td>
                                                <td style={{ padding: '12px', minWidth: '150px' }}>
                                                    <div style={{ width: '100%', backgroundColor: '#E2E8F0', borderRadius: '4px', height: '6px' }}>
                                                        <div style={{ width: `${percent}%`, backgroundColor: percent >= 100 ? '#10B981' : '#4F46E5', height: '100%', borderRadius: '4px' }}></div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px', fontWeight: '600', color: '#10B981' }}>${parseFloat(tt.revenue).toFixed(2)}</td>
                                            </tr>
                                        );
                                    })}
                                    {analysisData.ticket_types.length === 0 && (
                                        <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center' }}>No hay tipos de tickets configurados</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Buscador de Usuarios / Tickets */}
                    <div className="section-card" style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ marginBottom: '20px' }}>Buscador de Compradores</h3>
                        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                            <div style={{ flex: 1, position: 'relative' }}>
                                <Search size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94A3B8' }} />
                                <input 
                                    type="text" 
                                    placeholder="Buscar por correo, nombre, N° de ticket u orden..." 
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    style={{ width: '100%', padding: '10px 10px 10px 35px', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                                />
                            </div>
                            <button type="submit" disabled={searching} style={{ padding: '10px 20px', backgroundColor: '#4F46E5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                {searching ? 'Buscando...' : 'Buscar'}
                            </button>
                        </form>

                        {searchResults.length > 0 && (
                            <div className="table-responsive-wrapper">
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#F8FAFC', color: '#475569' }}>
                                            <th style={{ padding: '10px' }}>Cliente</th>
                                            <th style={{ padding: '10px' }}>Email</th>
                                            <th style={{ padding: '10px' }}>Ticket</th>
                                            <th style={{ padding: '10px' }}>Tipo</th>
                                            <th style={{ padding: '10px' }}>Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {searchResults.map((res, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                <td style={{ padding: '10px' }}>{res.first_name} {res.last_name}</td>
                                                <td style={{ padding: '10px' }}>{res.customer_email}</td>
                                                <td style={{ padding: '10px', fontFamily: 'monospace' }}>{res.ticket_number}</td>
                                                <td style={{ padding: '10px' }}>{res.ticket_type_name}</td>
                                                <td style={{ padding: '10px' }}>
                                                    <span style={{ 
                                                        padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem',
                                                        backgroundColor: res.tickets_status === 'valid' ? '#DCFCE7' : '#F1F5F9',
                                                        color: res.tickets_status === 'valid' ? '#166534' : '#475569'
                                                    }}>
                                                        {res.tickets_status.toUpperCase()}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {searchResults.length === 0 && searchQuery !== '' && !searching && (
                            <p style={{ color: '#64748B', textAlign: 'center', padding: '20px' }}>No se encontraron tickets con esa búsqueda.</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default SalesAnalysis;
