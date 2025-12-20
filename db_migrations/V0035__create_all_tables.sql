CREATE TABLE IF NOT EXISTS roles (
    name TEXT PRIMARY KEY,
    can_view_orders BOOLEAN DEFAULT false,
    can_edit_orders BOOLEAN DEFAULT false,
    can_remove_orders BOOLEAN DEFAULT false,
    can_view_clients BOOLEAN DEFAULT false,
    can_edit_clients BOOLEAN DEFAULT false,
    can_view_drivers BOOLEAN DEFAULT false,
    can_edit_drivers BOOLEAN DEFAULT false,
    can_view_vehicles BOOLEAN DEFAULT false,
    can_edit_vehicles BOOLEAN DEFAULT false,
    can_view_customers BOOLEAN DEFAULT false,
    can_edit_customers BOOLEAN DEFAULT false,
    can_view_settings BOOLEAN DEFAULT false,
    can_edit_settings BOOLEAN DEFAULT false,
    can_view_reports BOOLEAN DEFAULT false,
    can_manage_users BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    login TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT REFERENCES roles(name),
    full_name TEXT NOT NULL,
    invite_code TEXT UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS drivers (
    id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone TEXT,
    passport_series TEXT,
    passport_number TEXT,
    license_number TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    registration_number TEXT UNIQUE NOT NULL,
    vin TEXT,
    year INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    company_name TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customer_addresses (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    address TEXT NOT NULL,
    city TEXT,
    country TEXT,
    postal_code TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    direction TEXT,
    customer_id INTEGER REFERENCES customers(id),
    pickup_address TEXT,
    delivery_address TEXT,
    cargo_description TEXT,
    weight NUMERIC,
    volume NUMERIC,
    price NUMERIC,
    currency TEXT DEFAULT 'EUR',
    status TEXT DEFAULT 'pending',
    fito_control_arrival DATE,
    fito_control_departure DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS order_stages (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    stage_number INTEGER NOT NULL,
    driver_id INTEGER REFERENCES drivers(id),
    vehicle_id INTEGER REFERENCES vehicles(id),
    client_id INTEGER REFERENCES clients(id),
    pickup_address TEXT,
    delivery_address TEXT,
    pickup_date TIMESTAMP,
    delivery_date TIMESTAMP,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(order_id, stage_number)
);

CREATE TABLE IF NOT EXISTS customs_points (
    id SERIAL PRIMARY KEY,
    stage_id INTEGER REFERENCES order_stages(id),
    point_type TEXT,
    country TEXT,
    customs_office TEXT,
    crossing_date TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activity_log (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    user_id INTEGER REFERENCES users(id),
    action TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS telegram_settings (
    id SERIAL PRIMARY KEY,
    bot_token TEXT NOT NULL,
    chat_id TEXT NOT NULL,
    notifications_enabled BOOLEAN DEFAULT true,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS active_sessions (
    id SERIAL PRIMARY KEY,
    section_name TEXT NOT NULL,
    user_id INTEGER REFERENCES users(id),
    user_name TEXT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contract_applications (
    id SERIAL PRIMARY KEY,
    contract_number TEXT UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES customers(id),
    direction TEXT,
    cargo_description TEXT,
    weight NUMERIC,
    volume NUMERIC,
    pickup_address TEXT,
    delivery_address TEXT,
    price NUMERIC,
    currency TEXT DEFAULT 'EUR',
    status TEXT DEFAULT 'draft',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);