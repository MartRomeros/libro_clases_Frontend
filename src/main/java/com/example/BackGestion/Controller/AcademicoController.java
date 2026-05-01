package com.example.BackGestion.Controller;

import com.example.BackGestion.Model.Asignatura;
import com.example.BackGestion.Model.Curso;
import com.example.BackGestion.Model.CAD;
import com.example.BackGestion.Repository.AsignaturaRepository;
import com.example.BackGestion.Repository.CursoRepository;
import com.example.BackGestion.Repository.CADRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/academico")
@CrossOrigin(origins = "*")
public class AcademicoController {

    @Autowired
    private CursoRepository cursoRepository;

    @Autowired
    private AsignaturaRepository asignaturaRepository;

    @Autowired
    private CADRepository cadRepository;

    // --- CURSOS ---
    @GetMapping("/cursos")
    public List<Curso> listarCursos() {
        return cursoRepository.findAll();
    }

    @PostMapping("/cursos")
    public Curso crearCurso(@RequestBody Curso curso) {
        return cursoRepository.save(curso);
    }

    @DeleteMapping("/cursos/{id}")
    public void eliminarCurso(@PathVariable Integer id) {
        cursoRepository.deleteById(id);
    }

    // --- ASIGNATURAS ---
    @GetMapping("/asignaturas")
    public List<Asignatura> listarAsignaturas() {
        return asignaturaRepository.findAll();
    }

    @PostMapping("/asignaturas")
    public Asignatura crearAsignatura(@RequestBody Asignatura asignatura) {
        return asignaturaRepository.save(asignatura);
    }

    @DeleteMapping("/asignaturas/{id}")
    public void eliminarAsignatura(@PathVariable Integer id) {
        asignaturaRepository.deleteById(id);
    }

    // --- CAD (Relaciones) ---
    @PostMapping("/cad")
    public CAD crearCAD(@RequestBody CAD cad) {
        return cadRepository.save(cad);
    }

    @DeleteMapping("/cad/{id}")
    public void eliminarCAD(@PathVariable Integer id) {
        cadRepository.deleteById(id);
    }
}
