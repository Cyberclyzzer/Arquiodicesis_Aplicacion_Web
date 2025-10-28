// Módulo para gestionar la carga/reemplazo de PDF desde la vista de visualización
function q(sel){return document.querySelector(sel);} 
function el(html){ const d=document.createElement('div'); d.innerHTML=html.trim(); return d.firstChild; }

// Subida con intentos a origen local si es necesario
async function uploadFile(formData, method='POST', url='/archivos'){
  const bases=['']; if(!window.location.origin.includes('3000')) bases.push('http://localhost:3000');
  let lastErr;
  for(const b of bases){
    try{
      const res = await fetch(b+url, { method, body: formData });
      if(!res.ok) throw new Error(await res.text());
      return await res.json();
    }catch(e){ lastErr=e; }
  }
  throw lastErr || new Error('Fallo al subir archivo');
}

export function initPdfControls(documentoFull){
  const container = document.getElementById('pdf-controls');
  if(!container) return;
  container.innerHTML = '';

  let existingArchivo = (documentoFull?.Archivos||[])[0];
  const inputFile = el('<input type="file" accept="application/pdf" style="display:none" id="pdf-file-input" />');
  const controls = el('<div id="pdf-controls-row" class="flex items-center gap-3"></div>');
  const btnAction = el('<button type="button" id="btn-action-pdf" class="w-full md:w-auto px-4 py-2 rounded-lg shadow bg-blue-600 hover:bg-blue-700 text-white font-medium">Seleccionar PDF</button>');
  const btnView = el('<button type="button" id="btn-view-pdf" class="hidden md:inline-flex items-center px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-blue-600 hover:bg-gray-100 text-sm">Ver PDF</button>');
  const msg = el('<div id="pdf-msg" class="text-red-600 text-sm mt-1 hidden"></div>');

  controls.appendChild(btnAction);
  controls.appendChild(btnView);
  container.appendChild(inputFile);
  container.appendChild(controls);
  container.appendChild(msg);

  btnView.addEventListener('click', () => {
    const pdfUrl = btnView.dataset.href;
    if (pdfUrl) {
      const baseUrl = window.location.origin.includes('3000') ? '' : 'http://localhost:3000';
      window.open(baseUrl + pdfUrl, '_blank');
    }
  });

  if(existingArchivo){
    btnAction.textContent = 'Reemplazar PDF';
    try{
      const ruta = existingArchivo.RutaArchivo || existingArchivo.rutaarchivo || existingArchivo.Ruta || '';
      const rutaWeb = ruta.startsWith('/') ? ruta.replace(/\\/g,'/') : ('/' + ruta.replace(/\\/g,'/'));
      btnView.dataset.href = rutaWeb; btnView.classList.remove('hidden');
    }catch(e){}
  }

  // Inicialmente deshabilitados: no permitir selección hasta que se entre en modo edición
  btnAction.disabled = true;
  inputFile.disabled = true;
  btnAction.addEventListener('click', ()=> inputFile.click());

  // Habilitar controles cuando se activa el modo edición
  document.addEventListener('documento:editable', ()=>{
    btnAction.disabled = false; inputFile.disabled = false; btnAction.classList.remove('opacity-50');
    if(existingArchivo) btnView.disabled = false;
  });

  const MAX_BYTES = 12 * 1024 * 1024; // 12MB
  function showError(text){ msg.style.display='block'; msg.textContent = text; msg.classList.remove('hidden'); }
  function clearError(){ msg.style.display='none'; msg.textContent = ''; msg.classList.add('hidden'); }

  inputFile.addEventListener('change', async ()=>{
    clearError();
    const f = inputFile.files && inputFile.files[0];
    if(!f) return;
    // Validaciones
    if(f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')){
      showError('El archivo debe ser un PDF.');
      inputFile.value = '';
      return;
    }
    if(f.size > MAX_BYTES){
      showError('El archivo es demasiado grande. Límite '+(MAX_BYTES/1024/1024)+' MB.');
      inputFile.value = '';
      return;
    }

    // Auto-subir (POST si no existe, PUT si existe)
    const formData = new FormData();
    const docId = new URLSearchParams(location.search).get('id');
    formData.append('file', f, f.name);
    formData.append('DocumentoID', docId);
    formData.append('TipoArchivo', f.type || 'application/pdf');
    try{
      btnAction.disabled = true; const prevText = btnAction.textContent; btnAction.textContent = 'Subiendo...';
      const method = existingArchivo ? 'PUT' : 'POST';
      const url = existingArchivo ? ('/archivos/' + (existingArchivo.ArchivoID || existingArchivo.archivoid)) : '/archivos';
      const res = await uploadFile(formData, method, url);
      // actualizar campo ruta_pdf con la ruta retornada por el servidor
      const rutaInput = q('[name="ruta_pdf"]');
      if(rutaInput && res.RutaArchivo){
        const rutaWeb = res.RutaArchivo.startsWith('/') ? res.RutaArchivo.replace(/\\/g,'/') : ('/' + res.RutaArchivo.replace(/\\/g,'/'));
        rutaInput.value = rutaWeb;
        // activar/ver botón Ver PDF
  btnView.dataset.href = rutaWeb; btnView.classList.remove('hidden');
  // also store on input.dataset for other scripts
  rutaInput.dataset.ruta = rutaWeb;
      }
      existingArchivo = res;
      btnAction.textContent = 'Reemplazar PDF';
      alert('PDF subido correctamente');
    }catch(e){ showError('Error al subir: '+(e.message||e)); }
    finally{ btnAction.disabled = false; }
  });

    // If other scripts (poblar.js) notify that an archivo is available before init,
    // listen to the custom event and update the view button accordingly.
    document.addEventListener('documento:archivoDisponible', (ev)=>{
      try{
        const ruta = ev?.detail?.ruta;
        if(ruta){ btnView.dataset.href = ruta; btnView.classList.remove('hidden'); }
      }catch(e){}
    });
}

export default { initPdfControls };
