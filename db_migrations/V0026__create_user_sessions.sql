-- Таблица для отслеживания активных пользователей в разделах
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    section_name VARCHAR(50) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50),
    is_editing BOOLEAN DEFAULT FALSE,
    editing_item_id INTEGER,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индекс для быстрого поиска активных сессий
CREATE INDEX IF NOT EXISTS idx_user_sessions_section ON user_sessions(section_name, last_activity);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);