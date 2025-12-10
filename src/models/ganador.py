from sqlalchemy import Column, BigInteger, Integer, Date, Boolean, ForeignKey
from src.app import db


class Ganador(db.Model):
    __tablename__ = 'Ganador'

    id_ganador = Column(Integer, primary_key=True)
    Persona_id_persona = Column(BigInteger, ForeignKey('Persona.id_persona'), nullable=False)
    fecha = Column(Date, nullable=False)
    Sorteo_id_sorteo = Column(Integer, ForeignKey('Sorteo.id_sorteo'), nullable=False)
    estado = Column(Boolean, nullable=False)
    Premios_id_premio = Column(Integer, ForeignKey('Premios.id_premio'), nullable=False)

    def to_dict(self):
        return {
            'id_ganador': self.id_ganador,
            'Persona_id_persona': self.Persona_id_persona,
            'fecha': self.fecha.isoformat() if self.fecha else None,
            'Sorteo_id_sorteo': self.Sorteo_id_sorteo,
            'estado': self.estado,
            'Premios_id_premio': self.Premios_id_premio
        }