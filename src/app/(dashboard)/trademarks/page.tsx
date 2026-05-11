import { getTrademarks } from "@/actions/trademarks";
import TrademarkTable from "@/components/trademarks/TrademarkTable";
import Link from "next/link";
import type { TrademarkStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    status?: string;
    country?: string;
    search?: string;
  }>;
}

export default async function TrademarksPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const trademarks = await getTrademarks({
    status: params.status as TrademarkStatus | undefined,
    country: params.country,
    search: params.search,
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Registros de Marcas
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {trademarks.length} registro{trademarks.length !== 1 ? "s" : ""}{" "}
            encontrado{trademarks.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/trademarks/import" className="btn-secondary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Importar CSV
          </Link>
          <Link href="/trademarks/new" className="btn-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Registro
          </Link>
        </div>
      </div>

      <TrademarkTable
        trademarks={trademarks}
        currentFilters={{
          status: params.status,
          country: params.country,
          search: params.search,
        }}
      />
    </div>
  );
}
