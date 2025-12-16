-- Добавляем детальные поля для водителей
ALTER TABLE t_p96093837_transport_portal_fir.drivers
  ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS middle_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS additional_phone VARCHAR(50),
  ADD COLUMN IF NOT EXISTS passport_series VARCHAR(20),
  ADD COLUMN IF NOT EXISTS passport_number VARCHAR(20),
  ADD COLUMN IF NOT EXISTS passport_issued_by TEXT,
  ADD COLUMN IF NOT EXISTS passport_issue_date DATE,
  ADD COLUMN IF NOT EXISTS license_series VARCHAR(20),
  ADD COLUMN IF NOT EXISTS license_issued_by TEXT,
  ADD COLUMN IF NOT EXISTS license_issue_date DATE;

-- Обновляем существующую запись, разбив full_name на компоненты
UPDATE t_p96093837_transport_portal_fir.drivers
SET 
  last_name = SPLIT_PART(full_name, '  ', 1),
  first_name = SPLIT_PART(full_name, '  ', 2),
  middle_name = SPLIT_PART(full_name, '  ', 3)
WHERE full_name IS NOT NULL AND last_name IS NULL;