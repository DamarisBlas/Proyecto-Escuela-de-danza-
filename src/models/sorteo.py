from sqlalchemy import Column, Integer, Date, Boolean, ForeignKey
from src.app import db


class Sorteo(db.Model):
    __tablename__ = 'Sorteo'

    id_sorteo = Column(Integer, primary_key=True)
    Promocion_id_promocion = Column(Integer, ForeignKey('Promocion.id_promocion'), nullable=False)

    fecha_sorteo = Column(Date, nullable=False)
    estado = Column(Boolean, nullable=False)

    def to_dict(self):
        return {
            'id_sorteo': self.id_sorteo,
            'Promocion_id_promocion': self.Promocion_id_promocion,
            'fecha_sorteo': self.fecha_sorteo.isoformat() if self.fecha_sorteo else None,
            'estado': self.estado
        }