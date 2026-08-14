# Diagrama Entidad-Relación — Creaciones Emaleli

```mermaid
erDiagram
    Usuario {
        string id PK
        string nombre
        string email UK
        string passwordHash
        RolUsuario rol
        boolean activo
    }

    Categoria {
        string id PK
        string nombre
        string slug UK
        string descripcion
        string imagen
        boolean activo
        int orden
    }

    Producto {
        string id PK
        string nombre
        string slug UK
        string descripcionCorta
        string descripcionLarga
        decimal precioBase
        decimal precioDescuento
        string seoTitulo
        string seoDescripcion
        string seoImagen
        boolean destacado
        EstadoProducto estado
        int tiempoProduccion
    }

    ProductoImagen {
        string id PK
        string productoId FK
        string url
        boolean principal
        int orden
    }

    ProductoVariante {
        string id PK
        string productoId FK
        string nombre
        string tipo
        string imagen
        decimal precioExtra
        int orden
        boolean activo
    }

    CombinacionVariante {
        string id PK
        string productoId FK
        string sku
        decimal precio
        int stock
        boolean activo
    }

    Personalizacion {
        string id PK
        string productoId FK
        string nombre
        TipoPersonalizacion tipo
        boolean obligatorio
        decimal precioExtra
        json opciones
        int orden
        boolean activo
    }

    Cliente {
        string id PK
        string nombre
        string whatsapp
        string email
        string empresa
        string ciudad
        boolean activo
    }

    Pedido {
        string id PK
        string codigo UK
        string clienteId FK
        EstadoPedido estado
        MetodoEnvio metodoEnvio
        decimal total
        decimal saldoPendiente
        string ciudad
        string direccion
        string observaciones
        string tokenSeguimiento UK
    }

    ItemPedido {
        string id PK
        string pedidoId FK
        string productoId FK
        string varianteId FK
        string nombreProducto
        decimal precioUnitario
        int cantidad
        json personalizaciones
        decimal subtotal
    }

    Pago {
        string id PK
        string pedidoId FK
        TipoPago tipo
        decimal monto
        datetime fecha
        string metodo
    }

    Envio {
        string id PK
        string pedidoId FK
        MetodoEnvio metodo
        string direccion
        string ciudad
        string destinatario
        string documento
        string telefono
        string numeroGuia UK
        EstadoGuia estadoGuia
        string enlaceRastreo
    }

    ArchivoAdjunto {
        string id PK
        string pedidoId FK
        string pagoId FK
        OrigenArchivo origen
        string tipo
        string url
        string nombre
    }

    SolicitudCambio {
        string id PK
        string pedidoId FK
        string descripcion
        EstadoSolicitudCambio estado
        string respuestaCliente
    }

    Configuracion {
        string id PK
        string clave UK
        json valor
        string descripcion
    }

    Categoria }o--o{ Producto : "pertenece a"
    Producto ||--o{ ProductoImagen : "tiene"
    Producto ||--o{ ProductoVariante : "tiene"
    Producto ||--o{ CombinacionVariante : "tiene"
    CombinacionVariante }o--o{ ProductoVariante : "combina opciones de"
    Producto ||--o{ Personalizacion : "tiene"
    Cliente ||--o{ Pedido : "realiza"
    Pedido ||--o{ ItemPedido : "contiene"
    Pedido ||--o{ Pago : "recibe"
    Pedido ||--o{ Envio : "usa"
    Pedido ||--o{ ArchivoAdjunto : "adjunta"
    Pedido ||--o{ SolicitudCambio : "genera"
    ItemPedido }o--|| Producto : "referencia"
    ItemPedido }o--|| ProductoVariante : "referencia"
    Pago ||--o| ArchivoAdjunto : "comprobante"
```

Notas:

- `Categoria`–`Producto` es N-N (un producto puede estar en varias categorías).
- `ItemPedido` guarda un snapshot (`nombreProducto`, `precioUnitario`) para preservar el pedido aunque el producto cambie o se elimine.
- `Pedido.tokenSeguimiento` es único y no adivinable (seguimiento público de la Fase 8).
- `ArchivoAdjunto` es 1-1 con `Pago` cuando funciona como comprobante.
