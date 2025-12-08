export interface HorarioItem {
  id_horario: number;
  capacidad: number;
  dias: string;
  estado: boolean;
  hora_fin: string;
  hora_inicio: string;
  nivel: number;
  total_inscritos: number;
  estilo: {
    nombre_estilo: string;
  };
  oferta: {
    nombre_oferta: string;
    categoria: {
      nombre_categoria: string;
    };
    ciclo: {
      nombre_ciclo: string;
    };
    programa: {
      nombre_programa: string;
    };
    subcategoria: {
      nombre_subcategoria: string;
    };
  };
  profesor: {
    persona: {
      nombre: string;
      apellido_paterno: string;
      apellido_materno: string;
    };
  };
  sala: {
    nombre_sala: string;
    zona: string;
    ubicacion: string;
    link_ubicacion: string;
  };
}

export interface Student {
  id: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  email: string;
  celular: string;
  sesiones: {
    fecha: string;
    asistio: boolean | null;
    id_asistencia: number;
  }[];
  inscripcion: {
    id_inscripcion: number;
    estado: string;
    clases_restantes: number;
    clases_usadas: number;
    fecha_fin: string;
  };
}