package com.example.BackGestion.Repository;

import com.example.BackGestion.Model.Anotacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnotacionRepository extends JpaRepository<Anotacion, Integer> {
    List<Anotacion> findByEstudianteIdOrderByFechaRegistroDesc(Integer estudianteId);
}
