import { HelpCircle } from "lucide-react";
import type { FaqItem } from "@/src/backend/modules/configuracion/schemas/configuracion.schema";

export function FaqSection({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="faq-heading" className="scroll-mt-20">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-primary-50 text-primary-600">
          <HelpCircle className="size-5" />
        </div>
        <h2
          id="faq-heading"
          className="font-display text-xl font-bold text-gray-900 sm:text-2xl"
        >
          Preguntas frecuentes
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <details
            key={item.id}
            className="group rounded-card border border-gray-100 bg-white p-4 shadow-card open:shadow-card-hover"
          >
            <summary className="cursor-pointer list-none text-sm font-semibold text-gray-900 marker:content-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500">
              <span className="flex items-start justify-between gap-3">
                {item.pregunta}
                <span className="shrink-0 text-primary-500 transition-transform group-open:rotate-45">
                  +
                </span>
              </span>
            </summary>
            <p className="mt-2 text-sm text-gray-600">{item.respuesta}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
