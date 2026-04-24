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

### Linting
```bash
npm run lint
```

## 📂 Estructura del Proyecto

*   `src/app/core`: Servicios globales, interceptores de seguridad y modelos de datos.
*   `src/app/shared`: Componentes UI reutilizables, pipes y directivas.
*   `src/app/features`: Módulos funcionales (Académico, Asistencia, Comunicaciones).
*   `src/app/layout`: Componentes estructurales (Sidebar, Navbar, Footer).

## 🛡️ Estrategia de Autenticación
Debido a las restricciones de AWS Academy (sin Cognito), se utiliza un flujo de **Autenticación Personalizada** mediante Lambdas que generan y validan tokens JWT, integrados en el frontend a través de interceptores HTTP.

---
© 2026 Colegio Bernardo O’Higgins. Todos los derechos reservados.
