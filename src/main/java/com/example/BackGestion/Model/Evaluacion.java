package com.example.BackGestion.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "evaluaciones")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Evaluacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "evaluacion_id")
    private Integer evaluacionId;

    @Column(name = "cad_id")
    private Integer cadId;

    @Column(name = "nombre")
    private String nombre;

    @Column(name = "fecha_evaluacion")
    private LocalDate fechaEvaluacion;
}
