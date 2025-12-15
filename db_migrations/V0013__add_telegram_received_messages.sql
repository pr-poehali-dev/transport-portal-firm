-- Таблица для входящих сообщений от пользователей бота
CREATE TABLE IF NOT EXISTS telegram_received_messages (
    id SERIAL PRIMARY KEY,
    chat_id VARCHAR(50) NOT NULL,
    username VARCHAR(255),
    message TEXT NOT NULL,
    command VARCHAR(50),
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_telegram_received_chat ON telegram_received_messages(chat_id);
CREATE INDEX idx_telegram_received_time ON telegram_received_messages(received_at DESC);
