"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useCallback } from "react";
import Link from "next/link";
import type { Trademark, TrademarkStatus } from "@/lib/types";
import { STATUS_LABELS, STATUS_COLORS, COUNTRIES } from "@/lib/types";
import { formatDate, getDaysUntil } from "@/lib/utils";

interface Props {
  trademarks: Trademark[];
  currentFilters: {
    status?: string;
    country?: string;
    search?: string;
  };
}

export default function TrademarkTable({ trademarks, currentFilters }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(currentFilters.search || "");

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams();
      if (currentFilters.status && key !== "status")
        params.set("status", currentFilters.status);
      if (currentFilters.country && key !== "country")
        params.set("country", currentFilters.country);
      if (currentFilters.search && key !== "search")
        params.set("search", currentFilters.search);
      if (value) params.set(key, value);
      router.push(`${pathname}?${params.toString()}`);
    },
    [currentFilters, pathname, router]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter("search", search);
  };

  const clearFilters = () => {
    setSearch("");
    router.push(pathname);
  };

  const hasFilters =
    currentFilters.status || currentFilters.country || currentFilters.search;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, titular, expediente..."
              className="input-field flex-1"
            />
            <button type="submit" className="btn-secondary">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          {/* Status Filter */}
          <select
            value={currentFilters.status || ""}
            onChange={(e) => updateFilter("status", e.target.value)}
            className="input-field w-auto"
          >
            <option value="">Todos los estados</option>
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          {/* Country Filter */}
          <select
            value={currentFilters.country || ""}
            onChange={(e) => updateFilter("country", e.target.value)}
            className="input-field w-auto"
          >
            <option value="">Todos los países</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {hasFilters && (
            <button onClick={clearFilters} className="btn-secondary text-red-600 border-red-200">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {trademarks.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <span className="text-5xl">🔍</span>
            <p className="mt-3 text-sm font-medium text-gray-500">
              No se encontraron registros
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Intenta ajustar los filtros o crea un nuevo registro
            </p>
            <Link href="/trademarks/new" className="btn-primary inline-flex mt-4">
              Nuevo Registro
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Marca</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Titular</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">País / Jurisdicción</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Clases</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Estado</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Vencimiento</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Expediente</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {trademarks.map((t) => {
                  const expirationDate = t.expiration_date || t.next_renewal_date;
                  const daysLeft = getDaysUntil(expirationDate);
                  const isUrgent = daysLeft !== null && daysLeft <= 30 && daysLeft >= 0;
                  const isWarning = daysLeft !== null && daysLeft > 30 && daysLeft <= 90;

                  return (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <Link
                          href={`/trademarks/${t.id}`}
                          className="font-medium text-gray-900 hover:text-clara-600"
                        >
                          {t.name}
                        </Link>
                        <div className="text-xs text-gray-400 capitalize">{t.brand_type}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{t.owner_name}</td>
                      <td className="px-4 py-3">
                        <div className="text-gray-700">{t.country}</div>
                        {t.jurisdiction && (
                          <div className="text-xs text-gray-400">{t.jurisdiction}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {t.nice_classes?.length > 0
                          ? t.nice_classes.sort((a, b) => a - b).map((c) => (
                              <span
                                key={c}
                                className="inline-block bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded mr-1 mb-0.5"
                              >
                                {c}
                              </span>
                            ))
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            STATUS_COLORS[t.status] || "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {STATUS_LABELS[t.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {expirationDate ? (
                          <div>
                            <div
                              className={`text-sm font-medium ${
                                isUrgent
                                  ? "text-red-600"
                                  : isWarning
                                  ? "text-amber-600"
                                  : "text-gray-700"
                              }`}
                            >
                              {formatDate(expirationDate)}
                            </div>
                            {daysLeft !== null && daysLeft >= 0 && (
                              <div className="text-xs text-gray-400">
                                {daysLeft === 0
                                  ? "Hoy"
                                  : `En ${daysLeft} día${daysLeft !== 1 ? "s" : ""}`}
                              </div>
                            )}
                            {daysLeft !== null && daysLeft < 0 && (
                              <div className="text-xs text-red-500">Vencido</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        <div>{t.application_number || "—"}</div>
                        {t.registration_number && (
                          <div className="text-xs text-gray-400">Reg: {t.registration_number}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/trademarks/${t.id}`}
                            className="text-clara-600 hover:text-clara-700 font-medium text-xs"
                          >
                            Ver
                          </Link>
                          <Link
                            href={`/trademarks/${t.id}/edit`}
                            className="text-gray-500 hover:text-gray-700 text-xs"
                          >
                            Editar
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
