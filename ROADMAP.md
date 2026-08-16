# Roadmap — CREACIONES EMALELI

> Plataforma e-commerce a medida (catálogo + personalización de productos + gestión de pedidos y producción) construida con **Next.js**, **Prisma** y **Supabase**.

**Leyenda de estado:** `[ ]` pendiente · `[~]` en progreso · `[x]` completado

**Stack de referencia (asumido, ajustar si difiere):**

- Frontend/Backend: Next.js (App Router) + TypeScript
- ORM: Prisma
- Base de datos: PostgreSQL (Supabase)
- Storage: Supabase Storage
- Estilos: Tailwind CSS
- Autenticación: NextAuth.js / Supabase Auth (a definir en Fase 1)
- Notificaciones al cliente: WhatsApp (enlace `wa.me`)

---

## FASE 0 — Diseño

**Objetivo:** dejar completamente definido el proyecto antes de escribir código de producto.

### 0.1 Arquitectura

- [x] Definir estructura de carpetas del proyecto, arquitectura modular (`app/`, `src/backend/modules/*`, `src/frontend/components|modules/*`, `src/shared/`, `prisma/`) — reorganizada en la revisión de Fase 2 (antes vivía todo bajo `src/features/*`)
- [x] Separar dominios: `(public)` tienda vs `(admin)` panel administrativo como route groups
- [x] Definir convención de nombres (archivos, componentes, funciones, variables de entorno)
- [x] Definir organización por módulos de dominio (catálogo, pedidos, pagos, envíos, configuración)
- [x] Definir capa de acceso a datos (repositorios / servicios) separada de la UI
- [x] Definir estrategia de manejo de errores y logging
- [x] Definir convención de commits (Conventional Commits) y estrategia de ramas (main / develop / feature)
- [x] Documentar decisiones de arquitectura (ADR simples) en `/docs/adr`

### 0.2 Base de datos (Prisma)

- [x] Modelar entidades principales: `Usuario/Admin`, `Categoria`, `Producto`, `Variante`, `Personalizacion`, `Cliente`, `Pedido`, `ItemPedido`, `Pago`, `Envio`, `ArchivoAdjunto`, `SolicitudCambio`, `Configuracion`
- [x] Definir relaciones (1-1, 1-N, N-N) entre entidades
- Definir enumeraciones:
  - [x] `EstadoPedido` (Nuevo, En revisión, Esperando cliente, Diseño aprobado, Producción, Empacado, Enviado, Entregado)
  - [x] `MetodoEnvio` (Recoger, Domicilio, Transportadora)
  - [x] `TipoPersonalizacion` (Texto, Número, Color, Archivo, Lista, Checkbox)
  - [x] `EstadoProducto` (Activo, Inactivo, Agotado)
  - [x] `TipoPago` (Anticipo, Abono, Pago final)
  - [x] `EstadoFactura` (Pendiente, Emitida, Anulada)
- [x] Definir índices para búsquedas frecuentes (slug de producto, código de pedido, ciudad, estado)
- [x] Definir claves únicas (slug, código de pedido, número de guía)
- [x] Definir soft-delete vs hard-delete por entidad
- [x] Diagrama entidad-relación (ERD) documentado
- [x] Estrategia de migraciones (`prisma migrate dev` / `deploy`) y seed inicial

### 0.3 Diseño UI

- [x] Definir paleta de colores (primario, secundario, acento, estados: éxito/alerta/error/info, escala de grises)
- [x] Definir tipografía (familia, escalas de tamaño, pesos, line-height)
- [x] Definir sistema de espaciado (escala base 4px/8px, contenedores, breakpoints)
- [x] Definir radios de borde, sombras y elevaciones
- [x] Definir librería/base de componentes (tokens de diseño en Tailwind config)
- [x] Wireframes de baja fidelidad de pantallas clave (inicio, catálogo, producto, carrito, checkout, panel admin)
- [x] Mockups de alta fidelidad (Figma u otra herramienta) de las pantallas clave

### 0.4 Navegación

- [x] Mapa de rutas públicas (`/`, `/catalogo`, `/producto/[slug]`, `/carrito`, `/checkout`, `/pedido/[codigo]`, `/seguimiento/[token]`)
- [x] Mapa de rutas administrativas (`/admin`, `/admin/productos`, `/admin/pedidos`, `/admin/pagos`, `/admin/envios`, `/admin/configuracion`, `/admin/reportes`)
- [x] Flujo del cliente: descubrimiento → producto → personalización → carrito → checkout → seguimiento
- [x] Flujo del administrador: login → dashboard → gestión de pedido → producción → pagos → envío → cierre
- [x] Definir rutas protegidas vs públicas

**Entregable de la fase:** documento de arquitectura, esquema Prisma inicial (`schema.prisma`), guía de estilos UI y mapa de navegación aprobados.

---

## FASE 1 — Infraestructura

**Objetivo:** tener el proyecto ejecutándose end-to-end con conexión a servicios externos.

### 1.1 Next.js

- [x] Inicializar proyecto (App Router, TypeScript, ESLint, Tailwind)
- [x] Configurar alias de imports (`@/*`)
- [x] Configurar `next.config.js` (imágenes remotas, dominios permitidos)
- [x] Configurar linting y formateo (ESLint + Prettier) con hooks pre-commit (Husky + lint-staged)
- [x] Configurar estructura base de layouts (`app/(public)/layout.tsx`, `app/(admin)/layout.tsx`)

### 1.2 Prisma

- [x] Instalar Prisma y generar cliente
- [x] Conexión a Supabase (connection string con pooling — `pgbouncer` para runtime, `direct` para migraciones)
- [x] Configurar `schema.prisma` con datasource y generator
- [x] Ejecutar primera migración
- [x] Script de seed con datos de prueba (categorías, productos demo, admin)

### 1.3 Storage

- [x] Crear buckets en Supabase Storage: `productos`, `pedidos-archivos`, `pedidos-comprobantes`, `configuracion` (logo/banners)
- [x] Definir políticas de acceso (públicas vs privadas) por bucket
- [x] Definir convención de rutas de archivos (`productos/{productoId}/{filename}`)
- [x] Utilidad de subida/borrado de archivos reutilizable (`lib/storage.ts`)
- [x] Límites de tamaño y tipos de archivo permitidos por bucket

### 1.4 Variables de entorno

- [x] Definir `.env.example` con todas las variables necesarias
- [x] Configurar entorno de **desarrollo** (`.env.local`, base de datos de desarrollo/staging)
- [x] Configurar entorno de **producción** (variables en el proveedor de hosting)
- [x] Variables sensibles fuera del control de versiones (`.gitignore`)
- [x] Documentar cada variable y su propósito en `/docs/environment.md`

### 1.5 Autenticación

- [x] Implementar login de administrador (email/contraseña o magic link)
- [x] Hash seguro de contraseñas (bcrypt/argon2) si aplica
- [x] Manejo de sesión (JWT o sesión de base de datos)
- [x] Middleware de protección de rutas `/admin/*`
- [x] Página de login con manejo de errores y estados de carga
- [ ] Recuperación de contraseña (opcional en esta fase)
- [x] Cierre de sesión

### 1.6 Sistema de permisos

- [x] Modelar tabla `Rol` y `Permiso` (o enum inicial simple), pensado para escalar
- [x] Rol único inicial: `ADMIN` con acceso total
- [x] Middleware/guard reutilizable para validar permisos por ruta y por acción
- [x] Documentar cómo se agregarán roles futuros (ej. `PRODUCCION`, `VENTAS`, `SOPORTE`)

**Entregable de la fase:** app desplegable, conectada a Supabase (DB + Storage), con login de admin funcional y rutas protegidas.

---

## FASE 2 — Panel Administrativo (Base UI)

**Objetivo:** construir el esqueleto y la librería de componentes del panel admin.

### 2.1 Layout

- [x] Sidebar de navegación (colapsable, con íconos y secciones)
- [x] Navbar superior (usuario, notificaciones, buscador global)
- [x] Breadcrumb dinámico según ruta
- [x] Footer del panel (versión, enlaces internos)
- [x] Layout responsivo (desktop, tablet, mobile con sidebar tipo drawer)

### 2.2 Componentes base (design system interno)

- [x] `Button` (variantes: primario, secundario, destructivo, ghost; estados: loading, disabled)
- [x] `Input` (texto, número, con validación y mensajes de error)
- [x] `Select` (simple, buscable, multi-select)
- [x] `Checkbox`
- [x] `Textarea`
- [x] `Card`
- [x] `Modal`
- [x] `Drawer` (panel lateral)
- [x] `Table` (ordenable, con acciones por fila, selección múltiple)
- [x] `Pagination`
- [x] `Badge` (para estados de pedido, activo/inactivo)
- [x] `Empty State`
- [x] `Loader` (spinner/skeleton)
- [x] `Toast` (notificaciones de éxito/error/info)
- [x] Documentar componentes (Storybook opcional → se documentó en `docs/design-system.md`, sin Storybook)

### 2.3 Tema

- [ ] Tema claro (por defecto)
- [ ] Tema oscuro (opcional) con toggle y persistencia de preferencia

**Entregable de la fase:** panel administrativo navegable con librería de componentes reutilizable y consistente.

---

## FASE 3 — Catálogo (Backend + Admin)

**Objetivo:** administrar el catálogo completo de productos desde el panel.

### 3.1 Categorías

- [x] CRUD completo de categorías
- [x] Subida de imagen de categoría
- [x] Campo de orden (drag & drop o input numérico)
- [x] Activar/desactivar categoría (oculta en tienda pública si está inactiva)
- [x] Validación de slug único

### 3.2 Productos

- [x] CRUD completo de productos
- [x] Generación automática de slug (editable) y validación de unicidad
- [x] Precio base (y precio con descuento opcional)
- [x] Descripción corta y descripción larga (rich text) — implementado con textarea de texto plano por ahora; un editor WYSIWYG (Tiptap) queda pendiente como mejora incremental, no bloquea el resto del catálogo
- [x] SEO básico: título SEO, meta descripción, imagen OG
- [x] Estado del producto (activo/inactivo/agotado)
- [x] Tiempo de producción estimado (días) visible en tienda
- [x] Asociación producto–categoría (una o varias)

### 3.3 Galería

- [x] Subida de varias imágenes por producto
- [x] Selección de imagen principal
- [x] Reordenar imágenes (drag & drop)
- [x] Eliminar imágenes individuales
- [ ] Optimización/redimensionado al subir — pendiente: requiere agregar `sharp` (o similar) al pipeline de subida; no bloquea el resto de 3.3

### 3.4 Variantes

- [x] Modelo de variantes por producto (talla, color, material)
- [x] Combinaciones de variantes (matriz talla×color, con stock/precio diferenciado si aplica)
- [x] Activar/desactivar variantes específicas
- [x] Imagen asociada por variante (opcional, ej. por color)

### 3.5 Personalizaciones

- [x] Constructor de campos de personalización por producto
- [x] Tipos soportados: Texto, Número, Color, Archivo, Lista (opciones), Checkbox
- [x] Configuración de campo obligatorio/opcional
- [x] Reglas de validación por tipo (longitud máxima, formatos de archivo, rango numérico)
- [x] Precio adicional por opción de personalización (si aplica)
- [x] Orden de visualización de los campos

**Entregable de la fase:** catálogo completamente administrable, listo para consumir desde la tienda pública.

---

## FASE 4 — Tienda Pública

**Objetivo:** experiencia de compra pública, atractiva y funcional.

### 4.1 Inicio

- [x] Hero principal (banner destacado, CTA)
- [x] Sección de productos destacados
- [x] Sección de categorías (grid navegable)
- [x] Sección de testimonios de clientes — contenido estático por ahora; pasa a gestionable en Configuración (Fase 11)
- [x] Sección de preguntas frecuentes (FAQ) — contenido estático por ahora; mismo motivo que testimonios

### 4.2 Catálogo

- [x] Listado de productos con paginación/infinite scroll — paginación por número de página (no infinite scroll)
- [x] Búsqueda por nombre/palabra clave
- [x] Filtros (categoría, precio, variantes disponibles) — categoría y precio implementados vía query params; filtro por variante específica (ej. "solo color rojo" a través de todo el catálogo) queda pendiente
- [x] Ordenamiento (precio asc/desc, más recientes, más vendidos) — "más vendidos" cae a "más recientes" hasta que exista historial de pedidos (Fase 7) para calcular unidades vendidas
- [x] Estado vacío cuando no hay resultados

### 4.3 Producto

- [x] Galería de imágenes con zoom/carrusel — zoom on-hover + miniaturas clicables (sin carrusel de swipe dedicado)
- [x] Selector de variantes (talla, color, material) con actualización de precio/imagen
- [x] Formulario dinámico de personalizaciones según tipo de campo
- [x] Cálculo de precio total en tiempo real (base + variantes + personalizaciones)
- [x] Sección de productos relacionados
- [x] Indicador de tiempo estimado de producción

**Nota de diseño:** la UI de la tienda pública adapta la paleta, tipografía y lenguaje visual (tarjetas redondeadas, sombras suaves) del diseño de referencia (`emaleli-idea.html`), pero no replica su shell fijo de 3 columnas (sidebar 240px + carrito 340px siempre visibles a 1600px) — se optó por un layout responsive con el carrito como drawer para que funcione en móvil.

**Entregable de la fase:** tienda pública navegable, con catálogo filtrable y ficha de producto totalmente configurable por el cliente.

---

## FASE 5 — Carrito

**Objetivo:** gestión de ítems seleccionados antes del checkout.

### 5.1 Carrito

- [x] Agregar producto (con variante y personalización) al carrito
- [x] Editar ítem del carrito (cambiar cantidad, variante o personalización) — cantidad editable inline; cambiar variante/personalización requiere quitar el ítem y volver a agregarlo desde la ficha del producto
- [x] Eliminar ítem del carrito
- [x] Control de cantidades (incremento/decremento, validación mínima de 1)

### 5.2 Persistencia

- [x] Persistencia en LocalStorage (carrito de invitado)
- [x] Persistencia complementaria en cookies si se requiere SSR del estado del carrito — cookie liviana con el conteo de ítems (`emaleli_cart_count`)
- [x] Sincronización entre pestañas del navegador
- [x] Expiración/limpieza de carritos antiguos — ítems con más de 14 días se descartan al cargar

### 5.3 Resumen

- [x] Cálculo de subtotal por ítem
- [x] Cálculo de total general
- [x] Tiempo estimado de entrega/producción agregado (según ítem más lento)
- [x] Vista de carrito lateral (drawer) y vista de página completa

**Entregable de la fase:** carrito funcional, persistente entre sesiones, con resumen claro antes de avanzar al checkout.

---

## FASE 6 — Checkout

**Objetivo:** capturar los datos necesarios y generar el pedido.

### 6.1 Datos del cliente

- [x] Nombre completo
- [x] Número de WhatsApp (con validación de formato)
- [x] Ciudad
- [x] Correo electrónico
- [ ] Empresa (opcional, para pedidos corporativos)

### 6.2 Datos del pedido

- [x] Campo de observaciones generales
- [x] Adjuntar archivos de referencia (logos, diseños)
- [x] Confirmación final de personalizaciones seleccionadas por ítem

### 6.3 Envío

- [x] Selección de método: Recoger en tienda, Domicilio, Transportadora
- [x] Formulario condicional según método elegido
- [x] Cálculo de costo de envío (si aplica, según ciudad/transportadora)

### 6.4 Confirmación

- [x] Crear el pedido en base de datos (transacción atómica: pedido + ítems + archivos)
- [x] Generar código único de pedido (legible, ej. `EML-2026-0001`)
- [x] Pantalla de confirmación con resumen del pedido
- [x] Botón para abrir WhatsApp con mensaje prellenado (número + resumen + código de pedido)
- [x] Envío de correo de confirmación (opcional)
- [x] Vaciar carrito tras confirmación exitosa

**Entregable de la fase:** flujo de checkout completo, generando pedidos reales y facilitando contacto inmediato por WhatsApp.

---

## FASE 7 — Gestión de Pedidos (Admin)

**Objetivo:** administrar el ciclo de vida completo del pedido desde el panel.

### 7.1 Dashboard de pedidos

- [x] Vista de pedidos "Nuevos"
- [x] Vista de pedidos "En producción"
- [x] Vista de pedidos "Enviados"
- [x] Vista tipo Kanban (opcional) por estado
- [x] Filtros por fecha, ciudad, estado, cliente

### 7.2 Detalle del pedido

- [x] Información del cliente
- [x] Listado de productos/ítems con variantes y personalizaciones
- [x] Historial de pagos asociados
- [x] Archivos adjuntos (del cliente y del proceso de producción)
- [x] Historial/timeline completo de eventos

### 7.3 Estados del pedido

- [x] Nuevo
- [x] En revisión
- [x] Esperando cliente
- [x] Diseño aprobado
- [x] Producción
- [x] Empacado
- [x] Enviado
- [x] Entregado
- [x] Validar transiciones permitidas entre estados (máquina de estados)
- [x] Notificación al cliente en cambios de estado clave (WhatsApp/email)

### 7.4 Timeline

- [x] Registro automático de eventos (cambios de estado, pagos, mensajes, archivos)
- [x] Registro de usuario/admin responsable del evento
- [x] Vista cronológica en el detalle del pedido

**Entregable de la fase:** panel de operaciones completo para dar seguimiento a cada pedido desde su creación hasta la entrega.

---

## FASE 8 — Producción

**Objetivo:** dar visibilidad del proceso de producción al equipo y al cliente.

### 8.1 Actualizaciones de producción

- [x] Subida de fotos de avance
- [x] Subida de videos de avance
- [x] Comentarios internos y comentarios visibles al cliente

### 8.2 Solicitudes de cambio

- [x] Crear solicitud de cambio (desde admin o generada por el cliente)
- [x] Registrar respuesta del cliente (aprueba/rechaza/comenta) — el admin la registra en el detalle del pedido (canal actual: WhatsApp/llamada), no hay login de cliente
- [x] Cierre de la solicitud con estado final

### 8.3 Seguimiento

- [x] Vista pública de seguimiento por enlace único (token no adivinable)
- [x] Mostrar estado actual, timeline resumido y actualizaciones de producción
- [x] Sin necesidad de autenticación para el cliente

**Entregable de la fase:** proceso de producción documentado y visible, mejorando la comunicación con el cliente sin canales adicionales.

---

## FASE 9 — Pagos

**Objetivo:** registrar y controlar el estado financiero de cada pedido.

### 9.1 Anticipos

- [x] Registrar anticipo (monto, fecha, método de pago)

### 9.2 Abonos

- [x] Registrar abonos parciales adicionales
- [x] Cálculo automático de saldo pendiente

### 9.3 Pago final

- [x] Registrar pago final
- [x] Validación de que el total pagado coincide con el total del pedido

### 9.4 Comprobantes

- [x] Subida de archivos de comprobante de pago (imagen/PDF)
- [x] Asociación de comprobante a cada pago registrado

### 9.5 Facturación

- [x] Subida de PDF de factura
- [x] Estado de facturación (pendiente, emitida, anulada)

**Entregable de la fase:** control financiero por pedido con trazabilidad de anticipos, abonos, pago final y comprobantes.

---

## FASE 10 — Envíos

**Objetivo:** gestionar la logística de entrega de cada pedido.

### 10.1 Métodos

- [ ] Recoger en tienda
- [ ] Domicilio
- [ ] Transportadora

### 10.2 Datos de envío

- [ ] Dirección
- [ ] Ciudad
- [ ] Destinatario
- [ ] Documento de identidad (si aplica, según transportadora)
- [ ] Teléfono de contacto

### 10.3 Guías

- [ ] Número de guía
- [ ] Estado de la guía (generada, en tránsito, entregada, devuelta)
- [ ] Fecha de despacho/entrega
- [ ] Enlace de rastreo externo (si la transportadora lo provee)

**Entregable de la fase:** módulo de envíos con datos completos y trazabilidad de guías por pedido.

---

## FASE 11 — Configuración

**Objetivo:** permitir administrar los datos generales del negocio sin tocar código.

### 11.1 Empresa

- [ ] Logo
- [ ] Nombre
- [ ] Dirección
- [ ] Horario de atención

### 11.2 Redes sociales

- [ ] Facebook
- [ ] Instagram
- [ ] TikTok

### 11.3 WhatsApp

- [ ] Número de contacto principal
- [ ] Mensajes predeterminados (por contexto: consulta general, seguimiento de pedido, confirmación de checkout)

### 11.4 Página pública

- [ ] Gestión de banners del inicio
- [ ] Gestión de preguntas frecuentes (FAQ)
- [ ] Información de contacto visible en el sitio

**Entregable de la fase:** configuración centralizada, editable por el administrador sin despliegues nuevos.

---

## FASE 12 — Dashboard y Reportes

**Objetivo:** dar visibilidad de negocio para la toma de decisiones.

### 12.1 Ventas

- [ ] Reporte de ventas por día
- [ ] Reporte de ventas por mes
- [ ] Reporte de ventas por año
- [ ] Gráficos comparativos de tendencia

### 12.2 Productos

- [ ] Productos más vendidos
- [ ] Productos menos vendidos
- [ ] Filtro por rango de fechas y categoría

### 12.3 Pedidos

- [ ] Pedidos por estado
- [ ] Pedidos por ciudad
- [ ] Tiempo promedio por etapa del proceso

### 12.4 Clientes

- [ ] Clientes frecuentes (mayor número de pedidos/monto)
- [ ] Clientes nuevos en el período
- [ ] Exportación de reportes (CSV/Excel)

**Entregable de la fase:** panel de reportes con métricas clave del negocio, exportables.

---

## FASE 13 — Optimización

**Objetivo:** preparar el sistema para producción a escala y de forma segura.

### 13.1 SEO

- [ ] Metadata dinámica por página (título, descripción, OG, Twitter cards)
- [ ] Generación de `sitemap.xml`
- [ ] Configuración de `robots.txt`
- [ ] Datos estructurados (JSON-LD) para productos

### 13.2 Rendimiento

- [ ] Lazy loading de imágenes y componentes pesados
- [ ] Optimización de imágenes (formatos modernos, tamaños responsivos)
- [ ] Estrategia de caché (ISR/SSG donde aplique, cache de consultas frecuentes)
- [ ] Análisis de bundle y code splitting

### 13.3 Seguridad

- [ ] Rate limiting en endpoints públicos (checkout, formularios, login)
- [ ] Validaciones exhaustivas de entrada (server-side, con librería tipo Zod)
- [ ] Sanitización de datos (prevención XSS/inyección)
- [ ] Auditoría de acciones administrativas (quién hizo qué y cuándo)
- [ ] Revisión de cabeceras de seguridad (CSP, HSTS, etc.)

### 13.4 Backups

- [ ] Backups automáticos de base de datos (frecuencia definida, retención)
- [ ] Backups de Storage (buckets críticos)
- [ ] Prueba periódica de restauración de backups

**Entregable de la fase:** aplicación optimizada, segura y con estrategia de respaldo verificada, lista para producción estable.


---

## Notas finales

- Cada fase se considera "cerrada" cuando su entregable está funcionando en el entorno de desarrollo y ha sido validado manualmente contra los criterios de esta lista.
- Se recomienda avanzar de forma secuencial (0 → 13), pero las Fases 7-10 (Pedidos, Producción, Pagos, Envíos) están fuertemente relacionadas y pueden desarrollarse en paralelo por ser parte del mismo ciclo operativo del pedido.
- Este documento es vivo: debe actualizarse marcando checkboxes y agregando notas de decisiones tomadas durante el desarrollo.
