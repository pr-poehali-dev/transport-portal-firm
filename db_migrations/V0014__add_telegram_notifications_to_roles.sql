-- Добавляем Telegram уведомления для роли admin
UPDATE roles 
SET permissions = jsonb_set(
  permissions, 
  '{telegram_notifications}', 
  '{"order_created": true, "order_loaded": true, "order_in_transit": true, "order_delivered": true, "stage_completed": true}'::jsonb
)
WHERE role_name = 'admin';

-- Для всех остальных ролей добавляем по умолчанию выключенные уведомления
UPDATE roles 
SET permissions = jsonb_set(
  permissions, 
  '{telegram_notifications}', 
  '{"order_created": false, "order_loaded": false, "order_in_transit": false, "order_delivered": false, "stage_completed": false}'::jsonb
)
WHERE role_name != 'admin' AND NOT (permissions ? 'telegram_notifications');
