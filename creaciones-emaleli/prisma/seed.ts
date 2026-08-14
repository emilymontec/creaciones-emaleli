import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg(process.env.DATABASE_URL ?? "");
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPasswordHash = await bcrypt.hash("admin123", 10);

  const admin = await prisma.usuario.upsert({
    where: { email: "admin@emaleli.com" },
    update: {
      username: "admin",
      nombre: "Admin Emaleli",
      passwordHash: adminPasswordHash,
      telefono: "+573000000001",
      empresa: "Creaciones Emaleli",
      cargo: "Administrador General",
      rol: "ADMIN",
      activo: true,
    },
    create: {
      username: "admin",
      nombre: "Admin Emaleli",
      email: "admin@emaleli.com",
      telefono: "+573000000001",
      empresa: "Creaciones Emaleli",
      cargo: "Administrador General",
      passwordHash: adminPasswordHash,
      rol: "ADMIN",
      activo: true,
    },
  });

  const categoriasData = [
    {
      nombre: "Camisetas",
      slug: "camisetas",
      descripcion: "Camisetas personalizadas 100% algodón para toda ocasión.",
      orden: 1,
    },
    {
      nombre: "Tazas & Mugs",
      slug: "tazas",
      descripcion: "Tazas cerámicas mágicas y personalizadas con tu foto o frase.",
      orden: 2,
    },
    {
      nombre: "Hoodies & Sacos",
      slug: "hoodies",
      descripcion: "Buzos y sacos térmicos estampados a tu gusto.",
      orden: 3,
    },
    {
      nombre: "Termos & Tomatodos",
      slug: "termos",
      descripcion: "Termos metálicos de acero inoxidable personalizados.",
      orden: 4,
    },
    {
      nombre: "Accesorios & Llaveros",
      slug: "accesorios",
      descripcion: "Llaveros acrílicos, stickers impermeables y más detalles.",
      orden: 5,
    },
    {
      nombre: "Papelería & Regalos",
      slug: "papelera",
      descripcion: "Libretas, agendas y empaques de regalo personalizados.",
      orden: 6,
    },
  ];

  for (const c of categoriasData) {
    await prisma.categoria.upsert({
      where: { slug: c.slug },
      update: { nombre: c.nombre, descripcion: c.descripcion, orden: c.orden },
      create: c,
    });
  }

  const catCamisetas = await prisma.categoria.findUnique({ where: { slug: "camisetas" } });
  const catTazas = await prisma.categoria.findUnique({ where: { slug: "tazas" } });
  const catHoodies = await prisma.categoria.findUnique({ where: { slug: "hoodies" } });
  const catTermos = await prisma.categoria.findUnique({ where: { slug: "termos" } });
  const catAccesorios = await prisma.categoria.findUnique({ where: { slug: "accesorios" } });
  const catPapeleria = await prisma.categoria.findUnique({ where: { slug: "papelera" } });

  const productosSeed = [
    {
      nombre: "Camiseta Estampada Personalizada Premium",
      slug: "camiseta-personalizada-premium",
      descripcionCorta: "Camiseta 100% algodón peinado con estampado de alta durabilidad.",
      descripcionLarga: "Confeccionada en algodón 100% suave de alta calidad. Elige tu talla, color favorito y adjunta tu propio diseño o texto para sublimación/DTF de ultra definición.",
      precioBase: 45000,
      precioDescuento: 34900,
      seoTitulo: "Camiseta Personalizada Premium | Creaciones Emaleli",
      seoDescripcion: "Camisetas estampadas personalizadas con envíos a todo el país.",
      destacado: true,
      tiempoProduccion: 2,
      categoriaId: catCamisetas?.id,
      imagenUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80",
    },
    {
      nombre: "Mug Cerámico Mágico 11oz Personalizado",
      slug: "mug-ceramico-magico",
      descripcionCorta: "Taza que revela tu diseño o foto al verter líquido caliente.",
      descripcionLarga: "Taza termosensible de cerámica premium de 11 oz. Al agregar tu bebida caliente favorita, el fondo negro desaparece dejando ver tu diseño personalizado.",
      precioBase: 32000,
      precioDescuento: 24900,
      seoTitulo: "Taza Mágica Personalizada 11oz | Emaleli",
      seoDescripcion: "Mug mágico termo sensible con foto o frase personalizada.",
      destacado: true,
      tiempoProduccion: 1,
      categoriaId: catTazas?.id,
      imagenUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80",
    },
    {
      nombre: "Hoodie Oversize con Capucha Estampado",
      slug: "hoodie-oversize-estampado",
      descripcionCorta: "Buzo térmico fleece ultra cómodo con estampado en pecho o espalda.",
      descripcionLarga: "Hoodie de algodón perchado térmico de gran abrigo. Ideal para estampado frontal, posterior o mangas con tus imágenes o diseños favoritos.",
      precioBase: 85000,
      precioDescuento: 69900,
      seoTitulo: "Hoodie Oversize Personalizado | Creaciones Emaleli",
      seoDescripcion: "Sacos y hoodies estampados personalizados.",
      destacado: true,
      tiempoProduccion: 3,
      categoriaId: catHoodies?.id,
      imagenUrl: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80",
    },
    {
      nombre: "Termo de Acero Inoxidable 750ml Personalizado",
      slug: "termo-acero-inoxidable",
      descripcionCorta: "Mantiene bebidas frías 24h y calientes 12h con grabado térmico.",
      descripcionLarga: "Termo deportivo hermético antiderrames. Personalízalo con tu nombre, logo corporativo o diseño exclusivo grabado o sublimado a todo color.",
      precioBase: 58000,
      precioDescuento: 46900,
      seoTitulo: "Termo Metálico Personalizado 750ml",
      seoDescripcion: "Termo de acero inoxidable personalizado a tu gusto.",
      destacado: true,
      tiempoProduccion: 2,
      categoriaId: catTermos?.id,
      imagenUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80",
    },
    {
      nombre: "Combo Llaveros Acrílicos Personalizados (Pack x3)",
      slug: "combo-llaveros-acrilicos",
      descripcionCorta: "Llaveros transparentes alta resistencia con foto de ambos lados.",
      descripcionLarga: "Pack de 3 llaveros en acrílico cristal de alta transparencia. Perfectos para recuerdos, fotos en pareja o logos de emprendimiento.",
      precioBase: 25000,
      precioDescuento: 18900,
      seoTitulo: "Llaveros Acrílicos Personalizados Pack x3",
      seoDescripcion: "Llaveros en acrílico impresos por ambas caras.",
      destacado: true,
      tiempoProduccion: 1,
      categoriaId: catAccesorios?.id,
      imagenUrl: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80",
    },
    {
      nombre: "Agenda Ejecutiva Pasta Dura Personalizada 2026",
      slug: "agenda-ejecutiva-pasta-dura",
      descripcionCorta: "Agenda anillada con portada personalizada y hojas de planeación.",
      descripcionLarga: "Agenda con carátula de pasta dura laminada mate o brillante. Incluye planeador mensual, bolsillo interno y separadores a color.",
      precioBase: 42000,
      precioDescuento: null,
      seoTitulo: "Agenda Personalizada 2026 Pasta Dura",
      seoDescripcion: "Agendas y cuadernos personalizados para regalar.",
      destacado: false,
      tiempoProduccion: 3,
      categoriaId: catPapeleria?.id,
      imagenUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80",
    },
    {
      nombre: "Mug Blanco Tradicional 11oz con Caja Regalo",
      slug: "mug-blanco-tradicional",
      descripcionCorta: "Taza de cerámica clásica apta para microondas y lavavajillas.",
      descripcionLarga: "Mug cerámico blanco de máxima calidad con estampado full color brillante. Incluye empaque de regalo y dedicatoria personalizada opcional.",
      precioBase: 24000,
      precioDescuento: 19900,
      seoTitulo: "Mug Blanco 11oz Personalizado",
      seoDescripcion: "Taza personalizada con empaque especial.",
      destacado: false,
      tiempoProduccion: 1,
      categoriaId: catTazas?.id,
      imagenUrl: "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=800&q=80",
    },
    {
      nombre: "Pack Stickers Vinilo Impermeable (x15 unidades)",
      slug: "pack-stickers-vinilo",
      descripcionCorta: "Calcomanías resistentes al agua y sol para termo, laptop o carro.",
      descripcionLarga: "Stickers troquelados en vinilo laminado antirrayones. Ideales para decorar termos, portátiles, cascos y personalizar lo que quieras.",
      precioBase: 28000,
      precioDescuento: 21900,
      seoTitulo: "Stickers en Vinilo Personalizados Pack x15",
      seoDescripcion: "Stickers impermeables con corte personalizado.",
      destacado: true,
      tiempoProduccion: 1,
      categoriaId: catAccesorios?.id,
      imagenUrl: "https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=800&q=80",
    },
  ];

  for (const item of productosSeed) {
    const { categoriaId, imagenUrl, ...prodData } = item;
    const prod = await prisma.producto.upsert({
      where: { slug: prodData.slug },
      update: {
        nombre: prodData.nombre,
        descripcionCorta: prodData.descripcionCorta,
        descripcionLarga: prodData.descripcionLarga,
        precioBase: prodData.precioBase,
        precioDescuento: prodData.precioDescuento,
        destacado: prodData.destacado,
        tiempoProduccion: prodData.tiempoProduccion,
        estado: "ACTIVO",
        categorias: categoriaId ? { set: [{ id: categoriaId }] } : undefined,
      },
      create: {
        ...prodData,
        estado: "ACTIVO",
        categorias: categoriaId ? { connect: [{ id: categoriaId }] } : undefined,
        variantes: {
          create: [
            { nombre: "Negro", tipo: "COLOR", orden: 1 },
            { nombre: "Blanco", tipo: "COLOR", orden: 2 },
            { nombre: "Rosa Pastel", tipo: "COLOR", orden: 3 },
            { nombre: "Talla M", tipo: "TALLA", orden: 4 },
            { nombre: "Talla L", tipo: "TALLA", orden: 5 },
          ],
        },
        personalizaciones: {
          create: [
            {
              nombre: "Nombre / Texto personalizado",
              tipo: "TEXTO",
              obligatorio: false,
              orden: 1,
              opciones: { maxLength: 35 },
            },
            {
              nombre: "Subir imagen o logo",
              tipo: "ARCHIVO",
              obligatorio: false,
              orden: 2,
              opciones: { maxSizeMB: 10 },
            },
          ],
        },
      },
    });

    // Asegurar imagen
    const imgExistente = await prisma.productoImagen.findFirst({ where: { productoId: prod.id } });
    if (!imgExistente) {
      await prisma.productoImagen.create({
        data: {
          productoId: prod.id,
          url: imagenUrl,
          principal: true,
          orden: 1,
        },
      });
    } else {
      await prisma.productoImagen.update({
        where: { id: imgExistente.id },
        data: { url: imagenUrl },
      });
    }
  }

  await prisma.configuracion.upsert({
    where: { clave: "empresa" },
    update: {
      valor: {
        nombre: "Creaciones Emaleli",
        whatsapp: "+573000000000",
        direccion: "Envíos a todo el país",
      },
    },
    create: {
      clave: "empresa",
      valor: {
        nombre: "Creaciones Emaleli",
        whatsapp: "+573000000000",
        direccion: "Envíos a todo el país",
      },
      descripcion: "Datos de contacto de la tienda.",
    },
  });

  console.log(`✅ Seed completado con éxito! Admin: ${admin.email}`);
  console.log(`📦 Se crearon/actualizaron ${productosSeed.length} productos dinámicos.`);
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
