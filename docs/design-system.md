# Design System — Panel Administrativo

Documentación de la librería de componentes de Fase 2.2. Todos viven en
`src/frontend/components/ui/` y se importan desde el barrel
`@/src/frontend/components/ui`. Storybook no se incorporó (queda como
opcional, sin marcar en el roadmap); esta guía cumple el mismo propósito
de forma más liviana.

Convenciones generales: variantes por `variant` prop, tamaños por `size`,
estado de error vía `error?: string` (muestra el mensaje y el borde rojo),
tokens de color/radio/sombra siempre tomados de `globals.css` (nunca hex
sueltos en los componentes).

## Button

`variant`: `primary | secondary | accent | ghost | destructive` · `size`: `sm | md | lg` · `loading`, `fullWidth`, y el resto de props nativas de `<button>`.

```tsx
<Button variant="primary" loading={pending}>Guardar</Button>
```

## Input / Textarea

`label`, `error`, `helperText` + props nativas de `<input>`/`<textarea>`. Genera `id` automáticamente con `useId` si no se provee.

## Select / SearchableSelect

`Select` envuelve un `<select>` nativo (accesible, funciona en mobile) con `options: {value,label}[]`, soporta `multiple`. `SearchableSelect` es un combobox cliente con filtro de texto y selección simple o múltiple (`multiple` + `value: string[]` + `onChange`), pensado para listas largas (ej. categorías de un producto).

## Checkbox

`label`, `description` + props nativas de `<input type="checkbox">`.

## Card / CardHeader

`Card` es un contenedor con `shadow-card` y `radius-card`; `hoverable` añade `shadow-card-hover` al pasar el mouse. `CardHeader` acepta `title`, `description`, `action`.

## Badge

`variant`: `neutral | primary | success | warning | error | info`. Pensado para estados de pedido, activo/inactivo, etc.

## Modal

Diálogo centrado con overlay, portal a `document.body`, cierre con `Escape`/click en overlay/botón X. Props: `open`, `onClose`, `title`, `description`, `footer`, `size: sm|md|lg`.

## Drawer

Panel lateral (`side: left|right`, `size: sm|md|lg`). Props extra `hideHeader` y `noPadding` para casos donde el contenido trae su propia cabecera (así se usa para el menú mobile, embebiendo `AdminSidebar`).

## Table

Genérico y tipado (`Table<T>`). Props clave: `columns` (cada una con `render(row)`, opcionalmente `sortable` + `sortValue`), `data`, `rowKey`, `loading` (muestra `SkeletonTable`), estado vacío automático vía `EmptyState`, `actions(row)` para botones por fila, y selección múltiple con `selectable` + `selectedKeys` + `onSelectedKeysChange`.

## Pagination

`page`, `totalPages`, `onPageChange`. Colapsa páginas intermedias con `…` cuando hay más de 7.

## EmptyState

`icon` (opcional, por defecto un ícono de "búsqueda vacía"), `title`, `description`, `action`.

## Loader

`Spinner` (icono girando + texto para lectores de pantalla), `Skeleton` (bloque pulsante genérico), `SkeletonTable` (skeleton para tablas mientras cargan).

## Toast

Vía contexto: envolver la sección con `<ToastProvider>` (ya está en el layout del panel admin) y consumir `const { toast } = useToast()` en cualquier componente cliente hijo:

```tsx
toast({ variant: "success", title: "Categoría creada" });
```

Variantes: `success | error | warning | info`. Se autodescartan a los 5s o al hacer click en la X.

## Layout del panel (Fase 2.1)

- `AdminShell`: compone sidebar de escritorio + drawer mobile + topbar + footer + el `<main>` de cada página. Se usa una sola vez en `src/app/(admin)/admin/(panel)/layout.tsx`.
- `AdminSidebar`: navegación por secciones (`admin-nav.ts` es la fuente única de verdad), colapsable en escritorio (persistencia en `localStorage`), variante `mobile` para el drawer.
- `AdminTopbar`: botón de menú (mobile), breadcrumb (desktop), buscador global (UI lista, se conecta a un índice real en Fase 3+), notificaciones, avatar.
- `AdminBreadcrumb`: se genera dinámicamente a partir de la URL, usando `admin-nav.ts` como diccionario de etiquetas.
- `AdminFooter`: versión de la app y copyright.
