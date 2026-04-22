

| TALENT POOL MANAGER Sistema de Gestión de Talentos Freelance |
| :---: |

| Documento: Especificación de Requerimientos de Software (SRS) Versión: 1.1 — MVP Equipo Creativo (Rev. Ajustes) Fecha: Abril 2026 Estado: Borrador para revisión |
| :---- |

# **1\. Introducción**

## **1.1 Propósito del Documento**

Este documento describe los requerimientos funcionales y no funcionales del sistema Talent Pool Manager, una aplicación web diseñada para que una agencia creativa gestione su banco de talentos freelance. Sirve como acuerdo de base entre el equipo de producto, diseño y desarrollo, y define el alcance del MVP inicial centrado en el Equipo Creativo.

## **1.2 Alcance del Producto**

La aplicación cuenta con dos portales diferenciados:

* Portal de Prospectos: acceso público (solo con email) para que candidatos freelance se postulen a la agencia.

* Portal Joyer (Dashboard interno): acceso restringido por usuario y contraseña para que el personal de la agencia gestione, evalúe y califique los talentos.

El MVP cubre exclusivamente el flujo completo del Equipo Creativo, dejando preparada la arquitectura para sumar Equipo de Cuentas y Equipo Digital en fases posteriores.

## **1.3 Definiciones y Términos Clave**

| Término | Descripción |
| :---- | :---- |
| Prospecto | Candidato externo que se postula como freelance para trabajar con la agencia. |
| Joyer | Empleado de la agencia con acceso al dashboard interno. |
| Talento | Prospecto que superó el proceso de selección y fue aceptado para trabajar en proyectos. |
| En la Mira | Lista de prospectos sin entrevistar o en proceso de evaluación inicial. |
| Seleccionados | Lista de talentos que aprobaron la entrevista y están disponibles para proyectos. |
| Rechazados | Lista negra de perfiles que no pasaron el proceso de selección. |
| Entrevistador | Joyer habilitado por el administrador para evaluar prospectos. |
| Administrador | Joyer con permisos especiales: puede gestionar entrevistadores y acceder a configuración. |

## **1.4 Stack Tecnológico**

| Frontend | React (o framework equivalente) — Single Page Application |
| :---- | :---- |

| Backend / BDD | Supabase (PostgreSQL \+ Auth \+ Storage) |
| :---- | :---- |

| Autenticación | Supabase Auth — Magic Link (prospectos) \+ Email/Password (joyers) |
| :---- | :---- |

| Almacenamiento | Supabase Storage — CVs, fotos de perfil y portfolios |
| :---- | :---- |

| MVP | Fase 1 — Solo Equipo Creativo habilitado para carga completa |
| :---- | :---- |

# **2\. Descripción General del Sistema**

## **2.1 Perspectiva del Producto**

Talent Pool Manager es una aplicación web standalone que reemplaza el proceso manual de recepción y gestión de CVs freelance. Centraliza toda la información de candidatos, el historial de entrevistas, las calificaciones y los comentarios de los distintos equipos de la agencia.

## **2.2 Roles de Usuario**

| Rol | Acceso | Capacidades principales |
| :---- | :---- | :---- |
| Prospecto | Portal público (email) | Completar formulario de postulación, subir CV y foto |
| Joyer | Dashboard (user \+ pass) | Ver listas, asignar entrevistadores, dejar observaciones |
| Entrevistador | Dashboard (user \+ pass) | Todo lo de Joyer \+ actualizar estado de un prospecto |
| Administrador | Dashboard (user \+ pass) | Todo lo anterior \+ gestionar entrevistadores y configuración global |

## **2.3 Flujo General del Sistema**

| Flujo Prospecto | Flujo Joyer |
| :---- | :---- |
| 1\. Ingresa al portal con su email (magic link). | 1\. Ingresa con usuario y contraseña al dashboard. |
| 2\. Selecciona el equipo al que aplica. | 2\. Visualiza el home con top 10 y nuevos ingresos. |
| 3\. Completa el formulario del equipo elegido. | 3\. Navega las listas (En la Mira / Seleccionados / Rechazados). |
| 4\. Sube CV y foto de perfil. | 4\. Accede al perfil individual de un prospecto. |
| 5\. Envía la postulación (queda en lista 'En la Mira'). | 5\. Asigna entrevistador / actualiza estado / deja observaciones. |
|  | 6\. Califica a un talento que trabajó en un proyecto. |

# **3\. Portal de Prospectos**

## **3.1 Pantalla de Ingreso**

El prospecto accede a una URL pública de postulación. El único dato requerido para ingresar es su dirección de email. La autenticación se realiza mediante magic link de Supabase Auth: el sistema envía un enlace al email y el prospecto hace click para ingresar, sin necesidad de contraseña.

Condición especial: si un email ya tiene una postulación activa en la base de datos, el sistema muestra un mensaje informando que la postulación ya fue recibida y no permite completar un nuevo formulario.

## **3.2 Selección de Equipo**

Una vez autenticado, el prospecto ve una pantalla con tres opciones de equipo. En el MVP solo el Equipo Creativo tiene el formulario de postulación habilitado. Los otros dos equipos se muestran visualmente pero presentan un estado 'Próximamente' o similar al ser seleccionados.

* Equipo Creativo (habilitado en MVP)

* Equipo de Cuentas (visible, no habilitado en MVP)

* Equipo Digital — Redes Sociales (visible, no habilitado en MVP)

## **3.3 Formulario de Postulación — Equipo Creativo**

Al seleccionar Equipo Creativo, el prospecto ve el formulario con los siguientes campos:

| Campo | Tipo | Obligatorio | Notas |
| :---- | :---- | :---- | :---- |
| Nombre y Apellido | Texto libre | Sí |  |
| Email | Email (pre-cargado) | Sí | Tomado del login, solo lectura |
| Teléfono | Texto / número | No | Incluir código de área |
| Perfil / Especialidad | Desplegable | Sí | Ver opciones abajo |
| Años de experiencia | Número entero | Sí | Mínimo 0 |
| Link al Portfolio | URL | No | Validar formato URL |
| CV | Archivo (PDF) | Sí | Máx. 5 MB, solo PDF |
| Foto de perfil | Imagen (JPG/PNG) | Sí | Máx. 2 MB, cuadrada recomendada |

Opciones del desplegable de Perfil / Especialidad:

* Director de Arte

* Diseñador Gráfico

* Ilustrador/a

* Redactor/a Creativo/a

* Editor/a de Video

* Motion Graphics

## **3.4 Manejo de Postulaciones Existentes**

Cuando un prospecto ingresa con un email que ya tiene una postulación registrada, el sistema NO bloquea el acceso de forma definitiva. En cambio, presenta dos opciones:

* Ver mi postulación actual: muestra sus datos previos en modo solo lectura.

* Actualizar mi postulación: abre el formulario pre-completado para que pueda editarlo (nuevo portfolio, más años de experiencia, nuevo CV, etc.).

Lógica al actualizar: la postulación reemplaza los datos anteriores en la tabla prospects (se actualiza el registro existente, no se crea uno nuevo). El campo updated\_at refleja la fecha del cambio. El estado se resetea a 'unassigned' y el perfil vuelve a la lista En la Mira, preservando el historial de entrevistas previas en la tabla interviews.

Excepción: si el prospecto ya está en estado 'selected' (lista Seleccionados), no se permite el reset automático. Se muestra un mensaje indicando que su perfil ya fue aceptado y que debe comunicarse con la agencia para realizar actualizaciones.

## **3.5 Confirmación de Envío**

Al enviar el formulario con todos los campos obligatorios completos, el sistema muestra una pantalla de confirmación. Se le informa al prospecto que su postulación fue recibida y que el equipo se pondrá en contacto a la brevedad. El prospecto queda registrado automáticamente en la lista 'En la Mira' del dashboard interno.

# **4\. Portal Joyer — Dashboard Interno**

## **4.1 Autenticación**

Los Joyers acceden mediante email y contraseña gestionados por Supabase Auth. La creación de cuentas Joyer es responsabilidad exclusiva del administrador (no hay registro público). El sistema implementa control de sesión con cierre automático por inactividad configurable.

## **4.2 Home del Dashboard**

La pantalla de inicio muestra dos bloques principales de información:

### **Bloque 1 — Top 10 Talentos**

Grilla con los 10 perfiles de la lista Seleccionados que tienen mayor puntuación promedio. Cada tarjeta muestra foto, nombre y puntuación (estrellas o número). Un click abre el perfil completo. Si hay menos de 10 seleccionados con calificaciones, se completa con los de mayor puntuación disponible.

### **Bloque 2 — Nuevos Ingresos**

Listado de los últimos prospectos incorporados a la lista 'En la Mira', ordenados por fecha de postulación descendente. Cada tarjeta muestra foto, nombre y fecha de ingreso.

## **4.3 Menú de Navegación Principal**

| Sección | Nombre en UI | Descripción |
| :---- | :---- | :---- |
| Home | Inicio | Dashboard principal con Top 10 y nuevos ingresos |
| Lista cruda | En la Mira | Todos los prospectos sin asignar o en evaluación inicial |
| Lista depurada | Seleccionados | Talentos que superaron el proceso de entrevista |
| Lista negra | Rechazados | Perfiles descartados en el proceso de selección |

## **4.4 Listas de Prospectos / Talentos**

### **4.4.1 Comportamiento Común a Todas las Listas**

Cada lista presenta una grilla de tarjetas (cards). Cada tarjeta muestra:

* Foto de perfil del prospecto

* Nombre y apellido

* Perfil / especialidad (ej. 'Director de Arte')

* Equipo al que aplicó

Al hacer click sobre una tarjeta se accede a la vista de perfil detallado de ese prospecto.

### **4.4.1.1 Filtro por Especialidad (incluido en MVP)**

Cada lista incluye desde el día 1 un filtro básico por especialidad (profile\_type). Se implementa como un desplegable con las mismas opciones del formulario de postulación más la opción 'Todos'. El filtro es client-side y no requiere peticiones adicionales a la base de datos cuando la lista ya fue cargada. Esta decisión evita el caos operativo cuando la lista En la Mira supera las decenas de perfiles, con un costo de desarrollo mínimo.

* Opciones: Todos / Director de Arte / Diseñador Gráfico / Ilustrador/a / Redactor/a / Editor/a de Video / Motion Graphics

* Comportamiento: filtra en tiempo real sin recargar la página

* Contador: se actualiza mostrando cuántos perfiles coinciden con el filtro activo

### **4.4.2 Lista 'En la Mira'**

Muestra todos los prospectos cuyo estado es 'Sin entrevistar' o 'Entrevista asignada'. En el perfil individual de estos prospectos se muestra:

* Datos completos del formulario de postulación

* Link al CV descargable

* Link al portfolio (si lo ingresó)

* Campo de observaciones (texto libre, editable por entrevistadores y administradores)

* Selector de entrevistador: desplegable con los Joyers habilitados como entrevistadores por el administrador

* Botón 'Mover a Seleccionados' (disponible para entrevistadores y administradores)

* Botón 'Rechazar' (disponible para entrevistadores y administradores)

### **4.4.3 Lista 'Seleccionados'**

Muestra todos los talentos aceptados. En el perfil individual se muestra:

* Datos completos del formulario

* Nombre del Joyer que lo entrevistó y aprobó

* Fecha de aceptación

* Toggle 'En Proyecto' (Sí/No): indica si el talento está actualmente asignado a un trabajo activo

* Campo de observaciones

* Calificación promedio: estrellas de 1 a 5

* Bloque de comentarios y puntuaciones: cualquier Joyer puede agregar una puntuación (1-5) y un comentario sobre el trabajo de ese talento

### **4.4.4 Lista 'Rechazados'**

Muestra todos los perfiles descartados. En el perfil individual se muestra:

* Datos básicos del formulario

* Nombre del Joyer que lo rechazó

* Fecha de rechazo

* Campo de observaciones (solo lectura para la mayoría; editable por administradores)

## **4.5 Proceso de Selección — Flujo Detallado**

| Paso | Acción | Detalle |
| :---- | :---- | :---- |
| 1 | Recepción automática | El prospecto completa el formulario. Queda en 'En la Mira' con estado 'Sin asignar'. |
| 2 | Asignación de entrevistador | Un Joyer (o el admin) abre el perfil y selecciona un entrevistador del desplegable. El estado pasa a 'Entrevista asignada'. |
| 3 | Revisión del perfil | El entrevistador accede al perfil, descarga el CV, visita el portfolio y puede escribir observaciones. |
| 4a | Aceptar | El entrevistador hace click en 'Mover a Seleccionados'. El perfil pasa a la lista Seleccionados con los datos del entrevistador y la fecha. |
| 4b | Rechazar | El entrevistador hace click en 'Rechazar'. El perfil pasa a la lista Rechazados con los datos del entrevistador y la fecha. |

## **4.6 Estado 'En Proyecto' y Sistema de Calificación**

Dado que el sistema gestiona el pool de talentos pero no gestiona proyectos en sí mismos, se incorpora un indicador manual de disponibilidad en el perfil de cada talento Seleccionado.

### **4.6.1 Indicador 'En Proyecto'**

En el perfil de un talento Seleccionado, los Joyers pueden activar o desactivar el toggle 'En Proyecto (Sí / No)'. Este campo es puramente informativo y sirve para que el resto del equipo sepa si ese talento está actualmente ocupado en un trabajo para la agencia.

* El indicador se muestra también en la tarjeta de la grilla de Seleccionados (badge visual 'En Proyecto' o 'Disponible').

* Cualquier Joyer puede modificar este estado; no está restringido al entrevistador ni al administrador.

* El campo se mapea al booleano is\_in\_project en la tabla prospects.

### **4.6.2 Calificación de Talentos**

La opción de calificar a un talento está disponible únicamente para perfiles en la lista Seleccionados. No hay restricción técnica al estado is\_in\_project (un Joyer puede calificar incluso si el talento no está marcado en proyecto activo), ya que puede estar evaluando trabajo realizado previamente. Cualquier Joyer puede calificar, con una única calificación activa por talento, editable posteriormente. El sistema calcula y muestra el promedio de todas las calificaciones.

Componentes del bloque de calificación en el perfil:

* Puntuación: selector visual de 1 a 5 estrellas

* Comentario: texto libre con contexto del trabajo realizado

* Autor del comentario: nombre del Joyer que calificó

* Fecha de la calificación

* Promedio general visible en la tarjeta de la grilla

# **5\. Requerimientos Funcionales**

## **5.1 Módulo de Postulación (Prospecto)**

| ID | Requerimiento | Prioridad | Notas MVP |
| :---- | :---- | ----- | :---- |
| **RF-01** | El sistema permite el ingreso de prospectos solo con su dirección de email (magic link). | **Alta** | Supabase Auth Magic Link |
| **RF-02** | El sistema muestra las tres opciones de equipo al prospecto autenticado. | **Alta** | Solo Equipo Creativo funcional |
| **RF-03** | El sistema presenta el formulario de postulación del Equipo Creativo con todos los campos definidos. | **Alta** | Ver sección 3.3 |
| **RF-04** | El sistema valida los campos obligatorios antes del envío. | **Alta** | Validación client-side y server-side |
| **RF-05** | El sistema permite subir el CV en formato PDF (máx. 5 MB) via Supabase Storage. | **Alta** |  |
| **RF-06** | El sistema permite subir una foto de perfil JPG/PNG (máx. 2 MB) via Supabase Storage. | **Alta** |  |
| **RF-07** | Si el email ya existe, el sistema ofrece ver o actualizar la postulación existente en lugar de bloquear el acceso. | **Alta** | Ver sección 3.4. Reset de estado solo si no está en Seleccionados. |
| **RF-08** | El sistema muestra pantalla de confirmación tras el envío exitoso. | **Alta** |  |
| **RF-09** | El prospecto enviado queda registrado en la lista 'En la Mira' con estado 'Sin asignar'. | **Alta** |  |

## **5.2 Módulo de Autenticación Joyer**

| ID | Requerimiento | Prioridad | Notas MVP |
| :---- | :---- | ----- | :---- |
| **RF-10** | Los Joyers se autentican con email y contraseña (Supabase Auth). | **Alta** |  |
| **RF-11** | El administrador puede crear y eliminar cuentas Joyer desde el panel de configuración. | **Alta** | Solo admin |
| **RF-12** | El sistema implementa control de roles: Joyer, Entrevistador, Administrador. | **Alta** | Via Supabase RLS |
| **RF-13** | La sesión expira automáticamente por inactividad. | **Media** | Configurable |

## **5.3 Módulo de Dashboard**

| ID | Requerimiento | Prioridad | Notas MVP |
| :---- | :---- | ----- | :---- |
| **RF-14** | El home muestra el top 10 de talentos con mayor puntuación promedio. | **Alta** |  |
| **RF-15** | El home muestra los últimos prospectos incorporados a 'En la Mira'. | **Alta** |  |
| **RF-16** | El menú principal permite navegar entre Home, En la Mira, Seleccionados y Rechazados. | **Alta** |  |
| **RF-17** | Cada lista muestra una grilla de tarjetas con foto, nombre y perfil. | **Alta** |  |
| **RF-18** | Al hacer click en una tarjeta se accede al perfil detallado del prospecto/talento. | **Alta** |  |
| **RF-19b** | Cada lista tiene un filtro client-side por especialidad (profile\_type) con las opciones del formulario más 'Todos'. | **Alta** | Incluido en MVP. Filtra en tiempo real, actualiza contador. |

## **5.4 Módulo de Gestión de Prospectos**

| ID | Requerimiento | Prioridad | Notas MVP |
| :---- | :---- | ----- | :---- |
| **RF-19** | El perfil de un prospecto 'En la Mira' muestra todos sus datos completos. | **Alta** |  |
| **RF-20** | El perfil permite descargar el CV del prospecto. | **Alta** |  |
| **RF-21** | El perfil muestra el link al portfolio (si existe) como enlace externo. | **Alta** |  |
| **RF-22** | Los Joyers habilitados pueden escribir observaciones sobre un perfil. | **Alta** |  |
| **RF-23** | El admin puede asignar entrevistadores mediante un desplegable en el perfil del prospecto. | **Alta** | Solo cuentas con rol Entrevistador |
| **RF-24** | El entrevistador asignado puede mover un prospecto a 'Seleccionados'. | **Alta** | Registra quien aceptó y la fecha |
| **RF-25** | El entrevistador asignado puede mover un prospecto a 'Rechazados'. | **Alta** | Registra quien rechazó y la fecha |
| **RF-26** | El perfil de 'Seleccionados' muestra el nombre del entrevistador que lo aprobó y la fecha. | **Alta** |  |
| **RF-27** | El perfil de 'Rechazados' muestra el nombre del entrevistador que lo rechazó y la fecha. | **Alta** |  |

## **5.5 Módulo de Calificación**

| ID | Requerimiento | Prioridad | Notas MVP |
| :---- | :---- | ----- | :---- |
| **RF-28a** | El perfil de un talento Seleccionado muestra un toggle 'En Proyecto' (Sí/No) editable por cualquier Joyer. | **Alta** | Mapea a is\_in\_project en tabla prospects. |
| **RF-28b** | El estado 'En Proyecto' se muestra como badge visual en la tarjeta de la grilla de Seleccionados. | **Alta** | Badge 'En Proyecto' / 'Disponible'. |
| **RF-28c** | Cualquier Joyer puede calificar a un talento Seleccionado. | **Alta** | No requiere que is\_in\_project sea true. |
| **RF-29** | La calificación es de 1 a 5 estrellas con un comentario de texto libre. | **Alta** |  |
| **RF-30** | Cada Joyer solo puede tener una calificación activa por talento (editable). | **Media** |  |
| **RF-31** | El sistema calcula y muestra el promedio de calificaciones en el perfil y en la tarjeta de la grilla. | **Alta** |  |
| **RF-32** | El bloque de calificaciones muestra el autor, la puntuación, el comentario y la fecha. | **Alta** |  |

# **6\. Requerimientos No Funcionales**

| Categoría | Requerimiento |
| :---- | :---- |
| Rendimiento | El dashboard debe cargar en menos de 3 segundos en condiciones normales de uso. |
| Escalabilidad | La arquitectura Supabase debe permitir agregar nuevos equipos (Cuentas, Digital) sin rediseño de la base de datos. |
| Seguridad | Row Level Security (RLS) en Supabase: cada usuario solo accede a los datos que le corresponden según su rol. |
| Seguridad — RLS Crítico | Un prospecto autenticado (magic link) solo puede leer y editar su propia fila en la tabla prospects. Las políticas de Supabase deben impedir explícitamente que un prospecto consulte las tablas ratings, interviews o joyers, incluso a través de la consola del navegador o llamadas directas a la API de Supabase. |
| Seguridad — RLS Crítico | La política RLS de prospects para el rol 'anon' / 'authenticated prospect' debe ser: SELECT WHERE id \= auth.uid(). Sin acceso a filas de otros prospectos. Sin acceso a columnas de estado interno (status, interviewer\_id). |
| Seguridad — Storage | Los archivos en Supabase Storage tienen acceso controlado: CVs y fotos de perfil son accesibles para el prospecto dueño del archivo y para todos los Joyers autenticados. Ningún usuario anónimo puede acceder a estos recursos. |
| Usabilidad | El portal de prospectos debe ser 100% responsive y funcionar correctamente en mobile. |
| Usabilidad | El dashboard interno debe ser responsive, con optimización preferente para desktop. |
| Disponibilidad | Aprovechar el uptime garantizado por la infraestructura de Supabase (SLA del plan elegido). |
| Mantenibilidad | El código del frontend debe estar modularizado por feature (postulación, dashboard, listas, perfil). |
| Privacidad | Los datos personales de los prospectos solo son visibles para Joyers autenticados. No se exponen en URLs públicas. |

# **7\. Modelo de Datos — Supabase**

## **7.1 Tablas Principales**

### **Tabla: prospects**

| Campo | Tipo | Descripción |
| :---- | :---- | :---- |
| id | uuid (PK) | Identificador único del prospecto |
| email | text (unique) | Email de postulación |
| full\_name | text | Nombre y apellido |
| phone | text | Teléfono de contacto |
| team | text | Equipo al que aplica: creative / accounts / digital |
| profile\_type | text | Especialidad dentro del equipo creativo |
| years\_experience | integer | Años de experiencia declarados |
| portfolio\_url | text | URL al portfolio (nullable) |
| cv\_url | text | Path del CV en Supabase Storage |
| photo\_url | text | Path de la foto en Supabase Storage |
| status | text | unassigned / assigned / selected / rejected |
| is\_in\_project | boolean (default false) | Indica si el talento está actualmente asignado a un proyecto activo. Solo editable por Joyers. |
| created\_at | timestamptz | Fecha y hora de postulación |
| updated\_at | timestamptz | Última actualización del perfil |

### **Tabla: interviews**

| Campo | Tipo | Descripción |
| :---- | :---- | :---- |
| id | uuid (PK) | Identificador único del registro de entrevista |
| prospect\_id | uuid (FK) | Referencia a prospects.id |
| interviewer\_id | uuid (FK) | Referencia al joyer asignado (joyers.id) |
| outcome | text | accepted / rejected / pending |
| notes | text | Observaciones del entrevistador |
| outcome\_at | timestamptz | Fecha y hora del resultado (nullable) |
| created\_at | timestamptz | Fecha de asignación del entrevistador |

### **Tabla: ratings**

| Campo | Tipo | Descripción |
| :---- | :---- | :---- |
| id | uuid (PK) | Identificador único de la calificación |
| prospect\_id | uuid (FK) | Referencia al talento calificado |
| joyer\_id | uuid (FK) | Joyer que emite la calificación |
| score | integer (1-5) | Puntuación otorgada |
| comment | text | Comentario sobre el trabajo realizado |
| created\_at | timestamptz | Fecha de la calificación |
| updated\_at | timestamptz | Última edición de la calificación |

### **Tabla: joyers**

Esta tabla extiende los datos de auth.users de Supabase con información del rol y permisos internos.

| Campo | Tipo | Descripción |
| :---- | :---- | :---- |
| id | uuid (PK \= auth.users.id) | Enlazado con Supabase Auth |
| full\_name | text | Nombre completo del joyer |
| role | text | joyer / interviewer / admin |
| team | text | Equipo al que pertenece en la agencia (nullable) |
| is\_active | boolean | Permite desactivar acceso sin eliminar la cuenta |
| created\_at | timestamptz | Fecha de alta en el sistema |

# **8\. Descripción de Pantallas Clave (UI)**

## **8.1 Portal Prospectos**

| Pantalla | Elementos principales |
| :---- | :---- |
| Landing / Login | Logo de la agencia, campo de email, botón 'Recibir link de acceso', mensaje de confirmación de envío de email. |
| Selección de Equipo | 3 cards visuales con el nombre y descripción de cada equipo. Equipo Creativo activo; los otros con badge 'Próximamente'. |
| Formulario Postulación | Formulario multi-campo con todos los inputs definidos en 3.3. Botón 'Enviar postulación' al final. Indicador de progreso opcional. |
| Confirmación | Icono de éxito, texto de confirmación, información sobre próximos pasos. |

## **8.2 Dashboard Joyer**

| Pantalla | Elementos principales |
| :---- | :---- |
| Login Joyer | Logo, campos email y contraseña, botón 'Ingresar', link para recuperar contraseña. |
| Home Dashboard | Header con nombre del Joyer. Sección Top 10 (grilla horizontal de tarjetas). Sección Nuevos Ingresos (lista de tarjetas verticales). Menú lateral o superior. |
| Lista (cualquiera) | Breadcrumb de ubicación. Grilla de mini-tarjetas con foto, nombre y perfil. Filtros opcionales por especialidad. Contador de total de perfiles. |
| Perfil Prospecto (En la Mira) | Foto grande, datos completos, CV descargable, link portfolio, selector de entrevistador, campo observaciones, botones Aceptar/Rechazar. |
| Perfil Talento (Seleccionados) | Idem anterior \+ badge 'Seleccionado', entrevistador que aprobó, fecha de aceptación, bloque de calificaciones y comentarios. |
| Perfil Rechazado | Datos del prospecto \+ badge 'Rechazado', motivo/observaciones (solo lectura para joyers base), nombre del entrevistador, fecha. |

# **9\. Alcance del MVP — Checklist**

## **9.1 Incluido en el MVP**

* Portal de postulación de prospectos (solo Equipo Creativo operativo)

* Autenticación de prospectos via magic link

* Formulario completo con todos los campos del Equipo Creativo

* Subida de CV y foto a Supabase Storage

* Autenticación de Joyers con email/contraseña

* Home del dashboard con Top 10 y Nuevos Ingresos

* Menú principal con las cuatro secciones

* Grilla de mini-tarjetas en cada lista

* Vista de perfil detallado de prospectos

* Selector de entrevistador en perfiles 'En la Mira'

* Proceso completo de aceptación o rechazo

* Calificación 1-5 estrellas con comentario para talentos Seleccionados

* Control de roles básico: Joyer / Entrevistador / Administrador

## **9.2 Fuera del MVP (Fases Futuras)**

* Formularios para Equipo de Cuentas y Equipo Digital

* Notificaciones por email a prospectos sobre el estado de su postulación

* Filtros avanzados multi-campo y búsqueda full-text (el filtro básico por especialidad ya está en MVP).

* Panel de administración de Joyers con UI (en MVP se gestiona directo en Supabase)

* Exportación de listas a CSV / Excel

* Estadísticas y analytics de postulaciones

* Integración con calendarios para agendar entrevistas

* Sistema de tags o etiquetas para perfiles

* Historial de cambios de estado de un perfil (audit log)

## **9.3 Criterios de Aceptación del MVP**

1. Un candidato puede completar el formulario del Equipo Creativo desde mobile sin errores.

2. El Joyer puede ver el perfil completo de un prospecto, incluido el CV descargable.

3. El administrador puede asignar un entrevistador a un prospecto desde el dropdown.

4. El entrevistador puede mover un prospecto a 'Seleccionados' o 'Rechazados'.

5. El Joyer puede calificar con 1 a 5 estrellas a un talento Seleccionado y el promedio se actualiza en tiempo real.

6. El home muestra correctamente el Top 10 y los últimos ingresos.

# **10\. Preguntas Abiertas y Decisiones Pendientes**

| \# | Pregunta | Impacto |
| :---- | :---- | :---- |
| 1 | ¿Se notifica por email al prospecto cuando cambia el estado de su postulación (aceptado/rechazado)? | Requiere configurar Supabase Edge Functions o servicio de email externo. |
| 2 | ¿Los campos del formulario para Equipo Creativo son definitivos o pueden ajustarse antes del desarrollo? | Afecta el schema de la tabla prospects. |
| 3 | ¿La creación de cuentas Joyer en el MVP se hace directamente desde el panel de Supabase o necesita UI mínima? | Define el alcance del módulo de administración. |
| 4 | ¿Los entrevistadores solo pueden ser Joyers internos o también pueden ser externos (freelancers senior)? | Afecta el flujo de autenticación. |
| 5 | ¿Una calificación está atada a un proyecto específico o es general sobre el talento? | Define la cardinalidad de la tabla ratings. |
| 6 | ¿Se puede 'rehabilitar' un perfil Rechazado para moverlo de vuelta a En la Mira o a Seleccionados? | Define si el flujo de estados es unidireccional o bidireccional. |

*Este documento está sujeto a revisión. Versión actualizada con las respuestas a las preguntas abiertas se publicará antes del inicio del desarrollo.*

