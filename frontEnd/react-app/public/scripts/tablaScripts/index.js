// Punto de entrada tablaScripts público
import { loadTablaDocumentos } from './cargarDocumentos.js';
import { buscarContenido, buscarFecha, buscarTipoDocumento } from './buscar.js';

async function init(){
  await loadTablaDocumentos();
  attachRowHoverAndDblClick();
  document.getElementById('buscar-documento')?.addEventListener('input', buscarContenido);
  document.getElementById('fecha-emision')?.addEventListener('change', buscarFecha);
  buscarTipoDocumento();
}

window.TablaScriptsInit = init; // por si se quiere llamar manual

document.addEventListener('DOMContentLoaded', init);

// Función solicitada: resalta fila al pasar el mouse y abre detalle con doble click
export function attachRowHoverAndDblClick(){
  // Inyectar estilo una sola vez
  if(!document.getElementById('tabla-row-hover-style')){
    const style = document.createElement('style');
    style.id = 'tabla-row-hover-style';
    style.textContent = `table tbody tr.row-hover{background:#e3f3ff !important;} table tbody tr{transition:background-color .15s ease;}`;
    document.head.appendChild(style);
  }
  const rows = document.querySelectorAll('#tabla-body tr');
  rows.forEach(tr=>{
    // Evitar duplicar listeners
    if(tr.__hoverBound) return; // marca simple
    tr.__hoverBound = true;
    tr.addEventListener('mouseenter', ()=> tr.classList.add('row-hover'));
    tr.addEventListener('mouseleave', ()=> tr.classList.remove('row-hover'));
    tr.addEventListener('dblclick', ()=>{
      const id = tr.getAttribute('data-id');
      if(!id) return;
      // Navega a la página de visualización (misma carpeta)
      window.location.href = `./visualizacionDocumento.html?id=${encodeURIComponent(id)}`;
    });
    // Cursor indicativo de interactividad
    tr.style.cursor = 'pointer';
  });
}

// Re-export para uso manual si se carga después dinámicamente
export { attachRowHoverAndDblClick as enableRowNavigationHover };
