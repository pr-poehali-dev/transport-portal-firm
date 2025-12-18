-- Добавление полей для дат Фито в таблицу orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS fito_order_date DATE,
ADD COLUMN IF NOT EXISTS fito_ready_date DATE,
ADD COLUMN IF NOT EXISTS fito_received_date DATE;