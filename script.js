document.addEventListener('DOMContentLoaded', function() {
    const menuOverlay = document.getElementById('initial-menu-overlay');
    const menuLinks = document.querySelectorAll('.initial-nav a');
    const body = document.body;

    menuLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault(); 
            const destination = this.href;
            menuOverlay.classList.add('hidden');
            body.style.overflow = 'auto';
            setTimeout(() => window.location.href = destination, 500);
        });
    });
});
