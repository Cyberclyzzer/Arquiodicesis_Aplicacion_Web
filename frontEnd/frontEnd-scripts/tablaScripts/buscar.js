//Funcion encargada de mostrar en el DOM unicamente los documementos donde al menos una de sus celdas contenga el texto buscado por el usuario
export function buscarContenido(){
    const busqueda = document.getElementById("buscar-documento").value.toLowerCase();
    const tabla = document.querySelector('table');
    const filas = tabla.getElementsByTagName('tr');

    for (let i = 1; i < filas.length; i++) {
        const celdas = filas[i].getElementsByTagName('td');
        let encontrado = false;
        for (let j = 0; j < celdas.length; j++) {
            celdas[j].classList.remove('highlight'); // Limpiar resaltados previos
            const textoCelda = celdas[j].textContent.toLowerCase();
            if (textoCelda.includes(busqueda)) {
                encontrado = true;
                celdas[j].classList.add('highlight');
            }
        }
        filas[i].style.display = encontrado ? '' : 'none';
    }

    if (busqueda === '') {
        // Limpiar resaltados previos
        limpiarHighlight(filas);
    }
}

// Funcion encargada de buscar documentos de la tabla por fecha
export function buscarFecha(){
    const fecha = document.getElementById("fecha-emision").value;
    const tabla = document.querySelector('table');
    const filas = tabla.getElementsByTagName('tr');

    for (let i = 1; i < filas.length; i++) {
        const celdas = filas[i].getElementsByTagName('td');
        let encontrado = false;
        for (let j = 0; j < celdas.length; j++) {
            const textoCelda = celdas[j].textContent;
            if (textoCelda.includes(fecha)) {
                encontrado = true;
                celdas[j].classList.add('highlight');
                break;
            }
        }
        filas[i].style.display = encontrado ? '' : 'none';
    }

    if (busqueda === '') {
        // Limpiar resaltados previos
        limpiarHighlight(filas);
    }
}

// Funcion encargada de buscar documentos de la tabla por tipo de documento
// Solo toma en consideracion el texto del boton del dropdown y la primera columna de la tabla
// Resalta las celdas que coincidan con el tipo seleccionado
// Asocia el filtrado por tipo de documento al hacer click en cada dropdown-button
export function buscarTipoDocumento() {
    const valorPorDefecto = 'tipo de documento'; // Ajustar según texto inicial del botón
    const tabla = document.querySelector('table');
    const filas = tabla.getElementsByTagName('tr');

    // Asociar filtrado al seleccionar una opción del dropdown
    document.querySelectorAll('.dropdown').forEach(dropdown => {
        const button = dropdown.querySelector('.dropdown-button');
        const opciones = dropdown.querySelectorAll('.contenido-dropdown a');
        opciones.forEach(opcion => {
            opcion.addEventListener('click', (event) => {
                const tipoSeleccionado = event.target.textContent.trim().toLowerCase();
                // Actualizar título del botón
                button.textContent = event.target.textContent.trim();
                // Aplicar filtro dinámico
                for (let i = 1; i < filas.length; i++) {
                    const celdas = filas[i].getElementsByTagName('td');
                    // Limpiar resaltados previos
                    Array.from(celdas).forEach(c => c.classList.remove('highlight'));
                    if (tipoSeleccionado === valorPorDefecto) {
                        filas[i].style.display = '';
                    } else {
                        const textoCelda = celdas[0].textContent.trim().toLowerCase();
                        if (textoCelda.includes(tipoSeleccionado)) {
                            filas[i].style.display = '';
                            celdas[0].classList.add('highlight');
                        } else {
                            filas[i].style.display = 'none';
                        }
                    }
                }
            });
        });
    });
}

function limpiarHighlight(filas) {
    for (let i = 1; i < filas.length; i++) {
        const celdas = filas[i].getElementsByTagName('td');
        for (let j = 0; j < celdas.length; j++) {
            celdas[j].classList.remove('highlight');
        }
    }
}

//   const input = document.getElementById("miInput");
//   const resultado = document.getElementById("resultado");

//   input.addEventListener("input", () => {
//     resultado.textContent = input.value;
//   });