import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { API_URL } from './config';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Save, Calendar, MapPin, Ticket, AlertTriangle, CheckCircle, Send } from 'lucide-react';
import './EventEditor.css';
const generateId = () => Math.random().toString(36).substr(2, 9);
const EventEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isFetching, setIsFetching] = useState(false);
    const initialCatId = generateId();
    const initialStgId = generateId();
    const [formData, setFormData] = useState({
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
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
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
                if (data.error)
                    throw new Error(data.error);
                const formatInputDate = (d) => d && d !== '1970-01-01 00:00:00' ? d.substring(0, 16) : '';
                const loadedCats = (data.categories || []).map((c) => ({ ...c, temp_id: generateId() }));
                const loadedStages = (data.sale_stages || []).map((s) => ({
                    ...s,
                    temp_id: generateId(),
                    sale_stage_date_start: formatInputDate(s.sale_stage_date_start),
                    sale_stage_date_end: formatInputDate(s.sale_stage_date_end)
                }));
                const loadedTickets = (data.ticket_types || []).map((t) => {
                    const cat = loadedCats.find((c) => c.category_id === t.category_id);
                    const stg = loadedStages.find((s) => s.sale_stage_id === t.sale_stage_id);
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
    const handleChange = (e) => {
        if (isReadOnly)
            return;
        const target = e.target;
        const { name, value, type, checked } = target;
        setFormData(prev => {
            let newVal = value;
            if (type === 'checkbox')
                newVal = checked;
            if (type === 'number')
                newVal = value === '' ? null : Number(value);
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
        if (isReadOnly)
            return;
        setFormData(prev => {
            const newCatTempId = generateId();
            // Automatically enable shared stages if global capacity is enabled
            const newCategory = { temp_id: newCatTempId, category_name: '', total_capacity: 0, has_shared_stages: prev.has_shared_capacity };
            // Generate tickets by default for all existing stages
            const newTickets = prev.sale_stages.map(stg => ({
                ticket_type_name: ` - ${stg.stage_name}`,
                category_ref: newCatTempId,
                stage_ref: stg.temp_id,
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
    const removeCategory = (index) => {
        if (isReadOnly)
            return;
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
    const handleCategoryChange = (index, field, value) => {
        if (isReadOnly)
            return;
        setFormData(prev => {
            const updated = [...prev.categories];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, categories: updated };
        });
    };
    // Funciones de Fases
    const addSaleStage = () => {
        if (isReadOnly)
            return;
        setFormData(prev => {
            const newStgTempId = generateId();
            const newStage = { temp_id: newStgTempId, stage_name: '', sale_stage_date_start: '', sale_stage_date_end: '' };
            // Generate tickets by default for all existing categories
            const newTickets = prev.categories.map(cat => ({
                ticket_type_name: `${cat.category_name} - `,
                category_ref: cat.temp_id,
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
    const removeStage = (index) => {
        if (isReadOnly)
            return;
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
    const handleStageChange = (index, field, value) => {
        if (isReadOnly)
            return;
        setFormData(prev => {
            const updated = [...prev.sale_stages];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, sale_stages: updated };
        });
    };
    // Funciones de Tickets
    const handleMatrixTicketChange = (catRef, stgRef, field, value) => {
        if (isReadOnly)
            return;
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
    const toggleMatrixTicket = (catRef, stgRef, catName, stgName) => {
        if (isReadOnly)
            return;
        setFormData(prev => {
            const exists = prev.ticket_types.find(t => t.category_ref === catRef && t.stage_ref === stgRef);
            if (exists) {
                // Eliminar
                return { ...prev, ticket_types: prev.ticket_types.filter(t => t.category_ref !== catRef || t.stage_ref !== stgRef) };
            }
            else {
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
    const handleSave = async (targetStatus) => {
        if (targetStatus === 'published') {
            const confirm = window.confirm("¿Estás seguro de publicar este evento? Una vez publicado NO podrás modificar la estructura de tickets ni fechas.");
            if (!confirm)
                return;
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
        }
        catch (err) {
            setError(err.message || 'Error de conexión.');
        }
        finally {
            setIsLoading(false);
        }
    };
    if (isFetching)
        return _jsx("div", { className: "loading-state", children: "Cargando datos del evento..." });
    return (_jsxs("div", { className: "wizard-container", children: [_jsxs("div", { className: "wizard-header", children: [_jsxs("div", { className: "wizard-title", children: [_jsx("h2", { children: id ? 'Editor de Evento' : 'Crear Nuevo Evento' }), _jsx("p", { className: "subtitle", children: isReadOnly ? 'Modo de Solo Lectura (Evento Publicado/Finalizado)' : (step === 1 ? 'Paso 1: Identidad del evento' : 'Paso 2: Tickets y Preventas') })] }), _jsxs("div", { className: "editor-actions-top", children: [formData.event_status === 'draft' && (_jsxs("span", { className: "draft-badge", children: [_jsx(AlertTriangle, { size: 14 }), " Borrador"] })), formData.event_status === 'published' && (_jsxs("span", { className: "published-badge", children: [_jsx(CheckCircle, { size: 14 }), " Publicado"] })), !isReadOnly && (_jsx("div", { className: "action-buttons", children: _jsxs("button", { type: "button", className: "btn-secondary", onClick: () => handleSave('draft'), disabled: isLoading, children: [_jsx(Save, { size: 16 }), " Guardar Borrador"] }) }))] })] }), error && _jsx("div", { className: "alert alert-error", children: error }), successMessage && _jsx("div", { className: "alert alert-success", children: successMessage }), isReadOnly && (_jsxs("div", { className: "readonly-banner", children: ["Este evento se encuentra en estado ", _jsx("strong", { children: formData.event_status.toUpperCase() }), ". Su estructura no puede ser modificada."] })), _jsxs("form", { onSubmit: (e) => e.preventDefault(), className: "wizard-form", children: [step === 1 && (_jsxs("div", { className: "wizard-step step-1 fade-in", children: [_jsxs("div", { className: "section-card", children: [_jsxs("h3", { children: [_jsx(Calendar, { className: "section-icon", size: 20 }), " Informaci\u00F3n B\u00E1sica"] }), _jsxs("div", { className: "form-row", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "T\u00EDtulo del Evento *" }), _jsx("input", { type: "text", name: "title", required: true, value: formData.title, onChange: handleChange, disabled: isReadOnly })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "URL Amigable (Slug) *" }), _jsx("input", { type: "text", name: "slug", required: true, value: formData.slug, onChange: handleChange, disabled: isReadOnly })] })] }), _jsxs("div", { className: "form-row", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Fecha y Hora de Inicio" }), _jsx("input", { type: "datetime-local", name: "event_date_start", value: formData.event_date_start, onChange: handleChange, disabled: isReadOnly })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Fecha y Hora de Fin" }), _jsx("input", { type: "datetime-local", name: "event_date_end", value: formData.event_date_end, onChange: handleChange, disabled: isReadOnly })] })] }), _jsxs("div", { className: "form-row", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "URL Imagen Portada" }), _jsx("input", { type: "text", name: "cover_image_url", value: formData.cover_image_url, onChange: handleChange, disabled: isReadOnly })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "URL Banner (Opcional)" }), _jsx("input", { type: "text", name: "banner_image_url", value: formData.banner_image_url, onChange: handleChange, disabled: isReadOnly })] })] })] }), _jsxs("div", { className: "section-card", children: [_jsxs("h3", { children: [_jsx(MapPin, { className: "section-icon", size: 20 }), " Ubicaci\u00F3n"] }), _jsxs("div", { className: "form-row", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Lugar del Evento" }), _jsx("input", { type: "text", name: "venue_name", value: formData.venue_name, onChange: handleChange, disabled: isReadOnly })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Direcci\u00F3n" }), _jsx("input", { type: "text", name: "venue_address", value: formData.venue_address, onChange: handleChange, disabled: isReadOnly })] })] }), _jsxs("div", { className: "form-row", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Ciudad" }), _jsx("input", { type: "text", name: "city", value: formData.city, onChange: handleChange, disabled: isReadOnly })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Pa\u00EDs" }), _jsx("input", { type: "text", name: "country", value: formData.country, onChange: handleChange, disabled: isReadOnly })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "T\u00F3pico / Categor\u00EDa" }), _jsxs("select", { name: "event_topic", value: formData.event_topic, onChange: handleChange, disabled: isReadOnly, style: { padding: '10px', borderRadius: '4px', border: '1px solid #E2E8F0', width: '100%' }, children: [_jsx("option", { value: "", children: "Seleccione una categor\u00EDa" }), _jsx("option", { value: "M\u00FAsica", children: "M\u00FAsica" }), _jsx("option", { value: "Tecnolog\u00EDa", children: "Tecnolog\u00EDa" }), _jsx("option", { value: "Negocios", children: "Negocios" }), _jsx("option", { value: "Deportes", children: "Deportes" }), _jsx("option", { value: "Arte y Teatro", children: "Arte y Teatro" }), _jsx("option", { value: "Gastronom\u00EDa", children: "Gastronom\u00EDa" }), _jsx("option", { value: "Educaci\u00F3n", children: "Educaci\u00F3n" }), _jsx("option", { value: "Salud", children: "Salud" }), _jsx("option", { value: "Otros", children: "Otros" })] })] })] })] })] })), step === 2 && (_jsxs("div", { className: "wizard-step step-2 fade-in", children: [_jsxs("div", { className: "section-card", style: { marginBottom: '20px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs("div", { children: [_jsx("h4", { style: { margin: '0 0 5px 0' }, children: "Aforo Global Compartido" }), _jsx("p", { style: { margin: 0, fontSize: '0.85rem', color: '#64748B' }, children: "Permite que todas las zonas compartan un \u00FAnico l\u00EDmite de aforo total." })] }), _jsxs("label", { className: "switch", style: { position: 'relative', display: 'inline-block', width: '40px', height: '20px' }, children: [_jsx("input", { type: "checkbox", name: "has_shared_capacity", checked: formData.has_shared_capacity, onChange: handleChange, disabled: isReadOnly, style: { opacity: 0, width: 0, height: 0 } }), _jsx("span", { style: { position: 'absolute', cursor: isReadOnly ? 'not-allowed' : 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: formData.has_shared_capacity ? '#10B981' : '#CBD5E1', borderRadius: '20px', transition: '.4s' }, children: _jsx("span", { style: { position: 'absolute', content: '""', height: '16px', width: '16px', left: formData.has_shared_capacity ? '22px' : '2px', bottom: '2px', backgroundColor: 'white', borderRadius: '50%', transition: '.4s' } }) })] })] }), formData.has_shared_capacity && (_jsxs("div", { className: "form-group", style: { marginTop: '15px' }, children: [_jsx("label", { children: "Aforo Total del Evento" }), _jsx("input", { type: "number", name: "global_capacity", min: "0", value: formData.global_capacity || '', onChange: handleChange, disabled: isReadOnly, style: { maxWidth: '200px' } })] }))] }), _jsxs("div", { className: "section-card no-padding", children: [_jsxs("div", { className: "section-header-padded", children: [_jsxs("div", { className: "header-title-group", children: [_jsx(Ticket, { className: "section-icon", size: 24 }), _jsxs("div", { children: [_jsx("h3", { children: "Categor\u00EDas (Zonas)" }), _jsx("p", { className: "section-desc", children: "Crea las zonas del evento (ej: VIP, General)." })] })] }), !isReadOnly && _jsx("button", { type: "button", className: "btn-secondary", onClick: addCategory, children: "+ A\u00F1adir Categor\u00EDa" })] }), _jsx("div", { className: "tiers-list", style: { padding: '20px' }, children: formData.categories.map((cat, index) => (_jsxs("div", { style: { borderBottom: '1px solid #E2E8F0', paddingBottom: '15px', marginBottom: '15px' }, children: [_jsxs("div", { className: "form-row", style: { alignItems: 'flex-end', marginBottom: '10px' }, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Nombre de Categor\u00EDa" }), _jsx("input", { type: "text", value: cat.category_name, onChange: e => handleCategoryChange(index, 'category_name', e.target.value), disabled: isReadOnly })] }), !formData.has_shared_capacity && (_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Aforo de la Zona" }), _jsx("input", { type: "number", min: "0", value: cat.total_capacity, onChange: e => handleCategoryChange(index, 'total_capacity', parseInt(e.target.value)), disabled: isReadOnly })] })), !isReadOnly && formData.categories.length > 1 && (_jsx("button", { type: "button", className: "btn-icon-danger phase-remove-btn", style: { marginBottom: '5px' }, onClick: () => removeCategory(index), children: "\u2715" }))] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '10px' }, children: [_jsxs("label", { className: "switch", style: { position: 'relative', display: 'inline-block', width: '30px', height: '16px' }, children: [_jsx("input", { type: "checkbox", checked: cat.has_shared_stages, onChange: e => handleCategoryChange(index, 'has_shared_stages', e.target.checked), disabled: isReadOnly, style: { opacity: 0, width: 0, height: 0 } }), _jsx("span", { style: { position: 'absolute', cursor: isReadOnly ? 'not-allowed' : 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: cat.has_shared_stages ? '#4F46E5' : '#CBD5E1', borderRadius: '16px', transition: '.4s' }, children: _jsx("span", { style: { position: 'absolute', content: '""', height: '12px', width: '12px', left: cat.has_shared_stages ? '16px' : '2px', bottom: '2px', backgroundColor: 'white', borderRadius: '50%', transition: '.4s' } }) })] }), _jsx("span", { style: { fontSize: '0.85rem', color: '#64748B' }, children: "Aforo compartido entre Fases para esta Zona" })] })] }, index))) })] }), _jsxs("div", { className: "section-card no-padding", style: { marginTop: '20px' }, children: [_jsxs("div", { className: "section-header-padded", children: [_jsxs("div", { className: "header-title-group", children: [_jsx(Ticket, { className: "section-icon", size: 24 }), _jsxs("div", { children: [_jsx("h3", { children: "Fases de Venta" }), _jsx("p", { className: "section-desc", children: "Fechas de preventas y ventas regulares." })] })] }), !isReadOnly && _jsx("button", { type: "button", className: "btn-secondary", onClick: addSaleStage, children: "+ A\u00F1adir Fase" })] }), _jsx("div", { className: "tiers-list", style: { padding: '20px' }, children: formData.sale_stages.map((stg, index) => (_jsxs("div", { className: "form-row", style: { alignItems: 'flex-end', marginBottom: '15px' }, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Nombre Fase" }), _jsx("input", { type: "text", value: stg.stage_name, onChange: e => handleStageChange(index, 'stage_name', e.target.value), disabled: isReadOnly })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Inicio" }), _jsx("input", { type: "datetime-local", value: stg.sale_stage_date_start, onChange: e => handleStageChange(index, 'sale_stage_date_start', e.target.value), disabled: isReadOnly })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Fin" }), _jsx("input", { type: "datetime-local", value: stg.sale_stage_date_end, onChange: e => handleStageChange(index, 'sale_stage_date_end', e.target.value), disabled: isReadOnly })] }), !isReadOnly && formData.sale_stages.length > 1 && (_jsx("button", { type: "button", className: "btn-icon-danger phase-remove-btn", style: { marginBottom: '5px' }, onClick: () => removeStage(index), children: "\u2715" }))] }, index))) })] }), _jsxs("div", { className: "section-card no-padding", style: { marginTop: '20px' }, children: [_jsx("div", { className: "section-header-padded", children: _jsxs("div", { className: "header-title-group", children: [_jsx(Ticket, { className: "section-icon", size: 24 }), _jsxs("div", { children: [_jsx("h3", { children: "Matriz de Entradas" }), _jsx("p", { className: "section-desc", children: "Vincula las Zonas con las Fases de Venta. Habilita y configura los cuadros deseados." })] })] }) }), _jsx("div", { style: { padding: '20px', overflowX: 'auto' }, children: formData.categories.length === 0 || formData.sale_stages.length === 0 ? (_jsx("div", { className: "alert alert-warning", style: { backgroundColor: '#FEF3C7', color: '#92400E', padding: '15px', borderRadius: '8px' }, children: "Agrega al menos una Categor\u00EDa y una Fase de Venta para generar la matriz." })) : (_jsxs("table", { style: { width: '100%', borderCollapse: 'collapse', minWidth: '600px' }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: { padding: '15px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', textAlign: 'left', minWidth: '150px' }, children: "Zonas \\ Fases" }), formData.sale_stages.map(stg => (_jsx("th", { style: { padding: '15px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', textAlign: 'center', minWidth: '250px' }, children: stg.stage_name || '(Sin Nombre)' }, stg.temp_id)))] }) }), _jsx("tbody", { children: formData.categories.map(cat => (_jsxs("tr", { children: [_jsx("td", { style: { padding: '15px', border: '1px solid #E2E8F0', fontWeight: 'bold', backgroundColor: '#F8FAFC' }, children: cat.category_name || '(Sin Nombre)' }), formData.sale_stages.map(stg => {
                                                                const ticket = formData.ticket_types.find(t => t.category_ref === cat.temp_id && t.stage_ref === stg.temp_id);
                                                                const isActive = !!ticket;
                                                                return (_jsxs("td", { style: { padding: '15px', border: '1px solid #E2E8F0', verticalAlign: 'top', backgroundColor: isActive ? '#FFFFFF' : '#F1F5F9' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }, children: [_jsx("span", { style: { fontSize: '0.9rem', fontWeight: isActive ? '600' : 'normal', color: isActive ? '#1E293B' : '#94A3B8' }, children: isActive ? 'Habilitado' : 'Deshabilitado' }), _jsxs("label", { className: "switch", style: { position: 'relative', display: 'inline-block', width: '40px', height: '20px' }, children: [_jsx("input", { type: "checkbox", checked: isActive, onChange: () => toggleMatrixTicket(cat.temp_id, stg.temp_id, cat.category_name, stg.stage_name), disabled: isReadOnly, style: { opacity: 0, width: 0, height: 0 } }), _jsx("span", { style: { position: 'absolute', cursor: isReadOnly ? 'not-allowed' : 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: isActive ? '#10B981' : '#CBD5E1', borderRadius: '20px', transition: '.4s' }, children: _jsx("span", { style: { position: 'absolute', content: '""', height: '16px', width: '16px', left: isActive ? '22px' : '2px', bottom: '2px', backgroundColor: 'white', borderRadius: '50%', transition: '.4s' } }) })] })] }), isActive && ticket && (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }, children: [_jsxs("div", { children: [_jsx("label", { style: { fontSize: '0.8rem', display: 'block', marginBottom: '2px' }, children: "Nombre Ticket" }), _jsx("input", { type: "text", value: ticket.ticket_type_name, onChange: e => handleMatrixTicketChange(cat.temp_id, stg.temp_id, 'ticket_type_name', e.target.value), disabled: isReadOnly, style: { width: '100%', padding: '6px', fontSize: '0.85rem' } })] }), _jsxs("div", { style: { display: 'flex', gap: '5px' }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsx("label", { style: { fontSize: '0.8rem', display: 'block', marginBottom: '2px' }, children: "Precio" }), _jsx("input", { type: "number", step: "0.01", value: ticket.price, onChange: e => handleMatrixTicketChange(cat.temp_id, stg.temp_id, 'price', parseFloat(e.target.value)), disabled: isReadOnly, style: { width: '100%', padding: '6px', fontSize: '0.85rem' } })] }), !cat.has_shared_stages && (_jsxs("div", { style: { flex: 1 }, children: [_jsx("label", { style: { fontSize: '0.8rem', display: 'block', marginBottom: '2px' }, children: "Aforo (Fase)" }), _jsx("input", { type: "number", value: ticket.quantity_total, onChange: e => handleMatrixTicketChange(cat.temp_id, stg.temp_id, 'quantity_total', parseInt(e.target.value)), disabled: isReadOnly, style: { width: '100%', padding: '6px', fontSize: '0.85rem' } })] }))] })] }))] }, stg.temp_id));
                                                            })] }, cat.temp_id))) })] })) })] })] })), _jsxs("div", { className: "wizard-actions", children: [step === 2 && (_jsxs("button", { type: "button", className: "btn-ghost-large", onClick: () => setStep(1), children: [_jsx(ChevronLeft, { size: 20 }), " Atr\u00E1s"] })), step === 1 ? (_jsxs("button", { type: "button", className: "btn-primary btn-large ml-auto", onClick: () => setStep(2), children: ["Continuar a Tickets ", _jsx(ChevronRight, { size: 20 })] })) : (!isReadOnly && (_jsxs("div", { className: "ml-auto", style: { display: 'flex', gap: '15px' }, children: [_jsx("button", { type: "button", onClick: () => handleSave('draft'), disabled: isLoading, className: "btn-secondary btn-large", children: isLoading ? 'Guardando...' : _jsxs(_Fragment, { children: [_jsx(Send, { size: 20 }), " Guardar Borrador"] }) }), _jsx("button", { type: "button", onClick: () => handleSave('published'), disabled: isLoading, className: "btn-primary btn-large btn-success", children: isLoading ? 'Publicando...' : _jsxs(_Fragment, { children: [_jsx(Send, { size: 20 }), " Validar y Publicar Evento"] }) })] })))] })] })] }));
};
export default EventEditor;
//# sourceMappingURL=EventEditor.js.map