-- Добавляем поле для имени пользователя в журнал действий
ALTER TABLE activity_log 
ADD COLUMN IF NOT EXISTS user_name VARCHAR(255);

-- Обновляем существующие записи (устанавливаем user_role как user_name для старых записей)
UPDATE activity_log 
SET user_name = user_role 
WHERE user_name IS NULL;
