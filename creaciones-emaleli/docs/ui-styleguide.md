# Guía de estilos UI — Creaciones Emaleli

Documento de diseño de la Fase 0 (0.3 Diseño UI). Define la paleta, tipografía, sistema de espaciado, radios/sombras y la base de componentes, junto con los wireframes y especificaciones de pantallas clave. Los tokens están implementados en `src/app/globals.css` (Tailwind CSS v4, `@theme`).

> **Nota de revisión (Fase 2):** los valores de color y tipografía de este documento fueron auditados contra el logo y la paleta oficial de la marca (`public/brand/`) y contra el mockup de referencia `emaleli-idea.html`. Se corrigieron los hex de la paleta (estaban ligeramente desviados de la marca real) y se añadió el color **coral**, presente en la paleta oficial de 4 colores pero ausente en la versión anterior de este documento.

## 1. Marca visual

Estética artesanal y femenina (corte, costura y personalización), inspirada en referentes de e-commerce ágil (Temu/Shein/AliExpress) pero con identidad propia: tarjetas muy redondeadas, colores suaves y un logo de conejito. Paleta de 4 colores de marca — lavanda, turquesa, rosa/magenta y coral — sobre fondo blanco y grises fríos. La identidad transmite delicadeza, confianza y cercanía con el cliente.

## 2. Paleta de colores

| Rol | Token | Hex | Uso |
|-----|-------|-----|-----|
| Primario | `primary-500` | `#9491bc` | Logo, acciones principales, enlaces, elementos de marca |
| Secundario | `secondary-400` | `#7bbbc4` | Secciones destacadas, badges informativos, fondos de apoyo |
| Acento | `accent-500` | `#e06790` | CTA de personalización, ofertas, elementos de énfasis |
| Coral | `coral-500` | `#fe7771` | Segundo acento de marca: badges "nuevo/oferta", detalles decorativos |
| Base | `white` / `surface` | `#ffffff` | Fondos de página y tarjetas |
| Éxito | `success` | `#16a34a` | Confirmaciones, pagos completos |
| Alerta | `warning` | `#f59e0b` | Avisos, pendientes de revisión |
| Error | `error` | `#dc2626` | Validaciones, pedidos rechazados |
| Info | `info` | `#0ea5e9` | Mensajes informativos |
| Escala de grises | `gray-50 … 900` | `#f8f8f9 … #24242a` | Textos, bordes, fondos neutros |

Cada color base tiene escala propia (50–900). Estados incluyen variante `-light` para fondos de alerta (ej. `success-light` `#dcfce7`).

**Reglas de uso:** el primario nunca se combina con el acento en el mismo botón; el texto sobre `primary-500`/`accent-500`/`coral-500` debe ser blanco; los textos de cuerpo usan `gray-700` o `gray-900`; el coral se reserva para detalles puntuales (badges, acentos decorativos), no para botones grandes ni bloques extensos de color.

## 3. Tipografía

| Uso | Familia | Escalas | Pesos |
|-----|---------|---------|-------|
| Titulares | `font-display` — **Heroik** (marca) | `text-display-sm` 1.875rem → `text-display-xl` 3.75rem | 400, 700 |
| Cuerpo y UI | `font-sans` — **Qlassik** (marca) | `text-xs` → `text-2xl` (Tailwind) | 400, 500, 700 |

Heroik y Qlassik son las tipografías propietarias de Creaciones Emaleli y **no están disponibles en Google Fonts**. Se definen vía `@font-face` en `globals.css` apuntando a `/public/fonts/*.woff2`; mientras esos archivos no se incorporen al proyecto, la app usa automáticamente **Plus Jakarta Sans** (cargada con `next/font/google` en `src/app/layout.tsx`) como fuente puente visualmente cercana, sin romper el layout. En cuanto se agreguen los `.woff2` reales, Heroik/Qlassik toman el control sin cambios de código.

Line-height por defecto 1.5 en cuerpo y 1.2 en titulares. Los tamaños de titulares se definen con tokens semánticos (`--text-display-*`) y los de cuerpo con la escala estándar de Tailwind.

## 4. Sistema de espaciado

- **Escala base de 4px:** `0.25rem` (`spacing-1`), 8px (`spacing-2`), 16px (`spacing-4`), 24px (`spacing-6`), etc.
- **Gutter de contenedor:** `spacing-gutter` = 1.5rem (24px) en móvil, 2rem (32px) en desktop.
- **Secciones:** `spacing-section` = 6rem (96px) entre secciones de página.
- **Contenedores:** `max-w-page` 80rem (1280px) para la tienda y panel; `max-w-content` 72rem (1152px) para bloques de texto.
- **Breakpoints:** `sm` 640px · `md` 768px · `lg` 1024px · `xl` 1280px · `2xl` 1536px.

## 5. Radios, sombras y elevaciones

| Elemento | Token | Valor |
|----------|-------|-------|
| Inputs | `radius-input` | 0.625rem |
| Botones | `radius-button` | 0.625rem |
| Tarjetas | `radius-card` | 0.875rem |
| Modales | `radius-modal` | 1.25rem |
| Tarjeta reposo | `shadow-card` | sutil, 1px |
| Tarjeta hover | `shadow-card-hover` | elevación leve |
| Drawers/sidebars | `shadow-elevated` | 10px de desenfoque |
| Modales | `shadow-modal` | 20px de desenfoque |

Elevación = niveles de sombra; no usar bordes gruesos para destacar.

## 6. Base de componentes (design system)

Componentes implementados en Fase 2 (`src/frontend/components/ui/`) con estos tokens — ver `docs/design-system.md` para el detalle de props de cada uno:

| Componente | Especificación |
|------------|----------------|
| Button | Primario (`bg-primary-500`), secundario (`bg-secondary-400`), acento (`bg-accent-500`), ghost, destructivo (`bg-error`). Radios `radius-button`. Estados loading/disabled. |
| Input / Select / Textarea | Borde `gray-200`, foco `primary-500`, error `error` + `error-light`. Radios `radius-input`. |
| Checkbox | Acento `primary-500`. |
| Card | Fondo blanco, `shadow-card`, `radius-card`. |
| Modal / Drawer | `radius-modal` / `radius-card`, `shadow-modal` / `shadow-elevated`. |
| Table / Pagination / Badge / Empty State / Loader / Toast | Estilos definidos con la paleta de estados (éxito/alerta/error/info). |

## 7. Tokens (implementación)

Los tokens viven en `src/app/globals.css` dentro de `@theme` de Tailwind v4 y generan utilidades (`bg-primary-500`, `text-accent-500`, `shadow-card`, `rounded-card`, `max-w-page`, `font-display`, etc.).

## 8. Wireframes de baja fidelidad

### 8.1 Inicio (`/`)

```txt
+-----------------------------------------------------------+
| [Logo]            Inicio Catálogo Carrito  | (WhatsApp)   |
+-----------------------------------------------------------+
|  HERO  [texto + CTA "Ver catálogo"]        [imagen]      |
+-----------------------------------------------------------+
|  Categorías:  [Cat 1] [Cat 2] [Cat 3] [Cat 4]           |
+-----------------------------------------------------------+
|  Productos destacados:  [P1] [P2] [P3]                   |
+-----------------------------------------------------------+
|  Testimonios: [cliente 1] [cliente 2] [cliente 3]        |
+-----------------------------------------------------------+
|  FAQ                                                  [x] |
+-----------------------------------------------------------+
|  Footer: contacto, redes, WhatsApp, horario               |
+-----------------------------------------------------------+
```

### 8.2 Catálogo (`/catalogo`)

```txt
+-----------------------------------------------------------+
| [Logo]  |  Búsqueda ______________________  | Carrito     |
+-----------------------------------------------------------+
| Filtros |  Ordenar: [Más recientes ▾]                     |
| Categoría|  [P1]  [P2]  [P3]  [P4]                       |
| Precio  |  [P5]  [P6]  [P7]  [P8]                       |
| ...     |  [P1][P2]...                    « 1 2 3 »       |
+-----------------------------------------------------------+
```

### 8.3 Producto (`/producto/[slug]`)

```txt
+-----------------------------------------------------------+
| [Logo] Inicio > Catálogo > Nombre            | Carrito     |
+-----------------------------------------------------------+
| [Imagen] [Imagen] [Imagen]  | Nombre                      |
|                             | Precio $XXX                |
|                             | Talla: [S][M][L]           |
|                             | Color: [●][●][●]           |
|                             | Personalización:           |
|                             |   Texto: [__________]     |
|                             |   Color: [__]             |
|                             |   Subir archivo: [↥]      |
|                             | Total: $XXX   [Agregar]   |
|                             | ⏱ Producción: 5 días     |
+-----------------------------------------------------------+
|  Descripción  |  Productos relacionados                  |
+-----------------------------------------------------------+
```

### 8.4 Carrito (`/carrito`)

```txt
+-----------------------------------------------------------+
| [Logo]                              Carrito (3)          |
+-----------------------------------------------------------+
| [Item 1]  x2  ...  $XXX   [✎] [🗑]                      |
| [Item 2]  x1  ...  $XXX   [✎] [🗑]                      |
+-----------------------------------------------------------+
|                          Subtotal  $XXX                   |
|                          Total     $XXX                   |
|                          ⏱ Entrega est.: 7 días          |
|                          [Continuar a checkout]           |
+-----------------------------------------------------------+
```

### 8.5 Checkout (`/checkout`)

```txt
+-----------------------------------------------------------+
| [Logo]                      Resumen                       |
+-----------------------------------------------------------+
| Datos del cliente:                                        |
|   Nombre [______] WhatsApp [______] Ciudad [______]      |
|   Email [______] Empresa (opc) [______]                  |
| Envío: (•) Recoger  ( ) Domicilio  ( ) Transportadora     |
| Observaciones: [________________]                         |
| Adjuntar referencia: [↥ archivo]                         |
|                          [Confirmar pedido]              |
+-----------------------------------------------------------+
```

### 8.6 Panel admin (`/admin`)

```txt
+-----------------------------------------------------------+
| Sidebar      |  Dashboard                                 |
| [Dashboard]  |  Pedidos nuevos:  12   [ver]              |
| [Productos]  |  En producción:    5                       |
| [Pedidos]    |  Pagos pendientes: 3                       |
| [Pagos]      |  Ventas del mes: $1.2M                     |
| [Envíos]     |                                            |
| [Clientes]   |  Pedidos recientes: [tabla]                |
| [Config]     |                                            |
+-----------------------------------------------------------+
```

## 9. Mockups de alta fidelidad

Especificaciones por pantalla (versión detallada de los wireframes, lista para replicar en Figma u otra herramienta):

| Pantalla | Especificación |
|----------|----------------|
| Inicio | Hero de altura completa con imagen de producto en `secondary-400`, CTA `accent-500`; tarjetas de categoría con `radius-card` y `shadow-card`; destacados con foto, nombre, precio y badge de producción. |
| Catálogo | Grilla 4 columnas (2 en tablet, 1 en móvil); filtros laterales con `primary-500` en selección; paginación al pie; estado vacío con mensaje y CTA. |
| Producto | Galería a la izquierda con miniaturas; selector de variantes con borde `primary-500` activo; formulario de personalización con inputs `radius-input`; precio total en tiempo real destacado en `accent-500`; botón `bg-primary-500`. |
| Carrito | Ítems en tarjetas con miniatura, variante/personalización resumidas, controles de cantidad; total a la derecha en tarjeta `shadow-card`. |
| Checkout | Formulario de cliente y método de envío condicional; resumen del pedido persistente a la derecha; botón de confirmación `bg-accent-500`. |
| Panel admin | Sidebar colapsable con íconos lucide-react; tabla de pedidos con `Badge` de estado (colores por estado); acciones por fila; dashboard con tarjetas de métricas. |

La implementación de los mockups como componentes de React se realiza en las Fases 2–6.
