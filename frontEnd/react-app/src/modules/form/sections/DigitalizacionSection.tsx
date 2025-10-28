import { useFormContext } from 'react-hook-form'

const prefixes = ['V','E','J','G','P']

export function DigitalizacionSection() {
  const { register } = useFormContext()
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-medium">6. Digitalización</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Código</label>
          <input {...register('digitalCodigo')} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Ubicación</label>
          <input {...register('digitalUbicacion')} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Nombre del estudiante</label>
          <input {...register('digitalNombre')} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Identificación del responsable</label>
          <div className="flex gap-2">
            <select {...register('digitalPrefijo')} className="border rounded px-2">
              {prefixes.map(p=> <option key={p} value={p}>{p}-</option>)}
            </select>
            <input {...register('digitalIdentificacion')} placeholder="Sólo números" className="flex-1 border rounded px-3 py-2" />
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1">Fecha</label>
          <input type="date" {...register('digitalFecha')} className="w-full border rounded px-3 py-2" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm mb-1">Palabra clave (búsqueda)</label>
          <textarea {...register('digitalPalabraClave')} placeholder="Frases o palabras que faciliten la búsqueda" className="w-full border rounded px-3 py-2 h-24" />
        </div>
      </div>
    </section>
  )
}
