package com.example.BackGestion.Model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "estudiantes")
@Data
@NoArgsConstructor
public class Estudiante {

    @Id
    @Column(name = "estudiante_id")
    private Integer estudianteId;

    @Column(name = "curso_id")
    private Integer cursoId;

    @OneToOne
    @JoinColumn(name = "estudiante_id", referencedColumnName = "usuario_id", insertable = false, updatable = false)
    private Usuario usuario;
}
