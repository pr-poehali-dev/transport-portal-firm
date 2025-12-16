ALTER TABLE t_p96093837_transport_portal_fir.vehicles
ADD COLUMN vehicle_brand VARCHAR(255),
ADD COLUMN trailer_plate VARCHAR(50),
ADD COLUMN body_type VARCHAR(100),
ADD COLUMN company_name VARCHAR(255),
ADD COLUMN driver_id INTEGER;

UPDATE t_p96093837_transport_portal_fir.vehicles
SET vehicle_brand = model
WHERE vehicle_brand IS NULL;

COMMENT ON COLUMN t_p96093837_transport_portal_fir.vehicles.vehicle_brand IS 'Марка транспортного средства';
COMMENT ON COLUMN t_p96093837_transport_portal_fir.vehicles.trailer_plate IS 'Гос. номер прицепа';
COMMENT ON COLUMN t_p96093837_transport_portal_fir.vehicles.body_type IS 'Тип кузова';
COMMENT ON COLUMN t_p96093837_transport_portal_fir.vehicles.company_name IS 'Название транспортной компании';
COMMENT ON COLUMN t_p96093837_transport_portal_fir.vehicles.driver_id IS 'ID закрепленного водителя';