-- Исправляем существующие записи водителей, где license_number содержит и серию и номер
UPDATE t_p96093837_transport_portal_fir.drivers
SET license_number = TRIM(SUBSTRING(license_number FROM POSITION(' ' IN license_number) + 1))
WHERE license_number LIKE '% %' AND license_series IS NOT NULL;