import { inject, Injectable } from '@angular/core';
import { 
  mutationOptions, 
  injectQueryClient 
} from '@tanstack/angular-query-experimental';
import { AdminApi } from './admin.api';
import { adminKeys } from './admin.keys';
import { Usuario, Evaluacion } from '../models/admin.model';

@Injectable({
  providedIn: 'root'
})
export class AdminMutations {
  private readonly api = inject(AdminApi);
  private readonly queryClient = injectQueryClient();

  // --- Usuarios ---
  crearUsuarioCompleto() {
    return mutationOptions({
      mutationFn: async (payload: { usuario: Usuario; extraData?: any }) => {
        const nuevoUser = await this.api.crearUsuario(payload.usuario);

        if (payload.usuario.rolId === 2) {
          await this.api.crearDocente({ docenteId: nuevoUser.usuarioId! });
        } else if (payload.usuario.rolId === 3) {
          await this.api.crearEstudiante({
            estudianteId: nuevoUser.usuarioId!,
            cursoId: payload.extraData?.cursoId || 1,
          });
        }
        return nuevoUser;
      },
      onSuccess: () => {
        this.queryClient.invalidateQueries({ queryKey: adminKeys.usuarios() });
        this.queryClient.invalidateQueries({ queryKey: adminKeys.docentes() });
        this.queryClient.invalidateQueries({ queryKey: adminKeys.estudiantes() });
      },
    });
  }

  actualizarUsuario() {
    return mutationOptions({
      mutationFn: ({ id, usuario }: { id: number; usuario: Usuario }) =>
        this.api.actualizarUsuario(id, usuario),
      onSuccess: () => {
        this.queryClient.invalidateQueries({ queryKey: adminKeys.usuarios() });
      },
    });
  }

  eliminarUsuario() {
    return mutationOptions({
      mutationFn: (id: number) => this.api.eliminarUsuario(id),
      onSuccess: () => {
        this.queryClient.invalidateQueries({ queryKey: adminKeys.usuarios() });
      },
    });
  }

  // --- Estudiantes ---
  actualizarEstudiante() {
    return mutationOptions({
      mutationFn: ({ id, estudiante }: { id: number; estudiante: any }) =>
        this.api.actualizarEstudiante(id, estudiante),
      onSuccess: () => {
        this.queryClient.invalidateQueries({ queryKey: adminKeys.estudiantes() });
      },
    });
  }

  // --- Académico ---
  crearCurso() {
    return mutationOptions({
      mutationFn: (curso: any) => this.api.crearCurso(curso),
      onSuccess: () => {
        this.queryClient.invalidateQueries({ queryKey: adminKeys.cursos() });
      },
    });
  }

  eliminarCurso() {
    return mutationOptions({
      mutationFn: (id: number) => this.api.eliminarCurso(id),
      onSuccess: () => {
        this.queryClient.invalidateQueries({ queryKey: adminKeys.cursos() });
      },
    });
  }

  crearAsignatura() {
    return mutationOptions({
      mutationFn: (asignatura: any) => this.api.crearAsignatura(asignatura),
      onSuccess: () => {
        this.queryClient.invalidateQueries({ queryKey: adminKeys.asignaturas() });
      },
    });
  }

  eliminarAsignatura() {
    return mutationOptions({
      mutationFn: (id: number) => this.api.eliminarAsignatura(id),
      onSuccess: () => {
        this.queryClient.invalidateQueries({ queryKey: adminKeys.asignaturas() });
      },
    });
  }

  vincularCAD() {
    return mutationOptions({
      mutationFn: (cad: any) => this.api.vincularCAD(cad),
      onSuccess: () => {
        this.queryClient.invalidateQueries({ queryKey: adminKeys.cads() });
      },
    });
  }

  eliminarCAD() {
    return mutationOptions({
      mutationFn: (id: number) => this.api.eliminarCAD(id),
      onSuccess: () => {
        this.queryClient.invalidateQueries({ queryKey: adminKeys.cads() });
      },
    });
  }

  // --- Evaluaciones ---
  crearEvaluacion() {
    return mutationOptions({
      mutationFn: (evaluacion: Evaluacion) => this.api.crearEvaluacion(evaluacion),
      onSuccess: (data) => {
        this.queryClient.invalidateQueries({ queryKey: adminKeys.evaluacionesByCad(data.cadId) });
      },
    });
  }

  actualizarEvaluacion() {
    return mutationOptions({
      mutationFn: ({ id, evaluacion }: { id: number; evaluacion: Evaluacion }) =>
        this.api.actualizarEvaluacion(id, evaluacion),
      onSuccess: (data) => {
        this.queryClient.invalidateQueries({ queryKey: adminKeys.evaluacionesByCad(data.cadId) });
      },
    });
  }

  eliminarEvaluacion() {
    return mutationOptions({
      mutationFn: ({ id, cadId }: { id: number; cadId: number }) =>
        this.api.eliminarEvaluacion(id),
      onSuccess: (_, variables) => {
        this.queryClient.invalidateQueries({ queryKey: adminKeys.evaluacionesByCad(variables.cadId) });
      },
    });
  }
}
