INSERT INTO employees (
    id,
    name,
    email,
    password,
    created_at,
    updated_at
) VALUES
      (
          gen_random_uuid(),
          'Admin Moura',
          'admin@moura.com',
          '$2a$10$.2sXbmXbPEAXj./RzgZai.O6pJ.Zb4X.u9NoRBWKIdQ.rHRc3Jcfe',
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
      ),
      (
          gen_random_uuid(),
          'João Silva',
          'joao@moura.com',
          '$2a$10$.2sXbmXbPEAXj./RzgZai.O6pJ.Zb4X.u9NoRBWKIdQ.rHRc3Jcfe',
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
      ),
      (
          gen_random_uuid(),
          'Maria Santos',
          'maria@moura.com',
          '$2a$10$.2sXbmXbPEAXj./RzgZai.O6pJ.Zb4X.u9NoRBWKIdQ.rHRc3Jcfe',
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
      );