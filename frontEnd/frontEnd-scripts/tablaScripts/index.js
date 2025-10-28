import { loadTablaDocumentos } from './cargarDocumentos.js';

// (Opcional) si más adelante deseas reactivar filtros, re‑importa buscarContenido/buscarFecha.

async function initTabla() {
    await loadTablaDocumentos(); // espera llenado
    // Aquí podrías llamar a inicializarSeleccionDocumento() si lo necesitas.
}

document.addEventListener('DOMContentLoaded', initTabla);