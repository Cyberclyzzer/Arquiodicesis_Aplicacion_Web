import { useFormContext } from 'react-hook-form'

const prefixes = ['V','E','J','G','P']

export function PartesSection() {
  const { register, watch, setValue } = useFormContext()
  const otorgantePref = watch('otorgantePrefijo') || 'V'
  const receptorPref = watch('receptorPrefijo') || 'V'
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-medium">2. Partes involucradas</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2 font-semibold text-xs text-gray-600">Otorgante</div>
        <div>
          <label className="block text-sm mb-1">Nombre</label>
          <input {...register('otorganteNombre')} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Identificación</label>
          <div className="flex gap-2">
            <select {...register('otorgantePrefijo')} className="border rounded px-2">
              {prefixes.map(p => <option key={p} value={p}>{p}-</option>)}
            </select>
            <input {...register('otorganteId')} placeholder="Sólo números" className="flex-1 border rounded px-3 py-2" />
          </div>
        </div>
        <div className="sm:col-span-2 font-semibold text-xs text-gray-600 mt-4">Receptor</div>
        <div>
          <label className="block text-sm mb-1">Nombre</label>
          <input {...register('receptorNombre')} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Identificación</label>
          <div className="flex gap-2">
            <select {...register('receptorPrefijo')} className="border rounded px-2">
              {prefixes.map(p => <option key={p} value={p}>{p}-</option>)}
            </select>
            <input {...register('receptorId')} placeholder="Sólo números" className="flex-1 border rounded px-3 py-2" />
          </div>
        </div>
        <div className="sm:col-span-2 font-semibold text-xs text-gray-600 mt-4">Abogado del Otorgante (opcional)</div>
        <div>
          <label className="block text-sm mb-1">Nombre</label>
          <input {...register('abogadoOtorganteNombre')} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Identificación</label>
          <div className="flex gap-2">
            <select {...register('abogadoOtorgantePrefijo')} className="border rounded px-2">
              {prefixes.map(p => <option key={p} value={p}>{p}-</option>)}
            </select>
            <input {...register('abogadoOtorganteId')} placeholder="Sólo números" className="flex-1 border rounded px-3 py-2" />
          </div>
        </div>
        <div className="sm:col-span-2 font-semibold text-xs text-gray-600 mt-4">Abogado del Receptor (opcional)</div>
        <div>
          <label className="block text-sm mb-1">Nombre</label>
          <input {...register('abogadoReceptorNombre')} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Identificación</label>
          <div className="flex gap-2">
            <select {...register('abogadoReceptorPrefijo')} className="border rounded px-2">
              {prefixes.map(p => <option key={p} value={p}>{p}-</option>)}
            </select>
            <input {...register('abogadoReceptorId')} placeholder="Sólo números" className="flex-1 border rounded px-3 py-2" />
          </div>
        </div>
      </div>
    </section>
  )
}
