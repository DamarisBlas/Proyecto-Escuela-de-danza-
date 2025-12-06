
"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { ChevronDown, ChevronUp } from "lucide-react";

/** Tipado de cada ítem para poder usar JSX en la respuesta (listas, links, etc.) */
type FaqItem = {
  pregunta: string;
  respuesta: React.ReactNode;
  respuestaPlain: string; // para SEO JSON-LD
};

export default function Faq() {

const [openIndex, setOpenIndex] = useState<number | null>(0);

  const preguntas: FaqItem[] = [
    {
      pregunta: "¿Necesito experiencia previa para tomar clases?",
      respuesta: (
        <>
          No. Tenemos clases para todos los niveles, desde principiante hasta avanzado.
          Nuestras profesoras te guían paso a paso y adaptan la técnica a tu ritmo.
        </>
      ),
      respuestaPlain:
        "No. Tenemos clases para todos los niveles, desde principiante hasta avanzado. Las profesoras te guían paso a paso y adaptan la técnica a tu ritmo.",
    },
    {
      pregunta: "¿Qué debo traer a mi primera clase?",
      respuesta: (
        <>
          Ropa cómoda, botella de agua y actitud. Para <strong>Heels</strong>, puedes traer
          tacones con <em>ankle strap</em> y suela estable; si no tienes, podrás trabajar en
          medias/zapatillas.
        </>
      ),
      respuestaPlain:
        "Ropa cómoda, botella de agua y actitud. Para Heels, puedes traer tacones con ankle strap y suela estable; si no tienes, podrás trabajar en medias o zapatillas.",
    },
    {
      pregunta: "¿Cómo funcionan los paquetes y el Full Pass?",
      respuesta: (
        <>
          Nuestros <strong>cursos regulares</strong> operan por paquetes mensuales:
          <br />
          <span className="inline-block mt-2 rounded-full bg-femme-rose/10 px-2 py-0.5 text-xs text-femme-rose">
            A(4) · B(8) · C(12) · D(16) · Full Pass
          </span>
          <br />
          Cada paquete dura <strong>1 mes</strong> calendario y puedes combinar estilos dentro del
          programa regular.
        </>
      ),
      respuestaPlain:
        "Los cursos regulares operan por paquetes mensuales A(4), B(8), C(12), D(16) y Full Pass. Cada paquete dura 1 mes calendario y puedes combinar estilos dentro del programa regular.",
    },
    {
      pregunta: "¿Cuánto duran los ciclos y qué otros formatos hay?",
      respuesta: (
        <>
          Los ciclos regulares duran ~ <strong>2–3 meses</strong>. También tenemos:
          <ul className="mt-2 list-disc pl-6 text-slate-700">
            <li>
              <strong>Intensivos</strong>: 2–4 días, precio fijo.
            </li>
            <li>
              <strong>Talleres</strong>: 1–2 días, precio fijo, refuerzo técnico.
            </li>
            <li>
              <strong>Producciones</strong>: 3h aprox., por invitación.
            </li>
            <li>
              <strong>Especiales</strong>: temáticos en fechas festivas.
            </li>
          </ul>
        </>
      ),
      respuestaPlain:
        "Los ciclos regulares duran aproximadamente 2–3 meses. También hay Intensivos de 2–4 días, Talleres de 1–2 días, Producciones por invitación y Especiales temáticos.",
    },
    {
      pregunta: "¿Qué pasa si falto a una clase?",
      respuesta: (
        <>
          Puedes solicitar <strong>recuperación</strong> dentro del mismo mes calendario,
          sujeto a cupo. Escríbenos por WhatsApp/IG para reprogramar en un grupo disponible.
        </>
      ),
      respuestaPlain:
        "Puedes solicitar recuperación dentro del mismo mes calendario, sujeto a cupo. Contáctanos para reprogramar en un grupo disponible.",
    },
    {
      pregunta: "¿Métodos de pago y facturación?",
      respuesta: (
        <>
          Aceptamos transferencia/QR y efectivo. Si necesitas factura o recibo, indícalo al
          momento de la inscripción para generarlo correctamente.
        </>
      ),
      respuestaPlain:
        "Aceptamos transferencia/QR y efectivo. Si necesitas factura o recibo, indícalo al momento de la inscripción.",
    },
    {
      pregunta: "¿Hay clase de prueba?",
      respuesta: (
        <>
          Sí. Puedes tomar una <strong>clase suelta</strong> como prueba en el estilo que
          te interese, según disponibilidad del grupo.
        </>
      ),
      respuestaPlain:
        "Sí, puedes tomar una clase suelta como prueba según disponibilidad del grupo.",
    },
    {
      pregunta: "¿Hay límite de edad o requisitos de salud?",
      respuesta: (
        <>
          Recomendado desde <strong>16 años</strong>. Si presentas lesión o condición
          médica, avísanos antes de iniciar para adaptar ejercicios y evitar impacto.
        </>
      ),
      respuestaPlain:
        "Recomendado desde 16 años. Si presentas lesión o condición médica, avísanos para adaptar ejercicios.",
    },
    {
      pregunta: "¿Cuáles son las políticas de cancelación y reembolsos?",
      respuesta: (
        <>
          Los paquetes no son reembolsables una vez iniciado el mes. Puedes usar tus
          recuperaciones dentro del periodo activo. Eventos (intensivos/especiales) pueden
          reagendarse por causas de fuerza mayor.
        </>
      ),
      respuestaPlain:
        "Los paquetes no son reembolsables una vez iniciado el mes. Recuperaciones dentro del periodo activo. Eventos pueden reagendarse por fuerza mayor.",
    },
    {
      pregunta: "¿Dónde están ubicados y cómo reservo?",
      respuesta: (
        <>
          Estamos en <strong>La Paz, Bolivia</strong>. Reserva escribiéndonos por Instagram
          o desde la sección <strong>Clases</strong> de la web.
        </>
      ),
      respuestaPlain:
        "Estamos en La Paz, Bolivia. Reserva por Instagram o desde la sección Clases de la web.",
    },
  ];

  /** JSON-LD SEO para FAQPage */
  const faqSchema = useMemo(() => {
    const json = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": preguntas.map((q) => ({
        "@type": "Question",
        name: q.pregunta,
        acceptedAnswer: {
          "@type": "Answer",
          text: q.respuestaPlain,
        },
      })),
    };
    return JSON.stringify(json);
  }, [preguntas]);





  return (
    <section className="bg-white">
      <div className="container py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-femme-magenta">Preguntas frecuentes</h2>
      <br />
        <div className="space-y-4">
          {preguntas.map((item, index) => {
            const isOpen = openIndex === index;
            const contentId = `faq-content-${index}`;
            return (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-0">
                  <button
                    className="w-full p-6 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
                    aria-expanded={isOpen}
                    aria-controls={contentId}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                  >
                    <h3 className="text-lg font-semibold text-femme-magenta pr-4">
                      {item.pregunta}
                    </h3>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-femme-rose flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-femme-rose flex-shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div id={contentId} className="px-6 pb-6">
                      <div className="prose prose-sm max-w-none text-slate-700">
                        {item.respuesta}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* SEO JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqSchema }} />
        
      
    </section>
  )
}

