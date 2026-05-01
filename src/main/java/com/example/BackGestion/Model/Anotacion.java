package com.example.BackGestion.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "anotaciones")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Anotacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "anotacion_id")
    private Integer anotacionId;

    @Column(name = "estudiante_id")
    private Integer estudianteId;

    @Column(name = "docente_id")
    private Integer docenteId;

    @Column(name = "tipo")
    private String tipo;

    @Column(name = "descripcion")
    private String descripcion;

    @Column(name = "fecha_registro")
    private LocalDateTime fechaRegistro;
}
