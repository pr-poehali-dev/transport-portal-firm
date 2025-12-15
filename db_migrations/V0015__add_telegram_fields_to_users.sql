-- Добавляем поля для Telegram привязки каждого пользователя
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS telegram_chat_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS invite_code VARCHAR(20) UNIQUE,
ADD COLUMN IF NOT EXISTS telegram_connected_at TIMESTAMP;

-- Создаем индекс для быстрого поиска по invite_code
CREATE INDEX IF NOT EXISTS idx_users_invite_code ON users(invite_code);
CREATE INDEX IF NOT EXISTS idx_users_telegram_chat_id ON users(telegram_chat_id);

-- Генерируем уникальные invite_code для существующих пользователей
UPDATE users 
SET invite_code = 'INV_' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8))
WHERE invite_code IS NULL;
