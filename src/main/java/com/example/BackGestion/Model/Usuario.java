package com.example.BackGestion.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entidad que mapea la tabla 'usuarios' del schema 'public' en la BD 'colegio'.
 */
@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "usuario_id")
    private Integer usuarioId;

    @Column(name = "rol_id")
    private Integer rolId;

    @Column(name = "rut", length = 20)
    private String rut;

    @Column(name = "nombre", length = 100)
    private String nombre;

    @Column(name = "apellido_paterno", length = 100)
    private String apellidoPaterno;

    @Column(name = "apellido_materno", length = 100)
    private String apellidoMaterno;

    @Column(name = "email", length = 150)
    private String email;

    @Column(name = "password", length = 255)
    private String password;

    @Column(name = "activo")
    private Boolean activo;
}
