// Modulo principal para la tabla de documentos: carga + filtros
// Import nombrado simple (evita depender de default export en entorno público)
import { loadTablaDocumentos } from './cargarDocumentos.js';

function limpiarHighlight(filas){
  for(let i=1;i<filas.length;i++){
    const celdas=filas[i].getElementsByTagName('td');
    for(let j=0;j<celdas.length;j++) celdas[j].classList.remove('highlight');
  }
}
function buscarContenido(){
  const busqueda = document.getElementById('buscar-documento').value.toLowerCase();
  const tabla = document.querySelector('table'); if(!tabla) return;
  const filas = tabla.getElementsByTagName('tr');
  for(let i=1;i<filas.length;i++){
    const celdas=filas[i].getElementsByTagName('td');
    let ok=false;
    for(let j=0;j<celdas.length;j++){
      celdas[j].classList.remove('highlight');
      const t=celdas[j].textContent.toLowerCase();
      if(t.includes(busqueda)){ ok=true; celdas[j].classList.add('highlight'); }
    }
    filas[i].style.display = ok?'' : 'none';
  }
  if(busqueda==='') limpiarHighlight(filas);
}
function buscarFecha(){
  const fecha = document.getElementById('fecha-emision').value;
  const tabla = document.querySelector('table'); if(!tabla) return;
  const filas = tabla.getElementsByTagName('tr');
  for(let i=1;i<filas.length;i++){
    const celdas=filas[i].getElementsByTagName('td');
    let ok=false;
    for(let j=0;j<celdas.length;j++){
      const t=celdas[j].textContent;
      if(fecha && t.includes(fecha)){ ok=true; celdas[j].classList.add('highlight'); break; }
    }
    filas[i].style.display = ok?'' : 'none';
  }
  if(!fecha) limpiarHighlight(filas);
}
function buscarTipoDocumento(){
  const valorPorDefecto='tipo de documento';
  const tabla=document.querySelector('table'); if(!tabla) return;
  const filas=tabla.getElementsByTagName('tr');
  document.querySelectorAll('.dropdown').forEach(dropdown=>{
    const button=dropdown.querySelector('.dropdown-button');
    dropdown.querySelectorAll('.contenido-dropdown a').forEach(op=>{
      op.addEventListener('click',e=>{
        const tipo=e.target.textContent.trim().toLowerCase();
        button.textContent=e.target.textContent.trim();
        for(let i=1;i<filas.length;i++){
          const celdas=filas[i].getElementsByTagName('td');
          Array.from(celdas).forEach(c=>c.classList.remove('highlight'));
          if(tipo===valorPorDefecto){ filas[i].style.display=''; }
          else {
            const t=celdas[0].textContent.trim().toLowerCase();
            if(t.includes(tipo)){ filas[i].style.display=''; celdas[0].classList.add('highlight'); }
            else filas[i].style.display='none';
          }
        }
      });
    });
  });
}

async function init(){
  await loadTablaDocumentos();
  document.getElementById('buscar-documento')?.addEventListener('input', buscarContenido);
  document.getElementById('fecha-emision')?.addEventListener('change', buscarFecha);
  buscarTipoDocumento();
}

document.addEventListener('DOMContentLoaded', init);

// Exportar funciones por si se quieren invocar manualmente
export { buscarContenido, buscarFecha, buscarTipoDocumento, init };
