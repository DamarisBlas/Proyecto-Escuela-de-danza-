INSERT INTO Programa (nombre_programa, descricpcion_programa, estado) VALUES

('Camino Femme',
 'Programa principal de formación continua de bailarinas urbanas femeninas. Eje central de la escuela. Trabaja estilos como Heels, Dancehall, Afro, Salsa Femme, Twerk y Funk. Se organiza en categorías: Técnico (Regular ~2 meses con paquetes; Intensivo 1–2 días; Taller 1–2 días), Complementario (Especiales de 1 día) y Práctico (Producciones).',
 TRUE)
INSERT INTO Categoria (Programa_id_programa, nombre_categoria, descripcion_categoria, estado) VALUES
(1, 'Técnico', 'Cursos para mejorar la técnica de estilos urbanos femeninos (Regular ~2 meses, Intensivo 1–2 días, Taller 1–2 días).', TRUE),
(1, 'Complementario', 'Experiencias temáticas de un día orientadas al disfrute y refuerzo (Especiales).', TRUE),
(1, 'Práctico', 'Producciones y prácticas escénicas (grabaciones, presentaciones) para aplicar lo aprendido.', TRUE);

/*
CATEGORIAS

  {
    "Programa_id_programa": 1,
    "nombre_categoria": "Técnico",
    "descripcion_categoria": "Cursos para mejorar la técnica de estilos urbanos femeninos (Regular ~2 meses, Intensivo 1–2 días, Taller 1–2 días)."
  },
  {
    "Programa_id_programa": 1,
    "nombre_categoria": "Complementario",
    "descripcion_categoria": "Experiencias temáticas de un día orientadas al disfrute y refuerzo (Especiales)."
  },
  {
    "Programa_id_programa": 1,
    "nombre_categoria": "Práctico",
    "descripcion_categoria": "Producciones y prácticas escénicas (grabaciones, presentaciones) para aplicar lo aprendido."
  }





SUBCATEGORIA



  {
    "Categoria_id_categoria": 1,
    "nombre_subcategoria": "Regular",
    "descripcion_subcategoria": "Clases mensuales (~2 meses) con paquetes de 4/8/12/16; varios estilos y profes en el ciclo."
  },
  {
    "Categoria_id_categoria": 1,
    "nombre_subcategoria": "Taller",
    "descripcion_subcategoria": "Eventos de 1 a 2 días; pueden incluir varios bloques con distintos estilos y profes."
  },
  {
    "Categoria_id_categoria": 1,
    "nombre_subcategoria": "Intensivo",
    "descripcion_subcategoria": "Entrenamiento técnico concentrado (1–2 días) enfocado en uno o dos estilos."
  },
  {
    "Categoria_id_categoria": 2,
    "nombre_subcategoria": "Especiales",
    "descripcion_subcategoria": "Jornadas de 1 día con temática (carnaval, halloween, etc.); combinan varios estilos."
  },
  {
    "Categoria_id_categoria": 3,
    "nombre_subcategoria": "Producciones",
    "descripcion_subcategoria": "Grabaciones/presentaciones de coreografías; usualmente elenco o estudiantes seleccionados."
  }




SALAS

  {
    "nombre_sala": "Studio Dance",
    "ubicacion": "Plaza Abaroa, lado Café Alexander, Piso 1",
    "link_ubicacion": "https://maps.app.goo.gl/UUqXwQbeFRMJc8hP8",
    "departamento": "LP",
    "zona": "Sopocachi"
  },
  {
    "nombre_sala": "Universe Dance",
    "ubicacion": "Edif. Sama, Piso 1, Av. 20 de Octubre, a media cuadra de la Landaeta",
    "link_ubicacion": "https://maps.app.goo.gl/MPHfRX3CqHguo5gC7",
    "departamento": "LP",
    "zona": "San Pedro"
  }


ESTILOS

  {
    "nombre_estilo": "Heels",
    "descripcion_estilo": "Técnica y coreografía en tacones (incluye variaciones como Heels Floorwork).",
    "beneficios_estilo": "Mejora equilibrio, líneas y presencia escénica; refuerza core y glúteos."
  },
  {
    "nombre_estilo": "Twerk",
    "descripcion_estilo": "Técnica de caderas y aislamientos; niveles Basic/Inter/Pro y formatos de clase.",
    "beneficios_estilo": "Aumenta control de cadera, resistencia y confianza corporal."
  },
  {
    "nombre_estilo": "Dancehall Femenino",
    "descripcion_estilo": "Estilo jamaicano en líneas femeninas; incluye subestilos como Dancehall Queen (DHQ) y Bruk Out.",
    "beneficios_estilo": "Explosividad, grooves y musicalidad; mejora memoria coreográfica."
  },
  {
    "nombre_estilo": "Afrobeats",
    "descripcion_estilo": "Ritmos y pasos afro-urbanos modernos (clases y talleres combinados con Twerk en algunas convocatorias).",
    "beneficios_estilo": "Coordinación de cuerpo completo y resistencia; trabajo de pies y groove."
  },
  {
    "nombre_estilo": "Afrotwerk",
    "descripcion_estilo": "Fusión de bases afro-urbanas con técnica de Twerk (talleres y combos).",
    "beneficios_estilo": "Mejora movilidad de cadera/torso y acondiciona tren inferior."
  },
  {
    "nombre_estilo": "Heels Floorwork",
    "descripcion_estilo": "Trabajo de piso en tacones con énfasis en control, líneas y transiciones seguras.",
    "beneficios_estilo": "Flexibilidad, fuerza de core y fluidez en transiciones al piso."
  }




INSERT INTO public."Metodo_pago" (nombre_metodo, descripcion, estado) VALUES
[
	{
		"descripcion": "Pago en efectivo en la sede (se confirma al recibir el dinero)",
		"estado": true,
		"id_metodo_pago": 1,
		"nombre_metodo": "Efectivo"
	},
	{
		"descripcion": "Pago mediante código QR de cualquier banco (confirmación inmediata)",
		"estado": true,
		"id_metodo_pago": 2,
		"nombre_metodo": "QR Bancario"
	},
	{
		"descripcion": "Pago con tarjeta de débito o crédito (confirmación inmediata)",
		"estado": true,
		"id_metodo_pago": 3,
		"nombre_metodo": "Tarjeta"
	}

*/