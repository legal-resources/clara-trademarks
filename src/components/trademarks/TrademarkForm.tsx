"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { Trademark } from "@/lib/types";
import {
  STATUS_LABELS,
  BRAND_TYPE_LABELS,
  COUNTRIES,
  JURISDICTIONS,
  NICE_CLASSES,
} from "@/lib/types";

interface Props {
  trademark?: Trademark;
  action: (formData: FormData) => Promise<void>;
  isEdit?: boolean;
}

export default function TrademarkForm({ trademark, action, isEdit = false }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(trademark?.country || "");
  const [selectedClasses, setSelectedClasses] = useState<number[]>(
    trademark?.nice_classes || []
  );
  const [hasPriority, setHasPriority] = useState(trademark?.has_priority_claim || false);
  const [feesPaid, setFeesPaid] = useState(trademark?.official_fees_paid || false);

  const toggleClass = (classNum: number) => {
    setSelectedClasses((prev) =>
      prev.includes(classNum)
        ? prev.filter((c) => c !== classNum)
        : [...prev, classNum].sort((a, b) => a - b)
    );
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.set("nice_classes", selectedClasses.join(","));
      formData.set("has_priority_claim", hasPriority.toString());
      formData.set("official_fees_paid", feesPaid.toString());
      await action(formData);
    } catch (err) {
      toast.error((err as Error).message || "Error al guardar");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* ── Información básica ── */}
      <Section title="Información Básica">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Nombre de la Marca *</label>
            <input
              name="name"
              type="text"
              className="input-field"
              defaultValue={trademark?.name}
              required
              placeholder="ej. CLARA"
            />
          </div>
          <div>
            <label className="label">Tipo de Marca</label>
            <select
              name="brand_type"
              className="input-field"
              defaultValue={trademark?.brand_type || "nominativa"}
            >
              {Object.entries(BRAND_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Titular / Propietario *</label>
            <input
              name="owner_name"
              type="text"
              className="input-field"
              defaultValue={trademark?.owner_name || "Clara"}
              required
              placeholder="Nombre del titular"
            />
          </div>
          <div>
            <label className="label">Estado del Registro</label>
            <select
              name="status"
              className="input-field"
              defaultValue={trademark?.status || "solicitud_presentada"}
            >
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Section>

      {/* ── Jurisdicción ── */}
      <Section title="Jurisdicción">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">País *</label>
            <select
              name="country"
              className="input-field"
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.target.value);
              }}
              required
            >
              <option value="">Seleccionar país...</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Oficina / Jurisdicción</label>
            <input
              name="jurisdiction"
              type="text"
              className="input-field"
              value={
                selectedCountry
                  ? JURISDICTIONS[selectedCountry] || ""
                  : trademark?.jurisdiction || ""
              }
              onChange={() => {}}
              placeholder="ej. IMPI, USPTO"
            />
          </div>
        </div>
      </Section>

      {/* ── Clasificación Nice ── */}
      <Section title="Clasificación de Niza">
        <p className="text-xs text-gray-500 mb-3">
          Selecciona las clases de productos/servicios que cubre la marca:
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1.5">
          {Object.entries(NICE_CLASSES).map(([num, desc]) => {
            const classNum = parseInt(num);
            const selected = selectedClasses.includes(classNum);
            return (
              <button
                key={num}
                type="button"
                onClick={() => toggleClass(classNum)}
                title={`Clase ${num}: ${desc}`}
                className={`px-2 py-1.5 rounded text-xs font-medium border transition-colors ${
                  selected
                    ? "bg-clara-600 text-white border-clara-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-clara-400"
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>
        {selectedClasses.length > 0 && (
          <div className="mt-3 text-xs text-gray-600 bg-gray-50 rounded p-2">
            <strong>Seleccionadas:</strong>{" "}
            {selectedClasses.map((c) => `Clase ${c}: ${NICE_CLASSES[c]}`).join(" · ")}
          </div>
        )}
      </Section>

      {/* ── Descripción ── */}
      <Section title="Productos / Servicios">
        <div>
          <label className="label">Descripción de productos o servicios</label>
          <textarea
            name="goods_services_description"
            className="input-field min-h-[80px]"
            defaultValue={trademark?.goods_services_description || ""}
            placeholder="Describe los productos o servicios que cubre la marca..."
          />
        </div>
      </Section>

      {/* ── Números de expediente ── */}
      <Section title="Números de Expediente">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Número de Solicitud</label>
            <input
              name="application_number"
              type="text"
              className="input-field"
              defaultValue={trademark?.application_number || ""}
              placeholder="ej. MX/2024/123456"
            />
          </div>
          <div>
            <label className="label">Número de Registro</label>
            <input
              name="registration_number"
              type="text"
              className="input-field"
              defaultValue={trademark?.registration_number || ""}
              placeholder="ej. 2456789"
            />
          </div>
          <div>
            <label className="label">Número de Publicación</label>
            <input
              name="publication_number"
              type="text"
              className="input-field"
              defaultValue={trademark?.publication_number || ""}
              placeholder="ej. PUB-2024-001"
            />
          </div>
        </div>
      </Section>

      {/* ── Fechas ── */}
      <Section title="Fechas Clave">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <DateField
            name="filing_date"
            label="Fecha de Presentación"
            defaultValue={trademark?.filing_date}
          />
          <DateField
            name="examination_date"
            label="Fecha de Examen"
            defaultValue={trademark?.examination_date}
          />
          <DateField
            name="publication_date"
            label="Fecha de Publicación"
            defaultValue={trademark?.publication_date}
          />
          <DateField
            name="opposition_deadline"
            label="Fecha Límite de Oposición"
            defaultValue={trademark?.opposition_deadline}
          />
          <DateField
            name="registration_date"
            label="Fecha de Registro"
            defaultValue={trademark?.registration_date}
          />
          <DateField
            name="expiration_date"
            label="Fecha de Vencimiento"
            defaultValue={trademark?.expiration_date}
          />
          <DateField
            name="next_renewal_date"
            label="Próxima Renovación"
            defaultValue={trademark?.next_renewal_date}
          />
        </div>
      </Section>

      {/* ── Agente ── */}
      <Section title="Agente / Abogado">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Nombre del Agente</label>
            <input
              name="agent_name"
              type="text"
              className="input-field"
              defaultValue={trademark?.agent_name || ""}
              placeholder="Nombre completo"
            />
          </div>
          <div>
            <label className="label">Firma / Despacho</label>
            <input
              name="agent_firm"
              type="text"
              className="input-field"
              defaultValue={trademark?.agent_firm || ""}
              placeholder="Nombre del despacho"
            />
          </div>
          <div>
            <label className="label">Email del Agente</label>
            <input
              name="agent_email"
              type="email"
              className="input-field"
              defaultValue={trademark?.agent_email || ""}
              placeholder="agente@despacho.com"
            />
          </div>
          <div>
            <label className="label">Teléfono del Agente</label>
            <input
              name="agent_phone"
              type="tel"
              className="input-field"
              defaultValue={trademark?.agent_phone || ""}
              placeholder="+52 55 1234 5678"
            />
          </div>
        </div>
      </Section>

      {/* ── Información financiera ── */}
      <Section title="Información Financiera">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFeesPaid(!feesPaid)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                feesPaid ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  feesPaid ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <label className="text-sm font-medium text-gray-700">
              Tasas oficiales pagadas
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <DateField
              name="fee_payment_date"
              label="Fecha de Pago"
              defaultValue={trademark?.fee_payment_date}
            />
            <div>
              <label className="label">Monto</label>
              <input
                name="fee_amount"
                type="number"
                step="0.01"
                className="input-field"
                defaultValue={trademark?.fee_amount || ""}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="label">Moneda</label>
              <select
                name="fee_currency"
                className="input-field"
                defaultValue={trademark?.fee_currency || "USD"}
              >
                <option value="USD">USD</option>
                <option value="MXN">MXN</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="BRL">BRL</option>
                <option value="COP">COP</option>
              </select>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Prioridad ── */}
      <Section title="Prioridad (Convenio de París)">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setHasPriority(!hasPriority)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                hasPriority ? "bg-clara-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  hasPriority ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <label className="text-sm font-medium text-gray-700">
              Tiene reclamación de prioridad
            </label>
          </div>
          {hasPriority && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <label className="label">País de Prioridad</label>
                <select
                  name="priority_country"
                  className="input-field"
                  defaultValue={trademark?.priority_country || ""}
                >
                  <option value="">Seleccionar...</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <DateField
                name="priority_date"
                label="Fecha de Prioridad"
                defaultValue={trademark?.priority_date}
              />
              <div>
                <label className="label">Número de Prioridad</label>
                <input
                  name="priority_number"
                  type="text"
                  className="input-field"
                  defaultValue={trademark?.priority_number || ""}
                  placeholder="ej. US2024-001"
                />
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* ── Notas y etiquetas ── */}
      <Section title="Notas y Etiquetas">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Notas internas</label>
            <textarea
              name="notes"
              className="input-field min-h-[100px]"
              defaultValue={trademark?.notes || ""}
              placeholder="Observaciones, historial, comentarios internos..."
            />
          </div>
          <div>
            <label className="label">Etiquetas (separadas por coma)</label>
            <input
              name="tags"
              type="text"
              className="input-field"
              defaultValue={trademark?.tags?.join(", ") || ""}
              placeholder="ej. prioritaria, renovar-2025, latam"
            />
            <p className="text-xs text-gray-400 mt-1">
              Útil para organizar y filtrar registros
            </p>
          </div>
        </div>
      </Section>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Guardando...
            </>
          ) : (
            <>{isEdit ? "Actualizar Registro" : "Crear Registro"}</>
          )}
        </button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100">
        {title}
      </h3>
      {children}
    </div>
  );
}

function DateField({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        name={name}
        type="date"
        className="input-field"
        defaultValue={defaultValue ? defaultValue.substring(0, 10) : ""}
      />
    </div>
  );
}
