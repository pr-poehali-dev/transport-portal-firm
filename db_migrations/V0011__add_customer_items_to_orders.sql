-- Добавляем поддержку множественных заказчиков в заказ
ALTER TABLE t_p96093837_transport_portal_fir.orders 
ADD COLUMN IF NOT EXISTS customer_items JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN t_p96093837_transport_portal_fir.orders.customer_items IS 'Массив заказчиков с примечаниями: [{customer_id: 1, note: "7 тонн"}, ...]';