//La siguiente funcion se encargara que cuando se de click en el boton del div se oculte si no esta oculto y se muestre si esta oculto
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.toggle('hidden');
    }
}