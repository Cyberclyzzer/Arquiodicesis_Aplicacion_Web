// Punto central para manejar edición y guardado de un documento y entidades relacionadas.
// Requiere que previamente se haya cargado window.__documentoFull mediante cargarDocumento(id)

const API_BASE = ''; // relativo al mismo host

function q(sel){return document.querySelector(sel);} // helper
function val(name){return (q(`[name="${name}"]`)||{}).value?.trim?.()||'';}

// Normalizar texto y obtener abreviaciones (4-3-2)
function normalizeName(s){ if(!s) return ''; try{ return s.normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/[^A-Za-z0-9 ]/g,' ').trim(); }catch(e){ return String(s).replace(/[^A-Za-z0-9 ]/g,' ').trim(); } }
function abbr(s,n){
    // tomar los primeros n caracteres del nombre normalizado (sin espacios)
    const norm = normalizeName(s).replace(/\s+/g,' ').replace(/ /g,'');
    const t = String(norm).slice(0,n).padEnd(n,'X').toUpperCase();
    return t;
}

function generateDocumentCodeSync(nombreEstado, nombreMunicipio, nombreParroquia){
    const codEstado = abbr(nombreEstado||'',4);
    const codMun = abbr(nombreMunicipio||'',3);
    const codPar = abbr(nombreParroquia||'',2);
    const today = new Date(); const y = String(today.getFullYear()); const m = String(today.getMonth()+1).padStart(2,'0'); const d = String(today.getDate()).padStart(2,'0'); const rnd = Math.floor(Math.random()*10000).toString().padStart(4,'0');
    const prefix = `${codEstado}${codMun}${codPar}`;
    return { codigo: `${prefix}-${y}${m}${d}-${rnd}`, CodigoEstado: nombreEstado||'', CodigoMunicipio: nombreMunicipio||'', CodigoParroquia: nombreParroquia||'' };
}

function toISODate(str){
    if(!str) return null;
    const d = new Date(str);
    if(isNaN(d)) return null;
    return d.toISOString().slice(0,10);
}

async function jsonFetch(url, method, body){
    const res = await fetch(url, {method, headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)});
    let payload; const ct = res.headers.get('Content-Type')||'';
    if(ct.includes('application/json')) payload = await res.json(); else payload = await res.text();
    if(!res.ok) throw new Error(typeof payload==='string'?payload:(payload.error||`Error ${res.status}`));
    return payload;
}

function buildDocumentoPayload(original){
    // Usar los códigos existentes si no hay inputs en la vista
    const o = original?.Documento || {};
    // calcular Nombre* y Codigo* preferidos
    const nombreEstadoVal = val('nombreEstado') || o.NombreEstado || '';
    const nombreMunicipioVal = val('nombreMunicipio') || o.NombreMunicipio || '';
    const nombreParroquiaVal = val('nombreParroquia') || o.NombreParroquia || '';
    // Codigo* deben contener los nombres completos
    const codigoEstadoCalc = nombreEstadoVal || '00';
    const codigoMunicipioCalc = nombreMunicipioVal || '000';
    const codigoParroquiaCalc = nombreParroquiaVal || '00';

    return {
        TipoDocumentoID: Number(val('tipoDocumentoID'))||o.TipoDocumentoID||1,
        OficinaRegistroID: o.OficinaRegistroID || null, // No hay input explícito (se usa Texto)
        OficinaRegistroTexto: val('oficinaRegistroNombre')||o.OficinaRegistroTexto||'',
        FechaEmision: toISODate(val('fechaEmision')) || o.FechaEmision || new Date().toISOString().slice(0,10),
        FechaOtorgamiento: toISODate(val('fechaOtorgamiento')) || null,
        TipoDocumentoOtro: val('tipoDocumentoOtro') || o.TipoDocumentoOtro || '',
        DatosAsiento: val('datosAsiento') || o.DatosAsiento || '',
        CondicionesEspeciales: val('condiciones') || o.CondicionesEspeciales || '',
        Observaciones: val('observaciones') || o.Observaciones || '',
        ValorContrato: val('monto')? Number(val('monto')): (o.ValorContrato ?? null),
    MonedaContrato: val('monedaContrato') || o.MonedaContrato || null,
        PlazoVigencia: val('plazoVigencia') || o.PlazoVigencia || null,
    Codigo: o.Codigo || null,
    CodigoEstado: codigoEstadoCalc,
    CodigoMunicipio: codigoMunicipioCalc,
    CodigoParroquia: codigoParroquiaCalc,
    NombreEstado: nombreEstadoVal,
    NombreMunicipio: nombreMunicipioVal,
    NombreParroquia: nombreParroquiaVal
    };
}

function pickParteByTipo(tipo){
    const partes = window.__documentoFull?.Partes||[];
    return partes.find(p=> (p.TipoParte||p.tipoparte)===tipo) || null;
}

function buildPartesPayloads(documentoID){
    const roles = [
        {tipo:'Otorgante', nombre: val('otorganteNombre'), id: val('otorganteId')},
        {tipo:'Receptor', nombre: val('receptorNombre'), id: val('receptorId')},
        {tipo:'AbogadoOtorgante', nombre: val('abogadoOtorganteNombre'), id: val('abogadoOtorganteId')},
        {tipo:'AbogadoReceptor', nombre: val('abogadoReceptorNombre'), id: val('abogadoReceptorId')},
    ];
    return roles.filter(r=>r.nombre||r.id).map(r=>({
        existing: pickParteByTipo(r.tipo),
        payload:{DocumentoID: documentoID, TipoParte:r.tipo, NombreParte:r.nombre||'Sin nombre', DatosIdentificacion: r.id||'S/D'}
    }));
}

function buildBienPayload(documentoID){
    if(!val('tipoBienID') && !window.__documentoFull?.Bien) return null; // nada que guardar
    const bOrig = window.__documentoFull?.Bien || {};
    return {
        existing: bOrig,
        payload: {
            DocumentoID: documentoID,
            TipoBienID: Number(val('tipoBienID')) || bOrig.TipoBienID || 1,
            Descripcion: val('descripcion') || bOrig.Descripcion || '',
            Caracteristicas: bOrig.Caracteristicas || null, // sin campo separado
            Ubicacion: val('ubicacion') || bOrig.Ubicacion || '',
            MetrosFrenteTexto: val('metrosFrente') || bOrig.MetrosFrenteTexto || null,
            MetrosFondoTexto: val('metrosFondo') || bOrig.MetrosFondoTexto || null,
            MetrosTerreno: bOrig.MetrosTerreno || null,
            MetrosConstruccion: val('metrosConstruccion') || bOrig.MetrosConstruccion || null,
            LinderoNorte: val('linderoNorte') || bOrig.LinderoNorte || '',
            LinderoSur: val('linderoSur') || bOrig.LinderoSur || '',
            LinderoEste: val('linderoEste') || bOrig.LinderoEste || '',
            LinderoOeste: val('linderoOeste') || bOrig.LinderoOeste || '',
            Marca: val('marca') || bOrig.Marca || '',
            Modelo: val('modelo') || bOrig.Modelo || '',
            Serial: val('serial') || bOrig.Serial || '',
            Placa: val('placa') || bOrig.Placa || ''
        }
    };
}

function buildRevisionPayload(documentoID){
    const rOrig = window.__documentoFull?.Revision || {};
    if(!val('revisionFecha') && !rOrig.RevisionID) return null;
    return {
        existing: rOrig,
        payload: {
            DocumentoID: documentoID,
            FechaRevision: toISODate(val('revisionFecha')) || rOrig.FechaRevision || new Date().toISOString().slice(0,10),
            ResponsableNombre: val('revisionNombre') || rOrig.ResponsableNombre || '',
            ResponsableCedula: val('revisionCedula') || rOrig.ResponsableCedula || ''
        }
    };
}

function buildDigitalizacionPayload(documentoID){
    const gOrig = window.__documentoFull?.Digitalizacion || {};
    if(!val('digitalFecha') && !gOrig.DigitalizacionID) return null;
    return {
        existing: gOrig,
        payload: {
            DocumentoID: documentoID,
            FechaDigitalizacion: toISODate(val('digitalFecha')) || gOrig.FechaDigitalizacion || new Date().toISOString().slice(0,10),
            ResponsableNombre: val('digitalNombre') || gOrig.ResponsableNombre || '',
            ResponsableIdentificacion: val('digitalIdentificacion') || gOrig.ResponsableIdentificacion || '',
            UbicacionFisica: val('digitalUbicacion') || gOrig.UbicacionFisica || '',
            Codigo: val('digitalCodigo') || gOrig.Codigo || ''
        }
    };
}

async function guardarCambios(e){
    e?.preventDefault?.();
    const btn = e?.currentTarget;
    if(btn){ btn.disabled = true; btn.textContent='Guardando...'; }
    try {
        const id = new URLSearchParams(location.search).get('id');
        if(!id) throw new Error('No hay id de documento en la URL');
        // 1) Documento
        let docPayload = buildDocumentoPayload(window.__documentoFull);
        // si no tiene Codigo, generar uno sincrónico (fallback)
        if(!docPayload.Codigo){
            const gen = generateDocumentCodeSync(docPayload.NombreEstado||'', docPayload.NombreMunicipio||'', docPayload.NombreParroquia||'');
            // Mantener Codigo (documento) generado por abbr+seq, pero CodigoEstado/CodigoMunicipio/CodigoParroquia deben ser nombres completos
            docPayload = Object.assign({}, docPayload, { Codigo: gen.codigo, NombreEstado: docPayload.NombreEstado||'', NombreMunicipio: docPayload.NombreMunicipio||'', NombreParroquia: docPayload.NombreParroquia||'' });
            const inputCodigo = document.querySelector('[name="codigo"]'); if(inputCodigo) inputCodigo.value = gen.codigo;
        }
        // Asegurar que Codigo* sean derivados de Nombre* justo antes del envio
        try{
            const nE = docPayload.NombreEstado || (window.__documentoFull && window.__documentoFull.Documento && window.__documentoFull.Documento.NombreEstado) || '';
            const nM = docPayload.NombreMunicipio || (window.__documentoFull && window.__documentoFull.Documento && window.__documentoFull.Documento.NombreMunicipio) || '';
            const nP = docPayload.NombreParroquia || (window.__documentoFull && window.__documentoFull.Documento && window.__documentoFull.Documento.NombreParroquia) || '';
            docPayload.nombreEstado = abbr(nE,4) || '00';
            docPayload.nombreMunicipio = abbr(nM,3) || '000';
            docPayload.nombreParroquia = abbr(nP,2) || '00';
        }catch(e){}
        console.log('[guardarCambios][legacy] docPayload ->', JSON.parse(JSON.stringify(docPayload)));
        await jsonFetch(`${API_BASE}/documentos/${id}`, 'PUT', docPayload);
        const documentoID = Number(id);
        // 2) Partes
        for(const parte of buildPartesPayloads(documentoID)){
            if(parte.existing?.ParteID){
                await jsonFetch(`${API_BASE}/partes/${parte.existing.ParteID}`, 'PUT', parte.payload);
            } else {
                await jsonFetch(`${API_BASE}/partes`, 'POST', parte.payload);
            }
        }
        // 3) Bien
        const bien = buildBienPayload(documentoID);
        if(bien){
            if(bien.existing?.BienID){
                await jsonFetch(`${API_BASE}/bienes/${bien.existing.BienID}`, 'PUT', bien.payload);
            } else {
                await jsonFetch(`${API_BASE}/bienes`, 'POST', bien.payload);
            }
        }
        // 4) Revisión
        const rev = buildRevisionPayload(documentoID);
        if(rev){
            if(rev.existing?.RevisionID){
                await jsonFetch(`${API_BASE}/revisiones/${rev.existing.RevisionID}`, 'PUT', rev.payload);
            } else {
                await jsonFetch(`${API_BASE}/revisiones`, 'POST', rev.payload);
            }
        }
        // 5) Digitalización
        const dig = buildDigitalizacionPayload(documentoID);
        if(dig){
            if(dig.existing?.DigitalizacionID){
                await jsonFetch(`${API_BASE}/digitalizaciones/${dig.existing.DigitalizacionID}`, 'PUT', dig.payload);
            } else {
                await jsonFetch(`${API_BASE}/digitalizaciones`, 'POST', dig.payload);
            }
        }
        alert('Cambios guardados correctamente');
        // Refrescar datos en memoria
        try { const refreshed = await fetch(`/documentos/${id}/full`).then(r=>r.json()); window.__documentoFull = refreshed; } catch(_e){}
    } catch(err){
        console.error('Fallo guardando cambios', err);
        alert('Error guardando: '+ err.message);
    } finally {
        if(btn){ btn.disabled = false; btn.textContent='Guardar Cambios'; }
    }
}

export function editar(){
    const form = document.querySelector('form');
    if(!form) return;
    form.querySelectorAll('input, select, textarea').forEach(el=>{ el.removeAttribute('readonly'); el.disabled = false; });
    // Evitar duplicar botones
    if(form.querySelector('#btn-guardar-cambios')) return;
    const cont = form.querySelector('.acciones-form') || form;
    const guardar = document.createElement('button');
    guardar.type='button';
    guardar.id='btn-guardar-cambios';
    guardar.textContent='Guardar Cambios';
    guardar.className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mr-2';
    guardar.addEventListener('click', guardarCambios);
    const cancelar = document.createElement('button');
    cancelar.type='button';
    cancelar.textContent='Cancelar';
    cancelar.className='bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded';
    cancelar.addEventListener('click', ()=> location.reload());
    cont.appendChild(guardar);
    cont.appendChild(cancelar);
}

// Exponer guardarCambios si se quiere invocar desde otro script
export { guardarCambios };