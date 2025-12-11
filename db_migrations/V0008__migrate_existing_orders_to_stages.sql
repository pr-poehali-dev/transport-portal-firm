-- Миграция существующих заказов в новую структуру с этапами
INSERT INTO order_transport_stages (
    order_id, 
    stage_number, 
    vehicle_id, 
    driver_id,
    from_location, 
    to_location, 
    planned_departure, 
    planned_arrival,
    distance_km, 
    notes, 
    status
)
SELECT 
    o.id as order_id,
    1 as stage_number,
    o.vehicle_id,
    o.driver_id,
    o.route_from as from_location,
    o.route_to as to_location,
    NULL as planned_departure,
    NULL as planned_arrival,
    NULL as distance_km,
    CONCAT_WS(', ',
        CASE WHEN o.carrier IS NOT NULL THEN 'Перевозчик: ' || o.carrier END,
        CASE WHEN o.phone IS NOT NULL THEN 'Тел: ' || o.phone END,
        CASE WHEN o.border_crossing IS NOT NULL THEN 'Граница: ' || o.border_crossing END,
        CASE WHEN o.delivery_address IS NOT NULL THEN 'Адрес: ' || o.delivery_address END,
        CASE WHEN o.invoice_number IS NOT NULL THEN 'Инвойс: ' || o.invoice_number END
    ) as notes,
    CASE 
        WHEN o.status = 'pending' THEN 'planned'
        WHEN o.status = 'loading' THEN 'in_progress'
        WHEN o.status = 'in_transit' THEN 'in_progress'
        WHEN o.status = 'delivered' THEN 'completed'
        ELSE 'planned'
    END as status
FROM orders o
WHERE NOT EXISTS (
    SELECT 1 FROM order_transport_stages s WHERE s.order_id = o.id
);

-- Создаем таможенные пункты для заказов с border_crossing
INSERT INTO order_customs_points (
    order_id,
    stage_id,
    customs_name,
    country,
    crossing_date,
    notes
)
SELECT 
    o.id as order_id,
    s.id as stage_id,
    o.border_crossing as customs_name,
    '' as country,
    NULL as crossing_date,
    '' as notes
FROM orders o
JOIN order_transport_stages s ON s.order_id = o.id AND s.stage_number = 1
WHERE o.border_crossing IS NOT NULL 
  AND o.border_crossing != ''
  AND NOT EXISTS (
      SELECT 1 FROM order_customs_points c WHERE c.order_id = o.id
  );