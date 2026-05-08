-- ============================================================
-- CLARA TRADEMARKS - Migración Inicial
-- ============================================================
-- Ejecuta este SQL en el SQL Editor de tu proyecto Supabase
-- Supabase Dashboard → SQL Editor → New Query

-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUM: Estado del registro
-- ============================================================
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

-- ============================================================
-- TABLA: Perfiles de usuario
-- ============================================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- TABLA PRINCIPAL: Marcas
-- ============================================================
CREATE TABLE trademarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Información básica
  name TEXT NOT NULL,
  brand_type TEXT DEFAULT 'nominativa' CHECK (brand_type IN ('nominativa', 'figurativa', 'mixta', 'tridimensional', 'sonora', 'olfativa')),
  owner_name TEXT NOT NULL,
  country TEXT NOT NULL,
  jurisdiction TEXT, -- e.g. "IMPI", "USPTO", "EUIPO", "INDECOPI"

  -- Clasificación
  nice_classes INTEGER[] DEFAULT '{}',
  goods_services_description TEXT,

  -- Números de expediente
  application_number TEXT,
  registration_number TEXT,
  publication_number TEXT,

  -- Estado
  status trademark_status NOT NULL DEFAULT 'solicitud_presentada',

  -- Fechas clave
  filing_date DATE,
  examination_date DATE,
  publication_date DATE,
  opposition_deadline DATE,
  registration_date DATE,
  expiration_date DATE,
  next_renewal_date DATE,

  -- Agente / Abogado
  agent_name TEXT,
  agent_email TEXT,
  agent_phone TEXT,
  agent_firm TEXT,

  -- Información financiera
  official_fees_paid BOOLEAN DEFAULT FALSE,
  fee_payment_date DATE,
  fee_amount DECIMAL(10,2),
  fee_currency TEXT DEFAULT 'USD',

  -- Prioridad (Convenio de París)
  has_priority_claim BOOLEAN DEFAULT FALSE,
  priority_country TEXT,
  priority_date DATE,
  priority_number TEXT,

  -- Notas y etiquetas
  notes TEXT,
  tags TEXT[] DEFAULT '{}',

  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Índices para búsqueda eficiente
CREATE INDEX idx_trademarks_status ON trademarks(status);
CREATE INDEX idx_trademarks_country ON trademarks(country);
CREATE INDEX idx_trademarks_name ON trademarks USING gin(to_tsvector('spanish', name));
CREATE INDEX idx_trademarks_expiration ON trademarks(expiration_date);
CREATE INDEX idx_trademarks_created_by ON trademarks(created_by);
CREATE INDEX idx_trademarks_owner ON trademarks(owner_name);

-- ============================================================
-- TABLA: Historial de cambios
-- ============================================================
CREATE TABLE trademark_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trademark_id UUID REFERENCES trademarks(id) ON DELETE CASCADE NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted', 'status_changed')),
  field_changed TEXT,
  old_value TEXT,
  new_value TEXT,
  notes TEXT
);

CREATE INDEX idx_history_trademark ON trademark_history(trademark_id);

-- ============================================================
-- TABLA: Documentos adjuntos
-- ============================================================
CREATE TABLE trademark_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trademark_id UUID REFERENCES trademarks(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- path en Supabase Storage
  file_type TEXT,
  file_size INTEGER,
  document_type TEXT CHECK (document_type IN ('solicitud', 'certificado', 'comprobante_pago', 'oposicion', 'resolucion', 'otro')),
  description TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: Alertas y recordatorios
-- ============================================================
CREATE TABLE trademark_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trademark_id UUID REFERENCES trademarks(id) ON DELETE CASCADE NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('renovacion', 'vencimiento', 'oposicion', 'pago', 'otro')),
  alert_date DATE NOT NULL,
  days_before INTEGER DEFAULT 30,
  message TEXT,
  is_sent BOOLEAN DEFAULT FALSE,
  is_dismissed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alerts_trademark ON trademark_alerts(trademark_id);
CREATE INDEX idx_alerts_date ON trademark_alerts(alert_date) WHERE NOT is_dismissed;

-- ============================================================
-- TRIGGERS: Auditoría automática
-- ============================================================

-- Actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trademarks_updated_at
  BEFORE UPDATE ON trademarks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Registrar historial de cambios de status
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

CREATE TRIGGER log_status_change
  AFTER UPDATE ON trademarks
  FOR EACH ROW EXECUTE FUNCTION log_trademark_status_change();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) - Seguridad por filas
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trademarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE trademark_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE trademark_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE trademark_alerts ENABLE ROW LEVEL SECURITY;

-- Policies para profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Policies para trademarks (todos los usuarios autenticados pueden ver y editar)
CREATE POLICY "Authenticated users can view trademarks"
  ON trademarks FOR SELECT TO authenticated
  USING (NOT is_deleted);

CREATE POLICY "Authenticated users can insert trademarks"
  ON trademarks FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update trademarks"
  ON trademarks FOR UPDATE TO authenticated
  USING (NOT is_deleted);

-- Solo el creador o admin puede eliminar (soft delete)
CREATE POLICY "Creators can delete their trademarks"
  ON trademarks FOR UPDATE TO authenticated
  USING (auth.uid() = created_by OR
         EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Policies para historial (solo lectura para usuarios)
CREATE POLICY "Authenticated users can view history"
  ON trademark_history FOR SELECT TO authenticated USING (true);

CREATE POLICY "System can insert history"
  ON trademark_history FOR INSERT TO authenticated WITH CHECK (true);

-- Policies para documentos
CREATE POLICY "Authenticated users can view documents"
  ON trademark_documents FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can upload documents"
  ON trademark_documents FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = uploaded_by);

-- Policies para alertas
CREATE POLICY "Authenticated users can view alerts"
  ON trademark_alerts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage alerts"
  ON trademark_alerts FOR ALL TO authenticated USING (true);

-- ============================================================
-- STORAGE: Bucket para documentos
-- ============================================================
-- Ejecutar esto también en el SQL Editor:
INSERT INTO storage.buckets (id, name, public)
VALUES ('trademark-documents', 'trademark-documents', false);

CREATE POLICY "Authenticated users can upload to trademark-documents"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'trademark-documents');

CREATE POLICY "Authenticated users can view trademark-documents"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'trademark-documents');

-- ============================================================
-- DATOS DE EJEMPLO (opcional - comentar si no se quieren)
-- ============================================================
-- Puedes insertar datos de prueba después de registrar tu primer usuario
