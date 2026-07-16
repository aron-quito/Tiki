import React, { useEffect, useState } from 'react';
import { Users, Ticket, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { useAuth } from './AuthContext';
import './DashboardOverview.css';

interface DashboardStats {
    total_revenue: number;
    total_tickets_sold: number;
    average_attendance: number;
    conversion_rate: number;
    recent_events_progress: {
        event_id: number;
        title: string;
        tickets_sold: number;
        total_capacity: number;
    }[];
}

const DashboardOverview: React.FC = () => {
    const { token } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('http://localhost:8000/get_dashboard_stats.php', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    setStats(data);
                } else {
                    setError(data.error || 'Error fetching stats');
                }
            } catch (err) {
                setError('Network error');
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchStats();
    }, [token]);

    if (loading) return <div className="loading-state">Cargando métricas...</div>;
    if (error) return <div className="error-state">{error}</div>;
    if (!stats) return null;

    return (
        <div className="overview-container">
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon-wrapper" style={{ backgroundColor: '#EEF2FF', color: '#4F46E5' }}>
                        <Ticket size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Tickets Vendidos</p>
                        <h3 className="stat-value">{stats.total_tickets_sold}</h3>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon-wrapper" style={{ backgroundColor: '#ECFDF5', color: '#10B981' }}>
                        <DollarSign size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Ingresos Totales</p>
                        <h3 className="stat-value">${stats.total_revenue.toLocaleString()}</h3>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon-wrapper" style={{ backgroundColor: '#FEF2F2', color: '#EF4444' }}>
                        <Users size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Asistencia Promedio</p>
                        <h3 className="stat-value">{stats.average_attendance}%</h3>
                    </div>
                </div>

            </div>

            <div className="charts-section">
                <div className="chart-card">
                    <h3>Resumen de Ventas por Evento</h3>
                    <div className="events-progress-list">
                        {stats.recent_events_progress.map(event => {
                            const percent = event.total_capacity > 0 ? (event.tickets_sold / event.total_capacity) * 100 : 0;
                            return (
                                <div key={event.event_id} className="event-progress-item" style={{ marginBottom: '15px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        <span style={{ fontWeight: '500' }}>#{event.event_id} - {event.title}</span>
                                        <span style={{ color: '#64748B', fontSize: '0.9rem' }}>{event.tickets_sold} / {event.total_capacity} vendidas</span>
                                    </div>
                                    <div style={{ width: '100%', backgroundColor: '#E2E8F0', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                                        <div style={{ width: `${percent}%`, backgroundColor: '#4F46E5', height: '100%' }}></div>
                                    </div>
                                </div>
                            );
                        })}
                        {stats.recent_events_progress.length === 0 && (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#94A3B8' }}>
                                <Calendar size={48} style={{ margin: '0 auto', opacity: 0.5 }} />
                                <p>Aún no hay ventas en tus eventos.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
