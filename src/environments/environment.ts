export const environment = {
  production: false,
  msAuthUrl: 'http://localhost:3000/api',
  backGestionUrl: 'http://localhost:8080/api',
  apiAttendanceConductUrl: 'http://localhost:3001/api',
  msMensajeriaUrl: 'http://localhost:3001/api/mensajes',
  /** ⚠️ SOLO DESARROLLO: omite el login e inyecta un estudiante de prueba */
  bypassLogin: false,
  mockUser: {
    id: '42',
    rut: '15.234.678-3',
    nombre: 'Valentina',
    apellido_paterno: 'Rojas',
    apellido_materno: 'Muñoz',
    email: 'valentina.rojas@colegio.cl',
    role: 'Estudiante',
    activo: true,
    curso: { nivel: '2° Medio', letra: 'B', anio_academico: 2025 },
  },
};
