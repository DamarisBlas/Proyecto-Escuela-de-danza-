
export default function Testimonials() {
  return (
    <section className="bg-white">
      <div className="container py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-femme-magenta">Testimonios</h2>
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <blockquote key={i} className="rounded-lg border p-4 text-graphite">
              “Clases increíbles, ambiente seguro y empoderador.”
              <footer className="mt-3 text-sm text-ink">— Alumna #{i + 1}</footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}

