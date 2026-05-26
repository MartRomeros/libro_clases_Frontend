# Libro de Clases Digital - Frontend

Frontend del libro de clases digital construido con Angular para la vista de usuario del sistema. Esta aplicación consume los servicios del ecosistema académico y centraliza la experiencia para perfiles como administrador, docente y estudiante.

## Objetivo del proyecto

Este repositorio corresponde a la capa frontend que apoya a los siguientes servicios:

- `MS Gestion escolar` - Java Spring Boot
- `MS Autenticacion y autorizacion` - Node.js + Express
- `MS Asistencia y conducta` - Node.js + Express
- `MS Mensajeria` - Node.js + Express
- `BFF` - Node.js + Express

La aplicación actúa como una SPA que consume APIs HTTP para autenticación, gestión académica, asistencia, evaluaciones y mensajería.

## Stack principal

- Angular `21.2`
- Angular Material
- Angular CDK
- RxJS
- TanStack Angular Query
- Chart.js + ng2-charts
- Tailwind CSS 4 + PostCSS
- Cypress
- Vitest

## Arquetipo del proyecto

Este proyecto sigue un arquetipo de `SPA Angular standalone`, con arquitectura `feature-first` y carga diferida de rutas.

Características principales del arquetipo actual:

- Bootstrap moderno con `bootstrapApplication(...)`
- Uso de `standalone components`
- Rutas cargadas con `loadChildren` y `loadComponent`
- Separación por dominios funcionales en `features`
- Capa `data-access` para comunicación con backend
- Estado local reactivo con `signals`
- Estado remoto y caché con `TanStack Query`

En términos prácticos, es una aplicación Angular modular orientada a dominios, no un frontend monolítico por pantallas sueltas.

## Patrón de diseño usado

El proyecto está más cerca de `MVVM` que de `MVC`.

### Por qué MVVM

- La `View` está en los archivos `.html` y en los componentes standalone.
- El `ViewModel` vive principalmente en los componentes `.ts`, `stores`, `queries` y `mutations`, donde se prepara el estado para la UI.
- El `Model` está representado por `models`, contratos tipados, APIs y datos provenientes de los microservicios.

### Cómo se refleja en este repositorio

- `pages` y `sections`: presentan la interfaz.
- `data-access/*.api.ts`: encapsulan llamadas HTTP.
- `data-access/*.queries.ts` y `*.mutations.ts`: coordinan lectura, escritura, caché y efectos de UI.
- `data-access/*.store.ts`: administran estado local reactivo cuando aplica, por ejemplo autenticación.
- `models/`: definen entidades y DTOs del dominio.

No es un MVC clásico porque la lógica de interacción de la vista no está centralizada en controladores separados del frontend. En Angular, aquí el rol equivalente está distribuido entre componentes, stores y servicios reactivos, lo que encaja mejor con MVVM.

## Estructura general

```text
src/
  app/
    core/
      guards/
      interceptors/
      services/
      utils/
    layout/
    shared/
      components/
      http/
      pages/
    features/
      landing/
      auth/
      admin/
      docente/
      estudiante/
      comunicaciones/
```

## Organización por feature

Cada feature sigue una estructura similar:

```text
feature/
  data-access/
    *.api.ts
    *.queries.ts
    *.mutations.ts
    *.keys.ts
    *.store.ts
  models/
  pages/
  sections/
  *.routes.ts
```

Esta estructura facilita:

- separar responsabilidades
- aislar cada dominio funcional
- escalar nuevas vistas sin mezclar lógica
- mantener bajo control el acceso a APIs

## Requisitos para desarrollo

Para trabajar en este proyecto se necesita:

- Node.js LTS instalado
- npm disponible en el entorno

Notas:

- El repositorio declara `packageManager: npm@11.11.0`.
- No es obligatorio instalar Angular CLI de forma global porque el proyecto ya la usa localmente desde `node_modules`.

## Instalacion

```bash
npm install
```

Este comando instalará las dependencias principales del proyecto, incluyendo Angular, Angular Material, Tailwind, TanStack Query, Chart.js, Cypress y Vitest.

## Ejecucion local

```bash
npm start
```

O bien:

```bash
npm run dev
```

La aplicación quedará disponible normalmente en:

```text
http://localhost:4200
```

## Scripts disponibles

```bash
npm start
npm run dev
npm run build
npm run watch
npm test
```

## Dependencias relevantes

### Runtime

- `@angular/core`, `@angular/common`, `@angular/router`, `@angular/forms`
- `@angular/material`, `@angular/cdk`, `@angular/animations`
- `@tanstack/angular-query-experimental`
- `rxjs`
- `chart.js`
- `ng2-charts`

### Desarrollo

- `@angular/cli`
- `@angular/build`
- `typescript`
- `tailwindcss`
- `@tailwindcss/postcss`
- `postcss`
- `cypress`
- `vitest`
- `prettier`

## Integracion con backend

La URL base de consumo HTTP se define actualmente en:

- [src/environments/environment.ts](/C:/Users/marti/Desktop/fullstack3/frontend/src/environments/environment.ts)

Actualmente la app usa una propiedad `apiGw` como base para exponer los endpoints consumidos por las features. Desde allí se conectan autenticación, administración, asistencia, evaluaciones y mensajería.

## Seguridad y acceso

La aplicación ya considera:

- `authGuard` para proteger rutas privadas
- `authInterceptor` para adjuntar el token en las peticiones HTTP
- control por roles en rutas como `admin`, `docente`, `estudiante` y `comunicaciones`

## Despliegue en AWS Academy

Este frontend está pensado para ser servido como sitio estático en `Amazon S3` dentro de AWS Academy.

### Flujo de despliegue esperado

1. Generar el build de producción:

```bash
npm run build
```

2. Angular genera los archivos listos para publicar en:

```text
dist/frontend/browser
```

3. El contenido de esa carpeta se sube a un bucket S3 configurado para hosting estático.

4. S3 servirá:

- `index.html`
- archivos `js`
- hojas de estilo `css`
- assets e imágenes

### Consideraciones importantes para Angular en S3

- Como esta app usa routing del lado del cliente, el bucket debe considerar una estrategia para que rutas como `/admin`, `/docente` o `/estudiante` resuelvan hacia `index.html`.
- Si cambia la URL del backend o del BFF en AWS, se debe actualizar `src/environments/environment.ts` antes de construir.
- El frontend no se ejecuta en el servidor: se compila y se publica como archivos estáticos.

### Relacion con AWS Academy

Dentro de AWS Academy, este enfoque es adecuado porque:

- reduce complejidad operativa del frontend
- abarata el despliegue
- aprovecha S3 como hosting estático
- deja la lógica de negocio en los microservicios y/o BFF

## Features funcionales actuales

- `landing`: portada pública del sitio
- `auth`: inicio de sesión y control de sesión
- `admin`: administración académica y usuarios
- `docente`: asistencia, cursos y evaluaciones
- `estudiante`: notas, asistencia y recursos
- `comunicaciones`: bandeja y envío de mensajes

## Base de datos de referencia

La documentación de base de datos mencionada por el proyecto está en:

- `.agents/context/script.sql.md`

## Resumen arquitectonico

Este frontend Angular está organizado como una `SPA standalone`, modular por features, con una aproximación `MVVM`, usando `signals` para estado local y `TanStack Query` para estado remoto. Su despliegue objetivo en AWS Academy es como sitio estático en `Amazon S3`, mientras la lógica de negocio queda en los microservicios y el BFF.
