// Versión pública de cargarDocumento.js
import { poblarCampos, actualizarTitulo } from './poblar.js';

async function fetchJsonWithFallback(path){
  const bases=[''];
  if(!window.location.origin.includes('3000')) bases.push('http://localhost:3000');
  let lastErr; for(const b of bases){
    try{ const r=await fetch(b+path); if(!r.ok) throw new Error('HTTP '+r.status); return await r.json(); }catch(e){ lastErr=e; }
  }
  throw lastErr || new Error('No se pudo obtener '+path);
}

export function obtenerIdDeQuery(){ return new URLSearchParams(location.search).get('id'); }

export async function cargarDocumento(id){
  setCargando(true);
  try {
    const full = await fetchJsonWithFallback(`/documentos/${id}/full`);
    let tiposBien=[]; 
    try{ 
      tiposBien = await fetchJsonWithFallback('/tipos-bien'); 
      console.log('[Visualizacion] Respuesta de /tipos-bien:', tiposBien);
    }catch(e){ 
      console.error('[Visualizacion] Error al obtener /tipos-bien:', e);
    }
    full.__tiposBien = tiposBien;
    window.__documentoFull = full;
    poblarCampos(full);
    actualizarTitulo(full);
  } catch(e){
    console.error('Fallo al cargar documento', e);
    mostrarError('No se pudo cargar el documento');
  } finally { setCargando(false); }
}

function setCargando(c){
  let badge=document.getElementById('estado-carga');
  if(!badge){ badge=document.createElement('span'); badge.id='estado-carga'; badge.style.marginLeft='1rem'; document.querySelector('header h1')?.appendChild(badge); }
  badge.textContent = c ? 'Cargando…' : '';
}

function mostrarError(msg){
  let box=document.getElementById('mensaje-error');
  if(!box){ box=document.createElement('div'); box.id='mensaje-error'; box.className='bg-red-100 text-red-700 px-3 py-2 rounded mb-4'; document.querySelector('.max-w-6xl')?.prepend(box); }
  box.textContent=msg;
}
