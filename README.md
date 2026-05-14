# Colegio Bernardo O’Higgins — Libro de Clases Digital (Frontend de Apoyo)

![Angular](https://img.shields.io/badge/Angular-21.2-DD0031?style=for-the-badge&logo=angular)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![AWS](https://img.shields.io/badge/AWS-Academy_Ready-232F3E?style=for-the-badge&logo=amazon-aws)

Este proyecto es el Frontend de apoyo para los microservicios de la plataforma de gestión académica del **Colegio Bernardo O’Higgins**. Construido sobre una arquitectura moderna, serverless y altamente escalable, optimizada para el entorno de **AWS Academy**.

## 🚀 Stack Tecnológico

*   **Core:** Angular v21.2 (Standalone Components, Signals, Control Flow).
*   **UI/UX:** Angular Material (Componentes Enterprise) + Tailwind CSS (Layout & Styling).
*   **Infraestructura (AWS Academy):**
    *   **Hosting:** Amazon S3 + Amazon CloudFront.
    *   **Backend:** Amazon API Gateway + AWS Lambda.
    *   **Mensajería:** Amazon SQS.
    *   **Monitoreo:** Amazon CloudWatch.

## 🛠️ Comandos de Desarrollo

### Instalación
```bash
npm install
```

### Ejecución Local
```bash
npm start
# La aplicación estará disponible en http://localhost:4200
```

### Construcción para Producción
```bash
npm run build
```


## 📂 Estructura del Proyecto

*   `src/app/core`: Servicios globales, guards, interceptores de seguridad y modelos compartidos de autenticación.
*   `src/app/shared`: Componentes UI reutilizables, como el perfil de usuario.
*   `src/app/features`: Features funcionales separadas por dominio (`auth`, `admin`, `docente`, `estudiante`).
*   `src/app/layout`: Componentes estructurales de navegación, como el navbar.

## 🧩 Estructura de Features

Cada feature vive dentro de `src/app/features/<feature>` y mantiene una estructura orientada a dominio. La aplicación usa **standalone components** y carga las features mediante **lazy loading** desde `src/app/app.routes.ts`.

```text
src/app/features/
├── auth/
│   ├── auth.routes.ts
│   ├── data-access/
│   ├── models/
│   └── pages/
├── admin/
│   ├── admin.routes.ts
│   ├── data-access/
│   ├── models/
│   └── pages/
├── docente/
│   ├── docente.routes.ts
│   ├── data-access/
│   ├── models/
│   ├── pages/
│   └── sections/
└── estudiante/
    ├── estudiante.routes.ts
    ├── data-access/
    ├── models/
    └── pages/
```

### Convenciones internas

*   `*.routes.ts`: Define las rutas hijas de la feature y carga cada pantalla con `loadComponent`.
*   `pages/`: Contiene las pantallas principales de la feature. Cada página se organiza con sus archivos `.ts`, `.html` y `.css`.
*   `data-access/`: Centraliza la comunicación con backend y el estado remoto:
    *   `*.api.ts`: Métodos HTTP contra los microservicios definidos en `environment.ts`.
    *   `*.queries.ts`: Consultas de lectura con TanStack Query.
    *   `*.mutations.ts`: Operaciones de escritura y posterior invalidación de cache.
    *   `*.keys.ts`: Query keys usadas para cachear e invalidar datos de forma consistente.
    *   `*.store.ts`: Estado local de la feature cuando aplica, como la sesión de autenticación.
*   `models/`: Interfaces y tipos TypeScript que representan requests, responses y entidades del dominio.
*   `sections/`: Subcomponentes internos de una feature usados para dividir pantallas complejas.

## ⚙️ Funcionamiento de las Features

### Auth

La feature `auth` gestiona el inicio de sesión y la sesión local del usuario.

*   Ruta base: `/auth/login`.
*   `AuthApi` consume `/auth/login` y `/auth/profile`.
*   `AuthMutations` ejecuta el login, guarda token y perfil en `AuthStore`, y redirige según el rol recibido.
*   `AuthStore` usa signals para exponer `currentUser`, `accessToken` e `isAuthenticated`.
*   `authInterceptor` agrega el header `Authorization: Bearer <token>` a las peticiones HTTP cuando existe token en `localStorage`.

### Admin

La feature `admin` concentra la administración de usuarios y datos académicos base.

*   Rutas: `/admin` y `/admin/usuarios`.
*   `AdminApi` expone operaciones CRUD para usuarios, docentes, estudiantes, cursos, asignaturas, CAD y evaluaciones.
*   `AdminQueries` define lecturas cacheadas por entidad.
*   `AdminMutations` crea, actualiza o elimina entidades e invalida las queries afectadas para refrescar la UI.
*   Al crear usuarios completos, la mutación también crea el registro asociado de docente o estudiante según el rol.

### Docente

La feature `docente` agrupa las acciones operativas del profesor.

*   Rutas: `/docente`, `/docente/asistencia`, `/docente/clases` y `/docente/evaluaciones`.
*   `AttendanceApi` permite obtener cursos disponibles, listar alumnos por curso y registrar asistencia.
*   `EvaluationsApi` permite obtener cursos del docente, estudiantes por curso, evaluaciones por CAD, notas por curso/asignatura y guardar notas en bloque.
*   `sections/` contiene bloques reutilizados dentro de pantallas docentes, como asistencia y conducta.

### Estudiante

La feature `estudiante` muestra información académica consultable por el alumno.

*   Rutas: `/estudiante`, `/estudiante/notas`, `/estudiante/asistencia` y `/estudiante/recursos`.
*   `EstudianteApi` consulta notas desde el servicio de gestión académica y asistencias desde el servicio de asistencia/conducta.
*   Sus páginas separan la vista principal, calificaciones, asistencia y recursos para mantener responsabilidades acotadas.

### Flujo de navegación y seguridad

*   `src/app/app.routes.ts` redirige la raíz a login y carga las features con `loadChildren`.
*   Las rutas `admin`, `docente` y `estudiante` están protegidas con `authGuard`.
*   Las pantallas se cargan bajo demanda, reduciendo el bundle inicial.
*   La comunicación con backend pasa por `HttpClient`, el interceptor de autenticación y los endpoints configurados en `src/environments/environment.ts`.

## 🛡️ Estrategia de Autenticación
Debido a las restricciones de AWS Academy (sin Cognito), se utiliza un flujo de **Autenticación Personalizada** mediante Lambdas que generan y validan tokens JWT, integrados en el frontend a través de interceptores HTTP.

---
© 2026 Colegio Bernardo O’Higgins. Todos los derechos reservados.
