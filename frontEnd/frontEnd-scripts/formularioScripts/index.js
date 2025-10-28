import { inicializarDropdowns } from "../generalScripts/dropdown.js";
import { cargarFormulario } from "./formulario.js";

document.addEventListener('DOMContentLoaded', function() {
    inicializarDropdowns();
    cargarFormulario();
});