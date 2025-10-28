export function segmentos() {
    // Acordeones simples
            document.querySelectorAll('.accordion-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const target = document.querySelector(btn.getAttribute('data-target'));
                    if (!target) return;
                    target.classList.toggle('hidden');
                });
            });
            // Abrir todas por defecto
            document.querySelectorAll('.accordion-panel').forEach(p => p.classList.remove('hidden'));
}