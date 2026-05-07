import React, { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Save, Calendar, MapPin, Ticket, AlertTriangle, CheckCircle, Send } from 'lucide-react';
import './EventEditor.css';

export interface PricingPhase {
    phase_name: string;
    price: number;
    start_date: string;
    end_date: string;
}

export interface TicketTier {
    name: string;
    capacity: number;
    phases: PricingPhase[];
}

export interface EventFormData {
    id?: number;
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
    company_id: number;
    status: 'draft' | 'published' | 'cancelled' | 'completed';
    ticket_tiers: TicketTier[];
}

const EventEditor: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [step, setStep] = useState<number>(1);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    
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
        company_id: 1, 
        status: 'draft',
        ticket_tiers: [
            { name: 'General', capacity: 100, phases: [{ phase_name: 'Regular', price: 0, start_date: '', end_date: '' }] }
        ]
    });

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Cargar datos si hay ID
    useEffect(() => {
        if (id) {
            setIsFetching(true);
            fetch(`http://localhost:8000/get_event_details.php?id=${id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.error) throw new Error(data.error);
                    
                    // Formatear fechas para los inputs datetime-local (remover segundos y Z)
                    const formatInputDate = (d: string) => d ? d.substring(0, 16) : '';
                    
                    setFormData({
                        ...data,
                        event_date_start: formatInputDate(data.event_date_start),
                        event_date_end: formatInputDate(data.event_date_end),
                        ticket_tiers: data.ticket_tiers?.map((t: any) => ({
                            ...t,
                            phases: t.phases?.map((p: any) => ({
                                ...p,
                                start_date: formatInputDate(p.start_date),
                                end_date: formatInputDate(p.end_date)
                            })) || []
                        })) || []
                    });
                })
                .catch(err => setError(err.message))
                .finally(() => setIsFetching(false));
        }
    }, [id]);

    const isReadOnly = formData.status === 'published' || formData.status === 'completed' || formData.status === 'cancelled';

    // Manejador Genérico
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        if (isReadOnly) return;
        const { name, value } = e.target;
        setFormData(prev => {
            const updated = { ...prev, [name]: value };
            if (name === 'title' && !id && prev.slug === '') {
                updated.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            }
            return updated;
        });
    };

    // Funciones de Tickets
    const addTicketTier = () => {
        if (isReadOnly) return;
        setFormData(prev => ({
            ...prev,
            ticket_tiers: [...prev.ticket_tiers, { name: '', capacity: 0, phases: [{ phase_name: '', price: 0, start_date: '', end_date: '' }] }]
        }));
    };

    const removeTicketTier = (index: number) => {
        if (isReadOnly) return;
        setFormData(prev => {
            const updatedTiers = [...prev.ticket_tiers];
            updatedTiers.splice(index, 1);
            return { ...prev, ticket_tiers: updatedTiers };
        });
    };

    const handleTierChange = (index: number, field: keyof TicketTier, value: any) => {
        if (isReadOnly) return;
        setFormData(prev => {
            const updatedTiers = [...prev.ticket_tiers];
            if (updatedTiers[index]) {
                updatedTiers[index] = { ...updatedTiers[index], [field]: value } as TicketTier;
            }
            return { ...prev, ticket_tiers: updatedTiers };
        });
    };

    const addPhase = (tierIndex: number) => {
        if (isReadOnly) return;
        setFormData(prev => {
            const updatedTiers = [...prev.ticket_tiers];
            if (updatedTiers[tierIndex]) {
                updatedTiers[tierIndex].phases.push({ phase_name: '', price: 0, start_date: '', end_date: '' });
            }
            return { ...prev, ticket_tiers: updatedTiers };
        });
    };

    const removePhase = (tierIndex: number, phaseIndex: number) => {
        if (isReadOnly) return;
        setFormData(prev => {
            const updatedTiers = [...prev.ticket_tiers];
            if (updatedTiers[tierIndex]) {
                updatedTiers[tierIndex].phases.splice(phaseIndex, 1);
            }
            return { ...prev, ticket_tiers: updatedTiers };
        });
    };

    const handlePhaseChange = (tierIndex: number, phaseIndex: number, field: keyof PricingPhase, value: any) => {
        if (isReadOnly) return;
        setFormData(prev => {
            const updatedTiers = [...prev.ticket_tiers];
            const tier = updatedTiers[tierIndex];
            if (!tier) return prev;
            
            const updatedPhases = [...tier.phases];
            if (!updatedPhases[phaseIndex]) return prev;

            updatedPhases[phaseIndex] = { ...updatedPhases[phaseIndex], [field]: value } as PricingPhase;
            updatedTiers[tierIndex] = { ...tier, phases: updatedPhases } as TicketTier;
            return { ...prev, ticket_tiers: updatedTiers };
        });
    };

    // Guardado y Publicación
    const handleSave = async (targetStatus: 'draft' | 'published') => {
        if (targetStatus === 'published') {
            const confirm = window.confirm("¿Estás seguro de publicar este evento? Una vez publicado NO podrás modificar la estructura de tickets ni fechas.");
            if (!confirm) return;
        }

        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        const dataToSend = { ...formData, status: targetStatus };

        try {
            const response = await fetch('http://localhost:8000/save_event.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error ? `${data.error} ${data.details ? data.details.join(', ') : ''}` : 'Error al guardar');
            }

            setSuccessMessage(targetStatus === 'draft' ? 'Borrador guardado exitosamente.' : '¡Evento publicado con éxito!');
            setFormData(prev => ({ ...prev, status: targetStatus, id: data.event_id || prev.id }));
            
            if (targetStatus === 'published') {
                setTimeout(() => navigate('/events'), 2000);
            }
        } catch (err: any) {
            setError(err.message || 'Error de conexión.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) return <div className="loading-state">Cargando datos del evento...</div>;

    return (
        <div className="wizard-container">
            {/* Cabecera del Editor */}
            <div className="wizard-header">
                <div className="wizard-title">
                    <h2>{id ? 'Editor de Evento' : 'Crear Nuevo Evento'}</h2>
                    <p className="subtitle">
                        {isReadOnly ? 'Modo de Solo Lectura (Evento Publicado/Finalizado)' : (step === 1 ? 'Paso 1: Identidad del evento' : 'Paso 2: Tickets y Preventas')}
                    </p>
                </div>
                
                <div className="editor-actions-top">
                    {formData.status === 'draft' && (
                        <span className="draft-badge"><AlertTriangle size={14}/> Borrador</span>
                    )}
                    {formData.status === 'published' && (
                        <span className="published-badge"><CheckCircle size={14}/> Publicado</span>
                    )}
                    
                    {!isReadOnly && (
                        <div className="action-buttons">
                            <button type="button" className="btn-secondary" onClick={() => handleSave('draft')} disabled={isLoading}>
                                <Save size={16}/> Guardar Borrador
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {successMessage && <div className="alert alert-success">{successMessage}</div>}

            {isReadOnly && (
                <div className="readonly-banner">
                    Este evento se encuentra en estado <strong>{formData.status.toUpperCase()}</strong>. Su estructura no puede ser modificada.
                </div>
            )}

            <form onSubmit={(e) => e.preventDefault()} className="wizard-form">
                
                {/* ======================= PASO 1 ======================= */}
                {step === 1 && (
                    <div className="wizard-step step-1 fade-in">
                        <div className="section-card">
                            <h3><Calendar className="section-icon" size={20}/> Información Básica</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Título del Evento *</label>
                                    <input type="text" name="title" required value={formData.title} onChange={handleChange} disabled={isReadOnly}/>
                                </div>
                                <div className="form-group">
                                    <label>URL Amigable (Slug) *</label>
                                    <input type="text" name="slug" required value={formData.slug} onChange={handleChange} disabled={isReadOnly}/>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Descripción</label>
                                <textarea name="description" rows={3} value={formData.description} onChange={handleChange} disabled={isReadOnly}/>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Fecha y Hora de Inicio</label>
                                    <input type="datetime-local" name="event_date_start" value={formData.event_date_start} onChange={handleChange} disabled={isReadOnly}/>
                                </div>
                                <div className="form-group">
                                    <label>Fecha y Hora de Fin</label>
                                    <input type="datetime-local" name="event_date_end" value={formData.event_date_end} onChange={handleChange} disabled={isReadOnly}/>
                                </div>
                            </div>
                        </div>

                        <div className="section-card">
                            <h3><MapPin className="section-icon" size={20}/> Ubicación y Categoría</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Lugar del Evento</label>
                                    <input type="text" name="venue_name" value={formData.venue_name} onChange={handleChange} disabled={isReadOnly}/>
                                </div>
                                <div className="form-group">
                                    <label>Dirección</label>
                                    <input type="text" name="venue_address" value={formData.venue_address} onChange={handleChange} disabled={isReadOnly}/>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Ciudad</label>
                                    <input type="text" name="city" value={formData.city} onChange={handleChange} disabled={isReadOnly}/>
                                </div>
                                <div className="form-group">
                                    <label>Categoría</label>
                                    <input type="text" name="category" value={formData.category} onChange={handleChange} disabled={isReadOnly}/>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ======================= PASO 2 ======================= */}
                {step === 2 && (
                    <div className="wizard-step step-2 fade-in">
                        <div className="section-card no-padding">
                            <div className="section-header-padded">
                                <div className="header-title-group">
                                    <Ticket className="section-icon" size={24}/>
                                    <div>
                                        <h3>Gestión de Tickets y Aforos</h3>
                                        <p className="section-desc">Crea los tipos de entrada y configura sus fases de venta (preventas).</p>
                                    </div>
                                </div>
                                {!isReadOnly && <button type="button" className="btn-secondary" onClick={addTicketTier}>+ Añadir Categoría</button>}
                            </div>

                            <div className="tiers-list">
                                {formData.ticket_tiers.map((tier, tIndex) => (
                                    <div key={tIndex} className="ticket-tier-card">
                                        <div className="tier-header">
                                            <h4>🎟️ Categoría: {tier.name || `Nueva Categoría ${tIndex + 1}`}</h4>
                                            {!isReadOnly && formData.ticket_tiers.length > 1 && (
                                                <button type="button" className="btn-danger-text" onClick={() => removeTicketTier(tIndex)}>Eliminar</button>
                                            )}
                                        </div>
                                        
                                        <div className="form-row tier-basic-info">
                                            <div className="form-group">
                                                <label>Nombre de la Categoría</label>
                                                <input type="text" required value={tier.name} onChange={(e) => handleTierChange(tIndex, 'name', e.target.value)} disabled={isReadOnly}/>
                                            </div>
                                            <div className="form-group">
                                                <label>Aforo Máximo (Personas)</label>
                                                <input type="number" min="1" required value={tier.capacity} onChange={(e) => handleTierChange(tIndex, 'capacity', parseInt(e.target.value))} disabled={isReadOnly}/>
                                            </div>
                                        </div>

                                        <div className="phases-container">
                                            <div className="phases-header">
                                                <h5>Fases de Precios</h5>
                                                {!isReadOnly && <button type="button" className="btn-tertiary" onClick={() => addPhase(tIndex)}>+ Añadir Fase</button>}
                                            </div>

                                            <div className="phases-list">
                                                {tier.phases.map((phase, pIndex) => (
                                                    <div key={pIndex} className="phase-row">
                                                        <div className="form-group">
                                                            <label>Nombre Fase</label>
                                                            <input type="text" required value={phase.phase_name} onChange={(e) => handlePhaseChange(tIndex, pIndex, 'phase_name', e.target.value)} disabled={isReadOnly}/>
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Precio ($)</label>
                                                            <input type="number" min="0" step="0.01" required value={phase.price} onChange={(e) => handlePhaseChange(tIndex, pIndex, 'price', parseFloat(e.target.value))} disabled={isReadOnly}/>
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Inicio Venta</label>
                                                            <input type="datetime-local" required value={phase.start_date} onChange={(e) => handlePhaseChange(tIndex, pIndex, 'start_date', e.target.value)} disabled={isReadOnly}/>
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Fin Venta</label>
                                                            <input type="datetime-local" required value={phase.end_date} onChange={(e) => handlePhaseChange(tIndex, pIndex, 'end_date', e.target.value)} disabled={isReadOnly}/>
                                                        </div>
                                                        
                                                        {!isReadOnly && tier.phases.length > 1 && (
                                                            <button type="button" className="btn-icon-danger phase-remove-btn" onClick={() => removePhase(tIndex, pIndex)}>✕</button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Controles de Navegación */}
                <div className="wizard-actions">
                    {step === 2 && (
                        <button type="button" className="btn-ghost-large" onClick={() => setStep(1)}>
                            <ChevronLeft size={20}/> Atrás
                        </button>
                    )}
                    
                    {step === 1 ? (
                        <button type="button" className="btn-primary btn-large ml-auto" onClick={() => setStep(2)}>
                            Continuar a Tickets <ChevronRight size={20}/>
                        </button>
                    ) : (
                        !isReadOnly && (
                            <button type="button" onClick={() => handleSave('published')} disabled={isLoading} className="btn-primary btn-large btn-success ml-auto">
                                {isLoading ? 'Publicando...' : <><Send size={20}/> Validar y Publicar Evento</>}
                            </button>
                        )
                    )}
                </div>
            </form>
        </div>
    );
};

export default EventEditor;
