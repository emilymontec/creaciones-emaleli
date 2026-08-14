import { Quote } from "lucide-react";

// Contenido estático temporal. En la Fase 11 (Configuración > Página
// pública) esto se reemplaza por testimonios gestionables desde el admin.
const TESTIMONIOS = [
  {
    nombre: "Laura M.",
    ciudad: "Bogotá",
    texto:
      "Pedí camisetas personalizadas para todo mi equipo y quedaron exactamente como las imaginé. El acompañamiento por WhatsApp fue clave.",
  },
  {
    nombre: "Carlos R.",
    ciudad: "Medellín",
    texto:
      "La calidad superó lo que esperaba. Muy atentos durante todo el proceso de producción, con fotos de avance incluidas.",
  },
  {
    nombre: "Daniela P.",
    ciudad: "Cali",
    texto:
      "Excelente experiencia de principio a fin. El tiempo de entrega fue el que prometieron y el producto llegó perfecto.",
  },
];

export function TestimonialsSection() {
  return (
    <section>
      <h2 className="mb-4 font-display text-xl font-bold text-gray-900">
        Lo que dicen nuestros clientes
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {TESTIMONIOS.map((t) => (
          <figure
            key={t.nombre}
            className="flex flex-col gap-3 rounded-card bg-white p-5 shadow-card"
          >
            <Quote className="size-6 text-accent-400" />
            <blockquote className="flex-1 text-sm text-gray-600">
              &ldquo;{t.texto}&rdquo;
            </blockquote>
            <figcaption className="text-sm font-semibold text-gray-800">
              {t.nombre}
              <span className="ml-1 font-normal text-gray-400">
                · {t.ciudad}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
