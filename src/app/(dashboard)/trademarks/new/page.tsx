import { createTrademark } from "@/actions/trademarks";
import TrademarkForm from "@/components/trademarks/TrademarkForm";
import Link from "next/link";

export default function NewTrademarkPage() {
  return (
    <div className="space-y-6 max-w-5xl">
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
          <h1 className="text-2xl font-bold text-gray-900">Nuevo Registro de Marca</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Completa los datos del registro de marca
          </p>
        </div>
      </div>

      <div className="card p-6">
        <TrademarkForm action={createTrademark} />
      </div>
    </div>
  );
}
