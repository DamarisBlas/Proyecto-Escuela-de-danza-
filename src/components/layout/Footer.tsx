/*export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="container py-6 text-sm text-graphite">
        © {new Date().getFullYear()} Femme Dance. Todos los derechos reservados.
      </div>
    </footer>
  )
}
*/
import { Link } from "react-router-dom";
import { Instagram, Facebook, Youtube, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-brand-gradient text-white">
      <div className="container px-4 sm:px-6 lg:px-8 py-12">
        {/* Grid responsive: 1 col → 3/4 cols en desktop */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Logo + descripción */}
          <div className="md:col-span-6 lg:col-span-6 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              {/* Si está en /public usa src="/logo-femme.svg"; si está en /src/assets, impórtalo */}
                <img src="\src\assets\logoblanco.png" alt="Femme Dance" className="h-8 w-auto" />
              <span className="text-2xl font-bold">Femme Dance</span>
            </div>

            <p className="max-w-prose mx-auto md:mx-0 text-white/90 leading-relaxed">
              No es solo una Escuela de Danza... Es un estado mental y de comportamiento. Es un estilo de vida.
              ¡Eres bella! ¡Eres fuerte! ¡Eres femme!
            </p>

            {/* Social: centrado en mobile, a la izquierda en desktop */}
            <div className="mt-6 flex justify-center md:justify-start gap-4">
              <a href="https://instagram.com//femmedance.bo/" target="_blank" rel="noreferrer"
                 className="hover:text-femme-soft-yellow transition-colors" aria-label="Instagram">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="https://facebook.com/femmedance.bo?locale=es_LA" target="_blank" rel="noreferrer"
                 className="hover:text-femme-soft-yellow transition-colors" aria-label="Facebook">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="https://youtube.com/@femmedance" target="_blank" rel="noreferrer"
                 className="hover:text-femme-soft-yellow transition-colors" aria-label="YouTube">
                <Youtube className="w-6 h-6" />
              </a>
              <a href="https://wa.me/59164048095" target="_blank" rel="noreferrer"
                 className="hover:text-femme-soft-yellow transition-colors" aria-label="WhatsApp">
                <MessageCircle className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Enlaces rápidos – acordeón en mobile, lista fija en desktop */}
          <div className="md:col-span-3">
            {/* Mobile (acordeón) */}
            <details className="md:hidden group">
              <summary className="cursor-pointer text-lg font-semibold list-none flex items-center justify-between">
                Enlaces
                <span className="transition group-open:rotate-180">⌄</span>
              </summary>
              <ul className="mt-3 space-y-2 text-white/90">
                <li><Link to="/" className="hover:text-femme-soft-yellow">Inicio</Link></li>
                <li><Link to="/cursos" className="hover:text-femme-soft-yellow">Cursos</Link></li>
                <li><Link to="/promociones" className="hover:text-femme-soft-yellow">Promociones</Link></li>
                <li><Link to="/sobre-nosotros" className="hover:text-femme-soft-yellow">Sobre nosotros</Link></li>
              </ul>
            </details>

            {/* Desktop */}
            <div className="hidden md:block">
              <h3 className="text-lg font-semibold">Enlaces</h3>
              <ul className="mt-4 space-y-2 text-white/90">
                <li><Link to="/" className="hover:text-femme-soft-yellow">Inicio</Link></li>
                <li><Link to="/cursos" className="hover:text-femme-soft-yellow">Cursos</Link></li>
                <li><Link to="/promociones" className="hover:text-femme-soft-yellow">Promociones</Link></li>
                <li><Link to="/sobre-nosotros" className="hover:text-femme-soft-yellow">Sobre nosotros</Link></li>
              </ul>
            </div>
          </div>

          {/* Contacto – acordeón en mobile, lista fija en desktop */}
          <div className="md:col-span-3">
            {/* Mobile (acordeón) */}
            <details className="md:hidden group">
              <summary className="cursor-pointer text-lg font-semibold list-none flex items-center justify-between">
                Contacto
                <span className="transition group-open:rotate-180">⌄</span>
              </summary>
              <div className="mt-3 space-y-2 text-white/90">
                <p>La Paz, Bolivia</p>
                <p>Zona Sopocachi</p>
                <p>WhatsApp: +591 64048095</p>
              </div>
            </details>

            {/* Desktop */}
            <div className="hidden md:block">
              <h3 className="text-lg font-semibold">Contacto</h3>
              <div className="mt-4 space-y-2 text-white/90">
                <p>La Paz, Bolivia</p>
                <p>Zona Sopocachi</p>
                <p>WhatsApp: +591 64048095</p>
              </div>
            </div>
          </div>
        </div>

        {/* Copy */}
        <div className="border-t border-white/20 mt-10 pt-8 text-center text-white/80 text-sm">
          © {new Date().getFullYear()} Femme Dance. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}



