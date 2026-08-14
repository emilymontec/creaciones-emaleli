"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

// Contenido estático temporal: pasará a Configuración > Página pública en
// la Fase 11.
const FAQS = [
  {
    pregunta: "¿Cómo funciona la personalización de productos?",
    respuesta:
      "Eliges el producto, seleccionas variantes como talla o color y completas los campos de personalización (texto, imagen, etc.) según lo que ofrezca cada producto. Verás el precio total actualizarse en tiempo real.",
  },
  {
    pregunta: "¿Cuánto tarda la producción de mi pedido?",
    respuesta:
      "Cada producto muestra su tiempo estimado de producción en días. Si tu pedido tiene varios productos, se toma el tiempo del ítem más lento como estimado general.",
  },
  {
    pregunta: "¿Cómo se confirma y paga el pedido?",
    respuesta:
      "Al finalizar el checkout se genera un código de pedido y se abre un chat de WhatsApp con el resumen prellenado para coordinar el pago y los detalles finales contigo.",
  },
  {
    pregunta: "¿Puedo hacer seguimiento a mi pedido?",
    respuesta:
      "Sí, cada pedido tiene un enlace de seguimiento único donde puedes ver el estado actual y las actualizaciones de producción, sin necesidad de iniciar sesión.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section>
      <h2 className="mb-4 font-display text-xl font-bold text-gray-900">
        Preguntas frecuentes
      </h2>
      <div className="divide-y divide-gray-100 rounded-card bg-white shadow-card">
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={faq.pregunta}>
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="text-sm font-semibold text-gray-800">
                  {faq.pregunta}
                </span>
                <ChevronDown
                  className={clsx(
                    "size-4 shrink-0 text-gray-400 transition-transform",
                    isOpen && "rotate-180",
                  )}
                />
              </button>
              {isOpen && (
                <p className="px-5 pb-4 text-sm text-gray-500">
                  {faq.respuesta}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
