
import Hero from '../components/Hero'
import Values from '../components/Values'
import Testimonials from '../components/Testimonials'
import Identidad from '../components/Identidad'
import CaminoFemme from '../components/CaminoFemme'
import Benefits from '../components/Benefits'
import Profesor from '../components/Profesor'
import Faq from '../components/Faq'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Identidad />
      <CaminoFemme />
      <Benefits />
      <Profesor />
            
            <Values />
            <Testimonials />
      <Faq />
      
    </>
  )
}
