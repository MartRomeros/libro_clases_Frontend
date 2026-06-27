import {
  Component,
  effect,
  inject,
  signal,
  computed,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule, Location } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { injectMutation, injectQuery } from '@tanstack/angular-query-experimental';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ComunicacionesQueries } from '../data-access/comunicaciones.queries';
import { ComunicacionesMutations } from '../data-access/comunicaciones.mutations';
import { AuthQueries } from '../../auth/data-access/auth.queries';
import { EvaluationsApi } from '../../docente/data-access/evaluations.api';
import { LoadingStateComponent } from '../../../shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

interface Contacto {
  nombre: string;
  email: string;
  rol: 'Profesor' | 'Estudiante' | 'Grupo';
  avatar?: string;
}

const GROUP_EMAIL_PREFIX = 'GROUP:';

@Component({
  selector: 'app-comunicaciones-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatAutocompleteModule,
    MatOptionModule,
    MatSnackBarModule,
    FormsModule,
    ReactiveFormsModule,
    LoadingStateComponent,
    ErrorStateComponent,
    EmptyStateComponent,
  ],  
  templateUrl: './comunicaciones.page.component.html',
  styleUrl: './comunicaciones.page.component.css',
})
export class ComunicacionesPageComponent {
  private comunicacionesQueries = inject(ComunicacionesQueries);
  private comunicacionesMutations = inject(ComunicacionesMutations);
  private evaluationsApi = inject(EvaluationsApi);
  private authQueries = inject(AuthQueries);
  private location = inject(Location);
  private snackBar = inject(MatSnackBar);

  volverAtras() {
    this.location.back();
  }

  @ViewChild('editorRef') editorRef!: ElementRef<HTMLDivElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;
  @ViewChild('contactoInput') contactoInput?: ElementRef<HTMLInputElement>;
  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger?: MatAutocompleteTrigger;

  profileQuery = injectQuery(() => this.authQueries.me());
  profile = computed(() => this.profileQuery.data());
  conversacionesQuery = injectQuery(() =>
    this.comunicacionesQueries.conversaciones(this.profile()?.email),
  );
  enviarMensajeMutation = injectMutation(() => this.comunicacionesMutations.enviarMensaje());
  marcarComoLeidoMutation = injectMutation(() =>
    this.comunicacionesMutations.marcarComoLeido(this.profile()?.email || ''),
  );
  conversaciones = computed(() => this.conversacionesQuery.data() || []);
  inboxConversaciones = computed(() => this.conversaciones());
  isLoading = computed(() => this.conversacionesQuery.isLoading());
  hasError = computed(() => this.conversacionesQuery.isError());
  conversacionesError = computed(() => this.conversacionesQuery.error());
  selectedConvId = signal<string | null>(null);
  searchQuery = signal('');
  mostrandoNuevoMensaje = signal(false);
  archivosAdjuntos = signal<File[]>([]);
  isDragging = signal(false);

  contactoCtrl = new FormControl<string | Contacto | null>('');
  contactoValue = toSignal(this.contactoCtrl.valueChanges, { initialValue: '' });

  @HostListener('window:dragover', ['$event'])
  onWindowDragOver(event: DragEvent) {
    event.preventDefault();
  }

  @HostListener('window:drop', ['$event'])
  onWindowDrop(event: DragEvent) {
    event.preventDefault();
  }

  contactos = signal<Contacto[]>([]);
  private contactosCargados = signal(false);

  nuevoMensajeTexto = '';
  nuevoAsunto = '';
  enviarCopiaEmail = false;

  private esEmailDestinatarioValido(email: string | null | undefined): email is string {
    if (!email) return false;
    const limpio = email.trim();
    if (!limpio) return false;
    if (limpio.startsWith(GROUP_EMAIL_PREFIX)) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpio);
  }

  private readonly _cargarContactosCuandoHayPerfil = effect(() => {
    const user = this.profile();
    if (user && !this.contactosCargados()) {
      void this.cargarContactos();
    }
  });

  async cargarContactos() {
    const lista: Contacto[] = [
      { nombre: 'Todos los profesores', email: 'GROUP:PROFESORES', rol: 'Grupo' },
      { nombre: 'Todos los integrantes del curso', email: 'GROUP:ESTUDIANTES', rol: 'Grupo' },
    ];
    this.contactos.set(lista);

    const user = this.profile();
    if (!user) return;

    try {
      if (user.rol.nombre === 'Docente') {
        const cursos = await this.evaluationsApi.getCursos(user.usuario_id);
        const allStudents: Contacto[] = [];

        for (const curso of cursos) {
          const students = await this.evaluationsApi.getEstudiantesPorCurso(curso.cursoId);
          students.forEach((s) => {
            if (!this.esEmailDestinatarioValido(s.email)) {
              return;
            }

            if (!allStudents.some((as) => as.email === s.email)) {
              allStudents.push({
                nombre: s.estudianteFullName,
                email: s.email,
                rol: 'Estudiante',
              });
            }
          });
        }

        allStudents.forEach((s) => {
          if (!lista.some((l) => l.email === s.email)) {
            lista.push(s);
          }
        });
      }

      this.contactos.set(lista);
      this.contactosCargados.set(true);
      this.reabrirPanelSiEstaEnfocado();
    } catch (error) {
      console.error('Error cargando contactos:', error);
      this.contactos.set(lista);
      this.contactosCargados.set(true);
      this.reabrirPanelSiEstaEnfocado();
    }
  }

  private reabrirPanelSiEstaEnfocado(): void {
    setTimeout(() => {
      const inputEl = this.contactoInput?.nativeElement;
      if (inputEl && document.activeElement === inputEl) {
        this.autocompleteTrigger?.openPanel();
      }
    });
  }

  @HostListener('document:dragover', ['$event'])
  onGlobalDragOver(event: DragEvent) {
    event.preventDefault();
  }

  @HostListener('document:drop', ['$event'])
  onGlobalDrop(event: DragEvent) {
    event.preventDefault();
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.archivosAdjuntos.update((current) => [...current, ...(Array.from(files) as File[])]);
    }
  }

  private normalize(str: string | null | undefined): string {
    return (str || '')
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');
  }

  filteredContactos = computed(() => {
    const search = this.contactoValue();
    if (search && typeof search === 'object') {
      return [];
    }
    const searchStr = this.normalize(typeof search === 'string' ? search : (search as any)?.nombre);

    return this.contactos().filter(
      (c) =>
        this.normalize(c.nombre).includes(searchStr) || this.normalize(c.email).includes(searchStr),
    );
  });

  displayContacto(contacto: any): string {
    return contacto ? (typeof contacto === 'string' ? contacto : contacto.nombre) : '';
  }

  onContactoSelected(event: MatAutocompleteSelectedEvent) {
    const contacto = event.option.value;
    this.contactoCtrl.setValue(contacto, { emitEvent: false });
    this.autocompleteTrigger?.closePanel();
    setTimeout(() => this.contactoInput?.nativeElement.blur(), 0);
  }

  abrirSugerencias() {
    if (this.contactoCtrl.value && typeof this.contactoCtrl.value === 'object') {
      return;
    }
    setTimeout(() => this.autocompleteTrigger?.openPanel());
  }

  filteredConversaciones = computed(() => {
    const query = this.normalize(this.searchQuery());
    const conversacionesVisibles = this.inboxConversaciones();

    if (!query) return conversacionesVisibles;

    return conversacionesVisibles.filter(
      (c) =>
        c.participantes.some(
          (p) => this.normalize(p.nombre).includes(query) || this.normalize(p.id).includes(query),
        ) ||
        this.normalize(c.asunto).includes(query) ||
        this.normalize(c.ultimoMensaje).includes(query),
    );
  });

  selectedConv = computed(() => {
    const id = this.selectedConvId();
    return id ? this.conversaciones().find((c) => c.id === id) || null : null;
  });

  sidebarDescription = computed(() =>
    this.inboxConversaciones().length > 0
      ? `${this.inboxConversaciones().length} conversaciones en tu bandeja`
      : 'Tu bandeja de entrada está vacía',
  );

  mensajeEsValido() {
    const dest = this.contactoCtrl.value;
    const hasRecipient =
      dest && (typeof dest === 'object' || (typeof dest === 'string' && dest.includes('@')));
    return (
      (this.nuevoMensajeTexto.trim().length > 0 || this.archivosAdjuntos().length > 0) &&
      (this.mostrandoNuevoMensaje() ? hasRecipient : true)
    );
  }

  seleccionarConversacion(id: string) {
    this.selectedConvId.set(id);
    this.mostrandoNuevoMensaje.set(false);
    this.nuevoMensajeTexto = '';
    this.archivosAdjuntos.set([]);
    if (this.editorRef) this.editorRef.nativeElement.innerHTML = '';

    const conv = this.conversaciones().find((c) => c.id === id);
    if (conv) {
      conv.mensajes.forEach((m) => {
        if (!m.leido && !m.esMio) {
          this.marcarComoLeidoMutation.mutate(m.id);
        }
      });
    }
  }

  crearNuevoMensaje() {
    this.selectedConvId.set(null);
    this.mostrandoNuevoMensaje.set(true);
    this.nuevoMensajeTexto = '';
    this.nuevoAsunto = '';
    this.contactoCtrl.setValue('');
    this.archivosAdjuntos.set([]);
    this.enviarCopiaEmail = true;
    this.isDragging.set(false);
    if (this.editorRef) this.editorRef.nativeElement.innerHTML = '';
    if (this.contactos().length === 0) {
      void this.cargarContactos();
    }
  }

  reintentarConversaciones() {
    this.conversacionesQuery.refetch();
  }

  ejecutarComando(comando: string, valor: any = null) {
    document.execCommand(comando, false, valor);
    this.onEditorInput();
    this.editorRef.nativeElement.focus();
  }

  onEditorInput() {
    this.nuevoMensajeTexto = this.editorRef.nativeElement.innerHTML;
  }

  adjuntarArchivo() {
    this.fileInput.nativeElement.click();
  }

  insertarImagen() {
    this.imageInput.nativeElement.click();
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64Image = e.target.result;
        this.ejecutarComando('insertImage', base64Image);
      };
      reader.readAsDataURL(file);
    }
    this.imageInput.nativeElement.value = '';
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files.length > 0) {
      this.archivosAdjuntos.update((current) => [...current, ...(Array.from(files) as File[])]);
    }
  }

  eliminarAdjunto(file: File) {
    this.archivosAdjuntos.update((current) => current.filter((f) => f !== file));
  }

  enviarMensaje() {
    if (
      (!this.nuevoMensajeTexto.trim() && this.archivosAdjuntos().length === 0) ||
      !this.selectedConvId()
    )
      return;

    const archivo = this.archivosAdjuntos().length > 0 ? this.archivosAdjuntos()[0] : undefined;

    const user = this.profile();
    if (!user?.email) return;

    this.enviarMensajeMutation.mutate(
      {
        quienEnvia: user.email,
        quienRecibe: this.selectedConvId()!,
        cuerpo: this.nuevoMensajeTexto,
        asunto: this.selectedConv()?.asunto || 'Sin asunto',
        archivo,
      },
      {
        onSuccess: () => {
          this.conversacionesQuery.refetch();
          this.snackBar.open('Mensaje enviado', 'Cerrar', { duration: 3000 });
          this.nuevoMensajeTexto = '';
          this.archivosAdjuntos.set([]);
          if (this.editorRef) this.editorRef.nativeElement.innerHTML = '';
        },
      },
    );
  }

  enviarNuevoMensaje() {
    const destValue = this.contactoCtrl.value;
    if (!destValue || !this.mensajeEsValido()) return;

    const destinatario = typeof destValue === 'object' ? (destValue as Contacto).email : destValue;

    const archivo = this.archivosAdjuntos().length > 0 ? this.archivosAdjuntos()[0] : undefined;

    const user = this.profile();
    if (!user?.email) return;

    this.enviarMensajeMutation.mutate(
      {
        quienEnvia: user.email,
        quienRecibe: destinatario,
        cuerpo: this.nuevoMensajeTexto,
        asunto: this.nuevoAsunto || 'Sin asunto',
        archivo,
        enviarCopiaEmail: this.enviarCopiaEmail,
      },
      {
        onSuccess: (resp) => {
          this.conversacionesQuery.refetch();
          this.snackBar.open(resp.mensaje || 'Mensaje enviado', 'Cerrar', { duration: 3000 });
          if (!destinatario.startsWith('GROUP:')) {
            this.seleccionarConversacion(destinatario);
          } else {
            this.mostrandoNuevoMensaje.set(false);
          }
          this.nuevoMensajeTexto = '';
          this.nuevoAsunto = '';
          this.contactoCtrl.setValue('');
          this.archivosAdjuntos.set([]);
          this.enviarCopiaEmail = false;
        },
      },
    );
  }
}
