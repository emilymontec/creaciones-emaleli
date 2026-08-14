# Mapa de navegación — Creaciones Emaleli

Documento de la Fase 0 (0.4 Navegación). Define las rutas públicas y administrativas, los flujos de cliente y administrador, y las rutas protegidas vs públicas. Los route groups `(public)` y `(admin)` ya están definidos (ver ADR-0002); las rutas se construyen en las fases correspondientes.

## 1. Rutas públicas

| Ruta                   | Página             | Contenido                                                | Fase |
| ---------------------- | ------------------ | -------------------------------------------------------- | ---- |
| `/`                    | Inicio             | Hero, productos destacados, categorías, testimonios, FAQ | 4    |
| `/catalogo`            | Catálogo           | Listado de productos con filtros, búsqueda y paginación  | 4    |
| `/producto/[slug]`     | Ficha de producto  | Galería, variantes, personalización, precio total        | 4    |
| `/carrito`             | Carrito            | Ítems seleccionados y resumen                            | 5    |
| `/checkout`            | Checkout           | Datos de cliente, envío y confirmación                   | 6    |
| `/pedido/[codigo]`     | Detalle del pedido | Confirmación y resumen tras crear el pedido              | 6    |
| `/seguimiento/[token]` | Seguimiento        | Estado y timeline del pedido por enlace único            | 8    |

## 2. Rutas administrativas

| Ruta                   | Página                                                | Fase |
| ---------------------- | ----------------------------------------------------- | ---- |
| `/admin`               | Dashboard                                             | 7    |
| `/admin/productos`     | Gestión de productos (incluye categorías y variantes) | 3    |
| `/admin/pedidos`       | Gestión de pedidos (detalle, estados, timeline)       | 7    |
| `/admin/produccion`    | Actualizaciones de producción y solicitudes de cambio | 8    |
| `/admin/pagos`         | Gestión de pagos (anticipos, abonos, comprobantes)    | 9    |
| `/admin/envios`        | Gestión de envíos (métodos, guías)                    | 10   |
| `/admin/clientes`      | Gestión de clientes                                   | 7    |
| `/admin/configuracion` | Configuración (empresa, redes, WhatsApp, página)      | 11   |
| `/admin/reportes`      | Dashboard y reportes (ventas, productos, clientes)    | 12   |

Rutas ya esbozadas en el scaffold de Fase 0 (`src/app/(admin)/admin/`) y en la navegación del sidebar (`src/frontend/components/layout/admin-nav.ts`, Fase 2): `categorias`, `productos`, `pedidos`, `produccion`, `pagos`, `envios`, `clientes`, `reportes`, `configuracion` y el dashboard.

## 3. Flujo del cliente

```
Descubrimiento → Producto → Personalización → Carrito → Checkout → Confirmación → Seguimiento
   (/ o /catalogo)   (/producto/[slug])          (/carrito)  (/checkout)  (/pedido/[codigo])  (/seguimiento/[token])
```

Pasos:

1. El cliente entra al inicio o al catálogo.
2. Abre la ficha de producto, elige variantes y personalizaciones (precio total en tiempo real).
3. Agrega al carrito (persistente en LocalStorage).
4. Completa checkout con datos personales, método de envío y observaciones.
5. Confirma el pedido → se crea en BD con código `EML-AAAA-NNNN`.
6. Desde la confirmación abre WhatsApp con el resumen prellenado.
7. Sigue el estado del pedido por el enlace `/seguimiento/[token]`.

## 4. Flujo del administrador

```
Login → Dashboard → Gestión del pedido → Producción → Pagos → Envío → Cierre
(/admin/login)  (/admin)  (/admin/pedidos)         (/admin/pagos) (/admin/envios)
```

Pasos:

1. El admin inicia sesión (`/admin/login`, Fase 1).
2. Revisa pedidos nuevos en el dashboard.
3. Abre el detalle del pedido: cliente, ítems, personalizaciones y archivos.
4. Avanza el estado por la máquina de estados (Fase 7): revisión → aprobación → producción → empacado.
5. Registra anticipos/abonos y sube comprobantes (Fase 9).
6. Gestiona envío: método, guía y rastreo (Fase 10).
7. Cierra el pedido (Entregado) y queda registrado en reportes.

## 5. Rutas protegidas vs públicas

| Tipo               | Rutas                                                                             | Protección                                                             |
| ------------------ | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Públicas           | `/`, `/catalogo`, `/producto/[slug]`, `/carrito`, `/checkout`, `/pedido/[codigo]` | Sin autenticación                                                      |
| Públicas por token | `/seguimiento/[token]`                                                            | Enlace único no adivinable (sin login)                                 |
| Protegidas         | `/admin/*`                                                                        | Requieren sesión de admin (proxy en Fase 1); `/admin/login` es pública |

Reglas:

- Toda ruta bajo `/admin/*` exige autenticación y rol `ADMIN`.
- `src/proxy.ts` aplica la protección de rutas y el `layout.tsx` de `admin/(panel)` aplica el guard de sesión y el sidebar.
- Las rutas públicas de la tienda no exponen datos administrativos.
