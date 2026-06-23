import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Navbar } from '../landing/sections/navbar/navbar';
import { Footer } from '../landing/sections/footer/footer';
import { AdminApi } from '../admin/data-access/admin.api';
import { ReturnState, MatriculaResumen, GrabarMatriculaPayload, MatriculaFormData } from './webpay.interfaces';

@Component({
  selector: 'app-webpay-return',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    Navbar,
    Footer
  ],
  templateUrl: './webpay-return.component.html',
})
export class WebpayReturnComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private adminApi = inject(AdminApi);

  state: ReturnState = 'loading';
  errorMessage = '';
  resumen: MatriculaResumen | null = null;

  async ngOnInit() {
    // 1. Leer query params con ActivatedRoute (NO window.location)
    const params = this.route.snapshot.queryParams;
    const tbkToken = params['TBK_TOKEN'];
    const tokenWs = params['token_ws'];

    // 2. Si contiene TBK_TOKEN → cancelación
    if (tbkToken) {
      this.cleanupSession();
      this.state = 'cancelled';
      return;
    }

    // 3. Si no contiene token_ws → error por token inválido
    if (!tokenWs) {
      this.cleanupSession();
      this.errorMessage = 'No se recibió token de pago válido';
      this.state = 'error';
      return;
    }

    // 4. Leer datos del formulario desde sessionStorage
    const formDataStr = sessionStorage.getItem('matriculaFormData');
    if (!formDataStr) {
      this.cleanupSession();
      this.errorMessage = 'No se encontraron datos de matrícula';
      this.state = 'error';
      return;
    }

    // 5. Construir payload y llamar al backend
    let formData: MatriculaFormData;
    try {
      formData = JSON.parse(formDataStr) as MatriculaFormData;
    } catch {
      this.cleanupSession();
      this.errorMessage = 'No se encontraron datos de matrícula';
      this.state = 'error';
      return;
    }

    const payload: GrabarMatriculaPayload = { ...formData, token_ws: tokenWs };

    try {
      await this.adminApi.grabarMatricula(payload);

      // 6. Éxito: construir resumen con nombre del curso
      let cursoNombre = `Curso ${formData.curso}`;
      try {
        const cursos = await this.adminApi.getCursos();
        const curso = cursos.find(c => c.cursoId === formData.curso);
        if (curso) {
          cursoNombre = `${curso.nivel} ${curso.letra}`;
        }
      } catch {
        // Si no se puede obtener el nombre, se mantiene el fallback
      }

      this.resumen = {
        nombreAlumno: formData.nombreAlumno,
        apellidosAlumno: formData.apellidosAlumno,
        rutAlumno: formData.rutAlumno,
        cursoNombre
      };

      this.cleanupSession();
      this.state = 'success';
    } catch (error) {
      console.error('Error al registrar matrícula:', error);
      this.cleanupSession();
      this.errorMessage = 'Hubo un problema al registrar la matrícula';
      this.state = 'error';
    }
  }

  private cleanupSession() {
    sessionStorage.removeItem('matriculaFormData');
  }

  navigateHome() {
    this.router.navigate(['/']);
  }

  navigateToMatriculas() {
    this.router.navigate(['/matriculas']);
  }
}
