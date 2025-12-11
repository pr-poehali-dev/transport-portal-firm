-- Таблица этапов перевозки (каждый этап = одна машина на участке маршрута)
CREATE TABLE IF NOT EXISTS order_transport_stages (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    stage_number INTEGER NOT NULL,
    vehicle_id INTEGER,
    driver_id INTEGER,
    from_location TEXT NOT NULL,
    to_location TEXT NOT NULL,
    planned_departure TIMESTAMP,
    planned_arrival TIMESTAMP,
    actual_departure TIMESTAMP,
    actual_arrival TIMESTAMP,
    distance_km DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'planned',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица таможенных пунктов на маршруте
CREATE TABLE IF NOT EXISTS order_customs_points (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    stage_id INTEGER,
    customs_name TEXT NOT NULL,
    country VARCHAR(100),
    crossing_date TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending',
    documents_status VARCHAR(50) DEFAULT 'not_submitted',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица документов (фитосанитарные, CMR и др.)
CREATE TABLE IF NOT EXISTS order_documents (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    stage_id INTEGER,
    document_type VARCHAR(100) NOT NULL,
    document_number VARCHAR(200),
    issue_date DATE,
    expiry_date DATE,
    status VARCHAR(50) DEFAULT 'active',
    file_url TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_transport_stages_order ON order_transport_stages(order_id);
CREATE INDEX IF NOT EXISTS idx_transport_stages_stage_num ON order_transport_stages(order_id, stage_number);
CREATE INDEX IF NOT EXISTS idx_customs_order ON order_customs_points(order_id);
CREATE INDEX IF NOT EXISTS idx_customs_stage ON order_customs_points(stage_id);
CREATE INDEX IF NOT EXISTS idx_documents_order ON order_documents(order_id);
CREATE INDEX IF NOT EXISTS idx_documents_stage ON order_documents(stage_id);