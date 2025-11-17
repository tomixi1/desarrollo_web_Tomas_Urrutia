package cl.uchile.cc5002.tarea4.repositories;

import cl.uchile.cc5002.tarea4.models.AvisoAdopcion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AvisoAdopcionRepository extends JpaRepository<AvisoAdopcion, Integer> {
    // Spring data JPA se encarga de la implementación
}