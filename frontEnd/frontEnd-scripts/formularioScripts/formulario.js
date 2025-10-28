// Terminar el jueves
// export class Formulario {
//     constructor() {
//         this.form = document.querySelector('form');
//         this.data = [];
//     }

//     //recibimos los datos del formulario y los almacenamos en el array this.data
//     recibirDatos() {
//         document.getElementById('boton-enviar').addEventListener('click', (event) => {
//             const formData = new FormData(this.form);
//             this.data.push(Object.fromEntries(formData.entries()));
//             console.log(this.data);

//                 // const fields = [
//                 //     'TipoDocumentoID', 'OficinaRegistroID', 'FechaEmision', 'FechaOtorgamiento',
//                 //     'DatosAsiento', 'CondicionesEspeciales', 'Observaciones', 'ValorContrato',
//                 //     'PlazoVigencia', 'CodigoEstado', 'CodigoMunicipio', 'CodigoParroquia',
//                 //     'NombreEstado', 'NombreMunicipio', 'NombreParroquia'
//                 // ];
//         });
//     }

//     enviarDatos() {
//         this.recibirDatos();

//         fetch('/api/documentos', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(this.data)
//         })
//         .then(response => response.json())
//         .then(data => {
//             console.log('Éxito:', data);
//         })
//         .catch(error => {
//             console.error('Error:', error);
//         });
//     }
// }

// Registrar manejador de envío al cargar la página
export function cargarFormulario() {
  const form = document.querySelector('form');
  if (form) {
    preloadCatalogs();
    form.addEventListener('submit', onSubmit);
  }
}

// Base del backend (ajusta el puerto si cambias PORT)
const API_BASE = 'http://localhost:3000';

async function postJSON(url, data) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const contentType = res.headers.get('Content-Type') || '';
  let body;
  if (contentType.includes('application/json')) {
    body = await res.json();
  } else {
    body = await res.text();
  }
  if (!res.ok) {
    console.error('Error POST', url, res.status, body);
    throw new Error(typeof body === 'string' ? body : (body.error || 'Error desconocido'));
  }
  return body;
}

async function preloadCatalogs() {
  try {
    // Tipos de documento -> dropdown anchors
  const tipos = await fetch(`${API_BASE}/tipos-documento`).then(r => r.json());
    const tdCont = document.querySelector('.tipo-documento .contenido-dropdown');
    const tdHidden = document.getElementById('tipo-de-documento');
    const tdButton = document.querySelector('.tipo-documento .dropdown-button');
    if (tdCont && tdHidden && tdButton) {
      tdCont.innerHTML = '';
      tipos.forEach(t => {
    const id = t.tipodocumentoid || t.TipoDocumentoID || t.tipodocumento_id || t.id;
    const nombre = t.nombre || t.Nombre || t.nombre_tipo || 'Sin nombre';
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = nombre;
        a.dataset.id = id;
        a.addEventListener('click', (e) => {
          e.preventDefault();
          tdHidden.value = String(id);
          tdButton.textContent = nombre;
        });
        tdCont.appendChild(a);
      });
    }

    // Oficinas de registro -> dropdown anchors
  const oficinas = await fetch(`${API_BASE}/oficinas-registro`).then(r => r.json());
    const ofCont = document.querySelector('.oficina-registro .contenido-dropdown');
    const ofHidden = document.getElementById('oficina-de-registro');
    const ofButton = document.querySelector('.oficina-registro .dropdown-button');
    if (ofCont && ofHidden && ofButton) {
      ofCont.innerHTML = '';
      oficinas.forEach(o => {
    const id = o.oficinaregistroid || o.OficinaRegistroID || o.oficinaregistro_id || o.id;
    const nombre = o.nombre || o.Nombre || 'Sin nombre';
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = nombre;
        a.dataset.id = id;
        a.addEventListener('click', (e) => {
          e.preventDefault();
          ofHidden.value = String(id);
          ofButton.textContent = nombre;
        });
        ofCont.appendChild(a);
      });
    }

    // Tipos de bien -> dropdown anchors
  const tiposBien = await fetch(`${API_BASE}/tipos-bien`).then(r => r.json());
    const tbCont = document.querySelector('.tipo-bien .contenido-dropdown');
    const tbHidden = document.getElementById('tipo-bien');
    const tbButton = document.querySelector('.tipo-bien .dropdown-button');
    if (tbCont && tbHidden && tbButton) {
      tbCont.innerHTML = '';
      tiposBien.forEach(tb => {
    const id = tb.tipobienid || tb.TipoBienID || tb.tipobien_id || tb.id;
    const nombre = tb.nombre || tb.Nombre || 'Sin nombre';
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = nombre;
        a.dataset.id = id;
        a.addEventListener('click', (e) => {
          e.preventDefault();
          tbHidden.value = String(id);
          tbButton.textContent = nombre;
        });
        tbCont.appendChild(a);
      });
    }
  } catch (err) {
    console.warn('Error cargando catálogos:', err);
  }
}

async function onSubmit(e) {
  e.preventDefault();
  const form = document.querySelector('form');
  const data = new FormData(form);

  try {
    // 1) Crear Documento primero (campos requeridos por backend)
    // Mapeamos nombres del formulario a EXACTOS campos del backend.
    const FechaOtorgamiento = data.get('fecha-otorgamiento') || null;
    const FechaEmision = data.get('fecha-emision') || FechaOtorgamiento || new Date().toISOString().slice(0, 10);

    // NOTA: Asegúrate de que los select tengan valores reales que existan en BD (seed crea IDs empezando en 1).
    const documentoPayload = {
      TipoDocumentoID: Number(data.get('tipo-de-documento')) || 1,
      OficinaRegistroID: Number(data.get('oficina-de-registro')) || 1,
      FechaEmision, // requerido
      FechaOtorgamiento, // opcional
      DatosAsiento: data.get('datos-asiento') || '',
      CondicionesEspeciales: data.get('condiciones-especiales') || '',
      Observaciones: data.get('observaciones') || '',
      ValorContrato: data.get('monto') ? Number(data.get('monto')) : null,
      PlazoVigencia: data.get('vencimiento') || null,
  CodigoEstado: data.get('estado') || '00',
  CodigoMunicipio: data.get('municipio') || '000',
  CodigoParroquia: data.get('parroquia') || '0000',
      NombreEstado: data.get('estado') || '',
      NombreMunicipio: data.get('municipio') || '',
      NombreParroquia: data.get('parroquia') || ''
    };

    // Generar Codigo con esquema 4-3-2
    function normalizeNameLocal(s){ return String(s||'').normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/[^A-Za-z0-9 ]/g,' ').trim(); }
    function abbrLocal(s,n){ return normalizeNameLocal(s).replace(/\s+/g,' ').split(' ').map(w=> (w[0]||'')).join('').slice(0,n).padEnd(n,'X').toUpperCase(); }
    const codEstado = abbrLocal(documentoPayload.NombreEstado,4);
    const codMun = abbrLocal(documentoPayload.NombreMunicipio,3);
    const codPar = abbrLocal(documentoPayload.NombreParroquia,2);
    const prefix = `${codEstado}${codMun}${codPar}`;
    try{
      const all = await fetch(`${API_BASE}/documentos`).then(r=>r.json());
      let max = 0; const re = new RegExp('^' + prefix.replace(/[-\\/\\^$*+?.()|[\]{}]/g,'\\$&') + '-(\\d+)$');
      if(Array.isArray(all)){
        all.forEach(d=>{ const c = d.Codigo||d.codigo||''; const m = c.match(re); if(m&&m[1]){ const n = parseInt(m[1],10); if(Number.isFinite(n) && n>max) max=n; }});
      }
      if(max>0){ documentoPayload.Codigo = `${prefix}-${String(max+1).padStart(4,'0')}`; }
      else { const today = new Date(); const y=String(today.getFullYear()); const mo=String(today.getMonth()+1).padStart(2,'0'); const d=String(today.getDate()).padStart(2,'0'); const rnd = Math.floor(Math.random()*10000).toString().padStart(4,'0'); documentoPayload.Codigo = `${prefix}-${y}${mo}${d}-${rnd}`; }
  // Enviar los nombres completos en Codigo* (según solicitud)
  documentoPayload.CodigoEstado = documentoPayload.NombreEstado || '';
  documentoPayload.CodigoMunicipio = documentoPayload.NombreMunicipio || '';
  documentoPayload.CodigoParroquia = documentoPayload.NombreParroquia || '';
    }catch(e){ const today = new Date(); const y=String(today.getFullYear()); const mo=String(today.getMonth()+1).padStart(2,'0'); const d=String(today.getDate()).padStart(2,'0'); const rnd = Math.floor(Math.random()*10000).toString().padStart(4,'0'); documentoPayload.Codigo = `${prefix}-${y}${mo}${d}-${rnd}`; documentoPayload.CodigoEstado = codEstado; documentoPayload.CodigoMunicipio = codMun; documentoPayload.CodigoParroquia = codPar; }

  console.log('[formulario] documentoPayload ->', JSON.parse(JSON.stringify(documentoPayload)));
  const documento = await postJSON(`${API_BASE}/documentos`, documentoPayload);
    const documentoID = Number(
      documento.DocumentoID ?? documento.documentoid ?? documento.documento_id ?? documento.id
    );
    if (!documentoID || Number.isNaN(documentoID)) {
      throw new Error('No se pudo obtener DocumentoID del backend');
    }

    // 2) Crear Partes (Otorgante y Receptor). Tabla solo admite 'Otorgante' y 'Receptor'.
    await postJSON(`${API_BASE}/partes`, {
      DocumentoID: documentoID,
      TipoParte: 'Otorgante',
      NombreParte: data.get('nombre-del-otorgante') || 'Sin nombre',
      DatosIdentificacion: data.get('id-del-otorgante') || 'S/D'
    });
    await postJSON(`${API_BASE}/partes`, {
      DocumentoID: documentoID,
      TipoParte: 'Receptor',
      NombreParte: data.get('nombre-del-receptor') || 'Sin nombre',
      DatosIdentificacion: data.get('id-del-receptor') || 'S/D'
    });

    // 2.3) (Opcional) Abogado si viene
    const nombreAb = data.get('nombre-del-abogado');
    const idAb = data.get('id-del-abogado');
    if (nombreAb && idAb) {
      await postJSON(`${API_BASE}/partes`, {
        DocumentoID: documentoID,
        TipoParte: 'Abogado',
        NombreParte: nombreAb,
        DatosIdentificacion: idAb
      });
    }

    // 3) (Opcional) Crear Bien si hay selección de tipo de bien
  const tipoBienSel = data.get('tipo-bien');
    if (tipoBienSel) {
      await postJSON(`${API_BASE}/bienes`, {
        DocumentoID: documentoID,
        TipoBienID: Number(tipoBienSel),
        Caracteristicas: data.get('caracteristicas-del-inmueble') || '',
        Ubicacion: data.get('ubicacion-o-direccion') || '',
        MetrosTerreno: data.get('metros-terreno') ? Number(data.get('metros-terreno')) : null,
        MetrosConstruccion: data.get('metros-construccion') ? Number(data.get('metros-construccion')) : null,
        Linderos: data.get('lindero') || ''
      });
    }

    // 4) Registrar Revisión (si hay fecha)
    const fechaRevision = data.get('fecha-revision');
    if (fechaRevision) {
      await postJSON(`${API_BASE}/revisiones`, {
        DocumentoID: documentoID,
        FechaRevision: fechaRevision,
        ResponsableNombre: data.get('nombre-responsable-revision') || ''
      });
    }

    // 5) Registrar Digitalización (si hay fecha)
    const fechaDigitalizacion = data.get('fecha-digitalizacion');
    if (fechaDigitalizacion) {
      await postJSON(`${API_BASE}/digitalizaciones`, {
        DocumentoID: documentoID,
        FechaDigitalizacion: fechaDigitalizacion,
        ResponsableNombre: data.get('nombre-responsable-digitalizacion') || '',
        ResponsableIdentificacion: data.get('id-responsable-digitalizacion') || ''
      });
    }

    // 6) Subir archivo PDF (si hay)
    const file = data.get('file');
    if (file && file.size > 0) {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('DocumentoID', String(documentoID));
      // opcionales
      fd.append('TipoArchivo', 'application/pdf');
      fd.append('SubidoPor', data.get('nombre-responsable-digitalizacion') || '');

      const res = await fetch(`${API_BASE}/archivos`, {
        method: 'POST',
        body: fd
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Error subiendo archivo: ${t}`);
      }
    }

    alert('Documento registrado con éxito. ID: ' + documentoID);
    form.reset();
  } catch (err) {
    console.error(err);
    alert('Error al registrar: ' + err.message);
  }
}