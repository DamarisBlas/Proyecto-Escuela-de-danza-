
import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="bg-brand-gradient text-white">
      <div className="container py-16 md:py-24 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
            Eres bella. Eres fuerte. <span className="opacity-90">Eres Femme.</span>
          </h1>
          <p className="mt-4 md:text-lg opacity-95">
            No es solo una Escuela de Danza... Es un estado mental y de comportamiento. Es un estilo de vida.
           
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/cursos" className="btn-primary">Ver cursos</Link>
            <Link to="/promociones" className="inline-flex items-center px-4 py-2 rounded-md bg-white/10 hover:bg-white/20">
              Promociones
            </Link>
          </div>
        </div>
        <div className="md:justify-self-end">
          <div className="bg-white/10 rounded-xl p-6 text-center">
            <p className="text-sm opacity-90">Próximo ciclo • Cupos limitados</p>
            <p className="text-2xl font-semibold mt-1">Camino Femme</p>
          </div>
        </div>
      </div>
    </section>
  )
}

