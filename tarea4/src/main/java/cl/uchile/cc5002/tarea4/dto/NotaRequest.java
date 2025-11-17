package cl.uchile.cc5002.tarea4.dto;

public class NotaRequest {
    // Se cambia a Double para poder recibir y validar números decimales
    private Double nota;

    public Double getNota() {
        return nota;
    }

    public void setNota(Double nota) {
        this.nota = nota;
    }
}