document.addEventListener('DOMContentLoaded', function() {

    const listView = document.getElementById('list-view');
    const detailView = document.getElementById('detail-view');
    const tableBody = document.getElementById('avisos-table-body');
    const photoModal = document.getElementById('photo-modal');
    const modalImage = document.getElementById('modal-image');
    const closeModalBtn = document.querySelector('.close-btn');

    // Función para mostrar la vista de detalle
    async function showDetail(avisoId) {
        try {
            // Hacemos una petición a nuestra nueva API de Flask
            const response = await fetch(`/api/aviso/${avisoId}`);
            if (!response.ok) {
                throw new Error('No se pudo obtener la información del aviso.');
            }
            const aviso = await response.json();

            // Generamos el HTML para la galería de fotos
            let fotosHtml = aviso.fotos.map(fotoUrl => 
                `<img src="${fotoUrl}" alt="Foto de ${aviso.tipo}" class="gallery-photo">`
            ).join('');
            if (aviso.fotos.length === 0) {
                fotosHtml = '<p>Este aviso no tiene fotos.</p>';
            }

            // Par el contenedor de la vista de detalle
            detailView.innerHTML = `
                <h2>Detalles de Adopción: ${aviso.cantidad} ${aviso.tipo}(s)</h2>
                <p><strong>Publicado el:</strong> ${aviso.fechaPublicacion}</p>
                <p><strong>Disponible para entrega desde:</strong> ${aviso.fechaEntrega}</p>
                <p><strong>Ubicación:</strong> ${aviso.comuna}, ${aviso.sector || 'No especificado'}</p>
                <p><strong>Descripción:</strong> ${aviso.descripcion || 'Sin descripción.'}</p>
                <hr>
                <h3>Contacto</h3>
                <p><strong>Nombre:</strong> ${aviso.nombreContacto}</p>
                <p><strong>Email:</strong> ${aviso.emailContacto}</p>
                <p><strong>Celular:</strong> ${aviso.celularContacto || 'No especificado'}</p>
                <hr>
                <h3>Fotos</h3>
                <div class="photo-gallery">${fotosHtml}</div>
                <div class="detail-buttons">
                    <button id="back-to-list-btn">Volver al Listado</button>
                </div>
            `;

            // Ocultamos la lista y mostramos el detalle
            listView.classList.add('hidden');
            detailView.classList.remove('hidden');

        } catch (error) {
            console.error('Error al cargar los detalles:', error);
            alert('No se pudieron cargar los detalles del aviso. Por favor, intente de nuevo.');
        }
    }

    // --- EVENT LISTENERS ---

    // Listener para los clics en las filas de la tabla
    if (tableBody) {
        tableBody.addEventListener('click', function(event) {
            const row = event.target.closest('tr');
            if (row && row.dataset.id) {
                showDetail(row.dataset.id);
            }
        });
    }

    // Listener para botones y fotos en la vista de detalle 
    detailView.addEventListener('click', function(event) {
        if (event.target.id === 'back-to-list-btn') {
            detailView.classList.add('hidden');
            listView.classList.remove('hidden');
            detailView.innerHTML = ''; 
        }
        if (event.target.classList.contains('gallery-photo')) {
            modalImage.src = event.target.src;
            photoModal.classList.remove('hidden');
        }
    });
    
    // Listeners para cerrar el modal
    closeModalBtn.addEventListener('click', () => photoModal.classList.add('hidden'));
    photoModal.addEventListener('click', (event) => {
        if (event.target.id === 'photo-modal') {
            photoModal.classList.add('hidden');
        }
    });
});