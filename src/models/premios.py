from sqlalchemy import Column, Integer, BigInteger, Numeric, Boolean, ForeignKey
from src.app import db


class Premio(db.Model):
    __tablename__ = 'Premios'

    id_premio = Column(Integer, primary_key=True)
    Promocion_id_promocion = Column(Integer, ForeignKey('Promocion.id_promocion'), nullable=False)

    descuento = Column(Numeric(4, 2), nullable=False)
    estado = Column(Boolean, nullable=False)

    def to_dict(self):
        return {
            'id_premio': self.id_premio,
            'Promocion_id_promocion': self.Promocion_id_promocion,
            'descuento': float(self.descuento) if self.descuento is not None else None,
            'estado': self.estado
        }
