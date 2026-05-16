import {
  Component,
  inject,
  signal,
  computed,
  ViewChild,
  ElementRef,
  OnInit,
  HostListener,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { CommonModule, Location } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { injectMutation, injectQuery } from '@tanstack/angular-query-experimental';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ComunicacionesApi } from '../data-access/comunicaciones.api';
import { ComunicacionesQueries } from '../data-access/comunicaciones.queries';
import { ComunicacionesMutations } from '../data-access/comunicaciones.mutations';
import { Conversacion } from '../models/mensaje.model';
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
  animations: [
    trigger('listAnimation', [
      transition('* <=> *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(10px)' }),
            stagger(30, [
              animate(
                '300ms cubic-bezier(0.4, 0, 0.2, 1)',
                style({ opacity: 1, transform: 'translateY(0)' }),
              ),
            ]),
          ],
          { optional: true },
        ),
        query(
          ':leave',
          [
            animate(
              '200ms ease-in',
              style({ opacity: 0, transform: 'scale(0.95)', height: 0, padding: 0, margin: 0 }),
            ),
          ],
          { optional: true },
        ),
      ]),
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms ease-out', style({ opacity: 1 })),
      ]),
    ]),
  ],
  template: `
    <div class="comunicaciones-container">
      <!-- Sidebar -->
      <aside class="conversaciones-sidebar">
        <div class="sidebar-header">
          <div class="sidebar-title-block">
            <button mat-icon-button class="btn-back" (click)="volverAtras()" matTooltip="Volver">
              <mat-icon>arrow_back</mat-icon>
            </button>
            <h2>Mensajes</h2>
          </div>
          <button mat-flat-button color="primary" class="btn-nuevo" (click)="crearNuevoMensaje()">
            <mat-icon>edit</mat-icon>
            Nuevo mensaje
          </button>
        </div>

        <div class="search-container">
          <mat-form-field appearance="outline" class="full-width no-padding">
            <mat-icon matPrefix>search</mat-icon>
            <input
              matInput
              placeholder="Buscar mensajes..."
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)"
            />
          </mat-form-field>
        </div>

        @if (isLoading()) {
          <div class="sidebar-state">
            <app-loading-state message="Cargando conversaciones..." />
          </div>
        } @else if (hasError()) {
          <div class="sidebar-state">
            <app-error-state
              [error]="conversacionesError()"
              title="No se pudieron cargar los mensajes"
              message="Intenta nuevamente para actualizar tus conversaciones."
              (retry)="reintentarConversaciones()"
            />
          </div>
        }

        @if (!isLoading() && !hasError()) {
          <div class="conversaciones-lista" [@listAnimation]="filteredConversaciones().length">
            @for (conv of filteredConversaciones(); track conv.id) {
              <div
                class="conversacion-item"
                [class.active]="selectedConvId() === conv.id"
                [class.unread]="conv.sinLeerCount > 0"
                (click)="seleccionarConversacion(conv.id)"
              >
                <div class="avatar-placeholder">
                  {{ conv.participantes[0].nombre[0] }}
                </div>
                <div class="conv-info">
                  <div class="conv-header">
                    <span class="conv-nombre">{{ conv.participantes[0].nombre }}</span>
                    <span class="conv-fecha">{{ conv.fechaUltimoMensaje | date: 'HH:mm' }}</span>
                  </div>
                  <div class="conv-asunto">{{ conv.asunto }}</div>
                  <div class="conv-last-msg">
                    @if (conv.tieneAdjuntos) {
                      <mat-icon class="inline-clip">attach_file</mat-icon>
                    }
                    {{ conv.ultimoMensaje }}
                  </div>
                </div>
              </div>
            } @empty {
              <div class="sidebar-state compact">
                <app-empty-state
                  icon="mail"
                  title="Sin conversaciones"
                  message="No se encontraron mensajes para los filtros aplicados."
                />
              </div>
            }
          </div>
        }
      </aside>

      <!-- Main Content -->
      <main class="conversacion-detalle">
        @if (selectedConv(); as conv) {
          <div class="detalle-header">
            <div class="header-info">
              <h3>{{ conv.asunto }}</h3>
              <p>Con {{ conv.participantes[0].nombre }}</p>
            </div>
            <div class="header-actions">
              <button mat-icon-button><mat-icon>more_vert</mat-icon></button>
            </div>
          </div>

          <div class="mensajes-thread" #scrollContainer>
            @for (msg of conv.mensajes; track msg.id) {
              <div class="mensaje-wrapper" [class.es-mio]="msg.esMio" @fadeIn>
                <div class="mensaje-bubble">
                  <div class="mensaje-contenido" [innerHTML]="msg.contenido"></div>

                  @if (msg.adjuntos && msg.adjuntos.length > 0) {
                    <div class="mensaje-adjuntos">
                      @for (adj of msg.adjuntos; track adj.nombre) {
                        <a
                          [href]="adj.url"
                          [download]="adj.nombre"
                          class="msg-adjunto-item link-adjunto"
                          target="_blank"
                          matTooltip="Click para descargar"
                        >
                          <mat-icon>attach_file</mat-icon>
                          <span>{{ adj.nombre }}</span>
                        </a>
                      }
                    </div>
                  }

                  <div class="mensaje-footer">
                    {{ msg.fechaEnvio | date: 'HH:mm' }}
                    @if (msg.esMio) {
                      <mat-icon class="status-icon">done_all</mat-icon>
                    }
                  </div>
                </div>
              </div>
            }
          </div>

          <div class="detalle-input rich-reply">
            <div
              class="rich-editor-wrapper"
              [class.dragging]="isDragging()"
              (dragover)="onDragOver($event)"
              (dragleave)="onDragLeave($event)"
              (drop)="onDrop($event)"
            >
              @if (isDragging()) {
                <div class="drop-zone-overlay">
                  <mat-icon>cloud_upload</mat-icon>
                  <p>Suelta los archivos aquí para adjuntarlos</p>
                </div>
              }

              <div class="editor-toolbar">
                <div class="toolbar-group">
                  <button
                    mat-icon-button
                    (mousedown)="$event.preventDefault(); ejecutarComando('bold')"
                    type="button"
                    matTooltip="Negrita"
                  >
                    <mat-icon>format_bold</mat-icon>
                  </button>
                  <button
                    mat-icon-button
                    (mousedown)="$event.preventDefault(); ejecutarComando('italic')"
                    type="button"
                    matTooltip="Cursiva"
                  >
                    <mat-icon>format_italic</mat-icon>
                  </button>
                  <button
                    mat-icon-button
                    (mousedown)="$event.preventDefault(); ejecutarComando('underline')"
                    type="button"
                    matTooltip="Subrayado"
                  >
                    <mat-icon>format_underlined</mat-icon>
                  </button>
                </div>
                <mat-divider vertical></mat-divider>
                <div class="toolbar-group">
                  <button
                    mat-icon-button
                    (mousedown)="$event.preventDefault(); ejecutarComando('insertUnorderedList')"
                    type="button"
                    matTooltip="Lista"
                  >
                    <mat-icon>format_list_bulleted</mat-icon>
                  </button>
                </div>
                <mat-divider vertical></mat-divider>
                <div class="toolbar-group">
                  <button
                    mat-icon-button
                    (mousedown)="$event.preventDefault(); adjuntarArchivo()"
                    type="button"
                    matTooltip="Adjuntar archivo"
                  >
                    <mat-icon>attach_file</mat-icon>
                  </button>
                  <button
                    mat-icon-button
                    (mousedown)="$event.preventDefault(); insertarImagen()"
                    type="button"
                    matTooltip="Insertar imagen"
                  >
                    <mat-icon>insert_photo</mat-icon>
                  </button>
                </div>
                <input
                  type="file"
                  #fileInput
                  (change)="onFileSelected($event)"
                  style="display: none"
                  multiple
                />
                <input
                  type="file"
                  #imageInput
                  (change)="onImageSelected($event)"
                  style="display: none"
                  accept="image/*"
                />
              </div>

              <div
                class="editor-content"
                contenteditable="true"
                #editorRef
                (input)="onEditorInput()"
                placeholder="Escribe un mensaje..."
                style="min-height: 100px;"
              ></div>

              <div class="editor-footer-actions">
                @if (archivosAdjuntos().length > 0) {
                  <div class="adjuntos-mini-lista">
                    @for (file of archivosAdjuntos(); track file.name) {
                      <span class="adjunto-tag">
                        <mat-icon>attach_file</mat-icon>
                        {{ file.name }}
                        <mat-icon class="remove-icon" (click)="eliminarAdjunto(file)"
                          >close</mat-icon
                        >
                      </span>
                    }
                  </div>
                }
                <button
                  mat-fab
                  extended
                  color="primary"
                  (click)="enviarMensaje()"
                  [disabled]="!nuevoMensajeTexto.trim() && archivosAdjuntos().length === 0"
                >
                  <mat-icon>send</mat-icon>
                  Enviar
                </button>
              </div>
            </div>
          </div>
        } @else if (mostrandoNuevoMensaje()) {
          <div class="nuevo-mensaje-view">
            <div class="detalle-header">
              <h3>Nuevo mensaje</h3>
              <button mat-icon-button (click)="mostrandoNuevoMensaje.set(false)">
                <mat-icon>close</mat-icon>
              </button>
            </div>
            <div class="nuevo-mensaje-form">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Para:</mat-label>
                <input
                  matInput
                  placeholder="Escriba un miembro o grupo"
                  [formControl]="contactoCtrl"
                  [matAutocomplete]="auto"
                />
                <mat-icon matSuffix>person_add</mat-icon>
                <mat-autocomplete
                  #auto="matAutocomplete"
                  [displayWith]="displayContacto"
                  (optionSelected)="onContactoSelected($event)"
                >
                  @for (contacto of filteredContactos(); track contacto.email) {
                    <mat-option [value]="contacto" @fadeIn>
                      <div class="contacto-option">
                        <div class="contacto-avatar">
                          @if (contacto.rol === 'Grupo') {
                            <mat-icon>groups</mat-icon>
                          } @else {
                            <mat-icon>person</mat-icon>
                          }
                        </div>
                        <div class="contacto-info">
                          <div class="contacto-nombre">{{ contacto.nombre }}</div>
                          @if (contacto.rol !== 'Grupo') {
                            <div class="contacto-email">{{ contacto.email }}</div>
                          }
                        </div>
                        <span class="contacto-rol">{{ contacto.rol }}</span>
                      </div>
                    </mat-option>
                  }
                </mat-autocomplete>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Asunto:</mat-label>
                <input matInput placeholder="Asunto del mensaje" [(ngModel)]="nuevoAsunto" />
              </mat-form-field>

              <div
                class="rich-editor-wrapper"
                [class.dragging]="isDragging()"
                (dragover)="onDragOver($event)"
                (dragleave)="onDragLeave($event)"
                (drop)="onDrop($event)"
              >
                @if (isDragging()) {
                  <div class="drop-zone-overlay">
                    <mat-icon>cloud_upload</mat-icon>
                    <p>Suelta los archivos aquí para adjuntarlos</p>
                  </div>
                }

                <div class="editor-toolbar">
                  <div class="toolbar-group">
                    <button
                      mat-icon-button
                      (mousedown)="$event.preventDefault(); ejecutarComando('bold')"
                      type="button"
                      matTooltip="Negrita"
                    >
                      <mat-icon>format_bold</mat-icon>
                    </button>
                    <button
                      mat-icon-button
                      (mousedown)="$event.preventDefault(); ejecutarComando('italic')"
                      type="button"
                      matTooltip="Cursiva"
                    >
                      <mat-icon>format_italic</mat-icon>
                    </button>
                    <button
                      mat-icon-button
                      (mousedown)="$event.preventDefault(); ejecutarComando('underline')"
                      type="button"
                      matTooltip="Subrayado"
                    >
                      <mat-icon>format_underlined</mat-icon>
                    </button>
                  </div>
                  <mat-divider vertical></mat-divider>
                  <div class="toolbar-group">
                    <button
                      mat-icon-button
                      (mousedown)="$event.preventDefault(); ejecutarComando('insertUnorderedList')"
                      type="button"
                      matTooltip="Lista"
                    >
                      <mat-icon>format_list_bulleted</mat-icon>
                    </button>
                  </div>
                  <mat-divider vertical></mat-divider>
                  <div class="toolbar-group">
                    <button
                      mat-icon-button
                      (mousedown)="$event.preventDefault(); adjuntarArchivo()"
                      type="button"
                      matTooltip="Adjuntar archivo"
                    >
                      <mat-icon>attach_file</mat-icon>
                    </button>
                    <button
                      mat-icon-button
                      (mousedown)="$event.preventDefault(); insertarImagen()"
                      type="button"
                      matTooltip="Insertar imagen"
                    >
                      <mat-icon>insert_photo</mat-icon>
                    </button>
                  </div>
                  <input
                    type="file"
                    #fileInput
                    (change)="onFileSelected($event)"
                    style="display: none"
                    multiple
                  />
                  <input
                    type="file"
                    #imageInput
                    (change)="onImageSelected($event)"
                    style="display: none"
                    accept="image/*"
                  />
                </div>

                <div
                  class="editor-content"
                  contenteditable="true"
                  #editorRef
                  (input)="onEditorInput()"
                  placeholder="Escribe un mensaje..."
                ></div>
              </div>

              @if (archivosAdjuntos().length > 0) {
                <div class="adjuntos-lista">
                  @for (file of archivosAdjuntos(); track file.name) {
                    <div class="adjunto-item">
                      <mat-icon>description</mat-icon>
                      <span class="file-name">{{ file.name }}</span>
                      <button mat-icon-button color="warn" (click)="eliminarAdjunto(file)">
                        <mat-icon>close</mat-icon>
                      </button>
                    </div>
                  }
                </div>
              }

              <div class="form-footer">
                <label class="checkbox-container" style="display: none;">
                  <input type="checkbox" [(ngModel)]="enviarCopiaEmail" /> Enviar una copia por
                  correo electrónico a los destinatarios
                </label>
                <button
                  mat-flat-button
                  color="primary"
                  (click)="enviarNuevoMensaje()"
                  [disabled]="!mensajeEsValido()"
                >
                  <mat-icon>send</mat-icon>
                  Enviar
                </button>
              </div>
            </div>
          </div>
        } @else {
          <div class="empty-state">
            <app-empty-state
              icon="mark_email_unread"
              title="Comenzar un nuevo mensaje"
              message="Seleccione una conversación o envíe un mensaje nuevo para comenzar."
              actionLabel="Redactar mensaje"
              (action)="crearNuevoMensaje()"
            />
          </div>
        }
      </main>
    </div>
  `,
  styles: [
    `
      /* Look más limpio/profesional para comunicaciones */

      .comunicaciones-container {
        display: flex;
        height: calc(100vh - 110px);
        margin: 12px;
        border-radius: 18px;
        overflow: hidden;
        background: #f8fafc;
        border: 1px solid #e5e7eb;
      }

      /* Sidebar */
      .conversaciones-sidebar {
        width: clamp(280px, 28vw, 340px);
        background: #ffffff;
        border-right: 1px solid #e5e7eb;
        display: flex;
        flex-direction: column;
        box-shadow: none;
        z-index: 2;
      }

      .sidebar-header {
        padding: 20px 20px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
      }

      .sidebar-title-block {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .sidebar-header h2 {
        margin: 0;
        font-size: 1.45rem;
        font-weight: 800;
        color: #0f172a;
        letter-spacing: -0.03em;
      }

      .btn-back {
        width: 38px;
        height: 38px;
        border: 1px solid #dbeafe;
        background: #eff6ff;
        color: #1d4ed8;
      }

      .btn-nuevo {
        height: 40px;
        border-radius: 10px;
        padding: 0 16px;
        font-weight: 650;
        box-shadow: none;
      }

      .search-container {
        padding: 0 20px 16px;
      }

      .sidebar-state {
        padding: 0 20px 16px;
      }

      .conversaciones-lista {
        flex: 1;
        overflow-y: auto;
      }

      .conversacion-item {
        display: flex;
        padding: 14px 18px;
        gap: 12px;
        cursor: pointer;
        transition:
          background 0.18s ease,
          box-shadow 0.18s ease;
        border-bottom: 1px solid #f1f5f9;
        position: relative;
      }

      .conversacion-item:hover {
        background: #f8fafc;
      }

      .conversacion-item.active {
        background: #eff6ff;
        box-shadow: inset 0 0 0 1px #dbeafe;
      }

      .conversacion-item.active::before {
        content: '';
        position: absolute;
        left: 0;
        top: 10px;
        bottom: 10px;
        width: 3px;
        border-radius: 999px;
        background: #2563eb;
      }

      .conversacion-item.unread {
        background: #f8fbff;
      }

      .avatar-placeholder {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: linear-gradient(135deg, #3b82f6, #2563eb);
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 750;
        font-size: 1rem;
        flex-shrink: 0;
        box-shadow: none;
      }

      .conv-info {
        flex: 1;
        min-width: 0;
      }

      .conv-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 3px;
        align-items: baseline;
        gap: 10px;
      }

      .conv-nombre {
        font-weight: 650;
        color: #0f172a;
        font-size: 0.92rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .conv-fecha {
        font-size: 0.72rem;
        color: #94a3b8;
        font-weight: 500;
      }

      .conv-asunto {
        font-size: 0.86rem;
        font-weight: 600;
        color: #334155;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-bottom: 2px;
      }

      .conv-last-msg {
        font-size: 0.8rem;
        color: #94a3b8;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .unread .conv-nombre,
      .unread .conv-asunto {
        font-weight: 800;
        color: #0f172a;
      }

      .unread .conv-last-msg {
        color: #475569;
        font-weight: 600;
      }

      /* Detalle */
      .conversacion-detalle {
        flex: 1;
        display: flex;
        flex-direction: column;
        background: #f5f7fb;
        position: relative;
      }

      .detalle-header {
        padding: 16px 24px;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #ffffff;
        z-index: 1;
      }

      .detalle-header h3 {
        margin: 0;
        font-size: 1.15rem;
        font-weight: 800;
        color: #0f172a;
        letter-spacing: -0.02em;
      }

      .detalle-header p {
        margin: 2px 0 0;
        font-size: 0.84rem;
        color: #64748b;
        font-weight: 500;
      }

      .mensajes-thread {
        flex: 1;
        padding: 20px 24px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
        background: #f5f7fb;
      }

      .mensaje-wrapper {
        display: flex;
        flex-direction: column;
        max-width: 65%;
      }

      .mensaje-wrapper.es-mio {
        align-self: flex-end;
        align-items: flex-end;
      }

      .mensaje-bubble {
        padding: 12px 16px;
        border-radius: 14px;
        background: #ffffff;
        border: 1px solid #edf2f7;
        box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
        color: #334155;
        font-size: 0.92rem;
        line-height: 1.5;
      }

      .es-mio .mensaje-bubble {
        background: #2563eb;
        color: #ffffff;
        border-color: #2563eb;
        border-bottom-right-radius: 6px;
        box-shadow: 0 2px 8px rgba(37, 99, 235, 0.16);
      }

      .mensaje-wrapper:not(.es-mio) .mensaje-bubble {
        border-bottom-left-radius: 6px;
      }

      .mensaje-footer {
        font-size: 0.72rem;
        margin-top: 5px;
        display: flex;
        align-items: center;
        gap: 5px;
        color: #94a3b8;
        font-weight: 500;
      }

      .status-icon {
        font-size: 15px;
        width: 15px;
        height: 15px;
        color: #2563eb;
      }

      /* Adjuntos */
      .mensaje-adjuntos {
        margin-top: 10px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        border-top: 1px solid rgba(15, 23, 42, 0.08);
        padding-top: 8px;
      }

      .es-mio .mensaje-adjuntos {
        border-top-color: rgba(255, 255, 255, 0.22);
      }

      .msg-adjunto-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.78rem;
        background: rgba(15, 23, 42, 0.04);
        padding: 6px 10px;
        border-radius: 8px;
        text-decoration: none;
        color: inherit;
        transition:
          background 0.18s ease,
          transform 0.18s ease;
      }

      .link-adjunto:hover {
        background: rgba(15, 23, 42, 0.08);
        transform: translateY(-1px);
      }

      .es-mio .msg-adjunto-item {
        background: rgba(255, 255, 255, 0.16);
      }

      /* Editor */
      .detalle-input,
      .rich-reply {
        padding: 16px 24px 24px;
        background: transparent;
        border-top: 1px solid #e5e7eb;
      }

      .rich-editor-wrapper {
        border: 1px solid #e5e7eb;
        border-radius: 18px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        min-height: 180px;
        position: relative;
        transition:
          border 0.18s ease,
          box-shadow 0.18s ease;
        background: #ffffff;
        box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
      }

      .rich-editor-wrapper:focus-within {
        border-color: #93c5fd;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
      }

      .rich-editor-wrapper.dragging {
        border: 2px dashed #2563eb;
        background: #eff6ff;
      }

      .editor-toolbar {
        padding: 7px 12px;
        background: #f8fafc;
        border-bottom: 1px solid #edf2f7;
        display: flex;
        gap: 10px;
        color: #64748b;
        align-items: center;
      }

      .toolbar-group {
        display: flex;
        gap: 2px;
      }

      .editor-toolbar mat-divider {
        height: 22px;
        margin: 0 2px;
      }

      .editor-toolbar button {
        width: 32px;
        height: 32px;
        line-height: 32px;
        border-radius: 8px;
      }

      .editor-toolbar button:hover {
        background: #e2e8f0;
        color: #2563eb;
      }

      .editor-toolbar mat-icon {
        font-size: 19px;
      }

      .editor-content {
        padding: 16px 20px;
        flex: 1;
        outline: none;
        font-size: 0.94rem;
        line-height: 1.55;
        overflow-y: auto;
        min-height: 80px;
      }

      .editor-content:empty:before {
        content: attr(placeholder);
        color: #94a3b8;
      }

      .editor-footer-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        background: #ffffff;
        border-top: 1px solid #f1f5f9;
      }

      .editor-footer-actions button {
        box-shadow: none;
      }

      /* Nuevo mensaje */
      .nuevo-mensaje-view {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: #ffffff;
      }

      .nuevo-mensaje-form {
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        flex: 1;
        overflow-y: auto;
      }

      /* Adjuntos editor */
      .adjuntos-mini-lista,
      .adjuntos-lista {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .adjunto-tag,
      .adjunto-item {
        display: flex;
        align-items: center;
        gap: 6px;
        background: #f1f5f9;
        padding: 5px 9px;
        border-radius: 999px;
        font-size: 0.78rem;
        color: #475569;
        border: 1px solid #e2e8f0;
      }

      .adjunto-tag .mat-icon,
      .adjunto-item .mat-icon {
        font-size: 15px;
        width: 15px;
        height: 15px;
      }

      .remove-icon {
        cursor: pointer;
        color: #94a3b8;
      }

      .remove-icon:hover {
        color: #ef4444;
      }

      /* Empty */
      .empty-state {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 32px;
        text-align: center;
        background: #f5f7fb;
      }

      /* Responsive */
      @media (max-width: 900px) {
        .comunicaciones-container {
          margin: 0;
          border-radius: 0;
          height: calc(100vh - 80px);
        }

        .conversaciones-sidebar {
          width: 300px;
        }

        .mensaje-wrapper {
          max-width: 82%;
        }

        .btn-nuevo {
          padding: 0 12px;
        }
      }

      @media (max-width: 700px) {
        .comunicaciones-container {
          flex-direction: column;
        }

        .conversaciones-sidebar {
          width: 100%;
          max-height: 42vh;
          border-right: none;
          border-bottom: 1px solid #e5e7eb;
        }

        .mensajes-thread {
          padding: 16px;
        }

        .detalle-header {
          padding: 14px 16px;
        }

        .rich-reply {
          padding: 12px;
        }

        .mensaje-wrapper {
          max-width: 90%;
        }
      }
    `,
  ],
})
export class ComunicacionesPageComponent implements OnInit {
  private comunicacionesQueries = inject(ComunicacionesQueries);
  private comunicacionesMutations = inject(ComunicacionesMutations);
  private comunicacionesApi = inject(ComunicacionesApi);
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

  profileQuery = injectQuery(() => this.authQueries.me());
  profile = computed(() => this.profileQuery.data());
  conversacionesQuery = injectQuery(() =>
    this.comunicacionesQueries.conversaciones(this.profile()?.email),
  );
  usuariosQuery = injectQuery(() => this.comunicacionesQueries.usuarios());
  enviarMensajeMutation = injectMutation(() => this.comunicacionesMutations.enviarMensaje());
  marcarComoLeidoMutation = injectMutation(() =>
    this.comunicacionesMutations.marcarComoLeido(this.profile()?.email || ''),
  );
  conversaciones = computed(() => this.conversacionesQuery.data() || []);
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

  // Global drag listeners to prevent default browser behavior
  @HostListener('window:dragover', ['$event'])
  onWindowDragOver(event: DragEvent) {
    event.preventDefault();
  }

  @HostListener('window:drop', ['$event'])
  onWindowDrop(event: DragEvent) {
    event.preventDefault();
  }

  // Contactos logic
  contactos = signal<Contacto[]>([]);

  nuevoMensajeTexto = '';
  nuevoAsunto = '';
  enviarCopiaEmail = false;

  ngOnInit() {
    this.cargarContactos();
  }

  async cargarContactos() {
    const user = this.profile();
    if (!user) return;

    const lista: Contacto[] = [
      { nombre: 'Todos los profesores', email: 'GROUP:PROFESORES', rol: 'Grupo' },
      { nombre: 'Todos los integrantes del curso', email: 'GROUP:ESTUDIANTES', rol: 'Grupo' },
    ];

    try {
      // Obtener todos los usuarios del sistema
      const usuarios =
        this.usuariosQuery.data() || (await this.comunicacionesApi.getTodosLosUsuarios());

      const dbContacts: Contacto[] = usuarios
        .filter((u) => u.email !== user.email && u.activo)
        .map((u) => ({
          nombre:
            `${u.nombre} ${u.apellidoPaterno || u.apellido_paterno || ''} ${u.apellidoMaterno || u.apellido_materno || ''}`
              .trim()
              .replace(/\s+/g, ' '),
          email: u.email,
          rol: u.rolId === 2 ? 'Profesor' : u.rolId === 3 ? 'Estudiante' : 'Profesor',
        }));

      if (user.rol.nombre === 'Docente') {
        const cursos = await this.evaluationsApi.getCursos(user.usuario_id);
        const allStudents: Contacto[] = [];

        for (const curso of cursos) {
          const students = await this.evaluationsApi.getEstudiantesPorCurso(curso.cursoId);
          students.forEach((s) => {
            if (!allStudents.some((as) => as.email === s.email)) {
              allStudents.push({
                nombre: s.estudianteFullName,
                email: s.email || `${s.estudianteId}@estudiante.cl`, // Fallback
                rol: 'Estudiante',
              });
            }
          });
        }

        dbContacts.forEach((dbc) => {
          if (!lista.some((l) => l.email === dbc.email)) {
            lista.push(dbc);
          }
        });

        allStudents.forEach((s) => {
          // If the student from the course is not in the list, add them
          if (!lista.some((l) => l.email === s.email)) {
            lista.push(s);
          }
        });
      } else {
        dbContacts.forEach((dbc) => {
          lista.push(dbc);
        });
      }

      this.contactos.set(lista);
    } catch (error) {
      console.error('Error cargando contactos:', error);
      this.contactos.set(lista);
    }
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
      .replace(/[\u0300-\u036f]/g, '');
  }

  filteredContactos = computed(() => {
    const search = this.contactoValue();
    const searchStr = this.normalize(typeof search === 'string' ? search : (search as any)?.nombre);

    return this.contactos().filter(
      (c) =>
        this.normalize(c.nombre).includes(searchStr) || this.normalize(c.email).includes(searchStr),
    );
  });

  displayContacto(contacto: any): string {
    return contacto ? (typeof contacto === 'string' ? contacto : contacto.nombre) : '';
  }

  onContactoSelected(event: any) {
    const contacto = event.option.value;
    // El valor ahora es el objeto contacto completo
  }

  filteredConversaciones = computed(() => {
    const query = this.normalize(this.searchQuery());
    const allConvs = this.conversaciones();

    // Filtrar para mostrar solo conversaciones con mensajes recibidos (In-box)
    const recibidosOnly = allConvs.filter((c) => c.mensajes.some((m) => !m.esMio));

    if (!query) return recibidosOnly;

    return recibidosOnly.filter(
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
    this.enviarCopiaEmail = false;
    this.isDragging.set(false);
    if (this.editorRef) this.editorRef.nativeElement.innerHTML = '';
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
    // Limpiar input
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

    // We take the first attachment for now as the service expects one,
    // but we could map multiple if the backend supports it.
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

    // Si es un objeto contacto, usamos su email (o group ID)
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
          this.snackBar.open(resp.mensaje || 'Mensaje enviado', 'Cerrar', { duration: 3000 });
          // No seleccionamos la conversación si es masiva o si queremos seguir la regla de solo recibidos
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
