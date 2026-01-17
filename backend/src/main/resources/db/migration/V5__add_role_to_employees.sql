ALTER TABLE employees
    ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'USER';

UPDATE employees
SET role = 'ADMIN'
WHERE email = 'admin@moura.com';