import { getTrademark, getTrademarkHistory, deleteTrademark } from "@/actions/trademarks";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  STATUS_LABELS,
  STATUS_COLORS,
  BRAND_TYPE_LABELS,
  NICE_CLASSES,
} from "@/lib/types";
import { formatDate, formatCurrency, getDaysUntil } from "@/lib/utils";
import DeleteButton from "@/components/trademarks/DeleteButton";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TrademarkDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [trademark, history] = await Promise.all([
    getTrademark(id),
    getTrademarkHistory(id),
  ]);

  if (!trademark) notFound();

  const expirationDate = trademark.expiration_date || trademark.next_renewal_date;
  const daysLeft = getDaysUntil(expirationDate);
  const isUrgent = daysLeft !== null && daysLeft <= 30 && daysLeft >= 0;
  const isWarning = daysLeft !== null && daysLeft > 30 && daysLeft <= 90;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/trademarks"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{trademark.name}</h1>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  STATUS_COLORS[trademark.status]
                }`}
              >
                {STATUS_LABELS[trademark.status]}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-0.5">
              {trademark.owner_name} · {trademark.country}
              {trademark.jurisdiction && ` · ${trademark.jurisdiction}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/trademarks/${id}/edit`} className="btn-secondary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar
          </Link>
          <DeleteButton id={id} action={deleteTrademark} />
        </div>
      </div>

      {/* Urgent alert */}
      {(isUrgent || isWarning) && (
        <div
          className={`rounded-xl p-4 border flex items-center gap-3 ${
            isUrgent
              ? "bg-red-50 border-red-200"
              : "bg-amber-50 border-amber-200"
          }`}
        >
          <span className="text-2xl">{isUrgent ? "🚨" : "⚠️"}</span>
          <div>
            <div
              className={`font-semibold text-sm ${
                isUrgent ? "text-red-800" : "text-amber-800"
              }`}
            >
              {isUrgent ? "Vencimiento próximo crítico" : "Renovación próxima"}
            </div>
            <div
              className={`text-sm ${isUrgent ? "text-red-700" : "text-amber-700"}`}
            >
              Quedan <strong>{daysLeft} días</strong> para el vencimiento (
              {formatDate(expirationDate)})
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Basic */}
          <InfoCard title="Información Básica">
            <InfoGrid>
              <InfoItem label="Tipo de Marca" value={BRAND_TYPE_LABELS[trademark.brand_type] || trademark.brand_type} />
              <InfoItem label="Titular" value={trademark.owner_name} />
              <InfoItem label="País" value={trademark.country} />
              <InfoItem label="Jurisdicción" value={trademark.jurisdiction} />
            </InfoGrid>
            {trademark.nice_classes?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-xs font-medium text-gray-500 mb-2">CLASES DE NIZA</div>
                <div className="flex flex-wrap gap-1.5">
                  {trademark.nice_classes.sort((a, b) => a - b).map((c) => (
                    <span
                      key={c}
                      className="bg-clara-50 text-clara-700 text-xs px-2 py-1 rounded font-medium"
                      title={NICE_CLASSES[c]}
                    >
                      Clase {c}: {NICE_CLASSES[c]}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {trademark.goods_services_description && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-xs font-medium text-gray-500 mb-1">PRODUCTOS / SERVICIOS</div>
                <p className="text-sm text-gray-700">{trademark.goods_services_description}</p>
              </div>
            )}
          </InfoCard>

          {/* Expediente */}
          <InfoCard title="Números de Expediente">
            <InfoGrid>
              <InfoItem label="Número de Solicitud" value={trademark.application_number} />
              <InfoItem label="Número de Registro" value={trademark.registration_number} />
              <InfoItem label="Número de Publicación" value={trademark.publication_number} />
            </InfoGrid>
          </InfoCard>

          {/* Dates */}
          <InfoCard title="Fechas Clave">
            <InfoGrid cols={3}>
              <InfoItem label="Presentación" value={formatDate(trademark.filing_date)} />
              <InfoItem label="Examen" value={formatDate(trademark.examination_date)} />
              <InfoItem label="Publicación" value={formatDate(trademark.publication_date)} />
              <InfoItem label="Límite Oposición" value={formatDate(trademark.opposition_deadline)} />
              <InfoItem label="Registro" value={formatDate(trademark.registration_date)} />
              <InfoItem label="Vencimiento" value={formatDate(trademark.expiration_date)} highlight={isUrgent ? "danger" : isWarning ? "warning" : undefined} />
              <InfoItem label="Próx. Renovación" value={formatDate(trademark.next_renewal_date)} />
            </InfoGrid>
          </InfoCard>

          {/* Agent */}
          <InfoCard title="Agente / Abogado">
            <InfoGrid>
              <InfoItem label="Nombre" value={trademark.agent_name} />
              <InfoItem label="Firma / Despacho" value={trademark.agent_firm} />
              <InfoItem label="Email" value={trademark.agent_email} />
              <InfoItem label="Teléfono" value={trademark.agent_phone} />
            </InfoGrid>
          </InfoCard>

          {/* Priority */}
          {trademark.has_priority_claim && (
            <InfoCard title="Prioridad (Convenio de París)">
              <InfoGrid>
                <InfoItem label="País de Prioridad" value={trademark.priority_country} />
                <InfoItem label="Fecha de Prioridad" value={formatDate(trademark.priority_date)} />
                <InfoItem label="Número de Prioridad" value={trademark.priority_number} />
              </InfoGrid>
            </InfoCard>
          )}

          {/* Notes */}
          {trademark.notes && (
            <InfoCard title="Notas Internas">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{trademark.notes}</p>
            </InfoCard>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Financial */}
          <InfoCard title="Información Financiera">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Tasas pagadas</span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    trademark.official_fees_paid
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {trademark.official_fees_paid ? "Sí" : "No"}
                </span>
              </div>
              {trademark.fee_amount && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Monto</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(trademark.fee_amount, trademark.fee_currency)}
                  </span>
                </div>
              )}
              {trademark.fee_payment_date && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Fecha de pago</span>
                  <span className="text-sm text-gray-700">
                    {formatDate(trademark.fee_payment_date)}
                  </span>
                </div>
              )}
            </div>
          </InfoCard>

          {/* Tags */}
          {trademark.tags?.length > 0 && (
            <InfoCard title="Etiquetas">
              <div className="flex flex-wrap gap-1.5">
                {trademark.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </InfoCard>
          )}

          {/* History */}
          <InfoCard title="Historial de Cambios">
            {history.length === 0 ? (
              <p className="text-xs text-gray-400">Sin historial registrado</p>
            ) : (
              <div className="space-y-3">
                {history.map((h) => (
                  <div key={h.id} className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-clara-400 mt-1.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs text-gray-700 font-medium">
                        {h.action === "created" && "Registro creado"}
                        {h.action === "updated" && "Registro actualizado"}
                        {h.action === "status_changed" &&
                          `Estado → ${STATUS_LABELS[h.new_value as keyof typeof STATUS_LABELS] || h.new_value}`}
                        {h.action === "deleted" && "Registro eliminado"}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatDate(h.changed_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </InfoCard>

          {/* Meta */}
          <InfoCard title="Metadatos">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Creado</span>
                <span className="text-gray-600">{formatDate(trademark.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Actualizado</span>
                <span className="text-gray-600">{formatDate(trademark.updated_at)}</span>
              </div>
            </div>
          </InfoCard>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}

function InfoGrid({
  children,
  cols = 2,
}: {
  children: React.ReactNode;
  cols?: number;
}) {
  return (
    <div
      className={`grid gap-3 ${
        cols === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"
      }`}
    >
      {children}
    </div>
  );
}

function InfoItem({
  label,
  value,
  highlight,
}: {
  label: string;
  value?: string | null;
  highlight?: "danger" | "warning";
}) {
  return (
    <div>
      <div className="text-xs text-gray-400 mb-0.5">{label}</div>
      <div
        className={`text-sm font-medium ${
          highlight === "danger"
            ? "text-red-600"
            : highlight === "warning"
            ? "text-amber-600"
            : "text-gray-900"
        }`}
      >
        {value || "—"}
      </div>
    </div>
  );
}
