-- Создание таблицы адресов доставки для заказчиков
CREATE TABLE t_p96093837_transport_portal_fir.customer_delivery_addresses (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES t_p96093837_transport_portal_fir.customers(id),
    address_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(50),
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индекс для быстрого поиска адресов по заказчику
CREATE INDEX idx_customer_delivery_addresses_customer_id ON t_p96093837_transport_portal_fir.customer_delivery_addresses(customer_id);

-- Мигрируем существующие адреса доставки в новую таблицу
INSERT INTO t_p96093837_transport_portal_fir.customer_delivery_addresses (customer_id, address_name, address, is_primary)
SELECT id, 'Основной адрес', delivery_address, true
FROM t_p96093837_transport_portal_fir.customers
WHERE delivery_address IS NOT NULL AND delivery_address != '';