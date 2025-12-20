-- Создание таблицы для договоров-заявок
CREATE TABLE IF NOT EXISTS contract_applications (
    id SERIAL PRIMARY KEY,
    contract_number VARCHAR(50) NOT NULL,
    contract_date DATE NOT NULL,
    customer_id INTEGER REFERENCES customers(id),
    carrier_id INTEGER REFERENCES clients(id),
    vehicle_type VARCHAR(100),
    refrigerator BOOLEAN DEFAULT FALSE,
    cargo_weight NUMERIC(10, 2),
    cargo_volume NUMERIC(10, 2),
    transport_mode VARCHAR(100),
    additional_conditions TEXT,
    loading_address TEXT,
    loading_date DATE,
    loading_contact TEXT,
    unloading_address TEXT,
    unloading_date DATE,
    unloading_contact TEXT,
    payment_amount NUMERIC(15, 2),
    payment_without_vat BOOLEAN DEFAULT FALSE,
    payment_terms VARCHAR(100),
    payment_documents TEXT,
    driver_name VARCHAR(200),
    driver_license VARCHAR(100),
    driver_passport VARCHAR(100),
    driver_passport_issued TEXT,
    vehicle_number VARCHAR(50),
    trailer_number VARCHAR(50),
    transport_conditions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contract_applications_customer ON contract_applications(customer_id);
CREATE INDEX idx_contract_applications_carrier ON contract_applications(carrier_id);
CREATE INDEX idx_contract_applications_date ON contract_applications(contract_date);
