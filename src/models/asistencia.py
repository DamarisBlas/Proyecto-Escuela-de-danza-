from sqlalchemy import Column, Integer, Boolean, Date, ForeignKey
from src.app import db


class Asistencia(db.Model):
    __tablename__ = 'Asistencia'

    id_asistencia = Column(Integer, primary_key=True)
    # FK to Inscripcion (table `Inscripcion`, pk `id_inscripcion`)
    Inscripcion_id_inscripcion = Column(Integer, ForeignKey('Inscripcion.id_inscripcion'), nullable=False)
    # FK to HorarioSesion (table `HorarioSesion`, pk `id_horario_sesion`)
    Horario_sesion_id_horario_sesion = Column(Integer, ForeignKey('HorarioSesion.id_horario_sesion'), nullable=False)

    asistio = Column(Boolean, nullable=True)
    fecha = Column(Date, nullable=True)
    estado = Column(Boolean, nullable=False)

    def to_dict(self):
        return {
            'id_asistencia': self.id_asistencia,
            'Inscripcion_id_inscripcion': self.Inscripcion_id_inscripcion,
            'Horario_sesion_id_horario_sesion': self.Horario_sesion_id_horario_sesion,
            'asistio': self.asistio,
            'fecha': self.fecha.isoformat() if self.fecha else None,
            'estado': self.estado
        }
