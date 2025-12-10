-- Add unique constraint to login field
ALTER TABLE t_p96093837_transport_portal_fir.users 
ADD CONSTRAINT users_login_unique UNIQUE (login);

-- Update existing user with login admin
UPDATE t_p96093837_transport_portal_fir.users 
SET login = 'admin', password = 'admin'
WHERE id = 1;