"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface Props {
  id: string;
  action: (id: string) => Promise<void>;
}

export default function DeleteButton({ id, action }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-red-600 font-medium">¿Eliminar?</span>
        <button
          onClick={async () => {
            setLoading(true);
            try {
              await action(id);
              toast.success("Registro eliminado");
            } catch {
              toast.error("Error al eliminar");
              setLoading(false);
              setConfirming(false);
            }
          }}
          disabled={loading}
          className="btn-danger text-xs py-1.5 px-3"
        >
          {loading ? "Eliminando..." : "Confirmar"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="btn-secondary text-xs py-1.5 px-3"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="btn-secondary text-red-600 border-red-200 hover:bg-red-50"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
      Eliminar
    </button>
  );
}
