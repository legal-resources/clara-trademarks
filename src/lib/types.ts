export type TrademarkStatus =
  | "solicitud_presentada"
  | "en_examen"
  | "publicada"
  | "periodo_oposicion"
  | "registrada"
  | "rechazada"
  | "abandonada"
  | "vencida"
  | "en_renovacion"
  | "suspendida";

export type BrandType =
  | "nominativa"
  | "figurativa"
  | "mixta"
  | "tridimensional"
  | "sonora"
  | "olfativa";

export type DocumentType =
  | "solicitud"
  | "certificado"
  | "comprobante_pago"
  | "oposicion"
  | "resolucion"
  | "otro";

export type UserRole = "admin" | "user" | "viewer";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
}

export interface Trademark {
  id: string;
  name: string;
  brand_type: BrandType;
  owner_name: string;
  country: string;
  jurisdiction: string | null;
  nice_classes: number[];
  goods_services_description: string | null;
  application_number: string | null;
  registration_number: string | null;
  publication_number: string | null;
  status: TrademarkStatus;
  filing_date: string | null;
  examination_date: string | null;
  publication_date: string | null;
  opposition_deadline: string | null;
  registration_date: string | null;
  expiration_date: string | null;
  next_renewal_date: string | null;
  agent_name: string | null;
  agent_email: string | null;
  agent_phone: string | null;
  agent_firm: string | null;
  official_fees_paid: boolean;
  fee_payment_date: string | null;
  fee_amount: number | null;
  fee_currency: string;
  has_priority_claim: boolean;
  priority_country: string | null;
  priority_date: string | null;
  priority_number: string | null;
  notes: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  is_deleted: boolean;
}

export interface TrademarkHistory {
  id: string;
  trademark_id: string;
  changed_by: string | null;
  changed_at: string;
  action: "created" | "updated" | "deleted" | "status_changed";
  field_changed: string | null;
  old_value: string | null;
  new_value: string | null;
  notes: string | null;
}

export interface TrademarkDocument {
  id: string;
  trademark_id: string;
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  document_type: DocumentType | null;
  description: string | null;
  uploaded_by: string | null;
  uploaded_at: string;
}

export interface TrademarkAlert {
  id: string;
  trademark_id: string;
  alert_type: "renovacion" | "vencimiento" | "oposicion" | "pago" | "otro";
  alert_date: string;
  days_before: number;
  message: string | null;
  is_sent: boolean;
  is_dismissed: boolean;
  created_at: string;
}

export const STATUS_LABELS: Record<TrademarkStatus, string> = {
  solicitud_presentada: "Solicitud Presentada",
  en_examen: "En Examen",
  publicada: "Publicada",
  periodo_oposicion: "Período de Oposición",
  registrada: "Registrada",
  rechazada: "Rechazada",
  abandonada: "Abandonada",
  vencida: "Vencida",
  en_renovacion: "En Renovación",
  suspendida: "Suspendida",
};

export const STATUS_COLORS: Record<TrademarkStatus, string> = {
  solicitud_presentada: "bg-blue-100 text-blue-800",
  en_examen: "bg-yellow-100 text-yellow-800",
  publicada: "bg-purple-100 text-purple-800",
  periodo_oposicion: "bg-orange-100 text-orange-800",
  registrada: "bg-green-100 text-green-800",
  rechazada: "bg-red-100 text-red-800",
  abandonada: "bg-gray-100 text-gray-800",
  vencida: "bg-red-100 text-red-800",
  en_renovacion: "bg-cyan-100 text-cyan-800",
  suspendida: "bg-amber-100 text-amber-800",
};

export const BRAND_TYPE_LABELS: Record<BrandType, string> = {
  nominativa: "Nominativa",
  figurativa: "Figurativa",
  mixta: "Mixta",
  tridimensional: "Tridimensional",
  sonora: "Sonora",
  olfativa: "Olfativa",
};

export const NICE_CLASSES: Record<number, string> = {
  1: "Productos Químicos",
  2: "Pinturas y Barnices",
  3: "Cosméticos y Limpieza",
  4: "Aceites y Grasas",
  5: "Productos Farmacéuticos",
  6: "Metales Comunes",
  7: "Máquinas y Aparatos",
  8: "Herramientas Manuales",
  9: "Equipos Científicos y Electrónicos",
  10: "Aparatos Médicos",
  11: "Aparatos de Alumbrado",
  12: "Vehículos",
  13: "Armas de Fuego",
  14: "Metales Preciosos",
  15: "Instrumentos Musicales",
  16: "Papel y Artículos de Oficina",
  17: "Caucho y Plásticos",
  18: "Cuero y Artículos de Viaje",
  19: "Materiales de Construcción",
  20: "Muebles",
  21: "Utensilios del Hogar",
  22: "Cuerdas y Fibras",
  23: "Hilos y Fibras Textiles",
  24: "Tejidos y Telas",
  25: "Prendas de Vestir",
  26: "Encajes y Bordados",
  27: "Alfombras",
  28: "Juegos y Juguetes",
  29: "Carne y Alimentos Procesados",
  30: "Café, Té y Cereales",
  31: "Productos Agrícolas",
  32: "Cervezas y Refrescos",
  33: "Bebidas Alcohólicas",
  34: "Tabaco",
  35: "Publicidad y Negocios",
  36: "Seguros y Finanzas",
  37: "Construcción y Reparación",
  38: "Telecomunicaciones",
  39: "Transporte y Viajes",
  40: "Tratamiento de Materiales",
  41: "Educación y Entretenimiento",
  42: "Servicios Científicos y Tecnológicos",
  43: "Servicios de Alimentación",
  44: "Servicios Médicos",
  45: "Servicios Jurídicos",
};

export const COUNTRIES = [
  "México",
  "Estados Unidos",
  "Unión Europea",
  "España",
  "Argentina",
  "Brasil",
  "Colombia",
  "Chile",
  "Perú",
  "Reino Unido",
  "Canadá",
  "China",
  "Japón",
  "Alemania",
  "Francia",
  "Internacional (OMPI/Madrid)",
];

export const JURISDICTIONS: Record<string, string> = {
  México: "IMPI",
  "Estados Unidos": "USPTO",
  "Unión Europea": "EUIPO",
  España: "OEPM",
  Argentina: "INPI",
  Brasil: "INPI-BR",
  Colombia: "SIC",
  Chile: "INAPI",
  Perú: "INDECOPI",
  "Reino Unido": "UKIPO",
  Canadá: "CIPO",
  China: "CNIPA",
  Japón: "JPO",
  Alemania: "DPMA",
  Francia: "INPI-FR",
  "Internacional (OMPI/Madrid)": "WIPO",
};
