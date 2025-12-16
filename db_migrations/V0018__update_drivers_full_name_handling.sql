-- Обновляем данные существующих водителей: разбиваем full_name
UPDATE t_p96093837_transport_portal_fir.drivers
SET 
  last_name = COALESCE(SPLIT_PART(full_name, ' ', 1), ''),
  first_name = COALESCE(SPLIT_PART(full_name, ' ', 2), ''),
  middle_name = COALESCE(SPLIT_PART(full_name, ' ', 3), '')
WHERE full_name IS NOT NULL 
  AND (last_name IS NULL OR last_name = '');

-- Разбиваем license_number на series и number если еще не разбито
UPDATE t_p96093837_transport_portal_fir.drivers
SET 
  license_series = COALESCE(SPLIT_PART(license_number, ' ', 1), ''),
  license_number = COALESCE(SPLIT_PART(license_number, ' ', 2), license_number)
WHERE license_number IS NOT NULL 
  AND license_number LIKE '% %'
  AND (license_series IS NULL OR license_series = '');