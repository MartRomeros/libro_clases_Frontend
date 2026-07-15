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
    const params = this.route.snapshot.queryParams;
    const tbkToken = params['TBK_TOKEN'];
    const hasQueryParams = Object.keys(params).length > 0;

    if (tbkToken) {
      this.cleanupSession();
      this.state = 'cancelled';
      return;
    }

    if (!hasQueryParams) {
      this.cleanupSession();
      this.errorMessage = 'No se recibió información de pago válida';
      this.state = 'error';
      return;
    }

    // Mostrar éxito de inmediato: no depende de la carga del nombre del curso
    this.state = 'success';

    // Leer datos del formulario desde sessionStorage (puede no estar si se navega directo)
    let formData: MatriculaFormData | null = null;
    const formDataStr = sessionStorage.getItem('matriculaFormData');
    this.cleanupSession();
    if (formDataStr) {
      try {
        formData = JSON.parse(formDataStr) as MatriculaFormData;
      } catch {
        // Continuar sin form data
      }
    }

    if (!formData) {
      return;
    }

    let cursoNombre = `Curso ${formData.curso}`;
    try {
      const cursos = await this.adminApi.getCursos();
      const curso = cursos.find(c => c.cursoId === formData!.curso);
      if (curso) cursoNombre = `${curso.nivel} ${curso.letra}`;
    } catch {
      // Mantener fallback; el estado de éxito ya se mostró
    }

    this.resumen = {
      nombreAlumno: formData.nombreAlumno,
      apellidosAlumno: formData.apellidosAlumno,
      rutAlumno: formData.rutAlumno,
      cursoNombre
    };
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
