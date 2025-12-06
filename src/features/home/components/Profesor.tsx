

import React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MapPin, Calendar, Star, Instagram } from "lucide-react";

type Profesor = {
  slug: string;
  name: string;
  avatarLetter?: string;       // si no hay foto, usamos inicial
  avatarUrl?: string;          // opcional si luego agregas imagen
  specialties: string[];
  experience: string;          // ej: "15 años"
  quote?: string;
  description: string;
  details: {
    ciudad: string;
    signo: string;
    musica: string;
  };
  instagram: {
    handle: string;            // ej: "@patty_dancer"
    url: string;               // ej: "https://instagram.com/patty_dancer"
  };
};

const profesores: Profesor[] = [
  {
    slug: "patricia-charcas",
    name: 'Patricia Charcas "Patty"',
    avatarLetter: "P",
    specialties: ["Dancehall", "Salsa Femme", "Heels"],
    experience: "15 años",
    quote: "La danza es el lenguaje oculto del alma",
    description: "Profesora apasionada por el movimiento y la expresión escénica.",
    details: {
      ciudad: "La Paz, Bolivia",
      signo: "Escorpio",
      musica: "Reggae, Hip Hop",
    },
    instagram: {
      handle: "@patty_dancer",
      url: "https://instagram.com/dianira.bo/",
    },
  },
  {
    slug: "daysi",
    name: "Daysi",
    avatarLetter: "D",
    specialties: ["Heels", "Dancehall", "Afrobeats"],
    experience: "12 años",
    quote: "El movimiento es vida",
    description: "Especialista en danza urbana femenina con enfoque técnico y musicalidad.",
    details: {
      ciudad: "La Paz, Bolivia",
      signo: "Leo",
      musica: "Urban, Afrobeats",
    },
    instagram: {
      handle: "@daysi_urban",
      url: "https://instagram.com/daysi_pao/",
    },
  },
];
function ProfesorCard({ p }: { p: Profesor }) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-femme-lg">
      <CardContent className="p-0">
        {/* Header visual */}
        <div className="relative h-44 bg-gradient-to-br from-femme-rose to-femme-coral">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.2),transparent_55%)]" />
          <div className="absolute inset-0 flex items-center justify-center">
            {p.avatarUrl ? (
              <img
                src={p.avatarUrl}
                alt={`Foto de ${p.name}`}
                className="h-24 w-24 rounded-full object-cover ring-4 ring-white shadow-md"
                loading="lazy"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-white ring-4 ring-white shadow-md grid place-items-center">
                <span className="text-3xl font-bold text-femme-magenta">
                  {p.avatarLetter ?? p.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-xl font-bold text-femme-magenta break-words">
                {p.name}
              </h3>
              {p.quote && (
                <p className="mt-1 text-sm italic text-femme-rose/90">“{p.quote}”</p>
              )}
            </div>

            {/* Instagram */}
            <a
              href={p.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white text-femme-magenta px-3 py-1 text-xs font-medium ring-1 ring-femme-magenta/20 hover:bg-femme-magenta hover:text-white transition"
              aria-label={`Instagram de ${p.name}`}
              title={`Instagram de ${p.name}`}
            >
              <Instagram className="h-4 w-4" />
              <span className="hidden sm:inline">{p.instagram.handle}</span>
            </a>
          </div>

          <p className="mt-3 text-sm text-slate-600">{p.description}</p>

          {/* Detalles */}
          <div className="mt-5 grid grid-cols-1 gap-3 text-sm text-slate-700 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-femme-magenta" />
              <span>
                <strong>Ciudad:</strong> {p.details.ciudad}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-femme-magenta" />
              <span>
                <strong>Signo:</strong> {p.details.signo}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-femme-magenta" />
              <span>
                <strong>Experiencia:</strong> {p.experience}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-femme-magenta" />
              <span>
                <strong>Música:</strong> {p.details.musica}
              </span>
            </div>
          </div>

          {/* Chips de especialidades */}
          <div className="mt-5 flex flex-wrap gap-2">
            {p.specialties.map((s) => (
              <span
                key={s}
                className="px-3 py-1 rounded-full bg-femme-rose/10 text-femme-rose text-xs font-medium"
              >
                {s}
              </span>
            ))}
          </div>

          {/* Acciones */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
           

          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Profesor() {
  return (
    <section className="bg-white">
      <div className="container py-12">
        <h2 className="text-2xl md:text-3xl font-bold ">Nuestros profesores</h2>

 
      <div className="mx-auto max-w-6xl px-4">
       
        <header className="mb-8">
            <p className="mt-2 text-slate-600 dark:text-slate-300">
                Conoce a nuestro equipo de profesoras especializadas en danza urbana y empoderamiento femenino.
         
          </p>
        </header>

        {/* Grid responsive: 1 -> 2 -> 3 columnas */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {profesores.map((p) => (
            <ProfesorCard key={p.slug} p={p} />
          ))}
        </div>
      </div>
    




       
      </div>
    </section>
  )
}

