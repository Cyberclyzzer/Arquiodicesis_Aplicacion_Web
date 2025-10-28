// Versión pública mínima de habilitarEdicion
function q(sel){return document.querySelector(sel);}
function val(name) {
  const el = q(`[name="${name}"]`);
  if (el && el.value !== undefined && el.value !== null) {
    return String(el.value).trim();
  }
  return '';
}
function toISODate(str){ if(!str) return null; const d=new Date(str); return isNaN(d)? null : d.toISOString().slice(0,10);} 
// Normalizar texto (remueve diacríticos y caracteres no alfanuméricos)
function normalizeName(s){ if(!s) return ''; try{ return s.normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/[^A-Za-z0-9 ]/g,' ').trim(); }catch(e){ return String(s).replace(/[^A-Za-z0-9 ]/g,' ').trim(); } }
function abbr(s,n){
  // tomar los primeros n caracteres del nombre normalizado (sin espacios)
  const norm = normalizeName(s).replace(/\s+/g,' ').replace(/ /g,'');
  const t = String(norm).slice(0,n).padEnd(n,'X').toUpperCase();
  return t;
}
// Separar un valor de DatosIdentificacion en prefijo y número.
function splitPrefAndId(datos){
  if(!datos && datos!==0) return { pref: '', id: '' };
  const s = String(datos).trim();
  // Buscar patrones como 'V-12345678', 'V - 123', 'V123', 'VE-123' o sólo número
  const re = /^([^0-9\-\s]+)[\s\-]*([0-9]+)$/u;
  const m = s.match(re);
  if(m){ return { pref: m[1].toUpperCase(), id: m[2] }; }
  // Si no hay prefijo, devolver todo como id (quitar espacios y guiones)
  const onlyNum = s.replace(/[^0-9]/g,'');
  if(onlyNum) return { pref: '', id: onlyNum };
  return { pref: '', id: s };
}

// Rellena los inputs de prefijo e id para las partes (otorgante, receptor, abogados)
function populatePartesPrefijos(){
  try{
    const full = window.__documentoFull || {};
    const partes = full.Partes || [];
    const mapUI=[
      {tipo:'Otorgante', nombre:'otorganteNombre', id:'otorganteId'},
      {tipo:'Receptor', nombre:'receptorNombre', id:'receptorId'},
      {tipo:'AbogadoOtorgante', nombre:'abogadoOtorganteNombre', id:'abogadoOtorganteId'},
      {tipo:'AbogadoReceptor', nombre:'abogadoReceptorNombre', id:'abogadoReceptorId'},
    ];
    for(const m of mapUI){
      const p = partes.find(x=> (x.TipoParte||x.tipoparte)===m.tipo);
      if(!p) continue;
      const datos = p.DatosIdentificacion || p.datosidentificacion || '';
      const {pref, id} = splitPrefAndId(datos||'');
      // campos en el DOM
      const idEl = q(`[name="${m.id}"]`);
      const prefField = m.id.replace(/Id$/,'Prefijo');
      const prefEl = q(`[name="${prefField}"]`);
      if(idEl){
        // sólo poner la parte numérica en el input
        idEl.value = id || '';
      }
      if(prefEl){
        // intentar seleccionar la opción que coincida con el prefijo (mayúsculas)
        const valToSet = pref || '';
        // si existe la opción, asignar
        try{ prefEl.value = valToSet; }catch(e){}
        // si no existe, intentar buscar por texto
        if(prefEl.value !== valToSet){
          for(const opt of prefEl.options||[]){
            if(String(opt.value).toUpperCase()===String(valToSet).toUpperCase() || String(opt.text).toUpperCase()===String(valToSet).toUpperCase()){
              prefEl.value = opt.value; break;
            }
          }
        }
      }
    }
  }catch(e){ /* ignore */ }
}
async function getNextSequenceForPrefix(prefix){
  try{
    // Intentar obtener todos los documentos y buscar el mayor correlativo existente
    const docs = await jsonFetch('/documentos','GET');
    if(!Array.isArray(docs)) return null;
    let max = 0;
    const re = new RegExp('^' + prefix.replace(/[-\\/\\^$*+?.()|[\]{}]/g,'\\$&') + '-(\\d+)$');
    for(const d of docs){
      const codigo = d && (d.Codigo||d.codigo||'');
      if(!codigo) continue;
      const m = codigo.match(re);
      if(m && m[1]){
        const n = parseInt(m[1],10);
        if(Number.isFinite(n) && n>max) max=n;
      }
    }
    return max+1;
  }catch(e){
    return null;
  }
}
async function generateDocumentCode(nombreEstado, nombreMunicipio, nombreParroquia){
  const codEstado = abbr(nombreEstado||'','4');
  const codMun = abbr(nombreMunicipio||'','3');
  const codPar = abbr(nombreParroquia||'','2');
  const prefix = `${codEstado}${codMun}${codPar}`;
  let seq = await getNextSequenceForPrefix(prefix);
  if(!seq){ // fallback: usar fecha+random si no se pudo calcular
    const today = new Date(); const y = String(today.getFullYear()); const m = String(today.getMonth()+1).padStart(2,'0'); const d = String(today.getDate()).padStart(2,'0'); const rnd = Math.floor(Math.random()*10000).toString().padStart(4,'0');
    return { codigo: `${prefix}-${y}${m}${d}-${rnd}`, CodigoEstado: nombreEstado||'', CodigoMunicipio: nombreMunicipio||'', CodigoParroquia: nombreParroquia||'' };
  }
  const seqStr = String(seq).padStart(4,'0');
  return { codigo: `${prefix}-${seqStr}`, CodigoEstado: nombreEstado||'', CodigoMunicipio: nombreMunicipio||'', CodigoParroquia: nombreParroquia||'' };
}
async function jsonFetch(path, method, body){
	// fallback: si estamos en 5173 usar http://localhost:3000
	const bases=[''];
	if(!window.location.origin.includes('3000')) bases.push('http://localhost:3000');
  let lastErr; for(const b of bases){
    try{
      const r=await fetch(b+path,{method, headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)});
      if(!r.ok){
        const txt = await r.text().catch(()=>String(r.statusText||'error'));
        const err = new Error('HTTP '+r.status+': '+txt);
        err.status = r.status;
        err.body = txt;
        throw err;
      }
      return r.json().catch(()=>({}));
    }catch(e){ lastErr=e; }
  }
  throw lastErr || new Error('Fallo petición '+path);
}
export function editar(){ 
  const form=q('form'); if(!form) return; 
  form.querySelectorAll('input,textarea,select').forEach(el=>{
    el.removeAttribute('readonly'); 
    el.disabled=false;
    if(el.name==='tipoBienID'){
      el.classList.remove('bg-gray-50');
      // Si no hay un valor válido seleccionado, forzar al usuario a elegir.
      if(!el.value){
        el.selectedIndex = 0; // Asegura que la opción "Seleccione..." esté visible.
        el.focus(); // Opcional: pone el foco en el select.
      }
    }
  }); 
  if(form.querySelector('#btn-guardar-cambios')) return; 
  const guardar=document.createElement('button'); guardar.type='button'; guardar.id='btn-guardar-cambios'; guardar.textContent='Guardar Cambios'; guardar.className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mr-2'; guardar.addEventListener('click', guardarCambios); const cancelar=document.createElement('button'); cancelar.type='button'; cancelar.textContent='Cancelar'; cancelar.className='bg-red-500 hover:red-600 text-white px-4 py-2 rounded'; cancelar.addEventListener('click', ()=>location.reload()); form.appendChild(guardar); form.appendChild(cancelar);
  // Notificar a otros scripts que el documento está en modo edición (p. ej. para habilitar subida de PDF)
  try{ document.dispatchEvent(new CustomEvent('documento:editable')); }catch(e){}
}
function buildDocumentoPayload(orig){ 
    const o=orig?.Documento||{};
    
    let fechaEmision = toISODate(val('fechaEmision'));
    if (!fechaEmision) {
        // If form is empty, use original date, but ensure it's formatted correctly
        fechaEmision = toISODate(o.FechaEmision) || new Date().toISOString().slice(0,10);
    }

    let fechaOtorgamiento = toISODate(val('fechaOtorgamiento'));
    if (!fechaOtorgamiento && o.FechaOtorgamiento) {
        fechaOtorgamiento = toISODate(o.FechaOtorgamiento);
    }

  // Ensure Codigo* fields exist: prefer existing, otherwise generate from Nombre fields (4-3-2)
  const nombreEstadoVal = val('nombreEstado')||o.NombreEstado||'';
  const nombreMunicipioVal = val('nombreMunicipio')||o.NombreMunicipio||'';
  const nombreParroquiaVal = val('nombreParroquia')||o.NombreParroquia||'';
  // Always derive Codigo* from the Nombre* fields (do not prefer existing Codigo fields)
  // Codigo* fields will hold the full names (Nombre*), not abbreviations
  const codigoEstadoCalc = nombreEstadoVal || '00';
  const codigoMunicipioCalc = nombreMunicipioVal || '000';
  const codigoParroquiaCalc = nombreParroquiaVal || '00';

  return { 
    TipoDocumentoID: Number(val('tipoDocumentoID'))||o.TipoDocumentoID||1, 
    OficinaRegistroID: o.OficinaRegistroID||null, 
    OficinaRegistroTexto: val('oficinaRegistroNombre')||o.OficinaRegistroTexto||'', 
    FechaEmision: fechaEmision, 
    FechaOtorgamiento: fechaOtorgamiento, 
    TipoDocumentoOtro: val('tipoDocumentoOtro')||o.TipoDocumentoOtro||'', 
    DatosAsiento: val('datosAsiento')||o.DatosAsiento||'', 
    CondicionesEspeciales: val('condiciones')||o.CondicionesEspeciales||'', 
    Observaciones: val('observaciones')||o.Observaciones||'', 
    ValorContrato: val('monto')? Number(val('monto')): (o.ValorContrato??null), 
    MonedaContrato: val('monedaContrato')||o.MonedaContrato||null, 
    PlazoVigencia: val('plazoVigencia')||o.PlazoVigencia||null, 
    CodigoEstado: codigoEstadoCalc, 
    CodigoMunicipio: codigoMunicipioCalc, 
    CodigoParroquia: codigoParroquiaCalc, 
    NombreEstado: nombreEstadoVal, 
    NombreMunicipio: nombreMunicipioVal, 
    NombreParroquia: nombreParroquiaVal 
  }; 
}
function buildBienPayload(orig) {
  const o = orig?.Bien || {};
  const docId = new URLSearchParams(location.search).get('id') * 1;

    const rawTipoBienID = val('tipoBienID') || '';

  // Validar que no sea vacío ni NaN
  if (!rawTipoBienID || isNaN(parseInt(rawTipoBienID, 10))) {
    alert('Por favor selecciona un Tipo de Bien válido.');
    throw new Error('El campo "Tipo de Bien" es requerido y debe ser seleccionado.');
  }

  let tipoBienID = parseInt(rawTipoBienID, 10);

  return {
    DocumentoID: docId,
    TipoBienID: tipoBienID,
    Descripcion: val('descripcion') || o.Descripcion || '',
    Caracteristicas: o.Caracteristicas || null,
    Ubicacion: val('ubicacion') || o.Ubicacion || '',
    MetrosFrenteTexto: val('metrosFrente') || o.MetrosFrenteTexto || null,
    MetrosFondoTexto: val('metrosFondo') || o.MetrosFondoTexto || null,
    MetrosTerreno: o.MetrosTerreno || null,
    MetrosConstruccion: val('metrosConstruccion') || o.MetrosConstruccion || null,
    LinderoNorte: val('linderoNorte') || o.LinderoNorte || '',
    LinderoSur: val('linderoSur') || o.LinderoSur || '',
    LinderoEste: val('linderoEste') || o.LinderoEste || '',
    LinderoOeste: val('linderoOeste') || o.LinderoOeste || '',
    Marca: val('marca') || o.Marca || '',
    Modelo: val('modelo') || o.Modelo || '',
    Serial: val('serial') || o.Serial || '',
    Placa: val('placa') || o.Placa || ''
  };
}
// --- Bienes UI helpers ---
function createBienGroup(bienData, index){
  const div = document.createElement('div');
  div.className = 'border p-3 rounded bg-gray-50';
  div.dataset.index = index;
    const id = bienData?.BienID || bienData?.bienid || ''; // Ensure id is correctly assigned
  // helper to read multiple casing/key variants from the bien object
  const get = (...keys) => {
    for(const k of keys){
      if(bienData && (bienData[k] !== undefined && bienData[k] !== null)) return bienData[k];
      const lower = k.toLowerCase(); if(bienData && (bienData[lower] !== undefined && bienData[lower] !== null)) return bienData[lower];
    }
    return '';
  };
  const descripcion = String(get('Descripcion','descripcion') || ''); // Correctly formatted
  const ubicacion = String(get('Ubicacion','ubicacion') || ''); // Correctly formatted
  // normalize tipo bien value to a number if present
  const tipoFromData = (bienData && (bienData.TipoBienID || bienData.tipobienid || bienData.tipoBienID || (bienData.Bien && (bienData.Bien.TipoBienID || bienData.Bien.tipobienid)))) ? Number(bienData.TipoBienID||bienData.tipobienid||bienData.tipoBienID|| (bienData.Bien && (bienData.Bien.TipoBienID||bienData.Bien.tipobienid))) : null;
  const tipoBienVal = (get('TipoBienID','tipobienid','tipoBienID') || '') || (tipoFromData !== null ? String(tipoFromData) : '');
  // vehicle fields
  const marcaVal = String(get('Marca','marca') || '');
  const modeloVal = String(get('Modelo','modelo') || '');
  const serialVal = String(get('Serial','serial') || '');
  const placaVal = String(get('Placa','placa') || '');
  // Debug logs for each created bien group
  try{ console.log(`[createBienGroup] index=${index} bienData ->`, JSON.parse(JSON.stringify(bienData||null))); }catch(e){ console.log('[createBienGroup] bienData ->', bienData); }
  // If no TipoBienID provided but there are vehicle fields, infer Vehículo (2)
  if((!tipoBienVal || String(tipoBienVal).trim()==='') && (marcaVal || modeloVal || serialVal || placaVal)){
    console.log(`[createBienGroup] index=${index} - inferring TipoBienID=2 because vehicle fields present (marca/modelo/serial/placa)`);
    // set the local variable so the created group shows vehicle fields
    try{ tipoBienVal = '2'; }catch(e){}
  }
  // build tipo options (try to read catalog from global, otherwise default)
  // Read tipos de bien from the loaded document payload (multiple possible keys)
  let tiposCatalog = (window.__documentoFull && (window.__documentoFull.TiposBien || window.__documentoFull.__tiposBien || window.__documentoFull.tiposBien)) || [];
  // Normalize to objects with { id, name }
  const tiposNormalized = (Array.isArray(tiposCatalog) ? tiposCatalog : []).map(t => ({ id: Number(t.TipoBienID ?? t.tipoBienID ?? t.id ?? t.value ?? NaN), name: String(t.Nombre ?? t.nombre ?? t.Name ?? (t && (t.label||t.text)) ?? '').trim() })).filter(x=>!isNaN(x.id));
  // If no tipos found, provide defaults but also attempt a runtime fetch as fallback
  const defaultTipos = [{ id: 1, name: 'Inmueble' }, { id: 2, name: 'Vehiculo' }];
  const tipoOptionsHtml = (tiposNormalized.length ? tiposNormalized : defaultTipos).map(t=>`<option value="${t.id}">${t.name}</option>`).join('');
    const metrosTerreno = String(get('MetrosTerreno','metrosterreno','MetrosTerrenoTexto','metrosfrentetexto') || ''); // Correctly formatted
    const caracteristicasVal = String(get('Caracteristicas','caracteristicas') || '');
    const metrosConstruccion = String(get('MetrosConstruccion','metrosconstruccion') || ''); // Correctly formatted
    const linderoNorte = String(get('LinderoNorte','linderonorte') || ''); // Correctly formatted
    const linderoSur = String(get('LinderoSur','linderosur') || ''); // Correctly formatted
    const linderoEste = String(get('LinderoEste','linderoeste') || ''); // Correctly formatted
    const linderoOeste = String(get('LinderoOeste','linderooeste','linderooeste') || ''); // Correctly formatted
  // determine checked state for Activo (support boolean true or string 'true')
  const bdActivo = (bienData && (bienData.Activo !== undefined)) ? bienData.Activo : (bienData && bienData.activo !== undefined ? bienData.activo : null);
  const activoChecked = (bdActivo === true || String(bdActivo) === 'true') ? 'checked' : '';

  div.innerHTML = `
    <div class="flex justify-between items-center mb-2">
      <strong>Propiedad ${index+1}</strong>
      ${ id ? '<button type="button" class="remove-bien bg-gray-300 text-gray-700 px-2 py-1 rounded" disabled title="No se puede eliminar una propiedad ya registrada">Eliminar</button>' : '<button type="button" class="remove-bien bg-red-500 text-white px-2 py-1 rounded">Eliminar</button>' }
    </div>
    <div class="grid md:grid-cols-2 gap-2">
    <div><label class="block text-xs">Descripción</label><input name="bien_descripcion_${index}" value="${descripcion}" class="w-full border rounded px-2 py-1"/></div>
    <div><label class="block text-xs">Ubicación</label><input name="bien_ubicacion_${index}" value="${ubicacion}" class="w-full border rounded px-2 py-1"/></div>
  <div><label class="block text-xs">Tipo de Bien</label><select name="bien_tipo_${index}" class="w-full border rounded px-2 py-1">${"<option value=''>Seleccione...</option>" + tipoOptionsHtml}</select></div>
  <div class="md:col-span-2"><label class="block text-xs">Características</label><textarea name="bien_caracteristicas_${index}" class="w-full border rounded px-2 py-1 h-20">${caracteristicasVal}</textarea></div>
    <div><label class="block text-xs">Metros Terreno (frente)</label><input placeholder="Ej: 12.5 m o 12,5" name="bien_metros_frente_${index}" value="${metrosTerreno}" class="w-full border rounded px-2 py-1"/></div>
    <div><label class="block text-xs">Metros Terreno (fondo)</label><input placeholder="Ej: 20 m" name="bien_metros_fondo_${index}" value="${get('MetrosFondoTexto','metrosfondotexto','MetrosFondo')||''}" class="w-full border rounded px-2 py-1"/></div>
    <div><label class="block text-xs">Metros Construcción</label><input placeholder="Ej: 80 m² o N/A" name="bien_metros_construccion_${index}" value="${metrosConstruccion}" class="w-full border rounded px-2 py-1"/></div>
    <div class="flex items-center gap-2">
      <input type="checkbox" name="bien_activo_${index}" id="bien_activo_${index}" ${activoChecked} class="h-4 w-4" />
      <label for="bien_activo_${index}" class="block text-xs">Activo</label>
    </div>
      <div><label class="block text-xs">Lindero Norte</label><input name="bien_lindero_norte_${index}" value="${linderoNorte}" class="w-full border rounded px-2 py-1"/></div>
      <div><label class="block text-xs">Lindero Sur</label><input name="bien_lindero_sur_${index}" value="${linderoSur}" class="w-full border rounded px-2 py-1"/></div>
      <div><label class="block text-xs">Lindero Este</label><input name="bien_lindero_este_${index}" value="${linderoEste}" class="w-full border rounded px-2 py-1"/></div>
      <div><label class="block text-xs">Lindero Oeste</label><input name="bien_lindero_oeste_${index}" value="${linderoOeste}" class="w-full border rounded px-2 py-1"/></div>
    </div>
    <div class="mt-2 bien-vehiculo-fields" style="display:${(tipoBienVal==2 || tipoBienVal==='2')? 'block':'none'}">
      <div class="grid md:grid-cols-2 gap-2">
        <div><label class="block text-xs">Marca</label><input name="bien_marca_${index}" value="${marcaVal}" class="w-full border rounded px-2 py-1"/></div>
        <div><label class="block text-xs">Modelo</label><input name="bien_modelo_${index}" value="${modeloVal}" class="w-full border rounded px-2 py-1"/></div>
        <div><label class="block text-xs">Serial</label><input name="bien_serial_${index}" value="${serialVal}" class="w-full border rounded px-2 py-1"/></div>
        <div><label class="block text-xs">Placa</label><input name="bien_placa_${index}" value="${placaVal}" class="w-full border rounded px-2 py-1"/></div>
      </div>
    </div>
    <input type="hidden" name="bien_id_${index}" value="${id}" />
  <div class="text-xs text-gray-500 debug-bien" style="margin-top:6px;">Tipo detectado: <span class="debug-tipo">${tipoBienVal||''}</span> · Tipos disponibles: <span class="debug-count">${(tiposNormalized.length||defaultTipos.length)}</span></div>
  `;
  // remove handler: only allow removal for newly created (no id) groups
  const removeBtn = div.querySelector('.remove-bien');
  if(removeBtn){
    removeBtn.addEventListener('click', ()=>{
      if(id){
        // existing bien - disable remove and show warning
        removeBtn.disabled = true; removeBtn.title = 'No se puede eliminar una propiedad ya registrada desde aquí';
        return;
      }
      div.remove();
    });
  }
  // wire tipo de bien selector to show/hide vehiculo fields
  // after inserting HTML, wire tipo selector
  const tipoSel = div.querySelector(`[name="bien_tipo_${index}"]`);
  if(tipoSel){
    // set selected if we had a value
    try{
      if(tipoBienVal){
        // prefer selecting by numeric id
        const want = String(tipoBienVal);
        // if option exists use it
        const opt = tipoSel.querySelector(`option[value="${want}"]`);
        if(opt){ tipoSel.value = want; }
        else {
          // try matching by name: find option whose text includes the expected name from catalog
          const foundByName = Array.from(tipoSel.options).find(o => {
            const text = String(o.text||'').toLowerCase();
            const wantName = (tiposNormalized.find(x=>String(x.id)===String(tipoBienVal))||{}).name || '';
            return wantName && text.includes(String(wantName).toLowerCase());
          });
          if(foundByName) tipoSel.value = foundByName.value;
        }
      }
    }catch(e){ console.warn('[createBienGroup] failed to set tipoSel.value', e); }
    try{ console.log(`[createBienGroup] index=${index} tipoBienVal detected=`, tipoBienVal, 'tiposCatalog=', tiposNormalized); }catch(e){ console.log('[createBienGroup] tipoBienVal=', tipoBienVal, 'tiposCatalog=', tiposNormalized); }
    // If the select has no options (empty catalog), attempt to fetch /tipos-bien now and populate
    if(tipoSel.options.length <= 1 && (!tiposNormalized || tiposNormalized.length===0)){
      (async function(){
        try{
          const bases=['']; if(!window.location.origin.includes('3000')) bases.push('http://localhost:3000');
          let lastErr;
          for(const b of bases){
            try{
              const resp = await fetch(b + '/tipos-bien');
              if(!resp.ok) throw new Error('HTTP '+resp.status);
              const data = await resp.json();
              const normalized = (Array.isArray(data)?data:[]).map(t=>({ id: Number(t.TipoBienID ?? t.tipoBienID ?? t.id ?? t.value ?? NaN), name: String(t.Nombre ?? t.nombre ?? t.Name ?? (t && (t.label||t.text)) ?? '').trim() })).filter(x=>!isNaN(x.id));
              const optsHtml = (normalized.length ? normalized : defaultTipos).map(t=>`<option value="${t.id}">${t.name}</option>`).join('');
              tipoSel.innerHTML = "<option value=''>Seleccione...</option>" + optsHtml;
              // try set value again
              if(tipoBienVal){ const opt2 = tipoSel.querySelector(`option[value="${String(tipoBienVal)}"]`); if(opt2) tipoSel.value = String(tipoBienVal); }
              // update debug UI
              const dbg = div.querySelector('.debug-bien .debug-count'); if(dbg) dbg.textContent = (normalized.length||defaultTipos.length);
              return;
            }catch(e){ lastErr = e; }
          }
          console.warn('[createBienGroup] fallback fetch /tipos-bien failed', lastErr);
        }catch(e){ console.error('[createBienGroup] error fetching tipos-bien fallback', e); }
      })();
    }
    // toggle vehicle fields based on numeric value
    tipoSel.addEventListener('change', ()=>{
      const veh = div.querySelector('.bien-vehiculo-fields');
      if(!veh) return;
      const valNum = Number(tipoSel.value);
      if(!isNaN(valNum) && valNum === 2){
        veh.style.display = 'block';
      } else {
        veh.style.display = 'none';
      }
    });
  }
  return div;
}

function renderBienes(bienes){
  const container = document.getElementById('bienes-container'); if(!container) return;
  console.log('[renderBienes] bienes recibidos:', bienes);
  container.innerHTML = '';
  (bienes || []).forEach((b,i)=> container.appendChild(createBienGroup(b,i)));
}

// Expose render function so poblar.js can call it after loading data
try{ window.renderBienes = renderBienes; }catch(e){}

document.addEventListener('DOMContentLoaded', ()=>{
  // wire add bien button
  const btn = document.getElementById('agregar-bien');
  btn?.addEventListener('click', ()=>{
    const container = document.getElementById('bienes-container'); if(!container) return;
    const idx = container.children.length;
    container.appendChild(createBienGroup({}, idx));
  });
});

// Helper to collect bienes from UI before save; returns array of objects
function collectBienesFromUI(){
  const container = document.getElementById('bienes-container'); if(!container) return [];
  const bienes = [];
  Array.from(container.children).forEach((div, idx)=>{
  const get = (name)=>{ const el = div.querySelector(`[name="${name}_${idx}"]`); return el ? el.value : null };
    const id = (div.querySelector(`[name="bien_id_${idx}"]`)||{}).value || null;
      const tipoRaw = get('bien_tipo') || get('tipoBien') || '';
      let tipo = (typeof tipoRaw === 'string' && tipoRaw.trim()!=='') ? Number(tipoRaw) : null;
      // Fallback: if no TipoBienID selected but vehicle fields are filled, infer TipoBienID = 2
      const marca = get('bien_marca') || '';
      const modelo = get('bien_modelo') || '';
      const serial = get('bien_serial') || '';
      const placa = get('bien_placa') || '';
      if((!tipo || !Number.isFinite(tipo)) && (marca || modelo || serial || placa)){
        console.log(`[collectBienesFromUI] index=${idx} - inferring TipoBienID=2 because vehicle fields present`);
        tipo = 2;
      }
  const activoEl = div.querySelector(`[name="bien_activo_${idx}"]`);
  const activoVal = activoEl ? (!!activoEl.checked) : false;
    bienes.push({
      BienID: id || null,
      DocumentoID: new URLSearchParams(location.search).get('id')*1,
  TipoBienID: Number.isFinite(tipo) ? tipo : null,
  Descripcion: get('bien_descripcion') || null,
  Caracteristicas: get('bien_caracteristicas') || null,
  Activo: activoVal,
      Ubicacion: get('bien_ubicacion') || null,
  MetrosTerreno: get('bien_metros_frente') || null,
  MetrosFondoTexto: get('bien_metros_fondo') || null,
  MetrosConstruccion: get('bien_metros_construccion') || null,
      LinderoNorte: get('bien_lindero_norte') || null,
      LinderoSur: get('bien_lindero_sur') || null,
      LinderoEste: get('bien_lindero_este') || null,
      LinderoOeste: get('bien_lindero_oeste') || null,
      Marca: get('bien_marca') || null,
      Modelo: get('bien_modelo') || null,
      Serial: get('bien_serial') || null,
      Placa: get('bien_placa') || null,
    });
  });
  return bienes;
}
async function guardarCambios(){
	try{ 
		const id=new URLSearchParams(location.search).get('id'); if(!id) throw new Error('Sin id');
  let docPayload= buildDocumentoPayload(window.__documentoFull);

  // Safety: if buildDocumentoPayload didn't include Codigo* (e.g. old script cached), ensure they're present
  try{
    const nombreEstado = docPayload.NombreEstado || (window.__documentoFull && window.__documentoFull.Documento && window.__documentoFull.Documento.NombreEstado) || '';
    const nombreMunicipio = docPayload.NombreMunicipio || (window.__documentoFull && window.__documentoFull.Documento && window.__documentoFull.Documento.NombreMunicipio) || '';
    const nombreParroquia = docPayload.NombreParroquia || (window.__documentoFull && window.__documentoFull.Documento && window.__documentoFull.Documento.NombreParroquia) || '';
  if(!docPayload.CodigoEstado) docPayload.CodigoEstado = nombreEstado || '00';
  if(!docPayload.CodigoMunicipio) docPayload.CodigoMunicipio = nombreMunicipio || '000';
  if(!docPayload.CodigoParroquia) docPayload.CodigoParroquia = nombreParroquia || '00';
  }catch(e){ /* ignore */ }

  // Si el documento no tiene Codigo, generarlo ahora usando Estado/Municipio/Parroquia
  const origDoc = window.__documentoFull && window.__documentoFull.Documento ? window.__documentoFull.Documento : {};
  if (!origDoc.Codigo || String(origDoc.Codigo||'').trim()===''){
  const generated = await generateDocumentCode(docPayload.NombreEstado || origDoc.NombreEstado, docPayload.NombreMunicipio || origDoc.NombreMunicipio, docPayload.NombreParroquia || origDoc.NombreParroquia);
  // Poner en el payload para guardarlo en /documentos/:id
  // generated contains abbreviation-based Codigo for the document ID (generated.codigo)
  // but CodigoEstado/CodigoMunicipio/CodigoParroquia deben ser los nombres completos
  docPayload = Object.assign({}, docPayload, { Codigo: generated.codigo, CodigoEstado: docPayload.NombreEstado || origDoc.NombreEstado || '', CodigoMunicipio: docPayload.NombreMunicipio || origDoc.NombreMunicipio || '', CodigoParroquia: docPayload.NombreParroquia || origDoc.NombreParroquia || '' });
    // Actualizar UI para mostrar el nuevo código
    const inputCodigo = document.querySelector('[name="codigo"]'); if(inputCodigo) inputCodigo.value = generated.codigo;
  }
    // Force derive Codigo* from Nombre* to ensure we never send stale CodigoEstado/CodigoMunicipio/CodigoParroquia
    try{
      const nE = docPayload.NombreEstado || (origDoc && origDoc.NombreEstado) || '';
      const nM = docPayload.NombreMunicipio || (origDoc && origDoc.NombreMunicipio) || '';
      const nP = docPayload.NombreParroquia || (origDoc && origDoc.NombreParroquia) || '';
      docPayload.CodigoEstado = abbr(nE,4) || '00';
      docPayload.CodigoMunicipio = abbr(nM,3) || '000';
      docPayload.CodigoParroquia = abbr(nP,2) || '00';
    }catch(e){ }
    // Log payload for debugging missing Codigo* fields
    console.log('[guardarCambios] docPayload ->', JSON.parse(JSON.stringify(docPayload)));
    // Usamos un array de promesas para todas las actualizaciones
    const updates = [jsonFetch(`/documentos/${id}`, 'PUT', docPayload)];
		
		const full=window.__documentoFull||{};
		
    // Actualizar partes (solo si existen en full)
    const partes=full.Partes||[];
    const mapUI=[
      {tipo:'Otorgante', nombre:'otorganteNombre', id:'otorganteId'},
      {tipo:'Receptor', nombre:'receptorNombre', id:'receptorId'},
      {tipo:'AbogadoOtorgante', nombre:'abogadoOtorganteNombre', id:'abogadoOtorganteId'},
      {tipo:'AbogadoReceptor', nombre:'abogadoReceptorNombre', id:'abogadoReceptorId'},
    ];
    for(const m of mapUI){
      const p=partes.find(x=> (x.TipoParte||x.tipoparte)===m.tipo);
      const nuevoNombre=val(m.nombre);
      const nuevoIdRaw=val(m.id);
      // Buscar prefijo asociado si existe (ej: otorganteId -> otorgantePrefijo)
      const prefField = m.id.replace(/Id$/,'Prefijo');
      const prefVal = val(prefField);
      // Normalizar: extraer sólo dígitos del número
      const idOnly = nuevoIdRaw ? String(nuevoIdRaw).replace(/\D/g,'').trim() : '';
      const prefOnly = prefVal ? String(prefVal).trim().toUpperCase() : '';
      // Construir la representación combinada para comparar con lo almacenado
      const combinedForCompare = prefOnly ? (idOnly ? `${prefOnly}-${idOnly}` : '') : (idOnly || null);
      if(p){
        // actualizar existente si hubo cambios
        if(nuevoNombre!==p.NombreParte || (combinedForCompare||null)!=(p.DatosIdentificacion||null)){
          updates.push(jsonFetch(`/partes/${p.ParteID||p.parteid}`,'PUT',{
            DocumentoID: id*1,
            TipoParte: p.TipoParte||p.tipoparte,
            NombreParte: nuevoNombre,
            Prefijo: prefOnly || undefined,
            DatosIdentificacion: idOnly || null
          }));
        }
      } else {
        // crear nueva parte si se ingresó nombre o identificación
        if((nuevoNombre && nuevoNombre.trim()!=='') || (idOnly && String(idOnly).trim()!=='')){
          updates.push(jsonFetch('/partes','POST',{
            DocumentoID: id*1,
            TipoParte: m.tipo,
            NombreParte: nuevoNombre,
            Prefijo: prefOnly || undefined,
            DatosIdentificacion: idOnly || null,
          }));
        }
      }
    }

    // --- GUARDAR REVISIÓN ---
    const rev = full.Revision || {};
    const revisionNombre = val('revisionNombre');
    const revisionFecha = val('revisionFecha');
    const revisionCedulaRaw = val('revisionCedula');
    const revisionPrefijo = val('revisionPrefijo');
    const revisionCedula = revisionCedulaRaw ? String(revisionCedulaRaw).replace(/\D/g,'').trim() : '';
    const revisionPref = revisionPrefijo ? String(revisionPrefijo).trim().toUpperCase() : '';
  const combinedRevisionCedula = revisionPref ? (revisionCedula ? `${revisionPref}-${revisionCedula}` : null) : (revisionCedula || null);
      if(revisionNombre || revisionCedula){
        // Determine existing revision id robustly (case-insensitive shapes)
        const revId = rev && (rev.RevisionID || rev.revisionid || rev.RevisionId || rev.id);
        const payloadRev = {
          DocumentoID: id*1,
          ResponsableNombre: revisionNombre,
          FechaRevision: revisionFecha,
          ResponsablePrefijo: revisionPref || null,
          ResponsableCedula: combinedRevisionCedula || null,
        };
        console.log('[guardarCambios] payloadRev ->', JSON.parse(JSON.stringify(payloadRev)), 'revId=', revId);
        if(revId){
          updates.push(jsonFetch(`/revisiones/${revId}`,'PUT', payloadRev));
        } else {
          updates.push(jsonFetch('/revisiones','POST', payloadRev));
        }
    }

    // --- GUARDAR DIGITALIZACIÓN ---
    const dig = full.Digitalizacion || {};
    const digitalCodigo = val('digitalCodigo');
    const digitalUbicacion = val('digitalUbicacion');
    const digitalNombre = val('digitalNombre');
    const digitalFecha = val('digitalFecha');
    const digitalIdentificacionRaw = val('digitalIdentificacion');
    const digitalPrefijo = val('digitalPrefijo');
    const digitalIdentificacion = digitalIdentificacionRaw ? String(digitalIdentificacionRaw).replace(/\D/g,'').trim() : '';
    const digitalPref = digitalPrefijo ? String(digitalPrefijo).trim().toUpperCase() : '';
  const combinedDigitalIdent = digitalPref ? (digitalIdentificacion ? `${digitalPref}-${digitalIdentificacion}` : null) : (digitalIdentificacion || null);
      if(digitalNombre || digitalIdentificacion){
        // Determine existing digitalizacion id robustly
        const digId = dig && (dig.DigitalizacionID || dig.digitalizacionid || dig.DigitalizacionId || dig.id);
        const payloadDig = {
          DocumentoID: id*1,
          Codigo: digitalCodigo,
          UbicacionFisica: digitalUbicacion,
          ResponsableNombre: digitalNombre,
          FechaDigitalizacion: digitalFecha,
          ResponsablePrefijo: digitalPref || null,
              ResponsableIdentificacion: combinedDigitalIdent || null,
              PalabraClave: val('digitalPalabraClave') || (dig && (dig.PalabraClave || dig.palabraclave)) || null,
        };
        console.log('[guardarCambios] payloadDig ->', JSON.parse(JSON.stringify(payloadDig)), 'digId=', digId);
        if(digId){
          updates.push(jsonFetch(`/digitalizaciones/${digId}`,'PUT', payloadDig));
        } else {
          updates.push(jsonFetch('/digitalizaciones','POST', payloadDig));
        }
    }

      // --- GUARDAR BIENES ---
      try{
        const bienesToSave = collectBienesFromUI();
        for(const b of bienesToSave){
          // prepare payload and remove any BienID key (case-insensitive)
          const payload = Object.assign({}, b);
          for(const k of Object.keys(payload)){
            if(/^bienid$/i.test(k)) delete payload[k];
          }
          // ensure numeric TipoBienID
          payload.TipoBienID = Number(payload.TipoBienID);
          if(!Number.isFinite(payload.TipoBienID) || payload.TipoBienID <= 0){
            alert('Por favor selecciona el Tipo de Bien (Inmueble o Vehículo) para cada propiedad antes de guardar.');
            return; // cancel guardarCambios
          }
          if(b.BienID){
            // PUT uses URL id; send cleaned payload
            updates.push(jsonFetch(`/bienes/${b.BienID}`,'PUT', payload));
          } else {
            updates.push(jsonFetch('/bienes','POST', payload));
          }
        }
      }catch(e){ /* ignore UI collection errors */ }



		await Promise.all(updates);
		alert('Guardado');
  } catch(e){
    console.error('guardarCambios error:', e);
    if(e && (e.status || e.body)){
      alert('Error al guardar: '+ (e.body || e.message || JSON.stringify(e)));
    } else {
      alert('Error: '+(e && e.message? e.message : String(e)));
    }
  } 
}
export { guardarCambios };

// Also expose on window for non-module inline handlers (backwards compatible)
try{
  if(typeof window !== 'undefined'){
    window.guardarCambios = guardarCambios;
    // alias
    window.guardarBienes = guardarCambios;
    // deleteDocumento will be attached below when defined
  }
}catch(e){ /* ignore */ }

// Delete documento helper: confirm -> DELETE /documentos/:id -> redirect
async function deleteDocumento(){
  try{
    const id = new URLSearchParams(location.search).get('id');
    if(!id) { alert('ID de documento no encontrado.'); return; }
    if(!confirm('¿Confirma que desea eliminar este documento y todos sus registros asociados? Esta acción no se puede deshacer.')) return;
    // call API
    await jsonFetch(`/documentos/${id}`,'DELETE');
    alert('Documento eliminado. Serás redirigido a la lista.');
    // Redirect to documentos table
    window.location.href = './tablaDocumentos.html';
  }catch(e){
    console.error('deleteDocumento error', e);
    alert('Error al intentar eliminar: ' + (e && (e.body||e.message) ? (e.body||e.message) : String(e)));
  }
}
try{ if(typeof window !== 'undefined') window.deleteDocumento = deleteDocumento; }catch(e){}

// Inicializar prefijos al cargar la página y cuando se active el modo edición
document.addEventListener('DOMContentLoaded', populatePartesPrefijos);
document.addEventListener('documento:editable', populatePartesPrefijos);