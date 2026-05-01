package com.example.BackGestion.Model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "cursos")
public class Curso {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "curso_id")
    private Integer cursoId;

    private String nivel;
    private String letra;
    
    @Column(name = "anio_academico")
    private Integer anioAcademico;
}
