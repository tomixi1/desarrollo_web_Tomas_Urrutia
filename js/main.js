// Esperamos a que todo el contenido del DOM (la página) se cargue
document.addEventListener('DOMContentLoaded', function() {
    
    const regionSelect = document.getElementById('region');
    const comunaSelect = document.getElementById('comuna');
    const form = document.getElementById('adoption-form');
    const addPhotoBtn = document.getElementById('add-photo-btn');
    const photosContainer = document.getElementById('fotos-container');

    // La variable 'region_comuna' viene del archivo region_comuna.js
    region_comuna.regiones.forEach(region => {
        const option = new Option(region.nombre, region.numero);
        regionSelect.add(option);
    });

    regionSelect.addEventListener('change', function() {
        // Limpiamos las comunas anteriores
        comunaSelect.innerHTML = '<option value="">-- Seleccione una Comuna --</option>';
        
        const selectedRegionNumero = this.value;
        if (!selectedRegionNumero) return; // Si no hay región seleccionada, no hacemos nada

        // Encontramos la región seleccionada en nuestro objeto de datos
        const selectedRegion = region_comuna.regiones.find(r => r.numero == selectedRegionNumero);
        
        // Poblamos el select de comunas
        selectedRegion.comunas.forEach(comuna => {
            const option = new Option(comuna.nombre, comuna.id);
            comunaSelect.add(option);
        });
    });
    
    addPhotoBtn.addEventListener('click', function() {
        const photoInputs = photosContainer.querySelectorAll('.photo-input');
        if (photoInputs.length < 5) {
            const newPhotoInput = document.createElement('input');
            newPhotoInput.type = 'file';
            newPhotoInput.name = 'fotos[]';
            newPhotoInput.className = 'photo-input';
            newPhotoInput.accept = 'image/*';
            photosContainer.appendChild(newPhotoInput);
        }
        
        // Si llegamos al límite de 5, deshabilitamos el botón
        if (photosContainer.querySelectorAll('.photo-input').length === 5) {
            addPhotoBtn.disabled = true;
            addPhotoBtn.textContent = 'Máximo de 5 fotos alcanzado';
        }
    });

    const fechaInput = document.getElementById('fecha-entrega');
    const now = new Date();
    // Añadimos 3 horas
    now.setHours(now.getHours() + 3);
    // Formateamos para el input datetime-local
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const minDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    
    fechaInput.min = minDateTime;
    fechaInput.value = minDateTime;

    form.addEventListener('submit', function(event) {
        // Prevenimos el envío por defecto del formulario
        event.preventDefault();

        let isValid = true;
        // Limpiamos todos los mensajes de error previos
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

        // Función auxiliar para mostrar errores
        const showError = (inputId, message) => {
            const input = document.getElementById(inputId);
            const errorElement = input.nextElementSibling;
            if (errorElement && errorElement.classList.contains('error-message')) {
                errorElement.textContent = message;
            }
            isValid = false;
        };
        
        const showFotosError = (message) => {
            document.getElementById('fotos-error').textContent = message;
            isValid = false;
        };

        // --- INICIO DE VALIDACIONES ---
        // Región
        if (regionSelect.value === '') showError('region', 'Debe seleccionar una región.');
        // Comuna
        if (comunaSelect.value === '') showError('comuna', 'Debe seleccionar una comuna.');
        // Nombre
        const nombre = document.getElementById('nombre');
        if (nombre.value.trim().length < 3 || nombre.value.trim().length > 200) {
            showError('nombre', 'El nombre debe tener entre 3 y 200 caracteres.');
        }
        // Email
        const email = document.getElementById('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value)) {
            showError('email', 'Debe ingresar un formato de email válido.');
        }
        // Celular
        const celular = document.getElementById('celular');
        const celularRegex = /^\+569\.\d{8}$/;
        if (celular.value && !celularRegex.test(celular.value)) {
            showError('celular', 'El formato debe ser +569.12345678');
        }
        
        // Contactar por (opcional, conmáximo 5)
        const contactarPor = document.getElementById('contactar-por');
        if (contactarPor.selectedOptions.length > 5) {
            showError('contactar-por', 'Puede seleccionar un máximo de 5 opciones.');
        }
        const contactarPorId = document.getElementById('contactar-por-id');
        const idValue = contactarPorId.value.trim();
        if (idValue.length > 0 && (idValue.length < 4 || idValue.length > 50)) {
        showError('contactar-por-id', 'El ID/URL debe tener entre 4 y 50 caracteres.');
        }

        // Tipo de mascota
        if (document.getElementById('tipo-mascota').value === '') showError('tipo-mascota', 'Debe seleccionar un tipo de mascota.');
        
        // Cantidad
        const cantidad = document.getElementById('cantidad');
        if (parseInt(cantidad.value) < 1 || !cantidad.value) {
            showError('cantidad', 'La cantidad mínima es 1.');
        }
        
        // Edad
        const edad = document.getElementById('edad');
        if (parseInt(edad.value) < 1 || !edad.value) {
            showError('edad', 'La edad mínima es 1.');
        }
        // Unidad de edad
        if (document.getElementById('unidad-edad').value === '') showError('unidad-edad', 'Debe seleccionar meses o años.');
        // Fecha de entrega
        if (!fechaInput.value || new Date(fechaInput.value) < new Date(minDateTime)) {
            showError('fecha-entrega', 'La fecha debe ser igual o posterior a la pre-llenada.');
        }
        // Fotos
        const firstPhotoInput = photosContainer.querySelector('.photo-input');
        if (!firstPhotoInput.files || firstPhotoInput.files.length === 0) {
            showFotosError('Debe agregar al menos una foto.');
        }
        
        // --- FIN DE VALIDACIONES ---

        // si todo es válido...
        if (isValid) {
            const userIsSure = confirm('¿Está seguro que desea agregar este aviso de adopción?');
            if (userIsSure) {
                // Mensaje de éxito
                alert('Hemos recibido la información de adopción, ¡muchas gracias y suerte!');
                
                // Ocultamos el botón de submit y mostramos un botón para volver
                document.getElementById('submit-btn').style.display = 'none';
                const formResult = document.getElementById('form-result');
                formResult.innerHTML = '<a href="index.html"><button type="button">Volver a la Portada</button></a>';
                

            } else {
                // Si el usuario hace clic en "No" el formulario sigue visible
                console.log('El usuario canceló el envío.');
            }
        }
    });
});