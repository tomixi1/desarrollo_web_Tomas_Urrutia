package cl.uchile.cc5002.tarea4.repositories;

import cl.uchile.cc5002.tarea4.models.Nota;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotaRepository extends JpaRepository<Nota, Integer> {
}