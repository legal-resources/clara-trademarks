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
          <li>Llena los datos de tus marcas — respeta los nombres de columna exactamente</li>
          <li>Las fechas deben estar en formato <code className="bg-gray-100 px-1 rounded text-xs">AAAA-MM-DD</code> (ej. 2024-06-15)</li>
          <li>Las clases de Niza van separadas por coma dentro de la celda (ej. <code className="bg-gray-100 px-1 rounded text-xs">36,42</code>)</li>
          <li>Los campos booleanos aceptan <code className="bg-gray-100 px-1 rounded text-xs">true</code> o <code className="bg-gray-100 px-1 rounded text-xs">false</code></li>
          <li>Sube el archivo y revisa los resultados</li>
        </ol>

        <div className="pt-2">
          <a
            href="/plantilla-marcas.csv"
            download
            className="btn-secondary inline-flex"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Descargar Plantilla CSV
          </a>
        </div>
      </div>

      {/* Campos del CSV */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Columnas de la Plantilla</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-4 font-semibold text-gray-600">Columna</th>
                <th className="text-left py-2 pr-4 font-semibold text-gray-600">Requerido</th>
                <th className="text-left py-2 font-semibold text-gray-600">Descripción / Valores aceptados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                ["nombre", "✓", "Nombre de la marca"],
                ["tipo_marca", "", "nominativa · figurativa · mixta · tridimensional · sonora · olfativa"],
                ["titular", "✓", "Nombre del titular o propietario"],
                ["pais", "✓", "País donde se registra la marca"],
                ["jurisdiccion", "", "Oficina de marcas (ej. IMPI, USPTO, EUIPO)"],
                ["clases_niza", "", "Números separados por coma (ej. 36,42)"],
                ["descripcion", "", "Descripción de productos o servicios"],
                ["numero_solicitud", "", "Número de expediente de solicitud"],
                ["numero_registro", "", "Número de registro oficial"],
                ["numero_publicacion", "", "Número de publicación"],
                ["estado", "", "solicitud_presentada · en_examen · publicada · periodo_oposicion · registrada · rechazada · abandonada · vencida · en_renovacion · suspendida"],
                ["fecha_solicitud", "", "AAAA-MM-DD"],
                ["fecha_examen", "", "AAAA-MM-DD"],
                ["fecha_publicacion", "", "AAAA-MM-DD"],
                ["fecha_limite_oposicion", "", "AAAA-MM-DD"],
                ["fecha_registro", "", "AAAA-MM-DD"],
                ["fecha_vencimiento", "", "AAAA-MM-DD"],
                ["proxima_renovacion", "", "AAAA-MM-DD"],
                ["agente", "", "Nombre del agente o abogado"],
                ["correo_agente", "", "Email del agente"],
                ["telefono_agente", "", "Teléfono del agente"],
                ["firma_agente", "", "Nombre del despacho"],
                ["tasas_pagadas", "", "true · false"],
                ["fecha_pago", "", "AAAA-MM-DD"],
                ["monto", "", "Número decimal (ej. 5000.00)"],
                ["moneda", "", "USD · MXN · EUR · GBP · BRL · COP"],
                ["tiene_prioridad", "", "true · false"],
                ["pais_prioridad", "", "País de la prioridad"],
                ["fecha_prioridad", "", "AAAA-MM-DD"],
                ["numero_prioridad", "", "Número de prioridad"],
                ["notas", "", "Texto libre con notas internas"],
                ["etiquetas", "", "Palabras clave separadas por coma"],
              ].map(([col, req, desc]) => (
                <tr key={col}>
                  <td className="py-1.5 pr-4 font-mono text-clara-700">{col}</td>
                  <td className="py-1.5 pr-4 text-center">{req ? <span className="text-green-600 font-bold">{req}</span> : <span className="text-gray-300">—</span>}</td>
                  <td className="py-1.5 text-gray-600">{desc}</td>
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
