// Adaptado buscar.js
export function buscarContenido(){
  const busqueda=document.getElementById('buscar-documento').value.toLowerCase();
  const tabla=document.querySelector('table'); if(!tabla) return;
  const filas=tabla.getElementsByTagName('tr');
  for(let i=1;i<filas.length;i++){
    const celdas=filas[i].getElementsByTagName('td'); let encontrado=false;
    for(let j=0;j<celdas.length;j++){
      celdas[j].classList.remove('highlight');
      const t=celdas[j].textContent.toLowerCase();
      if(t.includes(busqueda)){ encontrado=true; celdas[j].classList.add('highlight'); }
    }
    filas[i].style.display = encontrado? '' : 'none';
  }
  if(busqueda==='') limpiarHighlight(filas);
}
export function buscarFecha(){
  const fecha=document.getElementById('fecha-emision').value;
  const tabla=document.querySelector('table'); if(!tabla) return;
  const filas=tabla.getElementsByTagName('tr');
  for(let i=1;i<filas.length;i++){
    const celdas=filas[i].getElementsByTagName('td'); let ok=false;
    for(let j=0;j<celdas.length;j++){
      const t=celdas[j].textContent; if(fecha && t.includes(fecha)){ ok=true; celdas[j].classList.add('highlight'); break; }
    }
    filas[i].style.display = ok? '' : 'none';
  }
  if(!fecha) limpiarHighlight(filas);
}
export function buscarTipoDocumento(){
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
          const celdas=filas[i].getElementsByTagName('td'); Array.from(celdas).forEach(c=>c.classList.remove('highlight'));
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
function limpiarHighlight(filas){
  for(let i=1;i<filas.length;i++){
    const celdas=filas[i].getElementsByTagName('td'); for(let j=0;j<celdas.length;j++) celdas[j].classList.remove('highlight');
  }
}
