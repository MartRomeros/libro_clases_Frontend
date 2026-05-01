package com.example.BackGestion.dto;

public interface NotaEstudianteProjection {
    // Para vista de Docente
    Integer getEstudianteId();
    String getEv1();
    Integer getEv1Id();
    Double getNotaEv1();
    Integer getNota1Id();
    String getEv2();
    Integer getEv2Id();
    Double getNotaEv2();
    Integer getNota2Id();
    String getEv3();
    Integer getEv3Id();
    Double getNotaEv3();
    Integer getNota3Id();
    Double getPromedio();

    // Para vista de Estudiante
    String getAsignaturaNombre();
}
