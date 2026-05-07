import React, { useState, type FormEvent, type ChangeEvent } from 'react';
import './CreateEventForm.css';

// Interfaz para los datos del formulario (excluyendo id, created_at, updated_at)
export interface EventFormData {
    title: string;
    slug: string;
    description: string;
    category: string;
    event_date_start: string;
    event_date_end: string;
    venue_name: string;
    venue_address: string;
    city: string;
    country: string;
    banner_image: string;
    organizer_id: number;
    status: 'draft' | 'published' | 'cancelled';
}

const CreateEventForm: React.FC = () => {
    // Estado inicial del formulario controlado
    const [formData, setFormData] = useState<EventFormData>({
        title: '',
        slug: '',
        description: '',
        category: '',
        event_date_start: '',
        event_date_end: '',
        venue_name: '',
        venue_address: '',
        city: '',
        country: '',
        banner_image: '',
        organizer_id: 1, // Ejemplo: ID fijo. En un entorno real, provendría del contexto de autenticación
        status: 'draft',
    });

    // Estados de UI para manejar la experiencia del usuario
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Manejador genérico para los cambios en los campos de entrada
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        // Actualizamos el estado asegurando el tipo de dato correcto (ej. number para organizer_id)
        setFormData(prev => ({
            ...prev,
            [name]: name === 'organizer_id' ? parseInt(value, 10) : value
        }));
        
        // Autogenerar slug básico si se cambia el título y el slug no ha sido modificado manualmente
        if (name === 'title' && formData.slug === '') {
            setFormData(prev => ({
                ...prev,
                slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
            }));
        }
    };

    // Manejador de envío del formulario
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault(); // Prevenir el refresco de la página
        
        // Reiniciar estados de UI
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            // Realizar la petición al endpoint PHP utilizando Fetch API
            // NOTA: Reemplazar la URL por la ruta real al endpoint en desarrollo/producción
            const response = await fetch('http://localhost/backend/create_event.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error desconocido al crear el evento');
            }

            // Manejo de éxito
            setSuccessMessage('¡El evento ha sido creado exitosamente!');
            
            // Reiniciar el formulario a sus valores iniciales (manteniendo el organizer_id)
            setFormData({
                title: '', slug: '', description: '', category: '', 
                event_date_start: '', event_date_end: '', venue_name: '', 
                venue_address: '', city: '', country: '', banner_image: '',
                organizer_id: formData.organizer_id, status: 'draft'
            });

        } catch (err: any) {
            // Manejo de errores (red o validación del servidor)
            setError(err.message || 'Error de conexión. Por favor intente nuevamente.');
        } finally {
            setIsLoading(false); // Terminar estado de carga
        }
    };

    return (
        <div className="event-form-container">
            <h2>Crear Nuevo Evento</h2>
            
            {/* Mensajes de feedback */}
            {error && <div className="alert alert-error">{error}</div>}
            {successMessage && <div className="alert alert-success">{successMessage}</div>}

            <form onSubmit={handleSubmit} className="event-form">
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="title">Título del Evento *</label>
                        <input type="text" id="title" name="title" required value={formData.title} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="slug">Slug (URL) *</label>
                        <input type="text" id="slug" name="slug" required value={formData.slug} onChange={handleChange} />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="description">Descripción</label>
                    <textarea id="description" name="description" rows={4} value={formData.description} onChange={handleChange} />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="category">Categoría</label>
                        <input type="text" id="category" name="category" value={formData.category} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="status">Estado</label>
                        <select id="status" name="status" value={formData.status} onChange={handleChange}>
                            <option value="draft">Borrador</option>
                            <option value="published">Publicado</option>
                            <option value="cancelled">Cancelado</option>
                        </select>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="event_date_start">Fecha de Inicio *</label>
                        <input type="datetime-local" id="event_date_start" name="event_date_start" required value={formData.event_date_start} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="event_date_end">Fecha de Fin *</label>
                        <input type="datetime-local" id="event_date_end" name="event_date_end" required value={formData.event_date_end} onChange={handleChange} />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="venue_name">Nombre del Lugar</label>
                        <input type="text" id="venue_name" name="venue_name" value={formData.venue_name} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="venue_address">Dirección</label>
                        <input type="text" id="venue_address" name="venue_address" value={formData.venue_address} onChange={handleChange} />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="city">Ciudad</label>
                        <input type="text" id="city" name="city" value={formData.city} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="country">País</label>
                        <input type="text" id="country" name="country" value={formData.country} onChange={handleChange} />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="banner_image">URL del Banner (Imagen)</label>
                    <input type="url" id="banner_image" name="banner_image" placeholder="https://..." value={formData.banner_image} onChange={handleChange} />
                </div>

                <div className="form-actions">
                    <button type="submit" disabled={isLoading} className="btn-primary">
                        {isLoading ? 'Guardando...' : 'Crear Evento'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateEventForm;
