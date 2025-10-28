import { useFormContext } from 'react-hook-form'

interface CatalogProps {
  catalogs: { tiposDocumento: any[] }
}

export function ReviewSection({ catalogs }: CatalogProps) {
  const { register, watch } = useFormContext()
  const tipoDocumentoID = watch('tipoDocumentoID')
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-medium">1. Revisión del documento</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Tipo de Documento</label>
          <select {...register('tipoDocumentoID')} className="w-full border rounded px-3 py-2">
            {catalogs.tiposDocumento.length === 0 && <option value="">Cargando...</option>}
            {catalogs.tiposDocumento.map(td => (
              <option key={td.tipodocumentoid || td.TipoDocumentoID || td.id} value={td.tipodocumentoid || td.TipoDocumentoID || td.id}>
                {td.nombre || td.Nombre || td.descripcion || td.Descripcion}
              </option>
            ))}
            <option value="otro">Otro</option>
          </select>
        </div>
        {tipoDocumentoID === 'otro' && (
          <div>
            <label className="block text-sm mb-1">Especificar</label>
            <input {...register('tipoDocumentoOtro')} className="w-full border rounded px-3 py-2" placeholder="Detalle" />
          </div>
        )}
      </div>
    </section>
  )
}
