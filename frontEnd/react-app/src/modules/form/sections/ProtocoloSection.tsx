import { useFormContext } from 'react-hook-form'

interface CatalogProps { catalogs: { oficinas: any[] } }

export function ProtocoloSection({ catalogs }: CatalogProps) {
  const { register } = useFormContext()
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-medium">4. Datos de Protocolización</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Nombre del Estado</label>
          <input {...register('nombreEstado')} className="w-full border rounded px-3 py-2" placeholder="Ej: Lara" />
        </div>
        <div>
          <label className="block text-sm mb-1">Nombre del Municipio</label>
          <input {...register('nombreMunicipio')} className="w-full border rounded px-3 py-2" placeholder="Ej: Iribarren" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm mb-1">Nombre de la Parroquia</label>
          <input {...register('nombreParroquia')} className="w-full border rounded px-3 py-2" placeholder="Ej: Concepción" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm mb-1">Oficina de Registro / Notaría (texto libre)</label>
          <input {...register('oficinaRegistroNombre')} className="w-full border rounded px-3 py-2" placeholder="Ej: Registro Principal de Barquisimeto" />
        </div>
        <div>
          <label className="block text-sm mb-1">Fecha del Otorgamiento</label>
          <input type="date" {...register('fechaOtorgamiento')} className="w-full border rounded px-3 py-2" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm mb-1">Datos del asiento del documento</label>
          <textarea {...register('datosAsiento')} className="w-full border rounded px-3 py-2" rows={3} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm mb-1">Condiciones Especiales</label>
          <textarea {...register('condiciones')} className="w-full border rounded px-3 py-2" rows={3} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm mb-1">Observaciones</label>
          <textarea {...register('observaciones')} className="w-full border rounded px-3 py-2" rows={3} />
        </div>
      </div>
    </section>
  )
}
