SET @org_id = 1;
SET @cust_id = 1;

INSERT INTO EVENTS (organizer_id, title, venue_name, venue_address, city, event_date_start, event_date_end, cover_image_url, banner_image_url, event_status, slug)
VALUES (@org_id, 'Festival de Mock Data V2', 'Mock Arena 2', '123 Fake St', 'Lima', '2026-10-01 10:00:00', '2026-10-01 23:00:00', 'https://images.unsplash.com/photo-1540039155732-61ee14b127ee?auto=format&fit=crop&q=80&w=400&h=200', '', 'published', 'mock-fest-v3-2026');

SET @evt_id = LAST_INSERT_ID();

INSERT INTO CATEGORIES (event_id, category_name, total_capacity) VALUES (@evt_id, 'General', 1000);
SET @cat_gen = LAST_INSERT_ID();

INSERT INTO CATEGORIES (event_id, category_name, total_capacity) VALUES (@evt_id, 'VIP', 200);
SET @cat_vip = LAST_INSERT_ID();

INSERT INTO SALE_STAGES (event_id, stage_name, sale_stage_date_start, sale_stage_date_end) VALUES (@evt_id, 'Fase 1', '2026-01-01 00:00:00', '2026-09-30 23:59:59');
SET @stage_id = LAST_INSERT_ID();

INSERT INTO TICKET_TYPES (category_id, sale_stage_id, ticket_type_name, ticket_type_description, price, quantity_total, sale_start_date, sale_end_date)
VALUES (@cat_gen, @stage_id, 'General Early Bird', 'Entrada general', 50.00, 1000, '2026-01-01 00:00:00', '2026-09-30 23:59:59');
SET @tt_gen = LAST_INSERT_ID();

INSERT INTO TICKET_TYPES (category_id, sale_stage_id, ticket_type_name, ticket_type_description, price, quantity_total, sale_start_date, sale_end_date)
VALUES (@cat_vip, @stage_id, 'VIP Early Bird', 'Entrada VIP', 150.00, 200, '2026-01-01 00:00:00', '2026-09-30 23:59:59');
SET @tt_vip = LAST_INSERT_ID();

-- Crear Order
INSERT INTO ORDERS (customer_id, event_id, order_number, total_amount, order_status, payment_status, payment_reference, buyer_email, buyer_phone, expires_at, confirmed_at, cancelled_at, cancellation_reason)
VALUES (@cust_id, @evt_id, 'ORD-MOCK-002', 250.00, 'confirmed', 'paid', 'REF-123456', 'customer@test.com', '987654321', '2026-10-01 00:00:00', NOW(), '2000-01-01 00:00:00', '');

SET @order_id = LAST_INSERT_ID();

-- Crear Order Items (2 General, 1 VIP)
INSERT INTO ORDER_ITEMS (order_id, ticket_type_id, quantity, unit_price, subtotal)
VALUES (@order_id, @tt_gen, 2, 50.00, 100.00);

INSERT INTO ORDER_ITEMS (order_id, ticket_type_id, quantity, unit_price, subtotal)
VALUES (@order_id, @tt_vip, 1, 150.00, 150.00);

-- Actualizar TICKET_TYPES con tickets vendidos (quantity_sold)
UPDATE TICKET_TYPES SET quantity_sold = 2 WHERE ticket_type_id = @tt_gen;
UPDATE TICKET_TYPES SET quantity_sold = 1 WHERE ticket_type_id = @tt_vip;

-- Crear Tickets
INSERT INTO TICKETS (ticket_type_id, order_id, ticket_number, qr_code, qr_code_image_url, transferred_to_customer_id, transferred_to_event_id)
VALUES (@tt_gen, @order_id, 'TKT-GEN-003', 'qr_gen_003', '', @cust_id, @evt_id);

INSERT INTO TICKETS (ticket_type_id, order_id, ticket_number, qr_code, qr_code_image_url, transferred_to_customer_id, transferred_to_event_id)
VALUES (@tt_gen, @order_id, 'TKT-GEN-004', 'qr_gen_004', '', @cust_id, @evt_id);

INSERT INTO TICKETS (ticket_type_id, order_id, ticket_number, qr_code, qr_code_image_url, transferred_to_customer_id, transferred_to_event_id)
VALUES (@tt_vip, @order_id, 'TKT-VIP-002', 'qr_vip_002', '', @cust_id, @evt_id);
