from sqlalchemy import Column, Integer, String, Boolean
from src.app import db


class MetodoPago(db.Model):
    __tablename__ = 'Metodo_pago'

    id_metodo_pago = Column(Integer, primary_key=True)
    nombre_metodo = Column(String(30), nullable=False)
    descripcion = Column(String(100), nullable=True)
    estado = Column(Boolean, nullable=False)

    def to_dict(self):
        return {
            'id_metodo_pago': self.id_metodo_pago,
            'nombre_metodo': self.nombre_metodo,
            'descripcion': self.descripcion,
            'estado': self.estado
        }
