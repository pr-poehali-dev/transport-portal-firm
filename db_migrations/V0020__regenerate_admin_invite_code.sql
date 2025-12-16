-- Обновляем invite_code для админа и сбрасываем telegram данные
UPDATE t_p96093837_transport_portal_fir.users 
SET 
  invite_code = 'INV_' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8)),
  telegram_chat_id = NULL,
  telegram_connected_at = NULL
WHERE id = 1;