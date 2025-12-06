import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getCourse } from '../api/courses'
import { Card } from '@components/ui/Card'

export default function CourseDetailPage() {
  const { id } = useParams()
  const { data } = useQuery({ queryKey: ['courses', id], queryFn: () => getCourse(id!) })
  if (!data) return null
  return (
    <div className="container">
      <Card>
        <div className="text-2xl font-semibold">{data.title}</div>
        <div className="text-sm text-zinc-500">{data.style} • {data.level}</div>
        <div className="mt-4">Horario: {data.schedule}</div>
        <div className="mt-2">Precio: Bs. {data.price}</div>
      </Card>
    </div>
  )
}
