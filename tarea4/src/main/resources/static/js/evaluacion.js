document.addEventListener('DOMContentLoaded', function () {
    const evaluarLinks = document.querySelectorAll('.evaluar-link');

    evaluarLinks.forEach(link => {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            const avisoId = this.dataset.id;
            const notaStr = prompt("Por favor, ingrese una nota del 1 al 7 para este aviso:");

            if (notaStr === null || notaStr.trim() === '') {
                return;
            }

            // --- VALIDACIÓN ---
            // para poder detectar decimales.
            const notaNum = parseFloat(notaStr);

            // Verificamos si no es un número, si tiene decimalesso si está fuera del rango permitido.
            if (isNaN(notaNum) || notaNum % 1 !== 0 || notaNum < 1 || notaNum > 7) {
                alert("Error: Debe ingresar un NÚMERO ENTERO entre 1 y 7.");
                return;
            }

            // Si la validación pasa, enviamos el número entero.
            enviarNota(avisoId, notaNum);
        });
    });

    async function enviarNota(avisoId, nota) {
        try {
            const response = await fetch(`/api/avisos/${avisoId}/evaluar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nota: nota }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Ocurrió un error en el servidor.');
            }

            const notaCell = document.getElementById(`nota-${avisoId}`);
            if (notaCell) {
                notaCell.textContent = result.nuevoPromedio.toFixed(1);
            }
            alert("¡Gracias por su evaluación!");

        } catch (error) {
            console.error('Error al enviar la evaluación:', error);
            alert(`Error: ${error.message}`);
        }
    }
});