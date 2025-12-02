from ..app import db
from sqlalchemy import Column, Integer, String, Text, Boolean

class Estilo(db.Model):
    __tablename__ = 'Estilo'
    id_estilo = Column(Integer, primary_key=True, autoincrement=True)
    nombre_estilo = Column(String(100), nullable=False)
    descripcion_estilo = Column(Text, nullable=True)
    beneficios_estilo = Column(Text, nullable=True)
    estado = Column(Boolean, nullable=False, default=True)

    def __repr__(self):
        return f"<Estilo {self.nombre_estilo}>"

    def to_dict(self):
        """
        Convierte el objeto Estilo a diccionario
        """
        return {
            "id_estilo": self.id_estilo,
            "nombre_estilo": self.nombre_estilo,
            "descripcion_estilo": self.descripcion_estilo,
            "beneficios_estilo": self.beneficios_estilo,
            "estado": self.estado
        }
