-- ============================================================
-- CLARA TRADEMARKS - Schema para Neon PostgreSQL
-- ============================================================
-- Ejecuta este SQL en Neon Console:
--   https://console.neon.tech → tu proyecto → SQL Editor
--
-- Puedes ejecutarlo todo de una sola vez.

-- ============================================================
-- EXTENSIONES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUM: Estado del registro
-- ============================================================
DO $$ BEGIN
  CREATE TYPE trademark_status AS ENUM (
    'solicitud_presentada',
    'en_examen',
    'publicada',
    'periodo_oposicion',
    'registrada',
    'rechazada',
    'abandonada',
    'vencida',
    'en_renovacion',
    'suspendida'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- TABLA: Usuarios (auth propia con NextAuth)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name     TEXT,
  role          TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user', 'viewer')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA PRINCIPAL: Marcas
-- ============================================================
CREATE TABLE IF NOT EXISTS trademarks (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Información básica
  name          TEXT NOT NULL,
  brand_type    TEXT DEFAULT 'nominativa'
    CHECK (brand_type IN ('nominativa','figurativa','mixta','tridimensional','sonora','olfativa')),
  owner_name    TEXT NOT NULL,
  country       TEXT NOT NULL,
  jurisdiction  TEXT,

  -- Clasificación
  nice_classes                INTEGER[] DEFAULT '{}',
  goods_services_description  TEXT,

  -- Números de expediente
  application_number   TEXT,
  registration_number  TEXT,
  publication_number   TEXT,

  -- Estado
  status  trademark_status NOT NULL DEFAULT 'solicitud_presentada',

  -- Fechas clave
  filing_date         DATE,
  examination_date    DATE,
  publication_date    DATE,
  opposition_deadline DATE,
  registration_date   DATE,
  expiration_date     DATE,
  next_renewal_date   DATE,

  -- Agente / Abogado
  agent_name  TEXT,
  agent_email TEXT,
  agent_phone TEXT,
  agent_firm  TEXT,

  -- Información financiera
  official_fees_paid  BOOLEAN DEFAULT FALSE,
  fee_payment_date    DATE,
  fee_amount          DECIMAL(10,2),
  fee_currency        TEXT DEFAULT 'USD',

  -- Prioridad (Convenio de París)
  has_priority_claim  BOOLEAN DEFAULT FALSE,
  priority_country    TEXT,
  priority_date       DATE,
  priority_number     TEXT,

  -- Notas y etiquetas
  notes  TEXT,
  tags   TEXT[] DEFAULT '{}',

  -- Auditoría
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  created_by  UUID REFERENCES users(id),
  updated_by  UUID REFERENCES users(id),
  is_deleted  BOOLEAN DEFAULT FALSE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_trademarks_status      ON trademarks(status);
CREATE INDEX IF NOT EXISTS idx_trademarks_country     ON trademarks(country);
CREATE INDEX IF NOT EXISTS idx_trademarks_expiration  ON trademarks(expiration_date);
CREATE INDEX IF NOT EXISTS idx_trademarks_created_by  ON trademarks(created_by);
CREATE INDEX IF NOT EXISTS idx_trademarks_is_deleted  ON trademarks(is_deleted);
CREATE INDEX IF NOT EXISTS idx_trademarks_name        ON trademarks USING gin(to_tsvector('spanish', name));

-- ============================================================
-- TABLA: Historial de cambios
-- ============================================================
CREATE TABLE IF NOT EXISTS trademark_history (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trademark_id  UUID REFERENCES trademarks(id) ON DELETE CASCADE NOT NULL,
  changed_by    UUID REFERENCES users(id),
  changed_at    TIMESTAMPTZ DEFAULT NOW(),
  action        TEXT NOT NULL CHECK (action IN ('created','updated','deleted','status_changed')),
  field_changed TEXT,
  old_value     TEXT,
  new_value     TEXT,
  notes         TEXT
);

CREATE INDEX IF NOT EXISTS idx_history_trademark ON trademark_history(trademark_id);
CREATE INDEX IF NOT EXISTS idx_history_changed_at ON trademark_history(changed_at DESC);

-- ============================================================
-- TABLA: Documentos adjuntos (para uso futuro)
-- ============================================================
CREATE TABLE IF NOT EXISTS trademark_documents (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trademark_id  UUID REFERENCES trademarks(id) ON DELETE CASCADE NOT NULL,
  file_name     TEXT NOT NULL,
  file_url      TEXT NOT NULL,
  file_type     TEXT,
  file_size     INTEGER,
  document_type TEXT CHECK (document_type IN ('solicitud','certificado','comprobante_pago','oposicion','resolucion','otro')),
  description   TEXT,
  uploaded_by   UUID REFERENCES users(id),
  uploaded_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRIGGER: actualizar updated_at automáticamente
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trademarks_updated_at ON trademarks;
CREATE TRIGGER trademarks_updated_at
  BEFORE UPDATE ON trademarks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TRIGGER: registrar cambios de status en historial
-- ============================================================
CREATE OR REPLACE FUNCTION log_trademark_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO trademark_history (trademark_id, changed_by, action, field_changed, old_value, new_value)
    VALUES (NEW.id, NEW.updated_by, 'status_changed', 'status', OLD.status::TEXT, NEW.status::TEXT);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS log_status_change ON trademarks;
CREATE TRIGGER log_status_change
  AFTER UPDATE ON trademarks
  FOR EACH ROW EXECUTE FUNCTION log_trademark_status_change();

-- ============================================================
-- ¡Listo! El schema está creado.
-- Ahora configura tu .env.local con la DATABASE_URL de Neon.
-- ============================================================
