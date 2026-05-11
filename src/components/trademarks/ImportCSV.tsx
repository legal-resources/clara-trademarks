"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { importTrademarks } from "@/actions/trademarks";

type Result = { success: number; errors: string[] };

export default function ImportCSV() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [dragging, setDragging] = useState(false);

  function handleFile(f: File) {
    if (!f.name.endsWith(".csv")) {
      toast.error("Solo se aceptan archivos .csv");
      return;
    }
    setFile(f);
    setResult(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("csv", file);
      const res = await importTrademarks(formData);
      setResult(res);
      if (res.success > 0) {
        toast.success(`${res.success} registro${res.success !== 1 ? "s" : ""} importado${res.success !== 1 ? "s" : ""} correctamente`);
        router.refresh();
      }
      if (res.errors.length > 0 && res.success === 0) {
        toast.error("No se pudo importar ningún registro");
      }
    } catch {
      toast.error("Error al procesar el archivo");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card p-6 space-y-5">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Subir Archivo</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const f = e.dataTransfer.files[0];
            if (f) handleFile(f);
          }}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
            dragging
              ? "border-clara-500 bg-clara-50"
              : file
              ? "border-green-400 bg-green-50"
              : "border-gray-300 hover:border-clara-400 hover:bg-gray-50"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
          {file ? (
            <div className="space-y-1">
              <div className="text-3xl">📄</div>
              <div className="font-medium text-gray-900">{file.name}</div>
              <div className="text-sm text-gray-500">
                {(file.size / 1024).toFixed(1)} KB · Haz clic para cambiar
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-4xl">📂</div>
              <div className="font-medium text-gray-700">Arrastra tu CSV aquí</div>
              <div className="text-sm text-gray-500">o haz clic para seleccionar el archivo</div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!file || loading}
          className="btn-primary w-full justify-center"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Importando...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Importar Registros
            </>
          )}
        </button>
      </form>

      {/* Resultados */}
      {result && (
        <div className="space-y-3 pt-2 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">Resultado de la importación</h3>

          {result.success > 0 && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
              <span className="text-green-600 text-xl">✓</span>
              <span className="text-sm text-green-800 font-medium">
                {result.success} registro{result.success !== 1 ? "s" : ""} importado{result.success !== 1 ? "s" : ""} correctamente
              </span>
            </div>
          )}

          {result.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 space-y-1">
              <div className="text-sm font-medium text-red-800 mb-2">
                {result.errors.length} error{result.errors.length !== 1 ? "es" : ""}:
              </div>
              {result.errors.map((err, i) => (
                <div key={i} className="text-xs text-red-700 flex gap-2">
                  <span className="text-red-400">•</span>
                  <span>{err}</span>
                </div>
              ))}
            </div>
          )}

          {result.success > 0 && (
            <a href="/trademarks" className="btn-secondary inline-flex text-sm">
              Ver registros importados →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
