-- Таблица для настроек Telegram бота
CREATE TABLE IF NOT EXISTS telegram_bot_settings (
    id SERIAL PRIMARY KEY,
    bot_token VARCHAR(255) NOT NULL,
    chat_id VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для настройки уведомлений по ролям
CREATE TABLE IF NOT EXISTS telegram_notifications_config (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    chat_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_name, event_type)
);

-- Вставляем дефолтные настройки уведомлений для админа
INSERT INTO telegram_notifications_config (role_name, event_type, is_enabled) VALUES
('admin', 'order_created', true),
('admin', 'order_loaded', true),
('admin', 'order_in_transit', true),
('admin', 'order_delivered', true),
('admin', 'stage_completed', true)
ON CONFLICT (role_name, event_type) DO NOTHING;

-- Таблица для логирования отправленных уведомлений
CREATE TABLE IF NOT EXISTS telegram_sent_notifications (
    id SERIAL PRIMARY KEY,
    order_id INTEGER,
    event_type VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    chat_id VARCHAR(255) NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_success BOOLEAN DEFAULT true,
    error_message TEXT
);