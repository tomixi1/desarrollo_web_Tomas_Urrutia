package cl.uchile.cc5002.tarea4.repositories;

import cl.uchile.cc5002.tarea4.models.Region;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RegionRepository extends JpaRepository<Region, Integer> {
    List<Region> findAllByOrderByIdAsc();
}