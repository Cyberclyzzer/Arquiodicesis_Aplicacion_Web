// Lógica para detectar selección de documento en la tabla y redirigir a visualización
// Requisitos asumidos:
// 1. Cada fila <tr> (excepto encabezado) representa un documento.
// 2. Debe existir (o se agregará) un atributo data-id con DocumentoID en la fila; si no, se intentará inferirlo.
// 3. La página de visualización se encuentra en /frontEnd/react-app/public/views/visualizacionDocumento.html (ajusta si ruta diferente al servir).

function obtenerRutaVisualizacion(id) {
	// Ajusta esta ruta si tu servidor expone los archivos estáticos en otra ubicación.
	return `/frontEnd/react-app/public/views/visualizacionDocumento.html?id=${encodeURIComponent(id)}`;
}

function extraerIdDesdeFila(tr) {
	// Preferir data-id
	const dataId = tr.getAttribute('data-id');
	if (dataId) return dataId;
	// Fallback: si la primera celda contiene un código con patrón PREFIJO-### lo usamos
	const primera = tr.querySelector('td');
	if (primera) {
		const texto = primera.textContent.trim();
		const m = texto.match(/[A-ZÁÉÍÓÚÑ]{4,10}-\d{3,}/i);
		if (m) return m[0];
	}
	return null;
}

export function inicializarSeleccionDocumento() {
	const tabla = document.querySelector('table');
	if (!tabla) return;
	const filas = tabla.querySelectorAll('tbody tr');
	filas.forEach(fila => {
		fila.style.cursor = 'pointer';
		fila.addEventListener('click', () => {
			const id = extraerIdDesdeFila(fila);
			if (!id) {
				console.warn('No se pudo determinar el ID del documento para la fila seleccionada');
				return;
			}
			window.location.href = obtenerRutaVisualizacion(id);
		});
	});
}

// Auto-inicializar si se carga directamente este script
document.addEventListener('DOMContentLoaded', () => {
	inicializarSeleccionDocumento();
});
