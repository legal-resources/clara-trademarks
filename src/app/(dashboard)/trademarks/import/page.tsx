import Link from "next/link";
import ImportCSV from "@/components/trademarks/ImportCSV";

export default function ImportPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/trademarks" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Importar Registros por CSV</h1>
          <p className="text-gray-500 text-sm mt-0.5">Carga múltiples marcas de una sola vez</p>
        </div>
      </div>

      {/* Instrucciones */}
      <div className="card p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Instrucciones</h2>
        <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
          <li>Descarga la plantilla CSV con el formato correcto</li>
          <li>Solo <strong>nombre</strong> y <strong>titular</strong> son obligatorios — el resto es opcional</li>
          <li>Las fechas deben ir en formato <code className="bg-gray-100 px-1 rounded text-xs">AAAA-MM-DD</code> (ej. 2024-06-15)</li>
          <li>Las clases de Niza van separadas por coma dentro de la celda (ej. <code className="bg-gray-100 px-1 rounded text-xs">36,42</code>)</li>
          <li>Si un campo tiene comas, enciérralo entre comillas (ej. <code className="bg-gray-100 px-1 rounded text-xs">"fintech,latam"</code>)</li>
        </ol>
        <div className="pt-2">
          <a href="/plantilla-marcas.csv" download className="btn-secondary inline-flex">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Descargar Plantilla CSV
          </a>
        </div>
      </div>

      {/* Columnas */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Columnas de la Plantilla</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-6 font-semibold text-gray-600">Columna</th>
                <th className="text-left py-2 pr-6 font-semibold text-gray-600">Requerido</th>
                <th className="text-left py-2 font-semibold text-gray-600">Descripción / Valores aceptados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                ["nombre", true, "Nombre de la marca"],
                ["tipo_marca", false, "nominativa · figurativa · mixta · tridimensional · sonora · olfativa"],
                ["titular", true, "Nombre del titular o propietario"],
                ["pais", false, "País donde se registra (ej. México, Estados Unidos)"],
                ["clases_niza", false, "Números separados por coma dentro de comillas (ej. \"36,42\")"],
                ["descripcion", false, "Descripción de los productos o servicios cubiertos"],
                ["numero_solicitud", false, "Número de expediente de solicitud"],
                ["numero_registro", false, "Número de registro oficial"],
                ["numero_publicacion", false, "Número de publicación en gaceta"],
                ["estado", false, "solicitud_presentada · en_examen · publicada · periodo_oposicion · registrada · rechazada · abandonada · vencida · en_renovacion · suspendida"],
                ["fecha_solicitud", false, "AAAA-MM-DD — Fecha de presentación de la solicitud"],
                ["fecha_registro", false, "AAAA-MM-DD — Fecha en que se otorgó el registro"],
                ["fecha_vencimiento", false, "AAAA-MM-DD — Fecha de vencimiento del registro"],
                ["proxima_renovacion", false, "AAAA-MM-DD — Fecha límite para renovar"],
                ["notas", false, "Texto libre con observaciones internas"],
                ["etiquetas", false, "Palabras clave separadas por coma dentro de comillas (ej. \"latam,prioritaria\")"],
              ].map(([col, req, desc]) => (
                <tr key={col as string}>
                  <td className="py-2 pr-6 font-mono text-clara-700 whitespace-nowrap">{col as string}</td>
                  <td className="py-2 pr-6 text-center">
                    {req
                      ? <span className="bg-clara-100 text-clara-700 text-xs font-semibold px-2 py-0.5 rounded-full">Sí</span>
                      : <span className="text-gray-300 text-xs">—</span>
                    }
                  </td>
                  <td className="py-2 text-gray-600 leading-relaxed">{desc as string}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Uploader */}
      <ImportCSV />
    </div>
  );
}
