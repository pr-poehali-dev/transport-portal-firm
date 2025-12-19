-- Добавляем поля customer_id и address_type в таблицу stage_waypoints
ALTER TABLE stage_waypoints 
ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES customers(id),
ADD COLUMN IF NOT EXISTS address_type VARCHAR(20) CHECK (address_type IN ('legal', 'delivery'));