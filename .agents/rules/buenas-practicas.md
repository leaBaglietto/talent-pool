---
trigger: always_on
---

1. El Mantra de Datos: "Nada se destruye, todo se audita"
Estamos manejando PII (Personal Identifiable Information). La integridad de los datos es nuestra prioridad absoluta.

1.1 Cambios Atómicos y Explicables
Transaccionalidad: Cualquier cambio que afecte a más de una tabla (ej: mover un prospecto a 'Seleccionados' y crear un registro de entrevista) debe ejecutarse mediante una Función de Base de Datos (RPC) o una transacción de Supabase. O todo sucede, o nada sucede.

No Destrucción (Immutable Logs): Queda estrictamente prohibido el uso de DELETE en tablas maestras.

Usaremos deleted_at (soft delete) para registros accidentales.

Cualquier cambio de estado debe quedar registrado en una tabla de audit_logs o status_history. Debemos poder explicar quién movió a quién y por qué en cualquier momento de 2026.

Versionado de Schema: Todo cambio en la base de datos debe pasar por un archivo de migración. Si no está en el repo de migraciones, no existe.

1.2 Privacidad por Diseño (RLS)
Cero Confianza: La lógica de seguridad no vive en el Frontend, vive en la base de datos mediante Row Level Security (RLS).

Principio de Menor Privilegio: Un Joyer solo ve lo que necesita. Un Prospecto solo ve su propia fila. Esto previene fugas de datos masivas si un token es comprometido.

2. Desarrollo de Alta Velocidad (The Vibe)
Queremos que desarrollar en Antigravity se sienta como surfear, no como caminar en el lodo.

2.1 Componentes "Plug & Play"
Base de UI: Utilizaremos Shadcn/UI + Tailwind CSS. No reinventamos la rueda de los botones o modales.

Lógica Desacoplada: El 80% de la lógica de negocio debe vivir en Custom Hooks (useProspects, useAuth). El componente solo debe preocuparse de "cómo se ve".

Optimistic Updates: Para que la app se sienta instantánea, usaremos TanStack Query. Cuando un Joyer califica a un talento, la estrella se ilumina antes de que la petición llegue a Supabase.

2.2 Developer Experience (DX)
Tipado Estricto: Si un campo es opcional en la DB, es opcional en TypeScript. Usaremos el comando de generación de tipos de Supabase (supabase gen types typescript) diariamente para evitar desajustes.

Conventional Commits: feat:, fix:, refactor:, chore:. Si el commit no explica el "qué" y el "porqué", se rechaza el PR.

3. UX/UI y Accesibilidad (A11y)
Una herramienta interna no es excusa para una mala interfaz. Si no es accesible, no está terminado.

3.1 Reglas de Oro de Interfaz
Estado de Carga (Skeletons): Prohibidos los spinners infinitos. Usaremos Skeleton Screens que mantengan la estructura visual mientras los datos llegan.

Feedback de Acción: Cada acción (enviar, guardar, borrar) debe tener un "Toast" de confirmación. El usuario nunca debe adivinar si el sistema recibió su click.

Jerarquía Visual: Lo más importante (Top 10, nuevos ingresos) debe ser lo primero que el ojo escanea. Usaremos espacios en blanco generosos para reducir la fatiga cognitiva del Joyer.

3.2 Accesibilidad (WCAG 2.1)
Navegación por Teclado: Un Joyer experimentado debería poder navegar por la lista de prospectos usando solo el teclado (Tab, Enter, Esc).

Contraste y Lectura: Ratio mínimo de contraste 4.5:1 para texto. No usaremos solo colores (rojo/verde) para indicar estado; siempre acompañaremos con iconos o texto (ej: "Rechazado" + icono 🗙).

El Viaje del Talento: De Postulante a Seleccionado
Imagina que el sistema es una tubería con válvulas de seguridad. Un prospecto no puede "saltar" de un extremo al otro; debe pasar por validaciones que aseguren que los datos no se corrompan.

1. El Big Bang (Estado: unassigned)
Todo comienza cuando el prospecto envía el formulario desde el portal público.

La Acción: El sistema crea el registro en la tabla prospects.

La Solidez: Se genera automáticamente el primer status_log. No existe un prospecto en la base de datos sin un rastro de auditoría que diga: "El sistema recibió estos datos a tal hora".

El Vibe (UX): El usuario recibe su confirmación visual inmediata y el Joyer ve aparecer la notificación en "Nuevos Ingresos".

2. El Compromiso (Estado: assigned)
Aquí es donde entra la intervención humana. Un Administrador o Joyer senior decide quién evaluará este perfil.

La Acción: Se vincula un interviewer_id al prospecto.

La Solidez: Esta es una operación atómica. Si por alguna razón el sistema no puede registrar quién es el entrevistador, el estado no cambia a "Asignado". Evitamos el limbo de tener prospectos "en proceso" que nadie está mirando.

El Vibe (UX): El entrevistador asignado recibe acceso (vía RLS) para ver los detalles privados (CV, teléfono) que antes estaban ocultos.

3. La Bifurcación Final (Estados: selected o rejected)
Este es el punto de no retorno para el flujo inicial del MVP. El entrevistador emite su juicio.

La Acción: El flujo se divide en dos caminos excluyentes.

Camino A (Seleccionado): El talento entra al "Pool de Oro". Se habilita la capacidad de recibir calificaciones por proyectos futuros.

Camino B (Rechazado): El talento va a la "Lista Negra/Archivo". Sus datos se conservan por integridad (no destructivo), pero desaparece de las vistas operativas de búsqueda de talento activo.

La Solidez: Cada decisión requiere una "nota de cierre" obligatoria en el status_log. Si alguien pregunta en seis meses "¿Por qué rechazamos a este editor?", la respuesta está a un query de distancia.

El Vibe (UX): El sistema limpia automáticamente la vista "En la Mira" del entrevistador, manteniendo su dashboard libre de ruido cognitivo.

🛠️ Regla de Oro para el Desarrollador
Para que este flujo sea explicable, cada vez que el código haga un UPDATE en la columna status de un prospecto, debe venir acompañado de un INSERT en la tabla de logs dentro de la misma función.

Arquitecto Dice: "Si el log falla, el cambio de estado falla. Preferimos un error de sistema a una base de datos mentirosa".

5. Criterios de "Ready to Deploy"
Un feature se considera sólido si cumple esta lista:

Tipado: No hay any en el código.

A11y: Es navegable por teclado y tiene etiquetas aria-label donde el contexto no es obvio.

Responsividad: Funciona en el iPad del Jefe de Creativos y en el monitor ultrawide del Desarrollador.

Seguridad: El RLS ha sido probado para ese nuevo endpoint.

Explicabilidad: El código está documentado en las partes complejas (especialmente los cálculos de promedios de ratings).

Nota final: Priorizamos la simplicidad sobre la abstracción excesiva. Si una solución es "demasiado inteligente" para que un junior la entienda en 10 minutos, es una mala solución.