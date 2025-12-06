

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import regular from "../../../assets/caminoFemme/regular.png";
import taller from "../../../assets/caminoFemme/taller.png";
import intensivo from "../../../assets/caminoFemme/intensivo.png";
import especial from "../../../assets/caminoFemme/especial.png";
import produccion from "../../../assets/caminoFemme/produccion.png";
import camino from "../../../assets/caminoFemme/camino.png";

/** Datos del carrusel (puedes cambiarlos cuando quieras) */
const slides = [
  {
    id: "resumen",
    title: "Camino Femme — Programa principal",
    short:
      "Programa principal y más estructurado. Tres categorías: Técnico, Práctico y Complementaria.",
    detail:
      "Se organiza en estas subcategorías: Cursos regulares, Cursos intensivos, Taller, Producciones y Especiales.",
    badge: "Resumen",
    image:
      camino,
  },
  {
    id: "regulares",
    title: "Cursos regulares (Técnico)",
    short: "Estilos urbanos femeninos: Dancehall, Afro, Heels, Salsa Femme, Twerk, Twerk brasileño…",
    detail:
      "Ciclos de ~2–3 meses. Pago por paquetes o clase suelta: A (4), B (8), C (12), D (16) y Full Pass. Cada paquete dura 1 mes.",
    badge: "Técnico",
    image:
      regular,
  },
  {
    id: "intensivos",
    title: "Cursos intensivos (Práctico)",
    short: "Especializados en un estilo puntual.",
    detail:
      "Duración 2–4 días. Precio fijo (no funcionan por paquetes). Ideales para profundizar rápidamente.",
    badge: "Práctico",
    image:
      intensivo, },
  {
    id: "taller",
    title: "Taller (Complementaria)",
    short: "Refuerzo técnico o contenidos específicos.",
    detail:
      "Sesiones de 1–2 días con precio fijo. Pensadas para complementar habilidades y trabajar puntos concretos.",
    badge: "Complementaria",
    image:
     taller,
  },
  {
    id: "producciones",
    title: "Producciones (Complementaria)",
    short: "Grabación de coreografías del ciclo, por invitación.",
    detail:
      "Enfocadas en alumnas destacadas y Alumnas Femme. Duración aprox. 3 horas. Precio fijo.",
    badge: "Complementaria",
    image:
     produccion,
  },
  {
    id: "especiales",
    title: "Especiales (Complementaria)",
    short: "Clases temáticas en fechas festivas.",
    detail:
      "Por ejemplo, Especial de Carnaval. Aproximadamente 3 horas o más. Precio fijo.",
    badge: "Complementaria",
    image:
      especial,
  },
];

export default function CaminoFemme() {
  const [index, setIndex] = useState(0);
  const count = slides.length;
  const containerRef = useRef(null);
  const touchX = useRef<number | null>(null);

  const goTo = useCallback((i: number) => {
    setIndex(((i % count) + count) % count);
  }, [count]);

  const next = useCallback(() => goTo(index + 1), [index, goTo]);
  const prev = useCallback(() => goTo(index - 1), [index, goTo]);

  // Navegación con teclas ← →
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  // Swipe en móvil
  const onTouchStart = (e : React.TouchEvent) => {
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) {
      dx < 0 ? next() : prev();
    }
    touchX.current = null;
  };

  const current = useMemo(() => slides[index], [index]);

  return (
    <section
      className="bg-white"
      aria-label="Carrusel Camino Femme"
    >


      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="container py-12">
          
            <h2 className="text-2xl md:text-3xl font-bold text-femme-magenta">Camino Femme</h2>
         
        </div>

        {/* Card principal */}
        <div
          ref={containerRef}
          className="relative mx-auto mt-8 max-w-6xl select-none"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Card */}
          <article
            className="
              grid gap-6 overflow-hidden rounded-2xl border border-slate-200 bg-white/80
              p-6 shadow-sm backdrop-blur transition-all duration-300
              md:grid-cols-2
            "
          >
            {/* Texto */}
            <div className="flex flex-col justify-center">
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-pink-00">
                <span className="h-2 w-2 rounded-full bg-pink-500" />
                {current.badge}
              </div>

              <h3 className="mt-3 text-xl font-semibold text-slate-900 md:text-2xl">
                {current.title}
              </h3>

              <p className="mt-2 text-slate-600">{current.short}</p>

              <p className="mt-3 text-slate-600">
                {current.detail}
              </p>

              {/* Controles inferior en mobile */}
              <div className="mt-6 flex items-center justify-between md:hidden">
                <button
                  onClick={prev}
                  aria-label="Anterior"
                  className="rounded-full border border-slate-300 bg-white p-2 text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  ←
                </button>
                <Dots count={count} index={index} goTo={goTo} />
                <button
                  onClick={next}
                  aria-label="Siguiente"
                  className="rounded-full border border-slate-300 bg-white p-2 text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  →
                </button>
              </div>
            </div>

            {/* Imagen (a la derecha en md+) */}
            <div className="order-first md:order-none">
              <div className="aspect-[16/10] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                <img
                  src={current.image}
                  alt={current.title}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </article>

          {/* Flechas laterales (desktop) */}
          <button
            onClick={prev}
            aria-label="Anterior"
            className="
              absolute left-0 top-1/2 hidden -translate-y-1/2 rounded-full border
              border-slate-300 bg-white p-3 text-slate-700 shadow-sm hover:bg-slate-50 md:flex
            "
          >
            ←
          </button>
          <button
            onClick={next}
            aria-label="Siguiente"
            className="
              absolute right-0 top-1/2 hidden -translate-y-1/2 rounded-full border
              border-slate-300 bg-white p-3 text-slate-700 shadow-sm hover:bg-slate-50 md:flex
            "
          >
            →
          </button>

          {/* Dots (desktop) */}
          <div className="mt-4 hidden justify-center md:flex">
            <Dots count={count} index={index} goTo={goTo} />
          </div>
        </div>
      </div>
    </section>
  );
}

type DotsProps = {
  count: number;
  index: number;
  goTo: (i: number) => void;
};

function Dots({ count, index, goTo }: DotsProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          aria-label={`Ir al slide ${i + 1}`}
          onClick={() => goTo(i)}
          className={[
            "h-2.5 w-2.5 rounded-full transition-colors",
            i === index ? "bg-pink-500" : "bg-slate-300 hover:bg-slate-400",
          ].join(" ")}
        />
      ))}
    </div>
  );
}


