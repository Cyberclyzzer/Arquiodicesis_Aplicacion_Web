import { useFormContext } from 'react-hook-form'

const prefixes = ['V','E','J','G','P']

export function RevisionSection() {
  const { register } = useFormContext()
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-medium">5. Revisión del documento</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Nombre del estudiante</label>
          <input {...register('revisionNombre')} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Cédula / ID</label>
          <div className="flex gap-2">
            <select {...register('revisionPrefijo')} className="border rounded px-2">
              {prefixes.map(p=> <option key={p} value={p}>{p}-</option>)}
            </select>
            <input {...register('revisionCedula')} placeholder="Sólo números" className="flex-1 border rounded px-3 py-2" />
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1">Fecha</label>
          <input type="date" {...register('revisionFecha')} className="w-full border rounded px-3 py-2" />
        </div>
      </div>
    </section>
  )
}
