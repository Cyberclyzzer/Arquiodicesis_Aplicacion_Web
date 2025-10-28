// Version pública de cargarDocumentos.js (reutilizada desde frontEnd-scripts/tablaScripts)
// Encargada de cargar todos los documentos y poblar la tabla

async function fetchJson(url) { const r = await fetch(url); if(!r.ok) throw new Error(url+': '+r.status); return r.json(); }
// helper para tomar el primer valor definido entre varias claves posibles
const val = (obj, ...keys) => { for(const k of keys){ if(obj && obj[k] !== undefined && obj[k] !== null) return obj[k]; } return undefined; };
function mapNombre(lista, idField, nameField, id){
  const lowerId = idField.toLowerCase();
  const f = lista.find(x => val(x, idField, lowerId) === id);
  return f ? (val(f, nameField, nameField.toLowerCase()) || '') : '';
}
function errorRow(tbody,msg){ tbody.innerHTML = `<tr><td colspan="13" style="color:#b00; text-align:center;">${msg}</td></tr>`; }
function clearBody(tbody){ tbody.innerHTML=''; }
export async function loadTablaDocumentos(options={}) {
  const tbody = document.getElementById('tabla-body') || document.querySelector('table tbody');
  if(!tbody) return;
  tbody.innerHTML = '<tr><td colspan="13" style="text-align:center; font-size:14px; color:#555;">Cargando datos...</td></tr>';
  const bases = [];
  if (options.baseUrl) bases.push(options.baseUrl.replace(/\/$/, ''));
  bases.push('');
  if (!window.location.origin.includes('3000')) bases.push('http://localhost:3000');
  let loaded = false, lastErr, docs=[], partes=[], bienes=[], tiposDoc=[], tiposBien=[];
  for(const base of bases){
    if(loaded) break;
    try {
      const results = await Promise.all([
        fetchJson(base+'/documentos'),
        fetchJson(base+'/partes'),
        fetchJson(base+'/bienes'),
        fetchJson(base+'/tipos-documento'),
        fetchJson(base+'/tipos-bien'),
      ]);
      [docs, partes, bienes, tiposDoc, tiposBien] = results;
      console.log('[TablaDocumentos] Base usada:', base || '(mismo origen)');
      console.log('[TablaDocumentos] docs:', docs);
      console.log('[TablaDocumentos] partes:', partes);
      console.log('[TablaDocumentos] bienes:', bienes);
      console.log('[TablaDocumentos] tiposDoc:', tiposDoc);
      console.log('[TablaDocumentos] tiposBien:', tiposBien);
      loaded = true;
    } catch(err){ lastErr = err; }
  }
  if(!loaded){ errorRow(tbody,'No se pudo conectar con la API'); console.error('[TablaDocumentos] Error:', lastErr); return; }
  clearBody(tbody);
  if(docs.length===0){ tbody.innerHTML='<tr><td colspan="13" style="text-align:center; color:#666;">No hay documentos registrados</td></tr>'; return; }
  docs.forEach(doc => {
    const docId = val(doc,'DocumentoID','documentoid');
    const tipoDocumentoID = val(doc,'TipoDocumentoID','tipodocumentoid');
    const fechaEmision = val(doc,'FechaEmision','fechaemision');
    const plazoVigencia = val(doc,'PlazoVigencia','plazovigencia');
    const oficinaTexto = val(doc,'OficinaRegistroTexto','oficinaregistrotexto');
    const fechaOtorg = val(doc,'FechaOtorgamiento','fechaotorgamiento');
    const codigo = val(doc,'Codigo','codigo');
    const partesDoc = partes.filter(p=> val(p,'DocumentoID','documentoid') === docId);
    const getParte = (tipo) => partesDoc.find(p => val(p,'TipoParte','tipoparte') === tipo);
    const otorgante = getParte('Otorgante');
    const receptor  = getParte('Receptor');
    const abogadoO  = partesDoc.find(p => ['AbogadoOtorgante','Abogado'].includes(val(p,'TipoParte','tipoparte')));
    const abogadoR  = partesDoc.find(p => ['AbogadoReceptor'].includes(val(p,'TipoParte','tipoparte')));
    const bien = bienes.find(b=> val(b,'DocumentoID','documentoid') === docId);
    const tipoBienID = bien ? val(bien,'TipoBienID','tipobienid') : undefined;
    const tipoBienNombre = tipoBienID ? mapNombre(tiposBien,'TipoBienID','Nombre',tipoBienID) : '';
    let tipoDocNombre = mapNombre(tiposDoc,'TipoDocumentoID','Nombre',tipoDocumentoID) || codigo || '';
    const tipoDocOtro = val(doc,'TipoDocumentoOtro','tipodocumentootro');
    if (tipoDocOtro && tipoDocOtro.trim() !== '') {
      tipoDocNombre = tipoDocOtro.trim();
    }
    const fmtDate = (d)=> typeof d === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d) ? d.slice(0,10) : (d||'');
    const tr = document.createElement('tr');
    tr.setAttribute('data-id', docId);
    tr.innerHTML = `
      <td>${tipoDocNombre}</td>
      <td>${val(otorgante||{},'NombreParte','nombreparte')||''}</td>
      <td>${val(otorgante||{},'DatosIdentificacion','datosidentificacion')||''}</td>
      <td>${val(receptor||{},'NombreParte','nombreparte')||''}</td>
      <td>${val(receptor||{},'DatosIdentificacion','datosidentificacion')||''}</td>
      <td>${[val(abogadoO||{},'NombreParte','nombreparte'), val(abogadoR||{},'NombreParte','nombreparte')].filter(Boolean).join(' / ')}</td>
      <td>${[val(abogadoO||{},'DatosIdentificacion','datosidentificacion'), val(abogadoR||{},'DatosIdentificacion','datosidentificacion')].filter(Boolean).join(' / ')}</td>
      <td>${tipoBienNombre}</td>
      <td>${fmtDate(fechaEmision)}</td>
      <td>${plazoVigencia||''}</td>
      <td>${oficinaTexto||''}</td>
      <td>${fmtDate(fechaOtorg)}</td>
      <td></td>`;
    tbody.appendChild(tr);
  });
}

// Re-export explícito (algunos servidores de assets podrían necesitar referencia al final)
export { loadTablaDocumentos as default, loadTablaDocumentos };
