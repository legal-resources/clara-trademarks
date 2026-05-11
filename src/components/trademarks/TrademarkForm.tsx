"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { Trademark } from "@/lib/types";
import {
  STATUS_LABELS,
  BRAND_TYPE_LABELS,
  COUNTRIES,
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
  const [selectedClasses, setSelectedClasses] = useState<number[]>(
    trademark?.nice_classes || []
  );

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
                <option key={key} value={key}>{label}</option>
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
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </Section>

      {/* ── País ── */}
      <Section title="País">
        <div className="max-w-xs">
          <label className="label">País</label>
          <select
            name="country"
            className="input-field"
            defaultValue={trademark?.country || ""}
          >
            <option value="">Seleccionar país...</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DateField name="filing_date" label="Fecha de Solicitud" defaultValue={trademark?.filing_date} />
          <DateField name="registration_date" label="Fecha de Registro" defaultValue={trademark?.registration_date} />
          <DateField name="expiration_date" label="Fecha de Vencimiento" defaultValue={trademark?.expiration_date} />
          <DateField name="next_renewal_date" label="Próxima Renovación" defaultValue={trademark?.next_renewal_date} />
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
            <p className="text-xs text-gray-400 mt-1">Útil para organizar y filtrar registros</p>
          </div>
        </div>
      </Section>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <button type="button" onClick={() => router.back()} className="btn-secondary">
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
