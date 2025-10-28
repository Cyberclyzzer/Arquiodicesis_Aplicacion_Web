import { segmentos } from './segmentacionDocumento.js';
import { cargarDocumento, obtenerIdDeQuery } from './cargarDocumento.js';
import { editar, guardarCambios } from './habilitarEdicion.js';

document.addEventListener('DOMContentLoaded', () => {
    segmentos();
    const id = obtenerIdDeQuery();
    if (id) {
        cargarDocumento(id).catch(err => console.error('Error cargando documento', err));
    } else {
        console.warn('No se encontró parámetro ?id= en la URL para cargar el documento');
    }
    // Activar edición solo cuando el usuario lo solicite
    const editLink = document.getElementById('editar-documento');
    if (editLink) {
        editLink.addEventListener('click', (e) => {
            e.preventDefault();
            editar();
            // Ocultar el enlace para evitar múltiples inicios
            editLink.classList.add('hidden');
        });
    }
    // Exponer utilidades para pruebas manuales en consola
    window.editarDocumento = editar;
    window.guardarCambiosDocumento = guardarCambios;
});