CREATE TABLE IF NOT EXISTS `CUSTOMERS` (
	`customer_id` INTEGER AUTO_INCREMENT,
	`email` VARCHAR(255) NOT NULL UNIQUE,
	`password_hash` VARCHAR(255) NOT NULL,
	`nickname` VARCHAR(255) NOT NULL,
	`phone_number` VARCHAR(20) NOT NULL,
	`email_verified` BOOLEAN DEFAULT false,
	`profile_image_url` VARCHAR(500) NOT NULL,
	`created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	`updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	`national_id` VARCHAR(15) NOT NULL UNIQUE,
	`foreigners_identity_card` VARCHAR(15) NOT NULL UNIQUE,
	`birthday` DATE NOT NULL,
	`first_name` VARCHAR(100) NOT NULL,
	`last_name` VARCHAR(100) NOT NULL,
	PRIMARY KEY(`customer_id`)
);


CREATE TABLE IF NOT EXISTS `ORGANIZERS` (
	`organizer_id` INTEGER AUTO_INCREMENT,
	`email` VARCHAR(255) NOT NULL UNIQUE,
	`password_hash` VARCHAR(255) NOT NULL,
	`nickname` VARCHAR(255) NOT NULL,
	`phone_number` VARCHAR(20) NOT NULL,
	`email_verified` BOOLEAN DEFAULT false,
	`profile_image_url` VARCHAR(500) NOT NULL,
	`created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	`updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	`ruc` VARCHAR(11) NOT NULL UNIQUE,
	`company_name` VARCHAR(100) NOT NULL,
	`trade_name` VARCHAR(100) NOT NULL,
	`corporate_phone_number` VARCHAR(20) NOT NULL,
	PRIMARY KEY(`organizer_id`)
);


CREATE TABLE IF NOT EXISTS `ADMINS` (
	`admin_id` INTEGER AUTO_INCREMENT,
	`password_hash` VARCHAR(255) NOT NULL,
	`nickname` VARCHAR(255) NOT NULL,
	`phone_number` VARCHAR(20) NOT NULL,
	`email_verified` BOOLEAN DEFAULT false,
	`profile_image_url` VARCHAR(500) NOT NULL,
	`created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	`updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	`internal_code` VARCHAR(50) NOT NULL UNIQUE,
	`department` VARCHAR(100) NOT NULL,
	PRIMARY KEY(`admin_id`)
);


CREATE TABLE IF NOT EXISTS `EVENTS` (
	`event_id` INTEGER NOT NULL AUTO_INCREMENT,
	`organizer_id` INTEGER NOT NULL,
	`title` VARCHAR(250) NOT NULL,
	`venue_name` VARCHAR(255) NOT NULL,
	`venue_address` VARCHAR(255) NOT NULL,
	`city` VARCHAR(100) NOT NULL,
	`country` VARCHAR(100) NOT NULL DEFAULT 'Peru',
	`event_date_start` TIMESTAMP NOT NULL,
	`event_date_end` TIMESTAMP NOT NULL,
	`cover_image_url` VARCHAR(500) NOT NULL,
	`banner_image_url` VARCHAR(500) NOT NULL,
	`global_capacity` INTEGER DEFAULT NULL,
	`has_shared_capacity` BOOLEAN DEFAULT FALSE,
	`event_topic` VARCHAR(100) DEFAULT NULL,
	`event_status` ENUM('draft', 'published', 'cancelled', 'completed') NOT NULL DEFAULT 'draft',
	`is_featured` BOOLEAN DEFAULT false,
	`slug` VARCHAR(255) UNIQUE,
	`created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	`updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY(`event_id`)
);


CREATE TABLE IF NOT EXISTS `CATEGORIES` (
	`category_id` INTEGER NOT NULL AUTO_INCREMENT,
	`event_id` INTEGER NOT NULL,
	`category_name` VARCHAR(100) NOT NULL,
	`total_capacity` INTEGER NOT NULL,
	`has_shared_stages` BOOLEAN DEFAULT FALSE,
	PRIMARY KEY(`category_id`)
);


CREATE TABLE IF NOT EXISTS `SALE_STAGES` (
	`sale_stage_id` INTEGER NOT NULL AUTO_INCREMENT,
	`event_id` INTEGER NOT NULL,
	`stage_name` VARCHAR(100) NOT NULL,
	`sale_stage_date_start` DATETIME NOT NULL,
	`sale_stage_date_end` DATETIME NOT NULL,
	PRIMARY KEY(`sale_stage_id`)
);


CREATE TABLE IF NOT EXISTS `TICKET_TYPES` (
	`ticket_type_id` INTEGER NOT NULL AUTO_INCREMENT,
	`category_id` INTEGER NOT NULL,
	`sale_stage_id` INTEGER NOT NULL,
	`ticket_type_name` VARCHAR(100) NOT NULL,
	`ticket_type_description` TEXT NOT NULL,
	`price` DECIMAL(10,2) NOT NULL,
	`currency` VARCHAR(3) DEFAULT 'KES',
	`quantity_total` INTEGER NOT NULL,
	`quantity_sold` INTEGER NOT NULL DEFAULT 0,
	`quantity_reserved` INTEGER NOT NULL DEFAULT 0,
	`sale_start_date` TIMESTAMP NOT NULL,
	`sale_end_date` TIMESTAMP NOT NULL,
	`min_per_order` INTEGER DEFAULT 1,
	`max_per_order` INTEGER DEFAULT 10,
	`sort_order` INTEGER DEFAULT 0,
	`ticket_type_status` ENUM('active', 'sold_out', 'inactive') NOT NULL DEFAULT 'active',
	`created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	`updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY(`ticket_type_id`)
);


CREATE TABLE IF NOT EXISTS `ORDERS` (
	`order_id` INTEGER NOT NULL AUTO_INCREMENT,
	`customer_id` INTEGER NOT NULL,
	`event_id` INTEGER NOT NULL,
	`order_number` VARCHAR(50) NOT NULL UNIQUE,
	`total_amount` DECIMAL(10,2) NOT NULL,
	`currency` VARCHAR(3) DEFAULT 'USD',
	`order_status` ENUM('pending', 'confirmed', 'cancelled', 'refunded', 'expired') NOT NULL DEFAULT 'pending',
	`payment_status` ENUM('pending', 'paid', 'failed', 'refunded', 'partially_refunded') NOT NULL DEFAULT 'pending',
	`payment_reference` VARCHAR(255) NOT NULL,
	`buyer_email` VARCHAR(255) NOT NULL,
	`buyer_phone` VARCHAR(255) NOT NULL,
	`expires_at` TIMESTAMP NOT NULL,
	`confirmed_at` TIMESTAMP NOT NULL,
	`cancelled_at` TIMESTAMP NOT NULL,
	`cancellation_reason` TEXT NOT NULL,
	`created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	`updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY(`order_id`)
);


CREATE TABLE IF NOT EXISTS `ORDER_ITEMS` (
	`order_item_id` INTEGER NOT NULL AUTO_INCREMENT,
	`order_id` INTEGER NOT NULL,
	`ticket_type_id` INTEGER NOT NULL,
	`quantity` INTEGER NOT NULL CHECK(`quantity` > 0),
	`unit_price` DECIMAL(10,2) NOT NULL,
	`subtotal` DECIMAL(10,2) NOT NULL,
	`discount_amount` DECIMAL(10,2) DEFAULT 0,
	`created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY(`order_item_id`)
);


CREATE TABLE IF NOT EXISTS `TICKETS` (
	`ticket_id` INTEGER NOT NULL AUTO_INCREMENT,
	`ticket_type_id` INTEGER NOT NULL,
	`order_id` INTEGER NOT NULL,
	`ticket_number` VARCHAR(50) NOT NULL UNIQUE,
	`qr_code` VARCHAR(255) NOT NULL UNIQUE,
	`qr_code_image_url` VARCHAR(500) NOT NULL,
	`tickets_status` ENUM('valid', 'used', 'cancelled', 'transferred', 'refunded') NOT NULL DEFAULT 'valid',
	`checked_in_at` TIMESTAMP NULL DEFAULT NULL,
	`checked_in_by` VARCHAR(255),
	`transferred_to_customer_id` INTEGER NOT NULL,
	`transferred_to_event_id` INTEGER NOT NULL,
	`created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY(`ticket_id`)
);


CREATE TABLE IF NOT EXISTS `PAYMENT_TRANSACTIONS` (
	`payment_id` INTEGER NOT NULL AUTO_INCREMENT,
	`order_id` INTEGER NOT NULL,
	`amount` DECIMAL(10,2) NOT NULL,
	`currency` VARCHAR(3) DEFAULT 'KES',
	`payment_method` VARCHAR(50) NOT NULL,
	`transaction_reference` VARCHAR(255) NOT NULL,
	`phone_number` VARCHAR(20) NOT NULL,
	`account_reference` VARCHAR(100) NOT NULL,
	`payment_status` ENUM('initiated', 'pending', 'success', 'failed', 'cancelled') NOT NULL,
	`error_message` TEXT NOT NULL,
	`callback_received_at` TIMESTAMP NOT NULL,
	`created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	`updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY(`payment_id`)
);


ALTER TABLE `EVENTS`
ADD FOREIGN KEY(`organizer_id`) REFERENCES `ORGANIZERS`(`organizer_id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `CATEGORIES`
ADD FOREIGN KEY(`event_id`) REFERENCES `EVENTS`(`event_id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `SALE_STAGES`
ADD FOREIGN KEY(`event_id`) REFERENCES `EVENTS`(`event_id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `TICKET_TYPES`
ADD FOREIGN KEY(`sale_stage_id`) REFERENCES `SALE_STAGES`(`sale_stage_id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `TICKET_TYPES`
ADD FOREIGN KEY(`category_id`) REFERENCES `CATEGORIES`(`category_id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `ORDERS`
ADD FOREIGN KEY(`event_id`) REFERENCES `EVENTS`(`event_id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `ORDERS`
ADD FOREIGN KEY(`customer_id`) REFERENCES `CUSTOMERS`(`customer_id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `ORDER_ITEMS`
ADD FOREIGN KEY(`order_id`) REFERENCES `ORDERS`(`order_id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `ORDER_ITEMS`
ADD FOREIGN KEY(`ticket_type_id`) REFERENCES `TICKET_TYPES`(`ticket_type_id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `TICKETS`
ADD FOREIGN KEY(`order_id`) REFERENCES `ORDERS`(`order_id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `TICKETS`
ADD FOREIGN KEY(`ticket_type_id`) REFERENCES `TICKET_TYPES`(`ticket_type_id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `TICKETS`
ADD FOREIGN KEY(`transferred_to_customer_id`) REFERENCES `CUSTOMERS`(`customer_id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `TICKETS`
ADD FOREIGN KEY(`transferred_to_event_id`) REFERENCES `EVENTS`(`event_id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `PAYMENT_TRANSACTIONS`
ADD FOREIGN KEY(`order_id`) REFERENCES `ORDERS`(`order_id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;

-- Insert mock users for testing (Password is: 123456)
INSERT INTO `ORGANIZERS` (`email`, `password_hash`, `nickname`, `phone_number`, `profile_image_url`, `ruc`, `company_name`, `trade_name`, `corporate_phone_number`)
VALUES ('organizer@test.com', '$2y$12$fPL7Obsw29LHO2jIjvecI.mZ/rLN1W02YjZLfusesLPW70oYfrJFG', 'OrgTest', '123456789', '', '12345678901', 'Test Company', 'Test Trade', '123456789');

INSERT INTO `CUSTOMERS` (`email`, `password_hash`, `nickname`, `phone_number`, `profile_image_url`, `national_id`, `foreigners_identity_card`, `birthday`, `first_name`, `last_name`)
VALUES ('customer@test.com', '$2y$12$fPL7Obsw29LHO2jIjvecI.mZ/rLN1W02YjZLfusesLPW70oYfrJFG', 'CustTest', '987654321', '', '12345678', 'N/A', '1990-01-01', 'Test', 'Customer');

CREATE TABLE IF NOT EXISTS `ATTENDANCE_LOGS` (
	`log_id` INTEGER NOT NULL AUTO_INCREMENT,
	`event_id` INTEGER NOT NULL,
	`ticket_id` INTEGER NOT NULL,
	`action_type` VARCHAR(50) NOT NULL,
	`performed_by` INTEGER NOT NULL,
	`created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY(`log_id`)
);
