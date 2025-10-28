// Funcion que se encarga de que el boton del dropdown obtenga el texto del tipo de documento seleccionado
// y lo muestre en el boton del dropdown
export function inicializarDropdowns() {
    // Selecciona todos los dropdowns de la página
    document.querySelectorAll('.dropdown').forEach(dropdown => {
        const button = dropdown.querySelector('.dropdown-button');
        const menu = dropdown.querySelector('.contenido-dropdown');
    const hidden = dropdown.querySelector('input[type="hidden"]');
        const opciones = menu.querySelectorAll('a');

        // Mostrar/ocultar el menú al hacer clic en el botón
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('show');
        });

        // Cambiar el texto del botón y ocultar el menú al seleccionar una opción
        opciones.forEach(opcion => {
            opcion.addEventListener('click', (event) => {
                event.preventDefault();
                // Texto visible
                button.textContent = opcion.textContent;
                // Si hay input hidden en este dropdown, guardamos el valor
                if (hidden) {
                    const val = opcion.dataset.id ?? opcion.textContent;
                    hidden.value = val;
                }
                menu.classList.remove('show');
            });
        });

        // Ocultar el menú si se hace clic fuera
        document.addEventListener('click', (event) => {
            if (!dropdown.contains(event.target)) {
                menu.classList.remove('show');
            }
        });
    });
}