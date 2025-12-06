/*export function Values() {
  const items = [
    ['Empoderamiento','Espacios seguros para tu expresión.'],
    ['Disciplina','Crecimiento sostenido con acompañamiento.'],
    ['Comunidad','Aprende con una tribu que te impulsa.'],
  ]
  return (
    <section className="container grid md:grid-cols-3 gap-6">
      {items.map(([title, desc]) => (
        <div key={title} className="border rounded-md p-6">
          <div className="font-semibold">{title}</div>
          <div className="text-sm text-zinc-500 mt-1">{desc}</div>
        </div>
      ))}
    </section>
  )
}*/
const values = [
  { title: 'Amor', desc: 'Eres femme' },
  { title: 'Resiliencia', desc: 'Eres fuerte' },
  { title: 'Autoestima', desc: 'Eres bella' },
  { title: 'Disciplina', desc: '' },
  { title: 'Empatía', desc: '' },
  { title: 'Integridad', desc: '' },
  { title: 'Diversidad', desc: '' },
]

export default function Values() {
  return (
    <section className="container py-12">
      <h2 className="text-2xl md:text-3xl font-bold text-femme-magenta">Nuestros valores</h2>
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {values.map((v) => (
          <div key={v.title} className="rounded-lg border p-4">
            <p className="font-semibold text-femme-magenta">{v.title}</p>
            {v.desc && <p className="text-sm text-graphite mt-1">{v.desc}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}

