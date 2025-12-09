-- Создание таблицы для логирования действий пользователей
CREATE TABLE IF NOT EXISTS activity_log (
    id SERIAL PRIMARY KEY,
    order_id INTEGER,
    user_role VARCHAR(50) NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_log_order_id ON activity_log(order_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at DESC);