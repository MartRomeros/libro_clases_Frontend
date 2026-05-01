package com.example.BackGestion.Services;

import com.example.BackGestion.Repository.EstudianteRepository;
import com.example.BackGestion.dto.EstudianteCursoProjection;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

import com.example.BackGestion.Model.Estudiante;
import java.util.Optional;

@Service
public class EstudianteService {

    @Autowired
    private EstudianteRepository estudianteRepository;

    public List<EstudianteCursoProjection> obtenerEstudiantesPorCurso(Integer cursoId) {
        return estudianteRepository.findEstudiantesByCursoId(cursoId);
    }

    public List<Estudiante> listarTodos() {
        return estudianteRepository.findAll();
    }

    public Optional<Estudiante> obtenerPorId(Integer id) {
        return estudianteRepository.findById(id);
    }

    public Estudiante guardar(Estudiante estudiante) {
        return estudianteRepository.save(estudiante);
    }

    public void eliminar(Integer id) {
        estudianteRepository.deleteById(id);
    }
}
