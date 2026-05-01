package com.example.BackGestion.Model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "asignaturas")
public class Asignatura {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "asignatura_id")
    private Integer asignaturaId;

    private String nombre;
}
