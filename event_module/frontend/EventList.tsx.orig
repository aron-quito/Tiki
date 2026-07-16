import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Users, Activity } from 'lucide-react';
import './EventList.css';
import { Link } from 'react-router-dom';

interface EventData {
    id: number;
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

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch('http://localhost:8000/get_events.php?company_id=1');
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
    }, []);

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
                <div className="events-grid">
                    {events.map(event => (
                        <div key={event.id} className="event-card">
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
                                <div className="event-stat">
                                    <Activity size={16} color="#4F46E5" />
                                    <span>Ventas activas</span>
                                </div>
                                <Link to={`/events/edit/${event.id}`} className="btn-ghost">
                                    {event.status === 'draft' ? 'Continuar Editando' : 'Ver Detalles'}
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EventList;
