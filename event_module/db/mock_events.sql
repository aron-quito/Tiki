INSERT INTO EVENTS (organizer_id, title, venue_name, venue_address, city, country, event_date_start, event_date_end, cover_image_url, banner_image_url, global_capacity, has_shared_capacity, event_topic, event_status, is_featured, slug)
VALUES
(1, 'Concierto de Rock Verano 2026', 'Estadio Nacional', 'Av. Paseo de la República', 'Lima', 'Peru', '2026-08-15 20:00:00', '2026-08-15 23:59:59', 'https://images.unsplash.com/photo-1540039155732-6762a4d3392f', 'https://images.unsplash.com/photo-1540039155732-6762a4d3392f', 50000, FALSE, 'Música', 'published', TRUE, 'concierto-rock-2026'),
(1, 'Tech Conference 2026', 'Centro de Convenciones', 'Av. La Arqueología', 'Lima', 'Peru', '2026-09-10 09:00:00', '2026-09-12 18:00:00', 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678', 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678', 2000, TRUE, 'Tecnología', 'published', FALSE, 'tech-conf-2026');

-- The IDs will be the max ones, let's assume 1 and 2 if DB is empty, or use subqueries for safety, 
-- but it's easier to just fetch LAST_INSERT_ID() if we ran a script, or we can just use variables.

SET @evt1 = (SELECT event_id FROM EVENTS WHERE slug = 'concierto-rock-2026' LIMIT 1);
SET @evt2 = (SELECT event_id FROM EVENTS WHERE slug = 'tech-conf-2026' LIMIT 1);

-- Categories for Event 1
INSERT INTO CATEGORIES (event_id, category_name, total_capacity, has_shared_stages) VALUES 
(@evt1, 'VIP', 5000, FALSE),
(@evt1, 'General', 45000, FALSE);

SET @cat1_vip = (SELECT category_id FROM CATEGORIES WHERE event_id = @evt1 AND category_name = 'VIP' LIMIT 1);
SET @cat1_gen = (SELECT category_id FROM CATEGORIES WHERE event_id = @evt1 AND category_name = 'General' LIMIT 1);

-- Sale Stages for Event 1
INSERT INTO SALE_STAGES (event_id, stage_name, sale_stage_date_start, sale_stage_date_end) VALUES
(@evt1, 'Preventa', '2026-06-01 00:00:00', '2026-07-10 23:59:59'),
(@evt1, 'Regular', '2026-07-11 00:00:00', '2026-08-14 23:59:59');

SET @stage1_pre = (SELECT sale_stage_id FROM SALE_STAGES WHERE event_id = @evt1 AND stage_name = 'Preventa' LIMIT 1);
SET @stage1_reg = (SELECT sale_stage_id FROM SALE_STAGES WHERE event_id = @evt1 AND stage_name = 'Regular' LIMIT 1);

-- Ticket Types for Event 1
INSERT INTO TICKET_TYPES (category_id, sale_stage_id, ticket_type_name, ticket_type_description, price, currency, quantity_total, quantity_sold, quantity_reserved, sale_start_date, sale_end_date) VALUES
(@cat1_vip, @stage1_pre, 'VIP Preventa', 'Acceso anticipado VIP', 150.00, 'USD', 2000, 2000, 0, '2026-06-01 00:00:00', '2026-07-10 23:59:59'),
(@cat1_vip, @stage1_reg, 'VIP Regular', 'Acceso VIP zona preferencial', 200.00, 'USD', 3000, 0, 0, '2026-07-11 00:00:00', '2026-08-14 23:59:59'),
(@cat1_gen, @stage1_pre, 'General Preventa', 'Acceso anticipado General', 50.00, 'USD', 15000, 15000, 0, '2026-06-01 00:00:00', '2026-07-10 23:59:59'),
(@cat1_gen, @stage1_reg, 'General Regular', 'Acceso a zona general', 75.00, 'USD', 30000, 0, 0, '2026-07-11 00:00:00', '2026-08-14 23:59:59');

-- Update statuses for Event 1 Ticket Types based on time
UPDATE TICKET_TYPES SET ticket_type_status = 'inactive' WHERE sale_stage_id = @stage1_pre;

-- Categories for Event 2
INSERT INTO CATEGORIES (event_id, category_name, total_capacity, has_shared_stages) VALUES 
(@evt2, 'Pase Completo 3 Días', 1000, TRUE),
(@evt2, 'Pase 1 Día', 1000, TRUE);

SET @cat2_full = (SELECT category_id FROM CATEGORIES WHERE event_id = @evt2 AND category_name = 'Pase Completo 3 Días' LIMIT 1);
SET @cat2_day = (SELECT category_id FROM CATEGORIES WHERE event_id = @evt2 AND category_name = 'Pase 1 Día' LIMIT 1);

-- Sale Stages for Event 2
INSERT INTO SALE_STAGES (event_id, stage_name, sale_stage_date_start, sale_stage_date_end) VALUES
(@evt2, 'Early Bird', '2026-05-01 00:00:00', '2026-06-30 23:59:59'),
(@evt2, 'Regular', '2026-07-01 00:00:00', '2026-09-09 23:59:59');

SET @stage2_eb = (SELECT sale_stage_id FROM SALE_STAGES WHERE event_id = @evt2 AND stage_name = 'Early Bird' LIMIT 1);
SET @stage2_reg = (SELECT sale_stage_id FROM SALE_STAGES WHERE event_id = @evt2 AND stage_name = 'Regular' LIMIT 1);

-- Ticket Types for Event 2
INSERT INTO TICKET_TYPES (category_id, sale_stage_id, ticket_type_name, ticket_type_description, price, currency, quantity_total, quantity_sold, quantity_reserved, sale_start_date, sale_end_date) VALUES
(@cat2_full, @stage2_eb, '3 Días Early Bird', 'Pase completo con descuento', 120.00, 'USD', 300, 300, 0, '2026-05-01 00:00:00', '2026-06-30 23:59:59'),
(@cat2_full, @stage2_reg, '3 Días Regular', 'Pase completo regular', 180.00, 'USD', 700, 0, 0, '2026-07-01 00:00:00', '2026-09-09 23:59:59'),
(@cat2_day, @stage2_eb, '1 Día Early Bird', 'Pase para un día específico con descuento', 50.00, 'USD', 300, 300, 0, '2026-05-01 00:00:00', '2026-06-30 23:59:59'),
(@cat2_day, @stage2_reg, '1 Día Regular', 'Pase para un día específico', 75.00, 'USD', 700, 0, 0, '2026-07-01 00:00:00', '2026-09-09 23:59:59');

-- Update statuses for Event 2 Ticket Types based on time
UPDATE TICKET_TYPES SET ticket_type_status = 'inactive' WHERE sale_stage_id = @stage2_eb;

