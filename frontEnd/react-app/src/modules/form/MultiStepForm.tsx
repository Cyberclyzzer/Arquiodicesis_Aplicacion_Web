import { useState, useMemo, useEffect } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'framer-motion'
import { ReviewSection } from './sections/ReviewSection'
import { PartesSection } from './sections/PartesSection'
import { InmuebleSection } from './sections/InmuebleSection'
import { ProtocoloSection } from './sections/ProtocoloSection'
import { RevisionSection } from './sections/RevisionSection'
import { DigitalizacionSection } from './sections/DigitalizacionSection'
import { api } from '../shared/api'

const schema = z.object({
  // 1. Revisión del documento / llenado de formulario
  // Catálogos dinámicos
  tipoDocumentoID: z.string().min(1, 'Requerido'),
  tipoDocumento: z.string().optional(),
  tipoDocumentoOtro: z.string().optional(),
  // 2. Partes
  otorganteNombre: z.string().min(2, 'Requerido'),
  otorganteId: z.string().optional(),
  otorgantePrefijo: z.string().default('V'),
  receptorNombre: z.string().min(2, 'Requerido'),
  receptorId: z.string().optional(),
  receptorPrefijo: z.string().default('V'),
  abogadoOtorganteNombre: z.string().optional(),
  abogadoOtorganteId: z.string().optional(),
  abogadoOtorgantePrefijo: z.string().optional(),
  abogadoReceptorNombre: z.string().optional(),
  abogadoReceptorId: z.string().optional(),
  abogadoReceptorPrefijo: z.string().optional(),
  // 3. Inmueble
  descripcion: z.string().min(2, 'Requerido'),
  tipoBienID: z.string().min(1, 'Selecciona un tipo'),
  tipoBienEsMueble: z.boolean().optional(), // derivado en UI
  caracteristicas: z.string().optional(),
  activo: z.boolean().optional(),
  ubicacion: z.string().optional(),
  metrosFrente: z.string().optional(),
  metrosFondo: z.string().optional(),
  metrosConstruccion: z.string().optional(),
  linderoNorte: z.string().optional(),
  linderoSur: z.string().optional(),
  linderoEste: z.string().optional(),
  linderoOeste: z.string().optional(),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  serial: z.string().optional(),
  placa: z.string().optional(),
  // Monto ahora texto: vacío => donación (se interpreta como null), si numérico se convierte
  monto: z.string().optional(),
  monedaContrato: z.string().optional(),
  fechaEmision: z.string().min(1, 'Requerido'),
  plazoVigencia: z.string().optional(),
  // 4. Protocolo
  oficinaRegistroNombre: z.string().min(1, 'Requerido'),
  fechaOtorgamiento: z.string().min(1, 'Requerido'),
  datosAsiento: z.string().min(2, 'Requerido'),
  condiciones: z.string().optional(),
  observaciones: z.string().optional(),
  nombreEstado: z.string().min(1, 'Requerido'),
  nombreMunicipio: z.string().min(1, 'Requerido'),
  nombreParroquia: z.string().min(1, 'Requerido'),
  // 5. Estudiante revisión
  revisionNombre: z.string().min(2, 'Requerido'),
  revisionFecha: z.string().min(1, 'Requerido'),
  revisionCedula: z.string().optional(),
  revisionPrefijo: z.string().optional(),
  revisionFirma: z.any().optional(),
  // 6. Digitalización
  digitalCodigo: z.string().optional(),
  digitalUbicacion: z.string().min(1, 'Requerido'),
  digitalNombre: z.string().min(2, 'Requerido'),
  digitalFecha: z.string().min(1, 'Requerido'),
  digitalIdentificacion: z.string().optional(),
  digitalPrefijo: z.string().optional(),
  digitalFirma: z.any().optional(),
}).superRefine((val, ctx) => {
  if (!val.tipoBienEsMueble) {
    if (!val.ubicacion || val.ubicacion.trim().length < 2) {
      ctx.addIssue({ code: 'custom', path: ['ubicacion'], message: 'Requerido' })
    }
  }
})

export type FormValues = z.infer<typeof schema>

const defaultValues: Partial<FormValues> = {}

export function MultiStepForm({ onDone }: { onDone: () => void }) {
  const methods = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues, mode: 'onSubmit' })
  const { setValue, watch } = methods
  const [catalogs, setCatalogs] = useState<{ tiposDocumento: any[]; oficinas: any[]; tiposBien: any[] }>({ tiposDocumento: [], oficinas: [], tiposBien: [] })

  // Cargar catálogos al montar
  useEffect(() => {
    (async () => {
      try {
        const [tiposDocumento, oficinas, tiposBien] = await Promise.all([
          api.get('/tipos-documento'),
          api.get('/oficinas-registro'),
          api.get('/tipos-bien'),
        ])
        setCatalogs({ tiposDocumento, oficinas, tiposBien })
        // valores por defecto si existen
        if (tiposDocumento?.[0]) setValue('tipoDocumentoID', String(tiposDocumento[0].tipodocumentoid || tiposDocumento[0].TipoDocumentoID || tiposDocumento[0].id))
  // ya no se autoselecciona oficina predefinida
        if (tiposBien?.[0]) setValue('tipoBienID', String(tiposBien[0].tipobienid || tiposBien[0].TipoBienID || tiposBien[0].id))
      } catch (e) {
        // silencioso: catálogos no críticos
      }
    })()
  }, [setValue])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [toast, setToast] = useState<{type:'success'|'error'; msg:string}|null>(null)
  useEffect(()=>{
    if(toast){
      const t = setTimeout(()=>setToast(null),4000)
      return ()=>clearTimeout(t)
    }
  },[toast])

  const onSubmit = methods.handleSubmit(async (values) => {
      // Utilidades para códigos en base a nombres
      const normalize = (s: string) => s
        .normalize('NFD').replace(/\p{Diacritic}/gu, '')
        .replace(/[^A-Za-z0-9 ]/g, ' ').trim();
      // Sanitizar cédulas para cumplir el CHECK del backend: ^(?:[VE]-)?[0-9]{5,12}$
      const sanitizeCedula = (raw: string | undefined | null) => {
        if (!raw) return raw as any
        let s = raw.trim()
        s = s.replace(/^[A-Za-z]\s*-?\s*/, '') // elimina prefijo letra-
  const digits = s.replace(/\D/g,'').slice(0,15)
        return 'V-' + digits
      }
      const abbr = (s: string, n: number) => {
        const norm = normalize(s).replace(/\s+/g, ' ').replace(/ /g, '');
        return String(norm).slice(0, n).padEnd(n, 'X').toUpperCase();
      };
      // Usar esquema 4-3-2
      const codEstado = abbr(values.nombreEstado, 4);
      const codMun = abbr(values.nombreMunicipio, 3);
      const codPar = abbr(values.nombreParroquia, 2);
      const prefix = `${codEstado}${codMun}${codPar}`;

      // Intentar obtener siguiente correlativo desde backend (lista /documentos)
      let nextSeq: number | null = null;
      try{
        const docs = await api.get('/documentos');
        if(Array.isArray(docs)){
          let max = 0;
          const re = new RegExp('^' + prefix.replace(/[-\\/\\^$*+?.()|[\]{}]/g,'\\$&') + '-(\\d+)$');
          docs.forEach((d:any)=>{
            const c = d.Codigo || d.codigo || '';
            const m = (c||'').match(re);
            if(m && m[1]){
              const n = parseInt(m[1],10);
              if(Number.isFinite(n) && n>max) max=n;
            }
          });
          nextSeq = max+1;
        }
      }catch(e){ /* silent -> fallback below */ }

      const today = new Date();
      const y = String(today.getFullYear());
      const m = String(today.getMonth() + 1).padStart(2, '0');
      const d = String(today.getDate()).padStart(2, '0');

      let generatedCodigo: string;
      if(nextSeq){
        generatedCodigo = `${prefix}-${String(nextSeq).padStart(4,'0')}`;
      } else {
        const rnd = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        generatedCodigo = `${prefix}-${y}${m}${d}-${rnd}`;
      }
      // Código para digitalización debe seguir formato fecha+random para evitar colisiones con correlativo
      const rndDigital = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const generatedDigitalCode = `${prefix}-${y}${m}${d}-${rndDigital}`;
  setLoading(true)
  setError(null)
  setSuccess(null)
    try {
      // 1) Crear Documento
      const plazo = values.plazoVigencia && values.plazoVigencia.trim() !== ''
        ? values.plazoVigencia.trim().slice(0,200)
        : null
  const valorContrato = values.monto && values.monto.trim() !== '' ? (isNaN(Number(values.monto.replace(',', '.'))) ? null : Number(values.monto.replace(',', '.'))) : null;
  const monedaContrato = valorContrato != null ? (values.monedaContrato || 'VES') : null;
  const docPayload = {
        TipoDocumentoID: Number(values.tipoDocumentoID) || 1,
  OficinaRegistroID: null,
  OficinaRegistroTexto: values.oficinaRegistroNombre,
        FechaEmision: values.fechaEmision,
        FechaOtorgamiento: values.fechaOtorgamiento,
        TipoDocumentoOtro: (values.tipoDocumento === 'Otro' || values.tipoDocumentoID === 'otro') ? (values.tipoDocumentoOtro || '') : null,
        DatosAsiento: values.datosAsiento,
        CondicionesEspeciales: values.condiciones || '',
        Observaciones: values.observaciones || '',
  ValorContrato: valorContrato,
  MonedaContrato: monedaContrato,
        PlazoVigencia: plazo,
  // Enviar los nombres completos en Codigo* para cumplir con la petición del backend/usuario
  CodigoEstado: values.nombreEstado,
  CodigoMunicipio: values.nombreMunicipio,
  CodigoParroquia: values.nombreParroquia,
  NombreEstado: values.nombreEstado,
  NombreMunicipio: values.nombreMunicipio,
  NombreParroquia: values.nombreParroquia,
      }
  // Incluir Codigo calculado en el payload para creación
  const finalDocPayload = Object.assign({}, docPayload, { Codigo: generatedCodigo });
  console.log('[MultiStepForm] finalDocPayload ->', JSON.parse(JSON.stringify(finalDocPayload)));
  const documento = await api.post('/documentos', finalDocPayload)
  const documentoID = documento?.DocumentoID ?? documento?.documentoid ?? documento?.id
  if (!documentoID) throw new Error('No se recibió un ID del documento desde el servidor.')

      // 2) Partes
  // Normalización opcional (solo si se provee)
  const otorganteCed = sanitizeCedula(values.otorganteId || undefined)
  const receptorCed = sanitizeCedula(values.receptorId || undefined)
  await api.post('/partes', { DocumentoID: documentoID, TipoParte: 'Otorgante', NombreParte: values.otorganteNombre, DatosIdentificacion: values.otorganteId || null, Prefijo: values.otorgantePrefijo })
  await api.post('/partes', { DocumentoID: documentoID, TipoParte: 'Receptor', NombreParte: values.receptorNombre, DatosIdentificacion: values.receptorId || null, Prefijo: values.receptorPrefijo })
      if (values.abogadoOtorganteNombre && values.abogadoOtorganteId) {
  await api.post('/partes', { DocumentoID: documentoID, TipoParte: 'AbogadoOtorgante', NombreParte: values.abogadoOtorganteNombre, DatosIdentificacion: values.abogadoOtorganteId || null, Prefijo: values.abogadoOtorgantePrefijo || 'V' })
      }
      if (values.abogadoReceptorNombre && values.abogadoReceptorId) {
  await api.post('/partes', { DocumentoID: documentoID, TipoParte: 'AbogadoReceptor', NombreParte: values.abogadoReceptorNombre, DatosIdentificacion: values.abogadoReceptorId || null, Prefijo: values.abogadoReceptorPrefijo || 'V' })
      }

      // 3) Bien (opcional)
  // Calcular área solo si ambos valores son numéricos; los campos son de texto para permitir descripciones libres
  const frenteNum = values.metrosFrente ? parseFloat(values.metrosFrente.replace(',', '.')) : NaN
  const fondoNum = values.metrosFondo ? parseFloat(values.metrosFondo.replace(',', '.')) : NaN
  const metrosTerreno = Number.isFinite(frenteNum) && Number.isFinite(fondoNum) ? frenteNum * fondoNum : null
      await api.post('/bienes', {
        DocumentoID: documentoID,
        TipoBienID: Number(values.tipoBienID) || 1,
        Descripcion: values.descripcion,
        Caracteristicas: values.caracteristicas || '',
        Activo: values.activo === true,
        Ubicacion: values.tipoBienEsMueble ? '' : values.ubicacion,
        MetrosFrenteTexto: values.tipoBienEsMueble ? null : (values.metrosFrente || null),
        MetrosFondoTexto: values.tipoBienEsMueble ? null : (values.metrosFondo || null),
        MetrosTerreno: values.tipoBienEsMueble ? null : metrosTerreno,
        MetrosConstruccion: values.tipoBienEsMueble ? null : (values.metrosConstruccion ? (isNaN(parseFloat(values.metrosConstruccion.replace(',', '.'))) ? null : parseFloat(values.metrosConstruccion.replace(',', '.'))) : null),
        LinderoNorte: values.tipoBienEsMueble ? null : (values.linderoNorte || null),
        LinderoSur: values.tipoBienEsMueble ? null : (values.linderoSur || null),
        LinderoEste: values.tipoBienEsMueble ? null : (values.linderoEste || null),
        LinderoOeste: values.tipoBienEsMueble ? null : (values.linderoOeste || null),
        Marca: values.tipoBienEsMueble ? (values.marca || null) : null,
        Modelo: values.tipoBienEsMueble ? (values.modelo || null) : null,
        Serial: values.tipoBienEsMueble ? (values.serial || null) : null,
        Placa: values.tipoBienEsMueble ? (values.placa || null) : null,
      })

      // 4) Revisión
  const revisionCed = values.revisionCedula ? sanitizeCedula(values.revisionCedula).replace(/^V-/, (values.revisionPrefijo||'V')+'-') : null
  await api.post('/revisiones', { DocumentoID: documentoID, FechaRevision: values.revisionFecha, ResponsableNombre: values.revisionNombre, ResponsableCedula: revisionCed })
      
      // 5) Digitalización
  const digitalCodigo = values.digitalCodigo && values.digitalCodigo.trim().length > 0 ? values.digitalCodigo : generatedDigitalCode
  const digitalId = values.digitalIdentificacion ? sanitizeCedula(values.digitalIdentificacion).replace(/^V-/, (values.digitalPrefijo||'V')+'-') : digitalCodigo
  await api.post('/digitalizaciones', { DocumentoID: documentoID, FechaDigitalizacion: values.digitalFecha, ResponsableNombre: values.digitalNombre, ResponsableIdentificacion: digitalId, UbicacionFisica: values.digitalUbicacion, Codigo: digitalCodigo })

      // 6) Subir PDF si se adjunta al final del formulario
      const fileInput = document.getElementById('pdf-upload') as HTMLInputElement | null
      const file = fileInput?.files?.[0]
      if (file) {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('DocumentoID', String(documentoID))
        fd.append('TipoArchivo', 'application/pdf')
        await api.upload('/archivos', fd)
      }

  setSuccess('Formulario enviado correctamente. Documento creado: ' + documentoID)
  setToast({ type:'success', msg:'Datos guardados (Documento '+documentoID+')' })
  try { window.scrollTo({ top: 0, behavior: 'smooth' }) } catch {}
  onDone()
    } catch (err: any) {
  const apiMsg = err?.response?.data?.message || err?.response?.data?.error
  const details = Array.isArray(err?.response?.data?.details) ? err.response.data.details.map((d:any)=>d.message).join(', ') : undefined
  const message = apiMsg || details || err?.message || 'Error al enviar'
  setError(message)
  setToast({ type:'error', msg: message })
  try { window.scrollTo({ top: 0, behavior: 'smooth' }) } catch {}
    } finally {
      setLoading(false)
    }
  })

  const [open, setOpen] = useState<{[k:string]: boolean}>({
    s1: true, s2: true, s3: true, s4: true, s5: true, s6: true,
  })

  const toggle = (k: string) => setOpen((o) => ({ ...o, [k]: !o[k] }))

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="form-container max-w-full">
  <div className="space-y-4 w-full">
          {/* 6 botones dinámicos tipo acordeón */}
          <div>
            <button type="button" className="dropdown-button" onClick={() => toggle('s1')}>1. Revisión del documento</button>
            <AnimatePresence>
              {open.s1 && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-3">
                  <ReviewSection catalogs={catalogs} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div>
            <button type="button" className="dropdown-button" onClick={() => toggle('s2')}>2. Partes involucradas</button>
            <AnimatePresence>
              {open.s2 && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-3">
                  <PartesSection />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div>
            <button type="button" className="dropdown-button" onClick={() => toggle('s3')}>3. Detalles del inmueble</button>
            <AnimatePresence>
              {open.s3 && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-3">
                  <InmuebleSection catalogs={catalogs} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div>
            <button type="button" className="dropdown-button" onClick={() => toggle('s4')}>4. Protocolo</button>
            <AnimatePresence>
              {open.s4 && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-3">
                  <ProtocoloSection catalogs={catalogs} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div>
            <button type="button" className="dropdown-button" onClick={() => toggle('s5')}>5. Revisión</button>
            <AnimatePresence>
              {open.s5 && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-3">
                  <RevisionSection />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div>
            <button type="button" className="dropdown-button" onClick={() => toggle('s6')}>6. Digitalización</button>
            <AnimatePresence>
              {open.s6 && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-3">
                  <DigitalizacionSection />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div>
            <button type="button" className="dropdown-button" onClick={() => toggle('s7')}>7. Cargar documento (PDF)</button>
            <AnimatePresence>
              {open['s7'] && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-3">
                  <div className="cargar">
                    <h4>Cargar documento</h4>
                    <label htmlFor="pdf-upload">Seleccionar archivo:</label>
                    <div className="columna-solicitud">
                      <input id="pdf-upload" type="file" accept="application/pdf" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {Object.keys(methods.formState.errors).length > 0 && !loading && (
          <div className="my-3 border border-yellow-300 bg-yellow-50 text-yellow-800 rounded px-3 py-2 text-xs">
            {Object.entries(methods.formState.errors).map(([k,v]) => (
              <div key={k}>{k}: {(v as any).message || 'Inválido'}</div>
            ))}
          </div>
        )}
        {(error || success) && (
          <div className="space-y-2 my-3">
            {error && (
              <div className="border border-red-300 bg-red-100 text-red-800 rounded px-3 py-2 text-sm">{error}</div>
            )}
            {success && (
              <div className="border border-green-300 bg-green-100 text-green-800 rounded px-3 py-2 text-sm">{success}</div>
            )}
          </div>
        )}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 shadow-lg px-4 py-3 rounded text-sm text-white ${toast.type==='success'?'bg-green-600':'bg-red-600'}`}>
            {toast.msg}
          </div>
        )}

        <div className="botones px-2">
          <button type="submit" disabled={loading} className="px-6 py-3 bg-green-700 text-white rounded-md disabled:opacity-50 w-full sm:w-auto">
            {loading ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </form>
    </FormProvider>
  )
}
