document.addEventListener('DOMContentLoaded', function() {
    
    const regionSelect = document.getElementById('region');
    const comunaSelect = document.getElementById('comuna');
    const form = document.getElementById('adoption-form');

    // --- CÓDIGO PARA CARGAR COMUNASSS DESDE EL SERVIDOR ---
    if (regionSelect) {
        regionSelect.addEventListener('change', function() {
            const regionId = this.value;
            comunaSelect.innerHTML = '<option value="">-- Cargando comunas... --</option>';

            if (!regionId) {
                comunaSelect.innerHTML = '<option value="">-- Seleccione una Comuna --</option>';
                return;
            }

            fetch(`/get_comunas/${regionId}`)
                .then(response => response.json())
                .then(data => {
                    comunaSelect.innerHTML = '<option value="">-- Seleccione una Comuna --</option>';
                    data.forEach(comuna => {
                        const option = new Option(comuna.nombre, comuna.id);
                        comunaSelect.add(option);
                    });
                })
                .catch(error => {
                    console.error('Error al cargar las comunas:', error);
                    comunaSelect.innerHTML = '<option value="">-- Error al cargar --</option>';
                });
        });
    }

    // --- VALIDACIÓN DEL LADO DEL CLIENTE ---
    if (form) {
        form.addEventListener('submit', function(event) {
            // Prevenimos el envío inmediato para poder validarlo primero.
            event.preventDefault();

            let isValid = true;
            let errorMessages = [];

            // --- Realizamos todas las validaciones de la Tarea 1 y Tarea 2---
            if (document.getElementById('region').value === '') {
                isValid = false;
                errorMessages.push('Debe seleccionar una región.');
            }
            if (document.getElementById('comuna').value === '') {
                isValid = false;
                errorMessages.push('Debe seleccionar una comuna.');
            }
            const nombre = document.getElementById('nombre').value.trim();
            if (nombre.length < 3 || nombre.length > 200) {
                isValid = false;
                errorMessages.push('El nombre debe tener entre 3 y 200 caracteres.');
            }
            const email = document.getElementById('email').value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                isValid = false;
                errorMessages.push('Debe ingresar un formato de email válido.');
            }
            const celular = document.getElementById('celular').value.trim();
            if (celular && !/^\+569\d{8}$/.test(celular)) {
                isValid = false;
                errorMessages.push('El formato del celular debe ser +569 followed by 8 digits.');
            }
            if (document.getElementById('tipo-mascota').value === '') {
                isValid = false;
                errorMessages.push('Debe seleccionar un tipo de mascota.');
            }
            // NUEVA VALIDACIÓN PARA CANTIDAD Y EDAD
            const cantidad = document.getElementById('cantidad').value;
            if (cantidad && !/^\d+$/.test(cantidad)) { 
                isValid = false;
                errorMessages.push('La cantidad debe ser un número entero (sin decimales).');
            }
            const edad = document.getElementById('edad').value;
            if (edad && !/^\d+$/.test(edad)) {
                isValid = false;
                errorMessages.push('La edad debe ser un número entero (sin decimales).');
            }
            const fotosInput = document.getElementById('fotos');
            if (!fotosInput.files || fotosInput.files.length === 0) {
                isValid = false;
                errorMessages.push('Debe agregar al menos una foto.');
            }


            // --- Decisión Final ---
            if (isValid) {
                // Si la validación de JS es exitosa, se pide confirmación.
                const userIsSure = confirm('¿Está seguro que desea agregar este aviso de adopción?');
                if (userIsSure) {
                    // Si el usuario confirma se envía el formulario al servidor.
                    form.submit();
                }
            } else {
                // Si la validación de JS falla, se muestra un único alert con todos los errores.
                alert('Por favor, corrija los siguientes errores:\n\n- ' + errorMessages.join('\n- '));
            }
        });
    }
});