import {Card }from '@components/ui/Card'
import { Heart, Target, Eye, Users } from 'lucide-react'
import VideoCarousel from '@components/ui/VideoCarousel'

export default function AboutPage() {
  const valores = [
    { icon: Heart, titulo: 'Amor', descripcion: 'Eres femme — cultivamos el amor propio y hacia la comunidad.' },
    { icon: Target, titulo: 'Resiliencia', descripcion: 'Eres fuerte — fortalecemos la capacidad de superar desafíos.' },
    { icon: Eye, titulo: 'Autoestima', descripcion: 'Eres bella — potenciamos la confianza y la autoaceptación.' },
    { icon: Users, titulo: 'Diversidad', descripcion: 'Celebramos y respetamos todas las formas de expresión.' }
  ]

  const programas = [
    {
      nombre: 'Camino Femme',
      descripcion:
        'Programa de formación de bailarinas urbanas femeninas que combina técnica, desarrollo personal y empoderamiento.'
    },
    {
      nombre: 'Femme Fit',
      descripcion:
        'Programa de formación de profesores fitness especializado en danza y acondicionamiento físico.'
    },
    {
      nombre: 'Bailando me Quiero',
      descripcion:
        'Proyecto dedicado a crear espacios de libre movimiento y expresión diversa, libres de prejuicios.'
    }
  ]


   const producciones = [
    { id: 't8HDELWiJrc', title: 'Toxic' },
    { id: '37BmXnpb0wA', title: 'Queens' },
    { id: 'lyvec5NFtPk', title: 'Bailando me quiero 22 ' },
    
  ]


  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="rounded-xl text-white shadow-femme bg-gradient-to-br from-femme-magenta via-femme-rose to-femme-coral">
        <div className="px-6 sm:px-8 md:px-12 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Sobre Nosotros</h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto">
            Conoce la historia, misión y valores que nos impulsan a transformar vidas a través de la danza.
          </p>
        </div>
      </section>

      {/* Quiénes Somos */}
      <section className="bg-femme-snow">
        <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-femme-magenta mb-6 text-center">Quiénes Somos</h2>
          <div className="prose prose-lg max-w-none text-graphite">
            <p className="leading-relaxed">
              FemmeDance es una escuela de danza en La Paz, Bolivia, enfocada en el empoderamiento femenino a través
              de la danza urbana. Somos más que una escuela de baile; somos un movimiento que busca transformar vidas
              y crear espacios seguros donde las mujeres puedan expresarse libremente.
            </p>
            <p className="leading-relaxed">
              Nuestro enfoque va más allá de la técnica de baile. Creemos que la danza es una herramienta poderosa
              para el desarrollo personal, la construcción de autoestima y la creación de comunidades fuertes y
              solidarias.
            </p>
          </div>
        </div>
      </section>

      {/* Misión · Visión · Objetivo */}
      <section className="bg-gray-50 py-4 rounded-xl">
        <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-femme-rose rounded-full flex items-center justify-center mx-auto mb-6">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-femme-magenta mb-3">Misión</h3>
                <p className="text-graphite leading-relaxed">
                  Ofrecer servicios artísticos, culturales y de formación con programas y proyectos que usen la danza
                  como herramienta de desarrollo personal, creando espacios de libre movimiento.
                </p>
              </div>
            </Card>

            <Card>
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-femme-coral rounded-full flex items-center justify-center mx-auto mb-6">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-femme-magenta mb-3">Visión</h3>
                <p className="text-graphite leading-relaxed">
                  Ser un referente en la industria artística a nivel nacional e internacional, reconocidos por la
                  excelencia en la formación de bailarinas y el compromiso con el empoderamiento femenino.
                </p>
              </div>
            </Card>

            <Card>
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-femme-orange rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-femme-magenta mb-3">Objetivo</h3>
                <p className="text-graphite leading-relaxed">
                  Empoderar a las mujeres a través de la danza, desarrollando su potencial artístico, fortaleciendo su
                  autoestima y construyendo una comunidad de apoyo mutuo.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="bg-femme-snow">
        <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-femme-magenta mb-10 text-center">Nuestros Valores</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {valores.map((v, i) => (
              <Card key={i}>
                <div className="p-6 text-center hover:shadow-lg transition-shadow rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-femme-rose to-femme-coral flex items-center justify-center mx-auto mb-4">
                    <v.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-femme-magenta mb-1">{v.titulo}</h3>
                  <p className="text-sm text-graphite leading-relaxed">{v.descripcion}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Programas */}
      <section className="bg-gray-50 py-4 rounded-xl">
        <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-femme-magenta mb-10 text-center">Nuestros Programas</h2>
          <div className="space-y-6">
            {programas.map((p, i) => (
              <Card key={i}>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-femme-magenta mb-2">{p.nombre}</h3>
                  <p className="text-lg text-graphite leading-relaxed">{p.descripcion}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

       {/* Nuestras producciones (Carousel de YouTube) */}
      <section className="bg-femme-snow">
        <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-femme-magenta mb-6 text-center">Nuestras producciones</h2>
          <p className="text-center text-graphite mb-6">
            Una selección de videos producidos por la escuela.
          </p>
          <VideoCarousel videos={producciones} />
        </div>
      </section>
      <br />
      <br />





    </div>
  )
}
