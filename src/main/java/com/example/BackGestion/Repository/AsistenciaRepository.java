package com.example.BackGestion.Repository;

import com.example.BackGestion.Model.Asistencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.BackGestion.dto.AsistenciaResumenProjection;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

@Repository
public interface AsistenciaRepository extends JpaRepository<Asistencia, Integer> {

    @Query(value = "SELECT a.nombre AS \"asignaturaNombre\", " +
            "       SUM(CASE WHEN asi.estado = 'Presente' THEN 1 ELSE 0 END) AS \"clasesAsistidas\", " +
            "       SUM(CASE WHEN asi.estado = 'Ausente' THEN 1 ELSE 0 END) AS \"clasesAusentes\" " +
            "FROM estudiantes e " +
            "INNER JOIN curso_asignatura_docente cad ON cad.curso_id = e.curso_id " +
            "INNER JOIN asignaturas a ON cad.asignatura_id = a.asignatura_id " +
            "LEFT JOIN asistencia asi ON asi.estudiante_id = e.estudiante_id " +
            "WHERE e.estudiante_id = :estudianteId " +
            "GROUP BY a.asignatura_id, a.nombre", nativeQuery = true)
    List<AsistenciaResumenProjection> findAsistenciaResumenByEstudianteId(@Param("estudianteId") Integer estudianteId);
}
