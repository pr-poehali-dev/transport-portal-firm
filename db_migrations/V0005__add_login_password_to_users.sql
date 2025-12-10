-- Add password and login fields to users table
ALTER TABLE t_p96093837_transport_portal_fir.users 
ADD COLUMN IF NOT EXISTS password VARCHAR(255),
ADD COLUMN IF NOT EXISTS login VARCHAR(100);