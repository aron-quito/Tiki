import { API_URL } from './config';
import React, { useState, useEffect, type ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Save, Calendar, MapPin, Ticket, AlertTriangle, CheckCircle, Send } from 'lucide-react';
import './EventEditor.css';

export interface Category {
    category_id?: number;
    category_name: string;
    total_capacity: number;
    has_shared_stages: boolean;
    temp_id?: string;
}

export interface SaleStage {
    sale_stage_id?: number;
    stage_name: string;
    sale_stage_date_start: string;
    sale_stage_date_end: string;
    temp_id?: string;
}

export interface TicketType {
    ticket_type_id?: number;
    category_ref: string;
    stage_ref: string;
    ticket_type_name: string;
    ticket_type_description: string;
    price: number;
    currency: string;
    quantity_total: number;
    sale_start_date: string;
    sale_end_date: string;
    min_per_order: number;
    max_per_order: number;
    ticket_type_status: string;
}

export interface EventFormData {
    event_id?: number;
    title: string;
    slug: string;
    event_date_start: string;
    event_date_end: string;
    venue_name: string;
    venue_address: string;
    city: string;
    country: string;
    event_topic: string;
    cover_image_url: string;
    banner_image_url: string;
    organizer_id: number;
    global_capacity: number | null;
    has_shared_capacity: boolean;
    event_status: 'draft' | 'published' | 'cancelled' | 'completed';
    is_featured: boolean;
    categories: Category[];
    sale_stages: SaleStage[];
    ticket_types: TicketType[];
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const EventEditor: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [step, setStep] = useState<number>(1);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    
    const initialCatId = generateId();
    const initialStgId = generateId();

    const [formData, setFormData] = useState<EventFormData>({
        title: '',
        slug: '',
        event_date_start: '',
        event_date_end: '',
        venue_name: '',
        venue_address: '',
        city: '',
        country: 'Peru',
        event_topic: '',
        cover_image_url: '',
        banner_image_url: '',
        organizer_id: 1, 
        global_capacity: 100,
        has_shared_capacity: false,
        event_status: 'draft',
        is_featured: false,
        categories: [
            { temp_id: initialCatId, category_name: 'General', total_capacity: 100, has_shared_stages: false }
        ],
        sale_stages: [
            { temp_id: initialStgId, stage_name: 'Regular', sale_stage_date_start: '', sale_stage_date_end: '' }
        ],
        ticket_types: [
            {
                ticket_type_name: 'General - Regular',
                category_ref: initialCatId,
                stage_ref: initialStgId,
                price: 0,
                currency: 'USD',
                quantity_total: 0,
                ticket_type_description: '',
                sale_start_date: '',
                sale_end_date: '',
                min_per_order: 1,
                max_per_order: 10,
                ticket_type_status: 'active'
            }
        ]
    });

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Cargar datos si hay ID
    useEffect(() => {
        if (id) {
            setIsFetching(true);
            fetch(`${API_URL}/get_event_details.php?id=${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.error) throw new Error(data.error);
                    
                    const formatInputDate = (d: string) => d && d !== '1970-01-01 00:00:00' ? d.substring(0, 16) : '';
                    
                    const loadedCats = (data.categories || []).map((c: any) => ({...c, temp_id: generateId()}));
                    const loadedStages = (data.sale_stages || []).map((s: any) => ({
                        ...s, 
                        temp_id: generateId(),
                        sale_stage_date_start: formatInputDate(s.sale_stage_date_start),
                        sale_stage_date_end: formatInputDate(s.sale_stage_date_end)
                    }));
                    
                    const loadedTickets = (data.ticket_types || []).map((t: any) => {
                        const cat = loadedCats.find((c:any) => c.category_id === t.category_id);
                        const stg = loadedStages.find((s:any) => s.sale_stage_id === t.sale_stage_id);
                        return {
                            ...t,
                            category_ref: cat ? cat.temp_id : '',
                            stage_ref: stg ? stg.temp_id : '',
                            sale_start_date: formatInputDate(t.sale_start_date),
                            sale_end_date: formatInputDate(t.sale_end_date)
                        };
                    });

                    setFormData({
                        ...data,
                        event_date_start: formatInputDate(data.event_date_start),
                        event_date_end: formatInputDate(data.event_date_end),
                        categories: loadedCats,
                        sale_stages: loadedStages,
                        ticket_types: loadedTickets
                    });
                })
                .catch(err => setError(err.message))
                .finally(() => setIsFetching(false));
        }
    }, [id]);

    const isReadOnly = formData.event_status === 'published' || formData.event_status === 'completed' || formData.event_status === 'cancelled';

    // Manejador Genérico
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        if (isReadOnly) return;
        const target = e.target as HTMLInputElement;
        const { name, value, type, checked } = target;
        
        setFormData(prev => {
            let newVal: any = value;
            if (type === 'checkbox') newVal = checked;
            if (type === 'number') newVal = value === '' ? null : Number(value);
            
            const updated = { ...prev, [name]: newVal };
            
            // If enabling global capacity, auto-enable shared stages for all categories
            if (name === 'has_shared_capacity' && newVal === true) {
                updated.categories = updated.categories.map(cat => ({
                    ...cat,
                    has_shared_stages: true
                }));
            }

            if (name === 'title' && !id && prev.slug === '') {
                updated.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            }
            return updated;
        });
    };

    // Funciones de Categorías
    const addCategory = () => {
        if (isReadOnly) return;
        setFormData(prev => {
            const newCatTempId = generateId();
            // Automatically enable shared stages if global capacity is enabled
            const newCategory = { temp_id: newCatTempId, category_name: '', total_capacity: 0, has_shared_stages: prev.has_shared_capacity };
            
            // Generate tickets by default for all existing stages
            const newTickets = prev.sale_stages.map(stg => ({
                ticket_type_name: ` - ${stg.stage_name}`,
                category_ref: newCatTempId,
                stage_ref: stg.temp_id as string,
                price: 0,
                currency: 'USD',
                quantity_total: 0,
                ticket_type_description: '',
                sale_start_date: stg.sale_stage_date_start,
                sale_end_date: stg.sale_stage_date_end,
                min_per_order: 1,
                max_per_order: 10,
                ticket_type_status: 'active'
            }));

            return {
                ...prev,
                categories: [...prev.categories, newCategory],
                ticket_types: [...prev.ticket_types, ...newTickets]
            };
        });
    };
    const removeCategory = (index: number) => {
        if (isReadOnly) return;
        setFormData(prev => {
            const updated = [...prev.categories];
            const removed = updated.splice(index, 1)[0];
            return { 
                ...prev, 
                categories: updated,
                ticket_types: prev.ticket_types.filter(t => t.category_ref !== (removed?.temp_id || ''))
            };
        });
    };
    const handleCategoryChange = (index: number, field: keyof Category, value: any) => {
        if (isReadOnly) return;
        setFormData(prev => {
            const updated = [...prev.categories];
            updated[index] = { ...updated[index], [field]: value } as Category;
            return { ...prev, categories: updated };
        });
    };

    // Funciones de Fases
    const addSaleStage = () => {
        if (isReadOnly) return;
        setFormData(prev => {
            const newStgTempId = generateId();
            const newStage = { temp_id: newStgTempId, stage_name: '', sale_stage_date_start: '', sale_stage_date_end: '' };
            
            // Generate tickets by default for all existing categories
            const newTickets = prev.categories.map(cat => ({
                ticket_type_name: `${cat.category_name} - `,
                category_ref: cat.temp_id as string,
                stage_ref: newStgTempId,
                price: 0,
                currency: 'USD',
                quantity_total: 0,
                ticket_type_description: '',
                sale_start_date: '',
                sale_end_date: '',
                min_per_order: 1,
                max_per_order: 10,
                ticket_type_status: 'active'
            }));

            return {
                ...prev,
                sale_stages: [...prev.sale_stages, newStage],
                ticket_types: [...prev.ticket_types, ...newTickets]
            };
        });
    };
    const removeStage = (index: number) => {
        if (isReadOnly) return;
        setFormData(prev => {
            const updated = [...prev.sale_stages];
            const removed = updated.splice(index, 1)[0];
            return { 
                ...prev, 
                sale_stages: updated,
                ticket_types: prev.ticket_types.filter(t => t.stage_ref !== (removed?.temp_id || ''))
            };
        });
    };
    const handleStageChange = (index: number, field: keyof SaleStage, value: any) => {
        if (isReadOnly) return;
        setFormData(prev => {
            const updated = [...prev.sale_stages];
            updated[index] = { ...updated[index], [field]: value } as SaleStage;
            return { ...prev, sale_stages: updated };
        });
    };

    // Funciones de Tickets
    const handleMatrixTicketChange = (catRef: string, stgRef: string, field: keyof TicketType, value: any) => {
        if (isReadOnly) return;
        setFormData(prev => {
            const updated = prev.ticket_types.map(t => {
                if (t.category_ref === catRef && t.stage_ref === stgRef) {
                    return { ...t, [field]: value };
                }
                return t;
            });
            return { ...prev, ticket_types: updated };
        });
    };

    const toggleMatrixTicket = (catRef: string, stgRef: string, catName: string, stgName: string) => {
        if (isReadOnly) return;
        setFormData(prev => {
            const exists = prev.ticket_types.find(t => t.category_ref === catRef && t.stage_ref === stgRef);
            if (exists) {
                // Eliminar
                return { ...prev, ticket_types: prev.ticket_types.filter(t => t.category_ref !== catRef || t.stage_ref !== stgRef) };
            } else {
                // Añadir
                return {
                    ...prev,
                    ticket_types: [...prev.ticket_types, {
                        category_ref: catRef,
                        stage_ref: stgRef,
                        ticket_type_name: `${catName} - ${stgName}`,
                        ticket_type_description: '',
                        price: 0,
                        currency: 'USD',
                        quantity_total: 0,
                        sale_start_date: '',
                        sale_end_date: '',
                        min_per_order: 1,
                        max_per_order: 10,
                        ticket_type_status: 'active'
                    }]
                };
            }
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

        const dataToSend = { ...formData, event_status: targetStatus };

        try {
            const response = await fetch(`${API_URL}/save_event.php`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(dataToSend),
            });

            const data = await response.json();

            if (!response.ok) {
                const detailsStr = Array.isArray(data.details) ? data.details.join(', ') : (data.details || '');
                throw new Error(data.error ? `${data.error} ${detailsStr}` : 'Error al guardar');
            }

            setSuccessMessage(targetStatus === 'draft' ? 'Borrador guardado exitosamente.' : '¡Evento publicado con éxito!');
            setFormData(prev => ({ ...prev, event_status: targetStatus, event_id: data.event_id || prev.event_id }));
            
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
                    {formData.event_status === 'draft' && (
                        <span className="draft-badge"><AlertTriangle size={14}/> Borrador</span>
                    )}
                    {formData.event_status === 'published' && (
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
                    Este evento se encuentra en estado <strong>{formData.event_status.toUpperCase()}</strong>. Su estructura no puede ser modificada.
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
                            <div className="form-row">
                                <div className="form-group">
                                    <label>URL Imagen Portada</label>
                                    <input type="text" name="cover_image_url" value={formData.cover_image_url} onChange={handleChange} disabled={isReadOnly}/>
                                </div>
                                <div className="form-group">
                                    <label>URL Banner (Opcional)</label>
                                    <input type="text" name="banner_image_url" value={formData.banner_image_url} onChange={handleChange} disabled={isReadOnly}/>
                                </div>
                            </div>
                        </div>

                        <div className="section-card">
                            <h3><MapPin className="section-icon" size={20}/> Ubicación</h3>
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
                                    <label>País</label>
                                    <input type="text" name="country" value={formData.country} onChange={handleChange} disabled={isReadOnly}/>
                                </div>
                                <div className="form-group">
                                    <label>Tópico / Categoría</label>
                                    <select name="event_topic" value={formData.event_topic} onChange={handleChange} disabled={isReadOnly} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #E2E8F0', width: '100%' }}>
                                        <option value="">Seleccione una categoría</option>
                                        <option value="Música">Música</option>
                                        <option value="Tecnología">Tecnología</option>
                                        <option value="Negocios">Negocios</option>
                                        <option value="Deportes">Deportes</option>
                                        <option value="Arte y Teatro">Arte y Teatro</option>
                                        <option value="Gastronomía">Gastronomía</option>
                                        <option value="Educación">Educación</option>
                                        <option value="Salud">Salud</option>
                                        <option value="Otros">Otros</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ======================= PASO 2 ======================= */}
                {step === 2 && (
                    <div className="wizard-step step-2 fade-in">
                        
                        {/* EVENT LEVEL CAPACITY */}
                        <div className="section-card" style={{ marginBottom: '20px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 5px 0' }}>Aforo Global Compartido</h4>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>Permite que todas las zonas compartan un único límite de aforo total.</p>
                                </div>
                                <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '40px', height: '20px' }}>
                                    <input 
                                        type="checkbox" 
                                        name="has_shared_capacity"
                                        checked={formData.has_shared_capacity} 
                                        onChange={handleChange} 
                                        disabled={isReadOnly}
                                        style={{ opacity: 0, width: 0, height: 0 }}
                                    />
                                    <span style={{ position: 'absolute', cursor: isReadOnly ? 'not-allowed' : 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: formData.has_shared_capacity ? '#10B981' : '#CBD5E1', borderRadius: '20px', transition: '.4s' }}>
                                        <span style={{ position: 'absolute', content: '""', height: '16px', width: '16px', left: formData.has_shared_capacity ? '22px' : '2px', bottom: '2px', backgroundColor: 'white', borderRadius: '50%', transition: '.4s' }}></span>
                                    </span>
                                </label>
                            </div>
                            
                            {formData.has_shared_capacity && (
                                <div className="form-group" style={{ marginTop: '15px' }}>
                                    <label>Aforo Total del Evento</label>
                                    <input 
                                        type="number" 
                                        name="global_capacity" 
                                        min="0" 
                                        value={formData.global_capacity || ''} 
                                        onChange={handleChange} 
                                        disabled={isReadOnly}
                                        style={{ maxWidth: '200px' }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* CATEGORIES SECTION */}
                        <div className="section-card no-padding">
                            <div className="section-header-padded">
                                <div className="header-title-group">
                                    <Ticket className="section-icon" size={24}/>
                                    <div>
                                        <h3>Categorías (Zonas)</h3>
                                        <p className="section-desc">Crea las zonas del evento (ej: VIP, General).</p>
                                    </div>
                                </div>
                                {!isReadOnly && <button type="button" className="btn-secondary" onClick={addCategory}>+ Añadir Categoría</button>}
                            </div>
                            <div className="tiers-list" style={{padding: '20px'}}>
                                {formData.categories.map((cat, index) => (
                                    <div key={index} style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '15px', marginBottom: '15px' }}>
                                        <div className="form-row" style={{alignItems: 'flex-end', marginBottom: '10px'}}>
                                            <div className="form-group">
                                                <label>Nombre de Categoría</label>
                                                <input type="text" value={cat.category_name} onChange={e => handleCategoryChange(index, 'category_name', e.target.value)} disabled={isReadOnly}/>
                                            </div>
                                            {!formData.has_shared_capacity && (
                                                <div className="form-group">
                                                    <label>Aforo de la Zona</label>
                                                    <input type="number" min="0" value={cat.total_capacity} onChange={e => handleCategoryChange(index, 'total_capacity', parseInt(e.target.value))} disabled={isReadOnly}/>
                                                </div>
                                            )}
                                            {!isReadOnly && formData.categories.length > 1 && (
                                                <button type="button" className="btn-icon-danger phase-remove-btn" style={{marginBottom: '5px'}} onClick={() => removeCategory(index)}>✕</button>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '30px', height: '16px' }}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={cat.has_shared_stages} 
                                                    onChange={e => handleCategoryChange(index, 'has_shared_stages', e.target.checked)} 
                                                    disabled={isReadOnly}
                                                    style={{ opacity: 0, width: 0, height: 0 }}
                                                />
                                                <span style={{ position: 'absolute', cursor: isReadOnly ? 'not-allowed' : 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: cat.has_shared_stages ? '#4F46E5' : '#CBD5E1', borderRadius: '16px', transition: '.4s' }}>
                                                    <span style={{ position: 'absolute', content: '""', height: '12px', width: '12px', left: cat.has_shared_stages ? '16px' : '2px', bottom: '2px', backgroundColor: 'white', borderRadius: '50%', transition: '.4s' }}></span>
                                                </span>
                                            </label>
                                            <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Aforo compartido entre Fases para esta Zona</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* STAGES SECTION */}
                        <div className="section-card no-padding" style={{marginTop: '20px'}}>
                            <div className="section-header-padded">
                                <div className="header-title-group">
                                    <Ticket className="section-icon" size={24}/>
                                    <div>
                                        <h3>Fases de Venta</h3>
                                        <p className="section-desc">Fechas de preventas y ventas regulares.</p>
                                    </div>
                                </div>
                                {!isReadOnly && <button type="button" className="btn-secondary" onClick={addSaleStage}>+ Añadir Fase</button>}
                            </div>
                            <div className="tiers-list" style={{padding: '20px'}}>
                                {formData.sale_stages.map((stg, index) => (
                                    <div key={index} className="form-row" style={{alignItems: 'flex-end', marginBottom: '15px'}}>
                                        <div className="form-group">
                                            <label>Nombre Fase</label>
                                            <input type="text" value={stg.stage_name} onChange={e => handleStageChange(index, 'stage_name', e.target.value)} disabled={isReadOnly}/>
                                        </div>
                                        <div className="form-group">
                                            <label>Inicio</label>
                                            <input type="datetime-local" value={stg.sale_stage_date_start} onChange={e => handleStageChange(index, 'sale_stage_date_start', e.target.value)} disabled={isReadOnly}/>
                                        </div>
                                        <div className="form-group">
                                            <label>Fin</label>
                                            <input type="datetime-local" value={stg.sale_stage_date_end} onChange={e => handleStageChange(index, 'sale_stage_date_end', e.target.value)} disabled={isReadOnly}/>
                                        </div>
                                        {!isReadOnly && formData.sale_stages.length > 1 && (
                                            <button type="button" className="btn-icon-danger phase-remove-btn" style={{marginBottom: '5px'}} onClick={() => removeStage(index)}>✕</button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* TICKETS SECTION (MATRIX) */}
                        <div className="section-card no-padding" style={{marginTop: '20px'}}>
                            <div className="section-header-padded">
                                <div className="header-title-group">
                                    <Ticket className="section-icon" size={24}/>
                                    <div>
                                        <h3>Matriz de Entradas</h3>
                                        <p className="section-desc">Vincula las Zonas con las Fases de Venta. Habilita y configura los cuadros deseados.</p>
                                    </div>
                                </div>
                            </div>
                            <div style={{padding: '20px', overflowX: 'auto'}}>
                                {formData.categories.length === 0 || formData.sale_stages.length === 0 ? (
                                    <div className="alert alert-warning" style={{ backgroundColor: '#FEF3C7', color: '#92400E', padding: '15px', borderRadius: '8px' }}>
                                        Agrega al menos una Categoría y una Fase de Venta para generar la matriz.
                                    </div>
                                ) : (
                                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ padding: '15px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', textAlign: 'left', minWidth: '150px' }}>
                                                    Zonas \ Fases
                                                </th>
                                                {formData.sale_stages.map(stg => (
                                                    <th key={stg.temp_id} style={{ padding: '15px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', textAlign: 'center', minWidth: '250px' }}>
                                                        {stg.stage_name || '(Sin Nombre)'}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {formData.categories.map(cat => (
                                                <tr key={cat.temp_id}>
                                                    <td style={{ padding: '15px', border: '1px solid #E2E8F0', fontWeight: 'bold', backgroundColor: '#F8FAFC' }}>
                                                        {cat.category_name || '(Sin Nombre)'}
                                                    </td>
                                                    {formData.sale_stages.map(stg => {
                                                        const ticket = formData.ticket_types.find(t => t.category_ref === cat.temp_id && t.stage_ref === stg.temp_id);
                                                        const isActive = !!ticket;
                                                        return (
                                                            <td key={stg.temp_id} style={{ padding: '15px', border: '1px solid #E2E8F0', verticalAlign: 'top', backgroundColor: isActive ? '#FFFFFF' : '#F1F5F9' }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                                                    <span style={{ fontSize: '0.9rem', fontWeight: isActive ? '600' : 'normal', color: isActive ? '#1E293B' : '#94A3B8' }}>
                                                                        {isActive ? 'Habilitado' : 'Deshabilitado'}
                                                                    </span>
                                                                    <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '40px', height: '20px' }}>
                                                                        <input 
                                                                            type="checkbox" 
                                                                            checked={isActive} 
                                                                            onChange={() => toggleMatrixTicket(cat.temp_id as string, stg.temp_id as string, cat.category_name, stg.stage_name)} 
                                                                            disabled={isReadOnly}
                                                                            style={{ opacity: 0, width: 0, height: 0 }}
                                                                        />
                                                                        <span style={{ position: 'absolute', cursor: isReadOnly ? 'not-allowed' : 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: isActive ? '#10B981' : '#CBD5E1', borderRadius: '20px', transition: '.4s' }}>
                                                                            <span style={{ position: 'absolute', content: '""', height: '16px', width: '16px', left: isActive ? '22px' : '2px', bottom: '2px', backgroundColor: 'white', borderRadius: '50%', transition: '.4s' }}></span>
                                                                        </span>
                                                                    </label>
                                                                </div>
                                                                
                                                                {isActive && ticket && (
                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                                                                        <div>
                                                                            <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '2px' }}>Nombre Ticket</label>
                                                                            <input type="text" value={ticket.ticket_type_name} onChange={e => handleMatrixTicketChange(cat.temp_id as string, stg.temp_id as string, 'ticket_type_name', e.target.value)} disabled={isReadOnly} style={{ width: '100%', padding: '6px', fontSize: '0.85rem' }} />
                                                                        </div>
                                                                        <div style={{ display: 'flex', gap: '5px' }}>
                                                                            <div style={{ flex: 1 }}>
                                                                                <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '2px' }}>Precio</label>
                                                                                <input type="number" step="0.01" value={ticket.price} onChange={e => handleMatrixTicketChange(cat.temp_id as string, stg.temp_id as string, 'price', parseFloat(e.target.value))} disabled={isReadOnly} style={{ width: '100%', padding: '6px', fontSize: '0.85rem' }} />
                                                                            </div>
                                                                            {!cat.has_shared_stages && (
                                                                                <div style={{ flex: 1 }}>
                                                                                    <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '2px' }}>Aforo (Fase)</label>
                                                                                    <input type="number" value={ticket.quantity_total} onChange={e => handleMatrixTicketChange(cat.temp_id as string, stg.temp_id as string, 'quantity_total', parseInt(e.target.value))} disabled={isReadOnly} style={{ width: '100%', padding: '6px', fontSize: '0.85rem' }} />
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
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
                            <div className="ml-auto" style={{ display: 'flex', gap: '15px' }}>
                                <button type="button" onClick={() => handleSave('draft')} disabled={isLoading} className="btn-secondary btn-large">
                                    {isLoading ? 'Guardando...' : <><Send size={20}/> Guardar Borrador</>}
                                </button>
                                <button type="button" onClick={() => handleSave('published')} disabled={isLoading} className="btn-primary btn-large btn-success">
                                    {isLoading ? 'Publicando...' : <><Send size={20}/> Validar y Publicar Evento</>}
                                </button>
                            </div>
                        )
                    )}
                </div>
            </form>
        </div>
    );
};

export default EventEditor;
