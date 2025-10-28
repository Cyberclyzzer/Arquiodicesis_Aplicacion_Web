// Adaptado desde frontEnd-scripts/tablaScripts/cargarDocumentos.js para entorno público
async function fetchJson(url){ const r= await fetch(url); if(!r.ok) throw new Error(url+': '+r.status); return r.json(); }
const val=(obj,...keys)=>{ for(const k of keys){ if(obj && obj[k] !== undefined && obj[k] !== null) return obj[k]; } return undefined; };
function mapNombre(lista,idField,nameField,id){ const lowerId=idField.toLowerCase(); const f=lista.find(x=> val(x,idField,lowerId)===id); return f ? (val(f,nameField,nameField.toLowerCase())||'') : ''; }
function errorRow(tbody,msg){ tbody.innerHTML=`<tr><td colspan="15" style="color:#b00; text-align:center;">${msg}</td></tr>`; }
function clearBody(tb){ tb.innerHTML=''; }
export async function loadTablaDocumentos(options={}){
  const tbody=document.getElementById('tabla-body')|| document.querySelector('table tbody'); if(!tbody) return;
  tbody.innerHTML='<tr><td colspan="14" style="text-align:center; font-size:14px; color:#555;">Cargando datos...</td></tr>';
  const bases=[]; if(options.baseUrl) bases.push(options.baseUrl.replace(/\/$/,'')); bases.push(''); if(!window.location.origin.includes('3000')) bases.push('http://localhost:3000');
  let loaded=false,lastErr,docs=[],partes=[],bienes=[],tiposDoc=[],tiposBien=[],digitalizaciones=[];
  for(const base of bases){ if(loaded) break; try{ const res= await Promise.all([
      fetchJson(base+'/documentos'), fetchJson(base+'/partes'), fetchJson(base+'/bienes'), fetchJson(base+'/tipos-documento'), fetchJson(base+'/tipos-bien'), fetchJson(base+'/digitalizaciones')
    ]); [docs,partes,bienes,tiposDoc,tiposBien,digitalizaciones]=res; loaded=true; console.log('[TablaDocumentos] Base usada:', base||'(mismo origen)'); }catch(e){ lastErr=e; }}
  if(!loaded){ errorRow(tbody,'No se pudo conectar con la API'); console.error(lastErr); return; }
  clearBody(tbody); if(docs.length===0){ tbody.innerHTML='<tr><td colspan="15" style="text-align:center; color:#666;">No hay documentos registrados</td></tr>'; return; }
  docs.forEach(doc=>{
    const docId=val(doc,'DocumentoID','documentoid'); const tipoDocumentoID=val(doc,'TipoDocumentoID','tipodocumentoid');
    const fechaEmision=val(doc,'FechaEmision','fechaemision'); const plazoVigencia=val(doc,'PlazoVigencia','plazovigencia');
    const oficinaTexto=val(doc,'OficinaRegistroTexto','oficinaregistrotexto'); const fechaOtorg=val(doc,'FechaOtorgamiento','fechaotorgamiento');
    const codigo=val(doc,'Codigo','codigo'); const partesDoc=partes.filter(p=> val(p,'DocumentoID','documentoid')===docId);
    const getParte=(tipo)=> partesDoc.find(p=> val(p,'TipoParte','tipoparte')===tipo);
    const otorgante=getParte('Otorgante'); const receptor=getParte('Receptor');
    const abogadoO=partesDoc.find(p=> ['AbogadoOtorgante','Abogado'].includes(val(p,'TipoParte','tipoparte')));
    const abogadoR=partesDoc.find(p=> ['AbogadoReceptor'].includes(val(p,'TipoParte','tipoparte')));
  // Determine document-level property state: if any bien linked to this documento is active, consider Propiedad = true
  const bienesDoc = bienes.filter(b => val(b,'DocumentoID','documentoid')===docId);
  const anyActivo = bienesDoc.some(b => { const a = val(b,'Activo','activo'); return a===true || a==='true' || a===1 || a==='1'; });
  const tipoBien = bienesDoc.length>0 ? bienesDoc[0] : null;
  const tipoBienID = tipoBien ? val(tipoBien,'TipoBienID','tipobienid') : undefined;
  const tipoBienNombre= tipoBienID? mapNombre(tiposBien,'TipoBienID','Nombre',tipoBienID):'';
  // Find digitalizacion for this document (to show Codigo and PalabraClave)
  const dig = digitalizaciones.find(d => val(d,'DocumentoID','documentoid')===docId) || null;
  let tipoDocNombre= mapNombre(tiposDoc,'TipoDocumentoID','Nombre',tipoDocumentoID) || codigo || '';
  const tipoDocOtro=val(doc,'TipoDocumentoOtro','tipodocumentootro'); if(tipoDocOtro && tipoDocOtro.trim()!=='') tipoDocNombre=tipoDocOtro.trim();
    const fmtDate=d=> typeof d==='string' && /^\d{4}-\d{2}-\d{2}/.test(d)? d.slice(0,10):(d||'');
  const tr=document.createElement('tr'); tr.setAttribute('data-id',docId);
  // PalabraClave for this document (from digitalizacion)
  const palabra = (dig && (val(dig,'PalabraClave','palabraclave') || val(dig,'PalabrasClave','palabrasclave'))) || '';
  const propiedadTexto = anyActivo ? 'Si' : 'No';
  tr.innerHTML=`<td>${tipoDocNombre}</td>
      <td>${(dig && (dig.Codigo||dig.codigo)) || ''}</td>
      <td>${codigo||''}</td>
      <td>${palabra}</td>
      <td>${val(otorgante||{},'NombreParte','nombreparte')||''}</td>
      <td>${[val(abogadoO||{},'NombreParte','nombreparte'),val(abogadoR||{},'NombreParte','nombreparte')].filter(Boolean).join(' / ')}</td>
      <td>${tipoBienNombre}</td>
      <td>${propiedadTexto}</td>
      <td>${fmtDate(fechaEmision)}</td>
      <td>${plazoVigencia||''}</td>
      <td>${oficinaTexto||''}</td>
      <td>${fmtDate(fechaOtorg)}</td>`;
    tbody.appendChild(tr);
  });
}
