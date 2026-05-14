import { Component, inject, signal, computed, ViewChild, ElementRef, OnInit, HostListener } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { injectMutation, injectQuery } from '@tanstack/angular-query-experimental';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ComunicacionesApi } from '../data-access/comunicaciones.api';
import { ComunicacionesQueries } from '../data-access/comunicaciones.queries';
import { ComunicacionesMutations } from '../data-access/comunicaciones.mutations';
import { Conversacion } from '../models/mensaje.model';
import { AuthQueries } from '../../auth/data-access/auth.queries';
import { EvaluationsApi } from '../../docente/data-access/evaluations.api';
import { Navbar } from '../../../layout/navbar/navbar';

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
    MatProgressSpinnerModule,
    MatAutocompleteModule,
    MatOptionModule,
    MatSnackBarModule,
    FormsModule,
    ReactiveFormsModule,
    Navbar
  ],
  animations: [
    trigger('listAnimation', [
      transition('* <=> *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(10px)' }),
          stagger(30, [
            animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true }),
        query(':leave', [
          animate('200ms ease-in', style({ opacity: 0, transform: 'scale(0.95)', height: 0, padding: 0, margin: 0 }))
        ], { optional: true })
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms ease-out', style({ opacity: 1 }))
      ])
    ])
  ],
  template: `
    <app-navbar/>

    <div class="comunicaciones-container">
      <!-- Sidebar -->
      <aside class="conversaciones-sidebar">
        <div class="sidebar-header">
          <h2>Mensajes</h2>
          <button mat-flat-button color="primary" class="btn-nuevo" (click)="crearNuevoMensaje()">
            <mat-icon>edit</mat-icon>
            Nuevo mensaje
          </button>
        </div>
        
        <div class="search-container">
          <mat-form-field appearance="outline" class="full-width no-padding">
            <mat-icon matPrefix>search</mat-icon>
            <input matInput placeholder="Buscar mensajes..." 
                   [ngModel]="searchQuery()" 
                   (ngModelChange)="searchQuery.set($event)">
          </mat-form-field>
        </div>

        @if (isLoading()) {
          <div class="loading-container">
            <mat-progress-spinner diameter="40" mode="indeterminate"></mat-progress-spinner>
          </div>
        }

        <div class="conversaciones-lista" [@listAnimation]="filteredConversaciones().length">
          @for (conv of filteredConversaciones(); track conv.id) {
            <div class="conversacion-item" 
                 [class.active]="selectedConvId() === conv.id"
                 [class.unread]="conv.sinLeerCount > 0"
                 (click)="seleccionarConversacion(conv.id)">
              <div class="avatar-placeholder">
                {{ conv.participantes[0].nombre[0] }}
              </div>
              <div class="conv-info">
                <div class="conv-header">
                  <span class="conv-nombre">{{ conv.participantes[0].nombre }}</span>
                  <span class="conv-fecha">{{ conv.fechaUltimoMensaje | date:'HH:mm' }}</span>
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
            <div class="no-results">No se encontraron mensajes</div>
          }
        </div>
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
                        <a [href]="adj.url" 
                           [download]="adj.nombre" 
                           class="msg-adjunto-item link-adjunto"
                           target="_blank"
                           matTooltip="Click para descargar">
                          <mat-icon>attach_file</mat-icon>
                          <span>{{ adj.nombre }}</span>
                        </a>
                      }
                    </div>
                  }

                  <div class="mensaje-footer">
                    {{ msg.fechaEnvio | date:'HH:mm' }}
                    @if (msg.esMio) {
                      <mat-icon class="status-icon">done_all</mat-icon>
                    }
                  </div>
                </div>
              </div>
            }
          </div>

          <div class="detalle-input rich-reply">
            <div class="rich-editor-wrapper" 
                 [class.dragging]="isDragging()"
                 (dragover)="onDragOver($event)"
                 (dragleave)="onDragLeave($event)"
                 (drop)="onDrop($event)">
               
               @if (isDragging()) {
                 <div class="drop-zone-overlay">
                   <mat-icon>cloud_upload</mat-icon>
                   <p>Suelta los archivos aquí para adjuntarlos</p>
                 </div>
               }

               <div class="editor-toolbar">
                  <div class="toolbar-group">
                    <button mat-icon-button (mousedown)="$event.preventDefault(); ejecutarComando('bold')" type="button" matTooltip="Negrita">
                      <mat-icon>format_bold</mat-icon>
                    </button>
                    <button mat-icon-button (mousedown)="$event.preventDefault(); ejecutarComando('italic')" type="button" matTooltip="Cursiva">
                      <mat-icon>format_italic</mat-icon>
                    </button>
                    <button mat-icon-button (mousedown)="$event.preventDefault(); ejecutarComando('underline')" type="button" matTooltip="Subrayado">
                      <mat-icon>format_underlined</mat-icon>
                    </button>
                  </div>
                  <mat-divider vertical></mat-divider>
                  <div class="toolbar-group">
                    <button mat-icon-button (mousedown)="$event.preventDefault(); ejecutarComando('insertUnorderedList')" type="button" matTooltip="Lista">
                      <mat-icon>format_list_bulleted</mat-icon>
                    </button>
                  </div>
                  <mat-divider vertical></mat-divider>
                  <div class="toolbar-group">
                    <button mat-icon-button (mousedown)="$event.preventDefault(); adjuntarArchivo()" type="button" matTooltip="Adjuntar archivo">
                      <mat-icon>attach_file</mat-icon>
                    </button>
                    <button mat-icon-button (mousedown)="$event.preventDefault(); insertarImagen()" type="button" matTooltip="Insertar imagen">
                      <mat-icon>insert_photo</mat-icon>
                    </button>
                  </div>
                  <input type="file" #fileInput (change)="onFileSelected($event)" style="display: none" multiple>
                  <input type="file" #imageInput (change)="onImageSelected($event)" style="display: none" accept="image/*">
               </div>
               
               <div class="editor-content" 
                    contenteditable="true" 
                    #editorRef 
                    (input)="onEditorInput()"
                    placeholder="Escribe un mensaje..."
                    style="min-height: 60px;"></div>

               <div class="editor-footer-actions">
                 @if (archivosAdjuntos().length > 0) {
                   <div class="adjuntos-mini-lista">
                     @for (file of archivosAdjuntos(); track file.name) {
                       <span class="adjunto-tag">
                         <mat-icon>attach_file</mat-icon>
                         {{ file.name }}
                         <mat-icon class="remove-icon" (click)="eliminarAdjunto(file)">close</mat-icon>
                       </span>
                     }
                   </div>
                 }
                 <button mat-fab extended color="primary" (click)="enviarMensaje()" [disabled]="!nuevoMensajeTexto.trim() && archivosAdjuntos().length === 0">
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
                  <input matInput 
                         placeholder="Escriba un miembro o grupo" 
                         [formControl]="contactoCtrl"
                         [matAutocomplete]="auto">
                  <mat-icon matSuffix>person_add</mat-icon>
                  <mat-autocomplete #auto="matAutocomplete" [displayWith]="displayContacto" (optionSelected)="onContactoSelected($event)">
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
                  <input matInput placeholder="Asunto del mensaje" [(ngModel)]="nuevoAsunto">
                </mat-form-field>

                <div class="rich-editor-wrapper" 
                     [class.dragging]="isDragging()"
                     (dragover)="onDragOver($event)"
                     (dragleave)="onDragLeave($event)"
                     (drop)="onDrop($event)">
                   
                   @if (isDragging()) {
                     <div class="drop-zone-overlay">
                       <mat-icon>cloud_upload</mat-icon>
                       <p>Suelta los archivos aquí para adjuntarlos</p>
                     </div>
                   }

                   <div class="editor-toolbar">
                      <div class="toolbar-group">
                        <button mat-icon-button (mousedown)="$event.preventDefault(); ejecutarComando('bold')" type="button" matTooltip="Negrita">
                          <mat-icon>format_bold</mat-icon>
                        </button>
                        <button mat-icon-button (mousedown)="$event.preventDefault(); ejecutarComando('italic')" type="button" matTooltip="Cursiva">
                          <mat-icon>format_italic</mat-icon>
                        </button>
                        <button mat-icon-button (mousedown)="$event.preventDefault(); ejecutarComando('underline')" type="button" matTooltip="Subrayado">
                          <mat-icon>format_underlined</mat-icon>
                        </button>
                      </div>
                      <mat-divider vertical></mat-divider>
                      <div class="toolbar-group">
                        <button mat-icon-button (mousedown)="$event.preventDefault(); ejecutarComando('insertUnorderedList')" type="button" matTooltip="Lista">
                          <mat-icon>format_list_bulleted</mat-icon>
                        </button>
                      </div>
                      <mat-divider vertical></mat-divider>
                      <div class="toolbar-group">
                        <button mat-icon-button (mousedown)="$event.preventDefault(); adjuntarArchivo()" type="button" matTooltip="Adjuntar archivo">
                          <mat-icon>attach_file</mat-icon>
                        </button>
                        <button mat-icon-button (mousedown)="$event.preventDefault(); insertarImagen()" type="button" matTooltip="Insertar imagen">
                          <mat-icon>insert_photo</mat-icon>
                        </button>
                      </div>
                      <input type="file" #fileInput (change)="onFileSelected($event)" style="display: none" multiple>
                      <input type="file" #imageInput (change)="onImageSelected($event)" style="display: none" accept="image/*">
                   </div>
                   
                   <div class="editor-content" 
                        contenteditable="true" 
                        #editorRef 
                        (input)="onEditorInput()"
                        placeholder="Escribe un mensaje..."></div>
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
                  <div class="notification-options">
                    <label class="checkbox-container">
                      <input type="checkbox" [(ngModel)]="enviarCopiaEmail"> 
                      <mat-icon>email</mat-icon>
                      Notificar por Email
                    </label>
                    <label class="checkbox-container">
                      <input type="checkbox" [(ngModel)]="enviarCopiaTelegram"> 
                      <mat-icon>send</mat-icon>
                      Notificar por Telegram
                    </label>
                  </div>
                  <button mat-flat-button color="primary" (click)="enviarNuevoMensaje()" [disabled]="!mensajeEsValido()">
                    <mat-icon>send</mat-icon>
                    Enviar
                  </button>
                </div>
             </div>
          </div>
        } @else {
          <div class="empty-state">
            <img src="assets/images/empty-mailbox.png" alt="No hay mensajes" class="empty-image">
            <h3>Comenzar un nuevo mensaje</h3>
            <p>Seleccione una conversación o envíe un mensaje nuevo para comenzar.</p>
            <button mat-flat-button color="primary" class="btn-nuevo" (click)="crearNuevoMensaje()">
              <mat-icon>edit</mat-icon>
              Redactar mensaje
            </button>
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    .p-4 { padding: 1.5rem; }
    .flex { display: flex; }
    .gap-3 { gap: 1rem; }
    .align-items-center { align-items: center; }
    .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
    .bold { font-weight: 700; }
    .m-0 { margin: 0; }

    .comunicaciones-container {
      display: flex;
      height: calc(100vh - 85px);
      background: #f8fafc;
      overflow: hidden;
    }

    /* Autocomplete styles */
    .contacto-option {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
    }
    .contacto-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
    }
    .contacto-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      line-height: 1.2;
    }
    .contacto-nombre {
      font-weight: 600;
      color: #1e293b;
      font-size: 0.95rem;
    }
    .contacto-email {
      font-size: 0.8rem;
      color: #64748b;
    }
    .contacto-rol {
      font-size: 0.75rem;
      color: #94a3b8;
      text-transform: capitalize;
    }

    /* Sidebar */
    .conversaciones-sidebar {
      width: 400px;
      background: white;
      border-right: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      box-shadow: 4px 0 10px rgba(0,0,0,0.02);
      z-index: 2;
    }
    .sidebar-header {
      padding: 32px 24px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .sidebar-header h2 {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
    }
    .btn-nuevo {
      border-radius: 12px;
      padding: 10px 20px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
    }
    .search-container {
      padding: 0 24px 20px;
    }
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 20px;
    }
    .conversaciones-lista {
      flex: 1;
      overflow-y: auto;
    }
    .conversacion-item {
      display: flex;
      padding: 20px 24px;
      gap: 16px;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      border-bottom: 1px solid #f1f5f9;
      position: relative;
    }
    .conversacion-item:hover {
      background: #f8fafc;
    }
    .conversacion-item.active {
      background: #eff6ff !important;
    }
    .conversacion-item.unread {
      background: #f0f9ff;
    }
    .conversacion-item.unread:hover {
      background: #e0f2fe;
    }
    .conversacion-item.active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: #3b82f6;
    }
    .avatar-placeholder {
      width: 52px;
      height: 52px;
      border-radius: 16px;
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.25rem;
      flex-shrink: 0;
      box-shadow: 0 4px 8px rgba(59, 130, 246, 0.15);
    }
    .conv-info {
      flex: 1;
      min-width: 0;
    }
    .conv-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
      align-items: baseline;
    }
    .conv-nombre {
      font-weight: 500;
      color: #64748b;
      font-size: 1rem;
      transition: all 0.2s ease;
    }
    .conv-fecha {
      font-size: 0.75rem;
      color: #94a3b8;
      font-weight: 500;
    }
    .unread .conv-nombre {
      font-weight: 700;
      color: #0f172a;
    }
    .unread .conv-asunto {
      font-weight: 700;
      color: #1e293b;
    }
    .unread .conv-last-msg {
      color: #334155;
      font-weight: 500;
    }
    .conv-asunto {
      font-size: 0.9rem;
      font-weight: 500;
      color: #64748b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 2px;
      transition: all 0.2s ease;
    }
    .conv-last-msg {
      font-size: 0.85rem;
      color: #64748b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .inline-clip {
      font-size: 14px;
      width: 14px;
      height: 14px;
      color: #94a3b8;
      transform: rotate(45deg);
    }
    /* Badge removed */

    /* Detalle */
    .conversacion-detalle {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: white;
      position: relative;
    }
    .detalle-header {
      padding: 20px 32px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: white;
      z-index: 1;
    }
    .detalle-header h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.01em;
    }
    .detalle-header p {
      margin: 2px 0 0;
      font-size: 0.9rem;
      color: #64748b;
      font-weight: 500;
    }
    .mensajes-thread {
      flex: 1;
      padding: 32px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 20px;
      background: #f8fafc;
    }
    .mensaje-wrapper {
      display: flex;
      flex-direction: column;
      max-width: 80%;
    }
    .mensaje-wrapper.es-mio {
      align-self: flex-end;
      align-items: flex-end;
    }
    .mensaje-bubble {
      padding: 14px 20px;
      border-radius: 20px;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.03);
      color: #334155;
      font-size: 0.95rem;
      line-height: 1.5;
    }
    .es-mio .mensaje-bubble {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      border-bottom-right-radius: 4px;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
    }
    .mensaje-wrapper:not(.es-mio) .mensaje-bubble {
      border-bottom-left-radius: 4px;
    }
    .mensaje-footer {
      font-size: 0.75rem;
      margin-top: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
      color: #94a3b8;
      font-weight: 500;
    }
    .es-mio .mensaje-footer {
      color: #94a3b8;
    }
    .status-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #3b82f6;
    }
    
    .mensaje-adjuntos {
      margin-top: 10px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      border-top: 1px solid rgba(0,0,0,0.05);
      padding-top: 8px;
    }
    .es-mio .mensaje-adjuntos {
      border-top-color: rgba(255,255,255,0.2);
    }
    .msg-adjunto-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.8rem;
      background: rgba(0,0,0,0.03);
      padding: 6px 10px;
      border-radius: 8px;
      text-decoration: none;
      color: inherit;
      transition: all 0.2s ease;
    }
    .link-adjunto:hover {
      background: rgba(0,0,0,0.08);
      transform: translateY(-1px);
    }
    .es-mio .msg-adjunto-item {
      background: rgba(255,255,255,0.15);
    }
    .es-mio .link-adjunto:hover {
      background: rgba(255,255,255,0.25);
    }
    .msg-adjunto-item mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    
    .detalle-input {
      padding: 24px 32px;
      background: white;
      border-top: 1px solid #e2e8f0;
    }

    /* Nuevo Mensaje View */
    .nuevo-mensaje-view {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: white;
    }
    .nuevo-mensaje-form {
      padding: 32px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      flex: 1;
      overflow-y: auto;
    }
    .rich-editor-wrapper {
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      min-height: 350px;
      position: relative;
      transition: all 0.2s ease;
      background: white;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
    }
    .rich-editor-wrapper.dragging {
      border: 2px dashed #3b82f6;
      background: rgba(59, 130, 246, 0.05);
      transform: scale(1.005);
    }
    .drop-zone-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(59, 130, 246, 0.1);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 100;
      color: #3b82f6;
      backdrop-filter: blur(8px);
      pointer-events: none;
    }
    .drop-zone-overlay mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
    }
    .drop-zone-overlay p {
      font-weight: 700;
      font-size: 1.2rem;
      text-shadow: 0 2px 4px rgba(255,255,255,0.5);
    }
    
    .editor-toolbar {
      padding: 8px 16px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      gap: 12px;
      color: #64748b;
      align-items: center;
    }
    .toolbar-group {
      display: flex;
      gap: 4px;
    }
    .editor-toolbar mat-divider {
      height: 24px;
      margin: 0 4px;
    }
    .editor-toolbar button {
      width: 34px;
      height: 34px;
      line-height: 34px;
      border-radius: 8px;
    }
    .editor-toolbar button:hover {
      background: #e2e8f0;
      color: #3b82f6;
    }
    .editor-toolbar mat-icon {
      font-size: 20px;
    }
    .editor-content {
      padding: 16px 24px;
      flex: 1;
      outline: none;
      font-size: 1rem;
      line-height: 1.6;
      overflow-y: auto;
      min-height: 150px;
    }
    .editor-content img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 8px 0;
    }
    .editor-content:empty:before {
      content: attr(placeholder);
      color: #94a3b8;
    }
    
    .adjuntos-lista {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 8px;
    }
    .adjunto-item {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #f1f5f9;
      padding: 4px 4px 4px 12px;
      border-radius: 8px;
      font-size: 0.85rem;
      color: #475569;
    }
    .file-name {
      max-width: 150px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .form-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 8px;
    }
    .checkbox-container {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      color: #64748b;
      cursor: pointer;
      padding: 6px 12px;
      background: #f8fafc;
      border-radius: 8px;
      transition: all 0.2s ease;
      border: 1px solid #e2e8f0;
    }
    .checkbox-container:hover {
      background: #f1f5f9;
      border-color: #cbd5e1;
    }
    .checkbox-container input {
      width: 16px;
      height: 16px;
      cursor: pointer;
    }
    .checkbox-container mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #94a3b8;
    }
    .notification-options {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .full-width {
      width: 100%;
    }

    .editor-footer-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: white;
      border-top: 1px solid #f1f5f9;
      border-bottom-left-radius: 12px;
      border-bottom-right-radius: 12px;
    }

    .adjuntos-mini-lista {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .adjunto-tag {
      display: flex;
      align-items: center;
      gap: 4px;
      background: #f1f5f9;
      padding: 4px 8px;
      border-radius: 100px;
      font-size: 0.8rem;
      color: #475569;
      border: 1px solid #e2e8f0;
    }

    .adjunto-tag .mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .adjunto-tag .remove-icon {
      cursor: pointer;
      margin-left: 4px;
      color: #94a3b8;
    }

    .adjunto-tag .remove-icon:hover {
      color: #ef4444;
    }

    .rich-reply {
      padding: 16px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
    }

    .rich-reply .rich-editor-wrapper {
      background: white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      min-height: 160px;
    }

    .rich-reply .editor-content {
      min-height: 60px;
    }

    /* Empty State */
    .empty-state {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #64748b;
      gap: 24px;
      padding: 60px;
      text-align: center;
      background: #f8fafc;
    }
    .empty-image {
      width: 320px;
      max-width: 100%;
      height: auto;
      margin-bottom: 12px;
      opacity: 0.8;
      filter: grayscale(0.2) contrast(1.1);
    }
    .empty-state h3 {
      margin: 0;
      color: #1e293b;
      font-size: 1.75rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    .empty-state p {
      max-width: 400px;
      line-height: 1.6;
      font-size: 1.1rem;
      color: #64748b;
    }
  `]
})
export class ComunicacionesPageComponent implements OnInit {
  
  private comunicacionesQueries = inject(ComunicacionesQueries);
  private comunicacionesMutations = inject(ComunicacionesMutations);
  private comunicacionesApi = inject(ComunicacionesApi);
  private evaluationsApi = inject(EvaluationsApi);
  private authQueries = inject(AuthQueries);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  volver() {
    this.router.navigate(['/estudiante']);
  }
  
  @ViewChild('editorRef') editorRef!: ElementRef<HTMLDivElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;

  profileQuery = injectQuery(() => this.authQueries.me());
  profile = computed(() => this.profileQuery.data());
  conversacionesQuery = injectQuery(() => this.comunicacionesQueries.conversaciones(this.profile()?.email));
  usuariosQuery = injectQuery(() => this.comunicacionesQueries.usuarios());
  enviarMensajeMutation = injectMutation(() => this.comunicacionesMutations.enviarMensaje());
  marcarComoLeidoMutation = injectMutation(() => this.comunicacionesMutations.marcarComoLeido(this.profile()?.email || ''));
  conversaciones = computed(() => this.conversacionesQuery.data() || []);
  isLoading = computed(() => this.conversacionesQuery.isLoading());
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
  enviarCopiaTelegram = false;
  
  ngOnInit() {
    this.cargarContactos();
  }

  async cargarContactos() {
    const user = this.profile();
    if (!user) return;

    const lista: Contacto[] = [
      { nombre: 'Todos los profesores', email: 'GROUP:PROFESORES', rol: 'Grupo' },
      { nombre: 'Todos los integrantes del curso', email: 'GROUP:ESTUDIANTES', rol: 'Grupo' }
    ];

    try {
      // Obtener todos los usuarios del sistema
      const usuarios = this.usuariosQuery.data() || await this.comunicacionesApi.getTodosLosUsuarios();
      
      const dbContacts: Contacto[] = usuarios
        .filter(u => u.email !== user.email && u.activo)
        .map(u => ({
          nombre: `${u.nombre} ${u.apellidoPaterno || u.apellido_paterno || ''} ${u.apellidoMaterno || u.apellido_materno || ''}`.trim().replace(/\s+/g, ' '),
          email: u.email,
          rol: u.rolId === 2 ? 'Profesor' : (u.rolId === 3 ? 'Estudiante' : 'Profesor')
        }));

      if (user.rol.nombre === 'Docente') {
        const cursos = await this.evaluationsApi.getCursos(user.usuario_id);
        const allStudents: Contacto[] = [];
        
        for (const curso of cursos) {
          const students = await this.evaluationsApi.getEstudiantesPorCurso(curso.cursoId);
          students.forEach(s => {
            if (!allStudents.some(as => as.email === s.email)) {
               allStudents.push({
                 nombre: s.estudianteFullName,
                 email: s.email || `${s.estudianteId}@estudiante.cl`, // Fallback
                 rol: 'Estudiante'
               });
            }
          });
        }
        
        dbContacts.forEach(dbc => {
          if (!lista.some(l => l.email === dbc.email)) {
            lista.push(dbc);
          }
        });

        allStudents.forEach(s => {
          // If the student from the course is not in the list, add them
          if (!lista.some(l => l.email === s.email)) {
            lista.push(s);
          }
        });
      } else {
        dbContacts.forEach(dbc => {
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
      this.archivosAdjuntos.update(current => [...current, ...Array.from(files) as File[]]);
    }
  }

  private normalize(str: string | null | undefined): string {
    return (str || '').toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  filteredContactos = computed(() => {
    const search = this.contactoValue();
    const searchStr = this.normalize(typeof search === 'string' ? search : (search as any)?.nombre);
    
    return this.contactos().filter(c => 
      this.normalize(c.nombre).includes(searchStr) || 
      this.normalize(c.email).includes(searchStr)
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
    const recibidosOnly = allConvs.filter(c => c.mensajes.some(m => !m.esMio));
    
    if (!query) return recibidosOnly;
    
    return recibidosOnly.filter(c => 
      c.participantes.some(p => this.normalize(p.nombre).includes(query) || this.normalize(p.id).includes(query)) ||
      this.normalize(c.asunto).includes(query) ||
      this.normalize(c.ultimoMensaje).includes(query)
    );
  });
  
  selectedConv = computed(() => {
    const id = this.selectedConvId();
    return id ? this.conversaciones().find(c => c.id === id) || null : null;
  });

  mensajeEsValido() {
    const dest = this.contactoCtrl.value;
    const hasRecipient = dest && (typeof dest === 'object' || (typeof dest === 'string' && dest.includes('@')));
    return (this.nuevoMensajeTexto.trim().length > 0 || this.archivosAdjuntos().length > 0) && 
           (this.mostrandoNuevoMensaje() ? hasRecipient : true);
  }
  
  seleccionarConversacion(id: string) {
    this.selectedConvId.set(id);
    this.mostrandoNuevoMensaje.set(false);
    this.nuevoMensajeTexto = '';
    this.archivosAdjuntos.set([]);
    if (this.editorRef) this.editorRef.nativeElement.innerHTML = '';
    
    const conv = this.conversaciones().find(c => c.id === id);
    if (conv) {
      conv.mensajes.forEach(m => {
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
    this.enviarCopiaTelegram = false;
    this.isDragging.set(false);
    if (this.editorRef) this.editorRef.nativeElement.innerHTML = '';
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
      this.archivosAdjuntos.update(current => [...current, ...Array.from(files) as File[]]);
    }
  }

  eliminarAdjunto(file: File) {
    this.archivosAdjuntos.update(current => current.filter(f => f !== file));
  }
  
  enviarMensaje() {
    if ((!this.nuevoMensajeTexto.trim() && this.archivosAdjuntos().length === 0) || !this.selectedConvId()) return;
    
    // We take the first attachment for now as the service expects one, 
    // but we could map multiple if the backend supports it.
    const archivo = this.archivosAdjuntos().length > 0 ? this.archivosAdjuntos()[0] : undefined;

    const user = this.profile();
    if (!user?.email) return;

    this.enviarMensajeMutation.mutate({
      quienEnvia: user.email,
      quienRecibe: this.selectedConvId()!,
      cuerpo: this.nuevoMensajeTexto,
      asunto: this.selectedConv()?.asunto || 'Sin asunto',
      archivo
    }, {
      onSuccess: () => {
        this.snackBar.open('Mensaje enviado', 'Cerrar', { duration: 3000 });
        this.nuevoMensajeTexto = '';
        this.archivosAdjuntos.set([]);
        if (this.editorRef) this.editorRef.nativeElement.innerHTML = '';
      }
    });
  }
  
  enviarNuevoMensaje() {
    const destValue = this.contactoCtrl.value;
    if (!destValue || !this.mensajeEsValido()) return;
    
    // Si es un objeto contacto, usamos su email (o group ID)
    const destinatario = typeof destValue === 'object' ? (destValue as Contacto).email : destValue;
    
    const archivo = this.archivosAdjuntos().length > 0 ? this.archivosAdjuntos()[0] : undefined;

    const user = this.profile();
    if (!user?.email) return;

    this.enviarMensajeMutation.mutate({
      quienEnvia: user.email,
      quienRecibe: destinatario,
      cuerpo: this.nuevoMensajeTexto,
      asunto: this.nuevoAsunto || 'Sin asunto',
      archivo,
<<<<<<< HEAD
<<<<<<< Updated upstream
      this.enviarCopiaEmail
    ).subscribe({
      next: (resp) => {
=======
      enviarCopiaEmail: this.enviarCopiaEmail,
      enviarCopiaTelegram: this.enviarCopiaTelegram
    }, {
      onSuccess: (resp) => {
>>>>>>> Stashed changes
=======
      enviarCopiaEmail: this.enviarCopiaEmail
    }, {
      onSuccess: (resp) => {
>>>>>>> 88751cb27e7e5b77bc17ac9e727630ae5435510f
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
        this.enviarCopiaTelegram = false;
      }
    });
  }
}
