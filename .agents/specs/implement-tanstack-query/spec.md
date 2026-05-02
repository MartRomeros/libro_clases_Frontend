# Spec: Integrar TanStack Query en Angular

## Objetivo

Permitir que la aplicación utilice TanStack Query para la obtención, modificación y eliminación de datos, centralizando el manejo de carga, errores, caché e invalidaciones.

---

## Alcance

- Reemplazar todas las peticiones HTTP actuales:
  - `GET` mediante TanStack Query.
  - `POST`, `PUT`, `PATCH` y `DELETE` mediante TanStack Mutations.

- Los servicios deben exponer:
  - `queryOptions` para consultas.
  - `mutationOptions` para escrituras.

- Los componentes deben crear las queries y mutations usando:
  - `injectQuery`
  - `injectMutation`

- No deben quedar llamadas HTTP directas desde componentes.

- No deben quedar `.subscribe()` relacionados a llamadas HTTP.

- Los `.subscribe()` no relacionados con HTTP se mantienen, por ejemplo:
  - `dialogRef.afterClosed().subscribe(...)`
  - eventos internos
  - observables de UI

- Los estados de carga y error deben manejarse con TanStack Query:
  - `isPending`
  - `isLoading`
  - `isError`
  - `error`
  - `data`
  - `mutate`
  - `mutateAsync`

- Los errores deben mostrarse de forma amigable al usuario.
  - Para mutations se debe usar snackbar.
  - Para carga inicial se debe mostrar mensaje en la UI y, cuando corresponda, también snackbar.

- Las invalidaciones deben realizarse dentro del `onSuccess` de cada mutation.

- Si existe un `forkJoin` asociado a peticiones HTTP, debe desagruparse en queries independientes.

- Auth entra completo en alcance.

- La configuración debe usar `provideTanStackQuery`.

---

## Configuración obligatoria de caché

```ts
provideTanStackQuery(
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  })
);
```

## Limites

Solo se deben modificar las partes relacionadas con peticiones HTTP y su impacto directo en la UI.
Se pueden modificar componentes y templates cuando sea necesario para integrar:
- injectQuery
- injectMutation
- estados de carga
- estados de error
- snackbar
- deshabilitado de formularios mientras una mutation está pendiente
- No se deben realizar tests.
- Solo se debe ejecutar npm run build para verificar compilación.
- Se debe mantener HttpClient dentro de queryFn y mutationFn.
- No se debe migrar a fetch.

## Regla de servicios

Los servicios mantienen la responsabilidad de:

- Definir endpoints.
- Definir queryKey.
- Definir mutationKey.
- Definir queryOptions.
- Definir mutationOptions.
- Definir invalidaciones con queryClient.invalidateQueries.
- Convertir Observable de HttpClient a Promise usando firstValueFrom.

ejemplo:
```typescript
getCursosOptions() {
  return queryOptions({
    queryKey: ['cursos'],
    queryFn: () => firstValueFrom(this.http.get<Curso[]>('/api/cursos')),
  });
}
```

## Regla de componentes

Los componentes deben consumir los servicios así:

```typescript
cursosQuery = injectQuery(() =>
  this.cursoService.getCursosOptions()
);
```

para mutations:

```typescript
crearCursoMutation = injectMutation(() =>
  this.cursoService.crearCursoOptions()
);
```

## Auth

Auth entra completo en alcance.

Reglas:

- login debe implementarse como mutation.
- forgot-password debe implementarse como mutation.
- reset-password debe implementarse como mutation.
- profile, validate-token o me deben implementarse como query.
- logout debe limpiar:
- localStorage/sessionStorage
- token
- estado local de sesión
- caché de TanStack Query mediante queryClient.clear()

## En caso de error 401:

- limpiar sesión
- limpiar caché
- redirigir al login

## Invalidaciones minimas esperadas para operaciones existentes: esto es solo un ejemplo:

| Mutation             | Queries a invalidar                                        |
| -------------------- | ---------------------------------------------------------- |
| crear usuario        | `['usuarios']`                                             |
| editar usuario       | `['usuarios']`, `['usuario', id]`                          |
| eliminar usuario     | `['usuarios']`                                             |
| crear estudiante     | `['estudiantes']`, `['usuarios']`                          |
| editar estudiante    | `['estudiantes']`, `['estudiante', id]`                    |
| eliminar estudiante  | `['estudiantes']`                                          |
| crear docente        | `['docentes']`, `['usuarios']`                             |
| editar docente       | `['docentes']`, `['docente', id]`                          |
| crear curso          | `['cursos']`                                               |
| editar curso         | `['cursos']`, `['curso', id]`                              |
| eliminar curso       | `['cursos']`                                               |
| crear asignatura     | `['asignaturas']`                                          |
| editar asignatura    | `['asignaturas']`, `['asignatura', id]`                    |
| crear evaluación     | `['evaluaciones']`, `['curso', cursoId]`                   |
| registrar nota       | `['notas']`, `['notas', estudianteId]`, `['evaluaciones']` |
| registrar asistencia | `['asistencias']`, `['asistencias', cursoId]`              |
| crear anotación      | `['anotaciones']`, `['anotaciones', estudianteId]`         |
| enviar mensaje       | `['mensajes']`, `['conversaciones']`                       |
| marcar mensaje leído | `['mensajes']`, `['mensajes-no-leidos']`                   |


## Operaciones encadenadas

Cuando exista una operación como:

- crear usuario
- crear estudiante/docente asociado

Debe implementarse como una mutation usando mutateAsync o una función async.

ejemplo:

```typescript
mutationFn: async (payload) => {
  const usuario = await firstValueFrom(this.http.post<Usuario>('/api/usuarios', payload.usuario));

  return firstValueFrom(
    this.http.post<Estudiante>('/api/estudiantes', {
      ...payload.estudiante,
      usuarioId: usuario.id,
    })
  );
}
```
Si la segunda operación falla, se debe mostrar un error claro al usuario.

## Casos borde a considerar
- Queries con parámetros no disponibles.
- Queries dependientes de id, curso seleccionado o usuario autenticado.
- Errores parciales al reemplazar forkJoin.
- Login/logout con queries en vuelo.
- Error 401 en queries o mutations.
- Doble submit mientras una mutation está pendiente.
- Datos stale después de crear, editar o eliminar.
- Errores del backend con formatos distintos:
- string
- HttpErrorResponse
- objeto { message }
- objeto desconocido

## Criterios de aceptación
- Todas las peticiones HTTP usan TanStack Query:
- GET mediante queries.
- POST, PUT, PATCH y DELETE mediante mutations.
- No quedan llamadas HTTP directas en componentes.
- No quedan .subscribe() asociados a llamadas HTTP.
- Los observables no HTTP se mantienen.
- Los servicios exponen queryOptions y mutationOptions.
- Los componentes usan injectQuery e injectMutation.
- Los estados de carga se reflejan en la UI.
- Los errores se muestran de forma amigable.
- Las mutations muestran errores mediante snackbar.
- Las mutations invalidan queries relacionadas dentro de onSuccess.
- Auth funciona correctamente:
- login
- logout
- validación de sesión
- limpieza de caché
- La app compila correctamente con: `npm run build`

- register no se incluira.

- Si una query falla y otras cargan correctamente, la UI debe mostrar los datos disponibles y un mensaje de error para la sección afectada, salvo que la vista requiera todos los datos para funcionar.



