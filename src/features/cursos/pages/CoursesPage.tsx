
import Schedule from '../components/Schedule'

export default function CoursesPage() {
  return (
    <div className="bg-white">
      {/* Encabezado con degradado como Hero */}
      <section className="bg-brand-gradient text-white">
        <div className="container py-10 md:py-14">
          <h1 className="text-3xl md:text-4xl font-bold">Cursos y Agenda</h1>
          <p className="mt-2 text-white/90 max-w-prose">
            Explora horarios por fecha o profesor, filtra por sede y tipo de curso.
          </p>
        </div>
      </section>

      <Schedule />
    </div>
  )
}

