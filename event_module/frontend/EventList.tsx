import { API_URL } from './config';
import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Users, Activity, ClipboardCheck } from 'lucide-react';
import './EventList.css';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface EventData {
    event_id: number;
    title: string;
    event_date_start: string;
    event_date_end: string;
    venue_name: string;
    city: string;
    status: string;
    created_at: string;
    total_capacity: number;
}

const EventList: React.FC = () => {
    const [events, setEvents] = useState<EventData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
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
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [token]);

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { 
            year: 'numeric', month: 'short', day: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
        };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    };

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'published': return <span className="badge badge-success">Publicado</span>;
            case 'draft': return <span className="badge badge-warning">Borrador</span>;
            case 'cancelled': return <span className="badge badge-danger">Cancelado</span>;
            case 'completed': return <span className="badge badge-info" style={{backgroundColor: '#E0F2FE', color: '#0369A1'}}>Finalizado</span>;
            default: return <span className="badge">{status}</span>;
        }
    };

    if (loading) return <div className="loading-state">Cargando eventos...</div>;
    if (error) return <div className="error-state">Error: {error}</div>;

    const activeEvents = events.filter(e => e.status !== 'completed' && e.status !== 'cancelled');
    const pastEvents = events.filter(e => e.status === 'completed' || e.status === 'cancelled');

    return (
        <div className="event-list-container">
            <div className="list-header">
                <h2>Todos los Eventos</h2>
                <Link to="/events/new" className="btn-primary">Crear Evento</Link>
            </div>

            {events.length === 0 ? (
                <div className="empty-state">
                    <Calendar size={48} color="#CBD5E1" />
                    <h3>No hay eventos creados</h3>
                    <p>Aún no has creado ningún evento. Comienza creando tu primer evento empresarial.</p>
                </div>
            ) : (
                <>
                    <h3 style={{ marginTop: '20px', marginBottom: '15px', color: '#1E293B' }}>Eventos Activos</h3>
                    <div className="events-grid">
                        {activeEvents.map(event => (
                            <div key={event.event_id} className="event-card">
                                <div className="event-card-header">
                                    <h3>{event.title}</h3>
                                    {getStatusBadge(event.status)}
                                </div>
                                
                                <div className="event-card-body">
                                    <div className="event-detail">
                                        <Calendar size={16} />
                                        <span>{formatDate(event.event_date_start)}</span>
                                    </div>
                                    <div className="event-detail">
                                        <MapPin size={16} />
                                        <span>{event.venue_name ? `${event.venue_name}, ${event.city}` : 'Ubicación por definir'}</span>
                                    </div>
                                    <div className="event-detail">
                                        <Users size={16} />
                                        <span>Aforo: {event.total_capacity || 0} personas</span>
                                    </div>
                                </div>

                                <div className="event-card-footer">
                                    <Link to={`/events/${event.event_id}/attendance`} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <ClipboardCheck size={16} /> Asistencia
                                    </Link>
                                    <Link to={`/events/edit/${event.event_id}`} className="btn-ghost">
                                        {event.status === 'draft' ? 'Continuar Editando' : 'Ver Detalles'}
                                    </Link>
                                </div>
                            </div>
                        ))}
                        {activeEvents.length === 0 && <p style={{ color: '#64748B' }}>No hay eventos activos.</p>}
                    </div>

                    {pastEvents.length > 0 && (
                        <>
                            <h3 style={{ marginTop: '40px', marginBottom: '15px', color: '#1E293B' }}>Eventos Finalizados o Cancelados</h3>
                            <div className="events-grid" style={{ opacity: 0.8 }}>
                                {pastEvents.map(event => (
                                    <div key={event.event_id} className="event-card">
                                        <div className="event-card-header">
                                            <h3>{event.title}</h3>
                                            {getStatusBadge(event.status)}
                                        </div>
                                        
                                        <div className="event-card-body">
                                            <div className="event-detail">
                                                <Calendar size={16} />
                                                <span>{formatDate(event.event_date_start)}</span>
                                            </div>
                                            <div className="event-detail">
                                                <MapPin size={16} />
                                                <span>{event.venue_name ? `${event.venue_name}, ${event.city}` : 'Ubicación por definir'}</span>
                                            </div>
                                            <div className="event-detail">
                                                <Users size={16} />
                                                <span>Aforo: {event.total_capacity || 0} personas</span>
                                            </div>
                                        </div>

                                        <div className="event-card-footer">
                                            <Link to={`/events/edit/${event.event_id}`} className="btn-ghost">
                                                Ver Detalles
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default EventList;
