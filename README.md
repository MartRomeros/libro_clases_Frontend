# Libro de Clases Digital - Frontend

Frontend del libro de clases digital construido con Angular para la vista de usuario del sistema. Esta aplicación consume los servicios del ecosistema académico y centraliza la experiencia para perfiles como administrador, docente, estudiante y apoderado.

Sitio en producción: **https://colegio.martin-romero.cl**

## Objetivo del proyecto

Este repositorio corresponde a la capa frontend que apoya a los siguientes servicios:

- `MS Gestion escolar` - Java Spring Boot
- `MS Autenticacion y autorizacion` - Node.js + Express
- `MS Asistencia y conducta` - Node.js + Express
- `MS Mensajeria` - Node.js + Express
- `BFF` - Node.js + Express

La aplicación actúa como una SPA que consume APIs HTTP para autenticación, gestión académica, asistencia, evaluaciones, mensajería y matrículas/pagos (Webpay), todas a través de un único API Gateway.

## Stack principal

- Angular `21.2` (standalone components)
- Angular Material + Angular CDK
- RxJS
- TanStack Angular Query
- Chart.js + ng2-charts
- Tailwind CSS 4 + PostCSS
- Vitest (unit tests, vía `@angular/build:unit-test` sobre jsdom)

> Cypress fue removido del proyecto. La convención actual de testing son specs a nivel de componente (`*.spec.ts` junto al archivo que testean).

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
- `data-access/*.keys.ts`: factories jerárquicas de query keys de TanStack Query.
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
      matriculas/
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
- `pnpm` disponible en el entorno (gestor de paquetes actual del proyecto)

Notas:

- El proyecto está migrado de `npm` a `pnpm` (`pnpm-lock.yaml` + `pnpm-workspace.yaml`). `npm` sigue funcionando como respaldo porque los scripts de `package.json` son agnósticos al gestor de paquetes, pero se recomienda `pnpm` para trabajo nuevo.
- No es obligatorio instalar Angular CLI de forma global porque el proyecto ya la usa localmente desde `node_modules`.

## Instalacion

```bash
pnpm install
```

Este comando instalará las dependencias principales del proyecto, incluyendo Angular, Angular Material, Tailwind, TanStack Query, Chart.js y Vitest.

## Ejecucion local

```bash
pnpm start
```

O bien:

```bash
pnpm run dev
```

La aplicación quedará disponible normalmente en:

```text
http://localhost:4200
```

## Scripts disponibles

```bash
pnpm start
pnpm run dev
pnpm run build
pnpm run watch
pnpm test
```

No hay script de lint definido en `package.json`. El formateo se maneja con Prettier (`.prettierrc`: comillas simples, ancho de línea 100, parser de Angular para `.html`).

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
- `vitest`
- `prettier`

## Integracion con backend

La URL base de consumo HTTP se define en:

- `src/environments/environment.ts` (propiedad `apiGw`)

Todas las llamadas HTTP de la app pasan por un único API Gateway configurado ahí. Desde allí se conectan autenticación, administración, asistencia, evaluaciones, mensajería y matrículas/Webpay.

Si cambia la URL del backend/BFF, se debe actualizar `apiGw` en `environment.ts` **antes** de generar el build de producción (actualmente no existen `environment.prod.ts` ni `fileReplacements`; el mismo archivo se usa para todos los builds).

## Seguridad y acceso

La aplicación ya considera:

- `authGuard` para proteger rutas privadas, con `data: { roles: [...] }` por ruta
- `authInterceptor` para adjuntar el JWT (`Authorization: Bearer <token>`) en cada petición, leyéndolo desde `localStorage`
- control por roles (`Administrador`, `Docente`, `Estudiante`, `Apoderado`) normalizado en `core/utils/access-control.ts`
- `AuthStore` como fuente única de verdad del token; al cerrar sesión limpia tanto `localStorage` como la caché de TanStack Query

## Despliegue en colegio.martin-romero.cl

Este frontend se sirve como sitio estático sobre hosting **Apache/cPanel**, en el dominio `colegio.martin-romero.cl`.

### Flujo de despliegue (CI)

El workflow `.github/workflows/ci.yml` se dispara en cada push a `master`:

1. `npm install`
2. `npm run build` (equivalente a `ng build`, configuración `production` por defecto)
3. Angular genera los archivos listos para publicar en `dist/frontend/browser/`
4. `SamKirkland/FTP-Deploy-Action` sube el contenido de esa carpeta por FTP a `/public_html/` del hosting cPanel

No hay gate de tests ni lint en CI: el único chequeo antes de desplegar es que el build sea exitoso.

### Ruteo de Angular en Apache (.htaccess)

Como esta app usa routing del lado del cliente (`@angular/router`), Apache necesita reescribir cualquier ruta que no sea un archivo/carpeta real hacia `index.html` para que el router de Angular la resuelva. Esto se maneja con `public/.htaccess`, que Angular copia automáticamente a `dist/frontend/browser/.htaccess` en cada build (vía el asset glob `**/*` configurado en `angular.json`).

El `.htaccess` cubre:

- redirección forzada a HTTPS
- fallback de rutas SPA (`/admin`, `/docente`, `/estudiante`, etc.) hacia `index.html`
- compresión (`mod_deflate`) para JS/CSS/HTML/JSON/SVG
- cache de larga duración para assets con hash, y `no-cache` para `index.html` (para que los usuarios siempre reciban la última versión de la app tras cada deploy)

Si se cambia el dominio o el `server-dir` del FTP, revisar que `<base href="/" />` en `src/index.html` siga correspondiendo a la raíz donde se publica el sitio.

### Consideraciones importantes

- El frontend no se ejecuta en el servidor: se compila y se publica como archivos estáticos servidos por Apache.
- Si cambia la URL del backend/BFF, actualizar `src/environments/environment.ts` (`apiGw`) antes de construir y desplegar.
- Los secretos de FTP (`FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`) están configurados como GitHub Secrets del repositorio, no en el código.

## Features funcionales actuales

- `landing`: portada pública del sitio
- `auth`: inicio de sesión y control de sesión
- `admin`: administración académica y usuarios
- `docente`: asistencia, cursos y evaluaciones
- `estudiante`: notas, asistencia y recursos
- `comunicaciones`: bandeja y envío de mensajes
- `matriculas`: proceso de matrícula y pago vía Webpay (Transbank)

## Resumen arquitectonico

Este frontend Angular está organizado como una `SPA standalone`, modular por features, con una aproximación `MVVM`, usando `signals` para estado local y `TanStack Query` para estado remoto. Se despliega como sitio estático sobre hosting Apache/cPanel en `colegio.martin-romero.cl`, con `.htaccess` resolviendo el ruteo del lado del cliente, mientras la lógica de negocio queda en los microservicios y el BFF.
