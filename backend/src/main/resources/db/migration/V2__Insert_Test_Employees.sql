-- Inserir funcionários de teste
-- Senha: senha123 (hash BCrypt)
INSERT INTO employees (name, email, password, created_at, updated_at) VALUES
('Admin Moura', 'admin@moura.com', '$2a$10$.2sXbmXbPEAXj./RzgZai.O6pJ.Zb4X.u9NoRBWKIdQ.rHRc3Jcfe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('João Silva', 'joao@moura.com', '$2a$10$.2sXbmXbPEAXj./RzgZai.O6pJ.Zb4X.u9NoRBWKIdQ.rHRc3Jcfe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Maria Santos', 'maria@moura.com', '$2a$10$.2sXbmXbPEAXj./RzgZai.O6pJ.Zb4X.u9NoRBWKIdQ.rHRc3Jcfe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);