-- Добавляем поле delivery_address_id
ALTER TABLE stage_waypoints 
ADD COLUMN IF NOT EXISTS delivery_address_id INTEGER REFERENCES customer_delivery_addresses(id);