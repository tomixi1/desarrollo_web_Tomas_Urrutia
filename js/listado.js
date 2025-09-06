document.addEventListener('DOMContentLoaded', function() {

    // Obtener las referencias a los elementos principales del DOM
    const listView = document.getElementById('list-view');
    const detailView = document.getElementById('detail-view');
    const tableBody = document.getElementById('avisos-table-body');
    const photoModal = document.getElementById('photo-modal');
    const modalImage = document.getElementById('modal-image');
    const closeModalBtn = document.querySelector('.close-btn');

    // Función para renderizar la tabla con la lista de avisos
    function renderList() {
        // Limpia cualquier contenido previo
        tableBody.innerHTML = '';

        // La variable 'datosAvisos' viene del archivo datos.js
        datosAvisos.forEach(aviso => {
            const row = document.createElement('tr');
            // Guardar el ID del aviso en el atributo 'data-id' de la fila
            // para saber cuál se clickeó
            row.dataset.id = aviso.id; 

            row.innerHTML = `
                <td>${aviso.fechaPublicacion}</td>
                <td>${aviso.fechaEntrega}</td>
                <td>${aviso.comuna}</td>
                <td>${aviso.sector}</td>
                <td>${aviso.cantidad} ${aviso.tipo}(s), ${aviso.edad}</td>
                <td>${aviso.nombreContacto}</td>
                <td>${aviso.fotos.length}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Función para renderizar la vista de detalle de un aviso
    function renderDetail(avisoId) {
        // Buscamos el aviso correcto en nuestros datos usando el ID
        const aviso = datosAvisos.find(a => a.id == avisoId);
        if (!aviso) return;

        // Generamos el HTML para la galería de fotos
        let fotosHtml = '';
        aviso.fotos.forEach(fotoUrl => {
            fotosHtml += `<img src="${fotoUrl}" alt="Foto de ${aviso.tipo}" data-src="${fotoUrl}">`;
        });
        
        // Contenedor de la vista de detalle
        detailView.innerHTML = `
            <h2>Detalles de Adopción: ${aviso.cantidad} ${aviso.tipo}(s)</h2>
            <p><strong>Publicado el:</strong> ${aviso.fechaPublicacion}</p>
            <p><strong>Disponible para entrega desde:</strong> ${aviso.fechaEntrega}</p>
            <p><strong>Ubicación:</strong> ${aviso.comuna}, ${aviso.sector}</p>
            <p><strong>Descripción:</strong> ${aviso.descripcion}</p>
            <hr>
            <h3>Contacto</h3>
            <p><strong>Nombre:</strong> ${aviso.nombreContacto}</p>
            <p><strong>Email:</strong> ${aviso.emailContacto}</p>
            <p><strong>Celular:</strong> ${aviso.celularContacto}</p>
            <hr>
            <h3>Fotos</h3>
            <div class="photo-gallery">
                ${fotosHtml}
            </div>
            <div class="detail-buttons">
                <button id="back-to-list-btn">Volver al Listado</button>
                <a href="index.html"><button>Volver a la Portada</button></a>
            </div>
        `;

        // Ocultamos la lista y mostramos el detalle
        listView.classList.add('hidden');
        detailView.classList.remove('hidden');
    }

    // --- EVENT LISTENERS ---

    // Event listener para los clics en las filas de la tabla
    tableBody.addEventListener('click', function(event) {
        const row = event.target.closest('tr');
        if (row && row.dataset.id) {
            renderDetail(row.dataset.id);
        }
    });

    // Event listener para los botones y fotos que se crean dinámicamente
    detailView.addEventListener('click', function(event) {
        // Si se hizo clic en el botón para volver a la lista
        if (event.target.id === 'back-to-list-btn') {
            detailView.classList.add('hidden');
            listView.classList.remove('hidden');
        }
        // Si se hizo clic en una imagen de la galería...
        if (event.target.tagName === 'IMG' && event.target.closest('.photo-gallery')) {
            modalImage.src = event.target.dataset.src || event.target.src;;
            photoModal.classList.remove('hidden');
        }
    });
    
    // Event listener para cerrar el modal
    closeModalBtn.addEventListener('click', function() {
        photoModal.classList.add('hidden');
    });

     // Para cerrar el modal al hacer clic fuera de la imagen
    photoModal.addEventListener('click', function(event) {
        // Si el clic fue en el fondo del modal (el propio div) y no en la imagen
        if (event.target.id === 'photo-modal') {
            photoModal.classList.add('hidden');
        }
    });


    // Llamada inicial para poblar la tabla cuando la página carga
    renderList();
});