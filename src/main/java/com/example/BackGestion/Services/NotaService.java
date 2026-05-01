package com.example.BackGestion.Services;

import com.example.BackGestion.Model.Nota;
import com.example.BackGestion.Repository.NotaRepository;
import com.example.BackGestion.dto.NotaEstudianteProjection;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotaService {

    @Autowired
    private NotaRepository notaRepository;

    public Nota guardarOActualizarNota(Nota nota) {
        // Buscamos si ya existe una nota para este estudiante y esta evaluación
        return notaRepository.findByEvaluacionIdAndEstudianteId(nota.getEvaluacionId(), nota.getEstudianteId())
                .map(notaExistente -> {
                    notaExistente.setValor(nota.getValor());
                    return notaRepository.save(notaExistente);
                })
                .orElseGet(() -> notaRepository.save(nota));
    }

    public List<Nota> listarTodas() {
        return notaRepository.findAll();
    }

    public List<NotaEstudianteProjection> obtenerNotasPorCursoYAsignatura(Integer cursoId, Integer asignaturaId) {
        return notaRepository.findNotasByCursoAndAsignatura(cursoId, asignaturaId);
    }
}
