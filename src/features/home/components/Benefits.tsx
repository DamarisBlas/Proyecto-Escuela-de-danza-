import React, { useCallback, useId, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Sparkles,
  Music2,
  Crown,
  Zap,
  Heart,
  Disc,
  CheckCircle2,
} from "lucide-react";

/** Utils */
function cn(...cls: Array<string | false | null | undefined>) {
  return cls.filter(Boolean).join(" ");
}

type StyleCard = {
  id: string;
  title: string;
  short: string;
  benefits: string[];
  Icon: LucideIcon;
  accent: {
    ring: string; // gradiente del borde
    bg: string;   // gradiente de fondo sutil
    icon: string; // color del icono principal
    cta?: string; // (opcional) color CTA si lo agregas
  };
};






const DATA: StyleCard[] = [
  {
    id: "heels",
    title: "Heels",
    short:
      "Elegancia y técnica en tacones: líneas, balance y actitud escénica.",
    benefits: [
      "Mejora equilibrio y control del eje",
      "Fortalece core y glúteos",
      "Sube confianza y presencia",
    ],
    Icon: Sparkles,
    accent: {
      // + claro y transparente, full fucsia/rosa
      ring: "from-femme-rose/36 via-femme-magenta/24 to-femme-rose/16",
     bg: "from-femme-rose/35 to-femme-coral/6",
      icon: "text-femme-magenta",
    },
  },
  {
    id: "salsa-femme",
    title: "Salsa Femme",
    short:
      "Styling femenino en salsa: cadera fluida, brazos limpios y musicalidad latina.",
    benefits: [
      "Refuerza giros y precisión",
      "Aumenta coordinación y ritmo",
      "Cardio divertido y sostenido",
    ],
    Icon: Music2,
    accent: {
      ring: "from-femme-rose/34 via-femme-magenta/22 to-femme-rose/14",
      bg: "from-femme-rose/35 to-femme-coral/6",
      icon: "text-femme-rose",
    },
  },
  {
    id: "dancehall-queen",
    title: "Dancehall Queen",
    short:
      "Potencia y grooves del dancehall femenino con pasos icónicos y actitud.",
    benefits: [
      "Explosividad y resistencia",
      "Aislamientos de cadera/torso",
      "Musicalidad y memoria coreográfica",
    ],
    Icon: Crown,
    accent: {
      // Coral solo como tinte rosado MUY sutil
      ring: "from-femme-rose/32 via-femme-coral/18 to-femme-rose/12",
      bg: "from-femme-rose/35 to-femme-coral/6",
      icon: "text-femme-rose",
    },
  },
  {
    id: "afrobeats",
    title: "Afrobeats",
    short:
      "Movimiento de cuerpo completo con polirritmia y vibras afro-urbanas.",
    benefits: [
      "Mejora coordinación total",
      "Movilidad de tobillos, rodillas y caderas",
      "Resistencia cardiovascular",
    ],
    Icon: Zap,
    accent: {
      ring: "from-femme-rose/32 via-femme-magenta/20 to-femme-rose/12",
      bg: "from-femme-rose/35 to-femme-magenta/5",
      icon: "text-femme-rose",
    },
  },
  {
    id: "twerk",
    title: "Twerk",
    short:
      "Técnica de cadera y control pélvico con enfoque en fuerza y body confidence.",
    benefits: [
      "Fortalece glúteos y core",
      "Aumenta movilidad lumbar/pélvica",
      "Impulsa autoestima corporal",
    ],
    Icon: Heart,
    accent: {
      ring: "from-femme-magenta/34 via-femme-rose/22 to-femme-magenta/14",
      bg: "from-femme-rose/35 to-femme-magenta/6",
      icon: "text-femme-rose",
    },
  },
  {
    id: "twerk-funk",
    title: "Twerk brasileño (Funk)",
    short: "Velocidad y precisión de cadera al estilo funk carioca.",
    benefits: [
      "Alta quema calórica y resistencia",
      "Control técnico en ritmos rápidos",
      "Presencia y carácter urbano",
    ],
    Icon: Disc,
    accent: {
      ring: "from-femme-magenta/32 via-femme-rose/20 to-femme-rose/12",
      bg: "from-femme-magenta/35 to-femme-rose/6",
      icon: "text-femme-magenta",
    },
  },
];





/** Card con tilt + expansión en hover/focus y toggle para móvil */
function Card({ item }: { item: StyleCard }) {
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [expanded, setExpanded] = useState(false);
  const id = useId();

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;  // 0..1
    const py = (e.clientY - r.top) / r.height;  // 0..1
    const ry = (px - 0.5) * 10; // rotY
    const rx = (0.5 - py) * 10; // rotX
    setTilt({ rx, ry });
  }, []);

  const resetTilt = useCallback(() => setTilt({ rx: 0, ry: 0 }), []);
  const transform = useMemo(
    () => `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
    [tilt]
  );

  const { Icon } = item;

  return (
    <div
      className={cn(
        "group relative rounded-2xl p-[1px] transition",
        "bg-gradient-to-br",
        item.accent.ring
      )}
    >
      <div
        className={cn(
          "h-full rounded-2xl",
          "bg-gradient-to-br",
          item.accent.bg,
          "shadow-femme-md hover:shadow-femme-lg transition-shadow duration-300"
        )}
      >
        <div
          onMouseMove={onMove}
          onMouseLeave={resetTilt}
          className="relative h-full rounded-2xl p-5"
          style={{
            transform,
            transformStyle: "preserve-3d",
            transition: "transform 200ms ease",
          }}
        >
          {/* Header */}
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "grid h-12 w-12 place-items-center rounded-xl bg-white/85 dark:bg-slate-900/70 shadow-sm",
                "ring-1 ring-black/5",
                item.accent.icon
              )}
              aria-hidden
              style={{ transform: "translateZ(24px)" }}
            >
              <Icon className="h-6 w-6" />
            </div>

            <div className="min-w-0">
              <h3
                id={`${id}-title`}
                className="text-lg font-semibold text-slate-900 dark:text-white"
                style={{ transform: "translateZ(20px)" }}
              >
                {item.title}
              </h3>
              <p
                className="mt-1 text-sm text-slate-700/90 dark:text-slate-300"
                style={{ transform: "translateZ(14px)" }}
              >
                {item.short}
              </p>
            </div>
          </div>

          {/* Beneficios */}
          <div className="mt-4">
            <ul
              aria-labelledby={`${id}-title`}
              className={cn(
                "grid gap-2 text-sm text-slate-800 dark:text-slate-200",
                "transition-[grid-template-rows,opacity] duration-300 ease-out",
                "overflow-hidden",
                expanded
                  ? "opacity-100"
                  : "opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
              )}
              style={{
                gridTemplateRows: expanded ? "1fr" : "0fr",
              }}
            >
              <div className="min-h-0">
                {item.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2
                      className={cn(
                        "mt-0.5 h-4 w-4 flex-none",
                        item.accent.icon
                      )}
                      aria-hidden
                    />
                    <span>{b}</span>
                  </li>
                ))}
              </div>
            </ul>

            {/* Toggle (para móvil/teclado) */}
            <div className="mt-4 flex">
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={`${id}-content`}
                onClick={() => setExpanded((v) => !v)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
                  "bg-white/80 text-slate-700 ring-1 ring-black/10 shadow-sm",
                  "hover:bg-white hover:ring-black/20 active:scale-[0.98]",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                  "focus-visible:ring-femme-rose focus-visible:ring-offset-white",
                  "dark:focus-visible:ring-offset-slate-900"
                )}
              >
                {expanded ? "Ocultar" : "Ver beneficios"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Grid de cards */
export default function Benefits() {

  return (

    <section
      className="bg-white"
    >
      <div className="container py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-femme-magenta">Beneficios de los cursos</h2>
        <div className="mx-auto max-w-6xl px-4">
          <header className="mb-8">
             <p className="mt-2 text-slate-600 dark:text-slate-300">
              Explora los estilos y sus beneficios
          </p>
        </header>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {DATA.map((item) => (
            <Card key={item.id} item={item} />
          ))}
        </div>
      </div>
      
      </div>
    </section>
  );
}
