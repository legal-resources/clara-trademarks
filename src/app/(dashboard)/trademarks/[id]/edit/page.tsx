import { getTrademark, updateTrademark } from "@/actions/trademarks";
import TrademarkForm from "@/components/trademarks/TrademarkForm";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTrademarkPage({ params }: PageProps) {
  const { id } = await params;
  const trademark = await getTrademark(id);

  if (!trademark) notFound();

  const action = async (formData: FormData) => {
    "use server";
    await updateTrademark(id, formData);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <Link
          href={`/trademarks/${id}`}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Editar: {trademark.name}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Actualiza los datos del registro de marca
          </p>
        </div>
      </div>

      <div className="card p-6">
        <TrademarkForm trademark={trademark} action={action} isEdit />
      </div>
    </div>
  );
}
