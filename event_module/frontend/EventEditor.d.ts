import React from 'react';
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
declare const EventEditor: React.FC;
export default EventEditor;
//# sourceMappingURL=EventEditor.d.ts.map