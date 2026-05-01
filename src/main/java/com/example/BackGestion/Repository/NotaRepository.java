package com.example.BackGestion.Repository;

import com.example.BackGestion.Model.Nota;
import com.example.BackGestion.dto.NotaEstudianteProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotaRepository extends JpaRepository<Nota, Integer> {
    Optional<Nota> findByEvaluacionIdAndEstudianteId(Integer evaluacionId, Integer estudianteId);

    @Query(value = "SELECT " +
            "e.estudiante_id AS estudianteId, " +
            "MAX(ev.nombre) FILTER (WHERE ev.evaluacion_id = sub.ev1Id) AS ev1, " +
            "sub.ev1Id AS ev1Id, " +
            "MAX(n.valor) FILTER (WHERE ev.evaluacion_id = sub.ev1Id) AS notaEv1, " +
            "MAX(n.nota_id) FILTER (WHERE ev.evaluacion_id = sub.ev1Id) AS nota1Id, " +
            "MAX(ev.nombre) FILTER (WHERE ev.evaluacion_id = sub.ev2Id) AS ev2, " +
            "sub.ev2Id AS ev2Id, " +
            "MAX(n.valor) FILTER (WHERE ev.evaluacion_id = sub.ev2Id) AS notaEv2, " +
            "MAX(n.nota_id) FILTER (WHERE ev.evaluacion_id = sub.ev2Id) AS nota2Id, " +
            "MAX(ev.nombre) FILTER (WHERE ev.evaluacion_id = sub.ev3Id) AS ev3, " +
            "sub.ev3Id AS ev3Id, " +
            "MAX(n.valor) FILTER (WHERE ev.evaluacion_id = sub.ev3Id) AS notaEv3, " +
            "MAX(n.nota_id) FILTER (WHERE ev.evaluacion_id = sub.ev3Id) AS nota3Id, " +
            "ROUND(CAST(AVG(n.valor) AS numeric), 1) AS promedio " +
            "FROM estudiantes e " +
            "INNER JOIN curso_asignatura_docente cad ON cad.curso_id = e.curso_id " +
            "LEFT JOIN ( " +
            "    SELECT " +
            "        MAX(evaluacion_id) FILTER (WHERE row_num = 1) AS ev1Id, " +
            "        MAX(evaluacion_id) FILTER (WHERE row_num = 2) AS ev2Id, " +
            "        MAX(evaluacion_id) FILTER (WHERE row_num = 3) AS ev3Id, " +
            "        cad_id " +
            "    FROM ( " +
            "        SELECT evaluacion_id, cad_id, ROW_NUMBER() OVER (PARTITION BY cad_id ORDER BY fecha_evaluacion) as row_num " +
            "        FROM evaluaciones " +
            "    ) t GROUP BY cad_id " +
            ") sub ON sub.cad_id = cad.id " +
            "LEFT JOIN notas n ON n.estudiante_id = e.estudiante_id AND n.evaluacion_id IN (sub.ev1Id, sub.ev2Id, sub.ev3Id) " +
            "LEFT JOIN evaluaciones ev ON ev.evaluacion_id = n.evaluacion_id " +
            "WHERE e.curso_id = :cursoId AND cad.asignatura_id = :asignaturaId " +
            "GROUP BY e.estudiante_id, sub.ev1Id, sub.ev2Id, sub.ev3Id " +
            "ORDER BY e.estudiante_id", nativeQuery = true)
    List<NotaEstudianteProjection> findNotasByCursoAndAsignatura(@Param("cursoId") Integer cursoId,
            @Param("asignaturaId") Integer asignaturaId);

    @Query(value = "SELECT a.nombre AS \"asignaturaNombre\", " +
            "       MAX(CASE WHEN sub.row_num = 1 THEN n.valor END) AS \"notaEv1\", " +
            "       MAX(CASE WHEN sub.row_num = 2 THEN n.valor END) AS \"notaEv2\", " +
            "       MAX(CASE WHEN sub.row_num = 3 THEN n.valor END) AS \"notaEv3\", " +
            "       MAX(CASE WHEN sub.row_num = 1 THEN sub.evaluacion_id END) AS \"ev1Id\", " +
            "       MAX(CASE WHEN sub.row_num = 2 THEN sub.evaluacion_id END) AS \"ev2Id\", " +
            "       MAX(CASE WHEN sub.row_num = 3 THEN sub.evaluacion_id END) AS \"ev3Id\" " +
            "FROM estudiantes e " +
            "INNER JOIN curso_asignatura_docente cad ON cad.curso_id = e.curso_id " +
            "INNER JOIN asignaturas a ON cad.asignatura_id = a.asignatura_id " +
            "LEFT JOIN ( " +
            "    SELECT evaluacion_id, cad_id, ROW_NUMBER() OVER (PARTITION BY cad_id ORDER BY fecha_evaluacion) as row_num " +
            "    FROM evaluaciones " +
            ") sub ON sub.cad_id = cad.id " +
            "LEFT JOIN notas n ON n.evaluacion_id = sub.evaluacion_id AND n.estudiante_id = e.estudiante_id " +
            "WHERE e.estudiante_id = :estudianteId " +
            "GROUP BY a.asignatura_id, a.nombre", nativeQuery = true)
    List<NotaEstudianteProjection> findNotasByEstudianteId(@Param("estudianteId") Integer estudianteId);
}
