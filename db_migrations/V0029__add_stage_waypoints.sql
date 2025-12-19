-- Добавляем таблицу для промежуточных точек погрузки/разгрузки в маршрутах
CREATE TABLE IF NOT EXISTS stage_waypoints (
    id SERIAL PRIMARY KEY,
    stage_id INTEGER NOT NULL REFERENCES order_transport_stages(id),
    waypoint_order INTEGER NOT NULL,
    location TEXT NOT NULL,
    waypoint_type VARCHAR(20) NOT NULL CHECK (waypoint_type IN ('loading', 'unloading')),
    planned_time TIMESTAMP,
    actual_time TIMESTAMP,
    cargo_description TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stage_waypoints_stage_id ON stage_waypoints(stage_id);
CREATE INDEX idx_stage_waypoints_order ON stage_waypoints(stage_id, waypoint_order);