-- Добавляем новые поля в таблицу clients для юридической информации
ALTER TABLE t_p96093837_transport_portal_fir.clients 
ADD COLUMN IF NOT EXISTS inn VARCHAR(12),
ADD COLUMN IF NOT EXISTS kpp VARCHAR(9),
ADD COLUMN IF NOT EXISTS legal_address TEXT,
ADD COLUMN IF NOT EXISTS director_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS delivery_address TEXT,
ADD COLUMN IF NOT EXISTS nickname VARCHAR(100);

-- Добавляем индекс для быстрого поиска по псевдониму
CREATE INDEX IF NOT EXISTS idx_clients_nickname ON t_p96093837_transport_portal_fir.clients(nickname);

-- Создаем таблицу customers (заказчики) как отдельную сущность
CREATE TABLE IF NOT EXISTS t_p96093837_transport_portal_fir.customers (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  inn VARCHAR(12) NOT NULL,
  kpp VARCHAR(9),
  legal_address TEXT NOT NULL,
  director_name VARCHAR(255) NOT NULL,
  delivery_address TEXT,
  nickname VARCHAR(100) UNIQUE NOT NULL,
  contact_person VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customers_nickname ON t_p96093837_transport_portal_fir.customers(nickname);
CREATE INDEX IF NOT EXISTS idx_customers_inn ON t_p96093837_transport_portal_fir.customers(inn);