package com.example.BackGestion.Model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Entidad limpia para Docente.
 * Se asocia con Usuario para obtener datos personales.
 */
@Entity
@Table(name = "docentes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Docente {

    @Id
    @Column(name = "docente_id")
    private Integer docenteId;

    @OneToOne
    @JoinColumn(name = "docente_id", referencedColumnName = "usuario_id", insertable = false, updatable = false)
    private Usuario usuario;
}
