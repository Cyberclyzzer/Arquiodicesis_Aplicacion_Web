// Funciones de poblar/format
export function formatearFecha(val){ if(!val) return ''; if(/^\d{4}-\d{2}-\d{2}$/.test(val)) return val; const d=new Date(val); if(isNaN(d)) return ''; return d.toISOString().slice(0,10); }
function setVal(name, value){ const el=document.querySelector(`[name="${name}"]`); if(!el) return; el.value = value ?? ''; }
// Render a prefijo field as a select with common options; keep disabled by default (will be enabled in editar())
function renderPrefijoSelect(name, value){
  const existing = document.querySelector(`[name="${name}"]`);
  const options = ['', 'V', 'E', 'J', 'G'];
  // build select
  const select = document.createElement('select');
  select.name = name;
  select.className = existing ? existing.className : 'w-full border rounded px-2 py-1 bg-gray-50';
  select.disabled = true; // readonly until editar() enables selects
  options.forEach(opt => {
    const o = document.createElement('option');
    o.value = opt;
    o.textContent = opt === '' ? '' : opt;
    select.appendChild(o);
  });
  // set value if provided
  if(value) select.value = value;
  // replace existing element (input) if present
  if(existing){
    existing.parentNode?.replaceChild(select, existing);
  } else {
    // try to find a sensible place: insert into form by name position
    const form = document.querySelector('form');
    if(form) form.appendChild(select);
  }
}
// helper case-insensitive para obtener valores
function val(obj, ...keys){ for(const k of keys){ if(obj && obj[k] !== undefined && obj[k] !== null) return obj[k]; } return undefined; }
export function actualizarTitulo(full){
  const span=document.getElementById('documento-titulo'); if(!span) return;
  const partes=full.Partes||[];
  const otorgante=partes.find(p=> (p.TipoParte||p.tipoparte)==='Otorgante');
  const receptor=partes.find(p=> (p.TipoParte||p.tipoparte)==='Receptor');
  const d=full.Documento||{};
  span.textContent = `${d.Codigo||'Documento'} ${otorgante?.NombreParte||''} → ${receptor?.NombreParte||''}`.trim();
}
export function poblarCampos(full){
  const d = full.Documento || {};
  // Debug: registrar tipos de bien y bien actual para diagnóstico
  try{ console.log('[poblarCampos] tiposBien:', full.__tiposBien); console.log('[poblarCampos] Bien:', full.Bien); }catch(e){}
  // Documento (case-insensitive)
  setVal('tipoDocumentoID', val(d,'TipoDocumentoID','tipodocumentoid'));
  setVal('tipoDocumentoOtro', val(d,'TipoDocumentoOtro','tipodocumentootro'));
  const tipoDocNombre = val(d, 'TipoDocumentoNombre', 'tipodocumentonombre');
  setVal('tipoDocumento', tipoDocNombre || '(Nombre no encontrado en API)');
  setVal('fechaEmision', formatearFecha(val(d,'FechaEmision','fechaemision')));
  setVal('plazoVigencia', val(d,'PlazoVigencia','plazovigencia'));
  setVal('nombreEstado', val(d,'NombreEstado','nombreestado'));
  setVal('nombreMunicipio', val(d,'NombreMunicipio','nombremunicipio'));
  setVal('nombreParroquia', val(d,'NombreParroquia','nombreparroquia'));
  setVal('monto', val(d,'ValorContrato','valorcontrato'));
  setVal('monedaContrato', val(d,'MonedaContrato','monedacontrato'));
  setVal('codigo', val(d,'Codigo','codigo'));
  // Prefijos (si la API no los separa, podemos inferir de la identificación antes del guión)
  const partes= full.Partes||[];
  function splitPrefijo(ced){ if(!ced) return {pref:'', id:''}; const m=ced.match(/^([A-Z])-(.+)$/i); return m? {pref:m[1].toUpperCase(), id:m[2]} : {pref:'', id:ced}; }
  function cleanId(raw){ if(raw===null||raw===undefined) return ''; const s=String(raw).trim(); if(s===''||/^(n\/?a|na|n\.a\.|null|sin cedula|s\.o\.n)$/i.test(s)) return ''; return s; }
  ['Otorgante','Receptor','AbogadoOtorgante','AbogadoReceptor'].forEach(tipo=>{
    const p=partes.find(x=> (x.TipoParte||x.tipoparte)===tipo || (x.tipoparte||'').toLowerCase()===tipo.toLowerCase());
    if(!p) return;
    const idRaw = p.DatosIdentificacion || p.datosidentificacion;
    const cleaned = cleanId(idRaw);
    const {pref, id} = splitPrefijo(cleaned);
  if(tipo==='Otorgante'){ setVal('otorganteNombre', p.NombreParte||p.nombreparte); setVal('otorganteId', id || cleaned); renderPrefijoSelect('otorgantePrefijo', pref); }
  if(tipo==='Receptor'){ setVal('receptorNombre', p.NombreParte||p.nombreparte); setVal('receptorId', id || cleaned); renderPrefijoSelect('receptorPrefijo', pref); }
    if(tipo==='AbogadoOtorgante'){ setVal('abogadoOtorganteNombre', p.NombreParte||p.nombreparte); setVal('abogadoOtorganteId', cleaned); }
    if(tipo==='AbogadoReceptor'){ setVal('abogadoReceptorNombre', p.NombreParte||p.nombreparte); setVal('abogadoReceptorId', cleaned); }
  });
  // Poblar select de tipoBienID con nombres
  const selectBien = document.querySelector('select[name="tipoBienID"]');
  const tiposBien = full.__tiposBien || [];
  // The API may return Bien as an array of properties; take first for single-form fields
  const bienesArrRaw = Array.isArray(full.Bien) ? full.Bien : (full.Bien ? [full.Bien] : []);
  // Debug: log raw Bien payload from API
  try{ console.log('[poblar] full.Bien raw ->', JSON.parse(JSON.stringify(bienesArrRaw||null))); }catch(e){ console.log('[poblar] full.Bien raw (not serializable) ->', bienesArrRaw); }
  // Normalize TipoBienID key casing so UI createBienGroup can read it reliably
  const bienesArr = bienesArrRaw.map(b => {
    if(!b) return b;
    const normalized = Object.assign({}, b);
    // try multiple likely keys and nested shapes
    const tipo = normalized.TipoBienID ?? normalized.tipobienid ?? normalized.tipoBienID ?? normalized.tipo_bien_id ?? normalized.tipo_bienid ?? (normalized.Bien && (normalized.Bien.TipoBienID || normalized.Bien.tipobienid));
    if(tipo !== undefined && tipo !== null) normalized.TipoBienID = tipo;
  // Normalize Activo (backend may return 'Activo' or 'activo', and may be boolean or string)
  const activoRaw = (normalized.Activo !== undefined) ? normalized.Activo : (normalized.activo !== undefined ? normalized.activo : null);
  normalized.Activo = (activoRaw === true || String(activoRaw) === 'true');
    return normalized;
  });
  try{ console.log('[poblar] bienesArr normalized ->', JSON.parse(JSON.stringify(bienesArr||null))); }catch(e){ console.log('[poblar] bienesArr normalized ->', bienesArr); }
  const b = bienesArr[0] || null;
  if (selectBien) {
    selectBien.innerHTML = '';
    // Opción por defecto
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Seleccione un Tipo de Bien...';
    defaultOption.disabled = true;
    selectBien.appendChild(defaultOption);

    let bienTipoBienFoundAndSelected = false;
    if (tiposBien.length > 0) {
        tiposBien.forEach((tb, idx) => {
          const option = document.createElement('option');
          // Manejar distintos casing que devuelve pg (tipobienid) o APIs que usen camelCase
          const tbId = tb.TipoBienID ?? tb.tipobienid ?? tb.tipoBienID ?? tb.id ?? tb.tipo_bien_id;
          // Valor debe ser siempre el ID (string), para que el select devuelva un identificador numérico/string consistente
          option.value = tbId !== undefined && tbId !== null ? String(tbId) : '';
          option.textContent = tb.Nombre || tb.nombre || tb.nombreTipo || String(tbId) || '(Sin nombre)';
          selectBien.appendChild(option);
          // Comparar como string para evitar problemas de tipo. Soportar distintas claves en el objeto Bien
          const bienTipoId = b ? (b.TipoBienID ?? b.tipobienid ?? b.tipoBienID ?? b.tipo_bien_id) : null;
          if (bienTipoId !== null && bienTipoId !== undefined && String(tbId) === String(bienTipoId)) {
            option.selected = true;
            bienTipoBienFoundAndSelected = true;
          }
        });
    } else {
      defaultOption.textContent = '(No hay tipos de bien disponibles)';
    }
    // Si no se seleccionó nada, dejar la opción por defecto seleccionada
    if (!bienTipoBienFoundAndSelected) {
      defaultOption.selected = true;
    }
  }
  if(b){
    setVal('descripcion', val(b,'Descripcion','descripcion'));
    setVal('ubicacion', val(b,'Ubicacion','ubicacion'));
    // Derivar si es mueble (si no hay ubicacion y tiene Marca/Modelo asumimos mueble)
    const esMueble = (!!b.Marca || !!b.Modelo) && !b.Ubicacion;
    setVal('tipoBienEsMueble', esMueble ? 'Sí' : 'No');
    setVal('metrosFrente', b.MetrosFrenteTexto); setVal('metrosFondo', b.MetrosFondoTexto); setVal('metrosConstruccion', b.MetrosConstruccion);
    setVal('linderoNorte', b.LinderoNorte); setVal('linderoSur', b.LinderoSur); setVal('linderoEste', b.LinderoEste); setVal('linderoOeste', b.LinderoOeste);
    setVal('marca', b.Marca); setVal('modelo', b.Modelo); setVal('serial', b.Serial); setVal('placa', b.Placa);
  }
  setVal('oficinaRegistroNombre', val(d,'OficinaRegistroTexto','oficinaregistrotexto'));
  setVal('fechaOtorgamiento', formatearFecha(val(d,'FechaOtorgamiento','fechaotorgamiento')));
  setVal('datosAsiento', val(d,'DatosAsiento','datosasiento')); setVal('condiciones', val(d,'CondicionesEspeciales','condicionesespeciales')); setVal('observaciones', val(d,'Observaciones','observaciones'));
  const r=full.Revision;
  if(r){
    // Extract prefijo and numeric ID if stored combined, otherwise use separate ResponsablePrefijo
    const rawRev = val(r,'ResponsableCedula','responsablecedula') || '';
    const cleanedRev = cleanId(rawRev);
    const revParts = splitPrefijo(cleanedRev);
  // set prefijo select and numeric-only cedula
  // Prefer prefijo extracted from the stored identification (e.g. 'V-123'),
  // only fallback to separate ResponsablePrefijo when the identification is empty.
  const prefFromIdentRev = revParts.pref || '';
  const prefToSetRev = prefFromIdentRev ? prefFromIdentRev : ( (revParts.id === '' || cleanedRev === '') ? (val(r,'ResponsablePrefijo','responsableprefijo') || '') : '' );
  setVal('revisionPrefijo', prefToSetRev);
  setVal('revisionCedula', revParts.id || (prefFromIdentRev ? '' : cleanedRev) || '');
    setVal('revisionNombre', val(r,'ResponsableNombre','responsablenombre'));
    setVal('revisionFecha', formatearFecha(val(r,'FechaRevision','fecharevision')));
  }
  const g=full.Digitalizacion;
  if(g){
    const rawDig = val(g,'ResponsableIdentificacion','responsableidentificacion') || '';
    const cleanedDig = cleanId(rawDig);
    const digParts = splitPrefijo(cleanedDig);
  // Prefer prefijo from identification; if identification is empty, fallback to ResponsablePrefijo
  const prefFromIdentDig = digParts.pref || '';
  const prefToSetDig = prefFromIdentDig ? prefFromIdentDig : ( (digParts.id === '' || cleanedDig === '') ? (val(g,'ResponsablePrefijo','responsableprefijo') || '') : '' );
  setVal('digitalPrefijo', prefToSetDig);
  setVal('digitalIdentificacion', digParts.id || (prefFromIdentDig ? '' : cleanedDig) || '');
    setVal('digitalCodigo', val(g,'Codigo','codigo'));
    setVal('digitalUbicacion', val(g,'UbicacionFisica','ubicacionfisica'));
    setVal('digitalNombre', val(g,'ResponsableNombre','responsablenombre'));
    setVal('digitalFecha', formatearFecha(val(g,'FechaDigitalizacion','fechadigitalizacion')));
  // PalabraClave: nueva propiedad para búsqueda
  setVal('digitalPalabraClave', val(g,'PalabraClave','palabraclave'));
  }
  const archivo = (full.Archivos || [])[0];
  if (archivo) {
    setVal('ruta_pdf', val(archivo, 'RutaArchivo', 'rutaarchivo') || val(archivo, 'NombreArchivo', 'nombrearchivo'));
    const inputRuta = document.querySelector('[name="ruta_pdf"]');
    const ruta = val(archivo, 'RutaArchivo', 'rutaarchivo');
    if (inputRuta && ruta) {
      // Store a normalized web path on the input instead of inserting an inline anchor.
      const rutaWeb = ruta.startsWith('/') ? ruta.replace(/\\/g,'/') : ('/' + ruta.replace(/\\/g,'/'));
      inputRuta.dataset.ruta = rutaWeb;
      // Notify other modules (if already initialized) that an archivo is available.
      document.dispatchEvent(new CustomEvent('documento:archivoDisponible', { detail: { ruta: rutaWeb } }));
    }
  }
  // Render bienes UI if a renderer is available (habilitarEdicion exposes window.renderBienes)
    try{
      if (typeof window !== 'undefined' && typeof window.renderBienes === 'function'){
        window.renderBienes(bienesArr);
      }
    }catch(e){ /* ignore render issues */ }
}
function fillParte(partes, tipo, nombreField, idField) {
  const p = partes.find(x => (x.TipoParte || x.tipoparte) === tipo);
  if (!p) return;
  setVal(nombreField, p.NombreParte || p.nombreparte);
  setVal(idField, p.DatosIdentificacion || p.datosidentificacion);
}