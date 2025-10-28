import { useFormContext } from 'react-hook-form'
import { useEffect } from 'react'

interface CatalogProps {
  catalogs: { tiposBien: any[] }
}

export function InmuebleSection({ catalogs }: CatalogProps) {
  const { register, watch, setValue } = useFormContext()
  const tipoBienID = watch('tipoBienID')
  // Determinar si es mueble (por nombre del catálogo que contenga 'mueble' o 'vehiculo')
  const tipoBienObj = catalogs.tiposBien.find(tb => String(tb.tipobienid || tb.TipoBienID || tb.id) === String(tipoBienID))
  const nombreTipoRaw = (tipoBienObj?.nombre || tipoBienObj?.Nombre || '') as string
  const nombreTipoNorm = nombreTipoRaw
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
  // Definir catálogo exacto para muebles para no confundir 'inmueble'
  const mueblesKeywords = new Set(['mueble','vehiculo','vehiculo','vehicul','auto','carro','equipo','maquinaria'])
  const esMueble = mueblesKeywords.has(nombreTipoNorm)
  // Guardar bandera para uso en submit (efecto para evitar setState durante render)
  useEffect(() => {
    try { setValue('tipoBienEsMueble', esMueble) } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [esMueble])
  return (
    <section className="space-y-4">
  <h2 className="text-xl font-medium">3. Detalles del {esMueble ? 'bien mueble' : 'inmueble'}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm mb-1">Descripción del Bien</label>
          <input {...register('descripcion')} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Tipo de Bien</label>
          <select {...register('tipoBienID')} className="w-full border rounded px-3 py-2">
            {catalogs.tiposBien.length === 0 && <option value="">Cargando...</option>}
            {catalogs.tiposBien.map(tb => (
              <option key={tb.tipobienid || tb.TipoBienID || tb.id} value={tb.tipobienid || tb.TipoBienID || tb.id}>
                {tb.nombre || tb.Nombre || tb.descripcion || tb.Descripcion}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm mb-1">Características</label>
          <textarea {...register('caracteristicas')} className="w-full border rounded px-3 py-2" rows={3} />
        </div>
        {!esMueble && (
          <div className="sm:col-span-2">
          <label className="block text-sm mb-1">Ubicación o dirección</label>
          <textarea {...register('ubicacion')} className="w-full border rounded px-3 py-2" rows={2} />
          </div>
        )}
        {!esMueble && (
          <div>
          <label className="block text-sm mb-1">Metros de terreno (frente)</label>
          <input type="text" {...register('metrosFrente')} className="w-full border rounded px-3 py-2" placeholder="Ej: 12.5 m o 12,5" />
          </div>
        )}
        {!esMueble && (
          <div>
          <label className="block text-sm mb-1">Metros de terreno (fondo)</label>
          <input type="text" {...register('metrosFondo')} className="w-full border rounded px-3 py-2" placeholder="Ej: 20 m" />
          </div>
        )}
        {!esMueble && (
          <>
            <div>
              <label className="block text-sm mb-1">Metros de construcción</label>
              <input type="text" {...register('metrosConstruccion')} className="w-full border rounded px-3 py-2" placeholder="Ej: 80 m² o N/A" />
            </div>
            <div className="sm:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm mb-1">Lindero Norte</label>
                  <input {...register('linderoNorte')} className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm mb-1">Lindero Sur</label>
                  <input {...register('linderoSur')} className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm mb-1">Lindero Este (Naciente)</label>
                  <input {...register('linderoEste')} className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm mb-1">Lindero Oeste (Poniente)</label>
                  <input {...register('linderoOeste')} className="w-full border rounded px-3 py-2" />
                </div>
              </div>
            </div>
          </>
        )}
        {esMueble && (
          <>
            <div>
              <label className="block text-sm mb-1">Marca</label>
              <input {...register('marca')} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm mb-1">Modelo</label>
              <input {...register('modelo')} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm mb-1">Serial</label>
              <input {...register('serial')} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm mb-1">Placa</label>
              <input {...register('placa')} className="w-full border rounded px-3 py-2" />
            </div>
          </>
        )}
        <div>
          <label className="block text-sm mb-1">Monto o valor (vacío = Donación)</label>
          <div className="flex gap-2">
            <input type="text" {...register('monto')} className="w-full border rounded px-3 py-2" placeholder="Ej: 15000.00" />
            <select {...register('monedaContrato')} className="border rounded px-2 py-2 text-sm">
              <option value="">Moneda</option>
              <option value="VES">Bs</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="OTRA">Otra</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1">Fecha de emisión</label>
          <input type="date" {...register('fechaEmision')} className="w-full border rounded px-3 py-2" />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" {...register('activo')} id="activo-bien" className="h-4 w-4" />
          <label htmlFor="activo-bien" className="text-sm">Activo (marcar si el bien está activo)</label>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm mb-1">Plazo de vigencia</label>
          <input {...register('plazoVigencia')} className="w-full border rounded px-3 py-2" placeholder="Texto o N/A" />
        </div>
      </div>
    </section>
  )
}
