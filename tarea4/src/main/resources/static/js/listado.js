document.addEventListener('DOMContentLoaded', function() {

    // --- Elementos del DOM ---
    const listView = document.getElementById('list-view');
    const detailView = document.getElementById('detail-view');
    const avisoDetailContent = document.getElementById('aviso-detail-content');
    const commentsList = document.getElementById('comments-list');
    const commentForm = document.getElementById('comment-form');
    const commentAvisoIdInput = document.getElementById('comment-aviso-id');
    const commentErrorDiv = document.getElementById('comment-error');

    // --- Para ir actualizando comntarios y que no se bugee de alguna forma ---
    let currentComments = [];

    // --- FUNCIONES DE RENDERIZADO ---

    function renderAvisoDetails(aviso) {
        let fotosHtml = aviso.fotos.map(fotoUrl =>
            `<img src="${fotoUrl}" alt="Foto de ${aviso.tipo}" class="gallery-photo">`
        ).join('');
        if (aviso.fotos.length === 0) {
            fotosHtml = '<p>Este aviso no tiene fotos.</p>';
        }
        avisoDetailContent.innerHTML = `
            <h2>Detalles: ${aviso.cantidad} ${aviso.tipo}(s)</h2>
            <p><strong>Publicado el:</strong> ${aviso.fechaPublicacion}</p>
            <p><strong>Ubicación:</strong> ${aviso.comuna}, ${aviso.sector || 'No especificado'}</p>
            <p><strong>Descripción:</strong> ${aviso.descripcion || 'Sin descripción.'}</p>
            <hr><h3>Contacto</h3>
            <p><strong>Nombre:</strong> ${aviso.nombreContacto}</p>
            <p><strong>Email:</strong> ${aviso.emailContacto}</p>
            <hr><h3>Fotos</h3>
            <div class="photo-gallery">${fotosHtml}</div>
            <div class="detail-buttons"><button id="back-to-list-btn">Volver al Listado</button></div>
        `;
    }

    // Esta función solo lee de currentComments.
    function renderComments() {
        if (currentComments.length === 0) {
            commentsList.innerHTML = '<p>Aún no hay comentarios para este aviso. Puedes ser el primero!</p>';
            return;
        }
        commentsList.innerHTML = currentComments.map(comment => `
            <div class="comment-item">
                <p class="comment-meta"><strong>${comment.nombre}</strong> <span class="comment-date">(${comment.fecha})</span></p>
                <p class="comment-text">${comment.texto}</p>
            </div>
        `).join('');
    }

    // --- LÓGICA DE CONTROL ---

    async function showDetail(avisoId) {
        try {
            const [avisoRes, commentsRes] = await Promise.all([
                fetch(`/api/aviso/${avisoId}`),
                fetch(`/api/aviso/${avisoId}/comentarios`)
            ]);

            if (!avisoRes.ok || !commentsRes.ok) throw new Error('No se pudo obtener la información.');

            const aviso = await avisoRes.json();
            const comments = await commentsRes.json();

            // Para actualizar el estado
            currentComments = comments;

            // Rediseñar la vista
            renderAvisoDetails(aviso);
            renderComments();
            
            commentAvisoIdInput.value = avisoId;
            commentErrorDiv.textContent = '';
            listView.classList.add('hidden');
            detailView.classList.remove('hidden');

        } catch (error) {
            console.error('Error al cargar los detalles:', error);
            alert('No se pudieron cargar los detalles del aviso.');
        }
    }

    // --- EVENT LISTENERS ---

    document.getElementById('avisos-table-body').addEventListener('click', (event) => {
        const row = event.target.closest('tr');
        if (row && row.dataset.id) showDetail(row.dataset.id);
    });

    detailView.addEventListener('click', (event) => {
        if (event.target.id === 'back-to-list-btn') {
            detailView.classList.add('hidden');
            listView.classList.remove('hidden');
            avisoDetailContent.innerHTML = '';
            currentComments = []; // Reseteo del estado
            commentsList.innerHTML = '';
        }
    });

    commentForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        commentErrorDiv.textContent = '';
        const nombre = document.getElementById('comment-nombre').value.trim();
        const texto = document.getElementById('comment-texto').value.trim();
        const avisoId = commentAvisoIdInput.value;

        if (nombre.length < 3 || nombre.length > 80 || texto.length < 5) {
            commentErrorDiv.textContent = 'Por favor revise el nombre y el comentario.';
            return;
        }

        try {
            const response = await fetch(`/api/aviso/${avisoId}/comentarios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, texto })
            });
            const newCommentData = await response.json();
            if (!response.ok) throw new Error(newCommentData.error || 'Error del servidor.');
            
            // MODIFICAR EL ESTADO
            currentComments.unshift(newCommentData); // Añade el nuevo comentario al principio dEL listado

            renderComments();

            // Limpiar formulario
            commentForm.reset();

        } catch (error) {
            commentErrorDiv.textContent = error.message;
        }
    });
    
    // El código para el modal de fotos se mantiene igual q para las otras tareas
    const photoModal = document.getElementById('photo-modal');
    const modalImage = document.getElementById('modal-image');
    document.querySelector('.close-btn').addEventListener('click', () => photoModal.classList.add('hidden'));
    photoModal.addEventListener('click', (e) => { if(e.target.id === 'photo-modal') photoModal.classList.add('hidden'); });
    detailView.addEventListener('click', (e) => {
        if(e.target.classList.contains('gallery-photo')){
            modalImage.src = e.target.src;
            photoModal.classList.remove('hidden');
        }
    });
});