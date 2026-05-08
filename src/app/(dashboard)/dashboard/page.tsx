import { getTrademarkStats, getTrademarks } from "@/actions/trademarks";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/types";
import { formatDate, getDaysUntil } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stats, recentTrademarks] = await Promise.all([
    getTrademarkStats(),
    getTrademarks(),
  ]);

  const expiring = recentTrademarks
    .filter((t) => {
      const date = t.expiration_date || t.next_renewal_date;
      if (!date) return false;
      const days = getDaysUntil(date);
      return days !== null && days >= 0 && days <= 90;
    })
    .sort((a, b) => {
      const da = getDaysUntil(a.expiration_date || a.next_renewal_date) ?? 999;
      const db = getDaysUntil(b.expiration_date || b.next_renewal_date) ?? 999;
      return da - db;
    })
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Resumen general de tus registros de marcas
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Marcas"
          value={stats?.total ?? 0}
          icon="📋"
          color="bg-clara-50 border-clara-200"
          textColor="text-clara-700"
        />
        <StatCard
          title="Registradas"
          value={stats?.registered ?? 0}
          icon="✅"
          color="bg-green-50 border-green-200"
          textColor="text-green-700"
        />
        <StatCard
          title="En Trámite"
          value={stats?.pending ?? 0}
          icon="⏳"
          color="bg-yellow-50 border-yellow-200"
          textColor="text-yellow-700"
        />
        <StatCard
          title="Vencen en 90 días"
          value={stats?.expiringsSoon ?? 0}
          icon="⚠️"
          color="bg-red-50 border-red-200"
          textColor="text-red-700"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="card p-6">
          <h2 className="section-title mb-4">Estado de Registros</h2>
          {stats?.byStatus && Object.keys(stats.byStatus).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(stats.byStatus)
                .sort((a, b) => b[1] - a[1])
                .map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        STATUS_COLORS[status as keyof typeof STATUS_COLORS] ||
                        "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status}
                    </span>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 bg-clara-400 rounded-full"
                        style={{
                          width: `${Math.max(
                            20,
                            Math.round((count / (stats.total || 1)) * 120)
                          )}px`,
                        }}
                      />
                      <span className="text-sm font-semibold text-gray-700 w-6 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No hay datos disponibles</p>
          )}
        </div>

        {/* Expiring Soon */}
        <div className="card p-6">
          <h2 className="section-title mb-4">Próximos a Vencer (90 días)</h2>
          {expiring.length > 0 ? (
            <div className="space-y-3">
              {expiring.map((t) => {
                const date = t.expiration_date || t.next_renewal_date;
                const days = getDaysUntil(date);
                return (
                  <Link
                    key={t.id}
                    href={`/trademarks/${t.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors"
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-900">{t.name}</div>
                      <div className="text-xs text-gray-500">{t.country}</div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-sm font-semibold ${
                          days !== null && days <= 30
                            ? "text-red-600"
                            : "text-amber-600"
                        }`}
                      >
                        {days !== null ? `${days} días` : "—"}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatDate(date)}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-gray-400">
              <span className="text-3xl mb-2">✓</span>
              <p className="text-sm">Sin vencimientos próximos</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Registros Recientes</h2>
          <Link href="/trademarks" className="text-sm text-clara-600 hover:text-clara-700 font-medium">
            Ver todos →
          </Link>
        </div>
        {recentTrademarks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 font-medium text-gray-500">Marca</th>
                  <th className="text-left py-2 font-medium text-gray-500">País</th>
                  <th className="text-left py-2 font-medium text-gray-500">Estado</th>
                  <th className="text-left py-2 font-medium text-gray-500">Vencimiento</th>
                </tr>
              </thead>
              <tbody>
                {recentTrademarks.slice(0, 5).map((t) => (
                  <tr key={t.id} className="border-b border-gray-50">
                    <td className="py-3">
                      <Link
                        href={`/trademarks/${t.id}`}
                        className="font-medium text-gray-900 hover:text-clara-600"
                      >
                        {t.name}
                      </Link>
                    </td>
                    <td className="py-3 text-gray-500">{t.country}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          STATUS_COLORS[t.status] || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {STATUS_LABELS[t.status]}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500">
                      {formatDate(t.expiration_date || t.next_renewal_date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-sm">No hay registros aún.</p>
            <Link href="/trademarks/new" className="btn-primary inline-flex mt-4">
              Crear primer registro
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
  textColor,
}: {
  title: string;
  value: number;
  icon: string;
  color: string;
  textColor: string;
}) {
  return (
    <div className={`rounded-xl border p-5 ${color}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
      </div>
      <div className={`text-3xl font-bold ${textColor}`}>{value}</div>
      <div className="text-sm text-gray-600 mt-1">{title}</div>
    </div>
  );
}
