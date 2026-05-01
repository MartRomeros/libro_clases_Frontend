package com.example.BackGestion.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "notas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Nota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "nota_id")
    private Integer notaId;

    @Column(name = "evaluacion_id")
    private Integer evaluacionId;

    @Column(name = "estudiante_id")
    private Integer estudianteId;

    @Column(name = "valor")
    private Double valor;
}
