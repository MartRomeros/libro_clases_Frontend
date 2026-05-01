package com.example.BackGestion.Services;

import com.example.BackGestion.Model.Docente;
import com.example.BackGestion.Repository.DocenteRepository;
import com.example.BackGestion.dto.DocenteCursoProjection;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DocenteService {

    @Autowired
    private DocenteRepository docenteRepository;

    public List<Docente> listarDocentes() {
        return docenteRepository.findAll();
    }

    public Optional<Docente> obtenerPorId(Integer id) {
        return docenteRepository.findById(id);
    }

    public List<DocenteCursoProjection> obtenerCursosPorDocente(Integer docenteId) {
        return docenteRepository.findCursosByDocenteId(docenteId);
    }

    public Docente guardar(Docente docente) {
        return docenteRepository.save(docente);
    }

    public void eliminar(Integer id) {
        docenteRepository.deleteById(id);
    }

    public List<DocenteCursoProjection> listarTodosLosCads() {
        return docenteRepository.findAllCADs();
    }
}
