-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(200),
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы ролей и их прав
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    permissions JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставка дефолтных ролей
INSERT INTO roles (role_name, display_name, permissions) VALUES
('admin', 'Администратор', '{"orders": {"view": true, "create": true, "edit": true}, "drivers": {"view": true, "create": true, "edit": true}, "vehicles": {"view": true, "create": true, "edit": true}, "clients": {"view": true, "create": true, "edit": true}, "overview": {"view": true}, "settings": {"view": true, "edit": true}}'),
('logist', 'Логист', '{"orders": {"view": true, "create": false, "edit": true}, "drivers": {"view": true, "create": true, "edit": true}, "vehicles": {"view": true, "create": true, "edit": true}, "clients": {"view": true, "create": false, "edit": false}, "overview": {"view": true}, "settings": {"view": false, "edit": false}}'),
('buyer', 'Байер', '{"orders": {"view": true, "create": true, "edit": true}, "drivers": {"view": true, "create": false, "edit": false}, "vehicles": {"view": true, "create": false, "edit": false}, "clients": {"view": true, "create": true, "edit": true}, "overview": {"view": true}, "settings": {"view": false, "edit": false}}'),
('manager', 'Менеджер', '{"orders": {"view": true, "create": false, "edit": false}, "drivers": {"view": true, "create": false, "edit": false}, "vehicles": {"view": true, "create": false, "edit": false}, "clients": {"view": true, "create": false, "edit": false}, "overview": {"view": true}, "settings": {"view": false, "edit": false}}'),
('director', 'Руководитель', '{"orders": {"view": true, "create": false, "edit": false}, "drivers": {"view": false, "create": false, "edit": false}, "vehicles": {"view": false, "create": false, "edit": false}, "clients": {"view": false, "create": false, "edit": false}, "overview": {"view": true}, "settings": {"view": false, "edit": false}}');

-- Вставка дефолтного администратора
INSERT INTO users (username, full_name, role) VALUES
('admin', 'Администратор системы', 'admin');

-- Создание индексов
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);