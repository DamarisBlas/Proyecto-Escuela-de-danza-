from ..app import db
from sqlalchemy import Column, Integer, String, Text, Boolean

class Sala(db.Model):
    __tablename__ = 'Sala'
    id_sala = Column(Integer, primary_key=True, autoincrement=True)
    nombre_sala = Column(String(50), nullable=False)
    ubicacion = Column(Text, nullable=False)
    link_ubicacion = Column(Text, nullable=True)
    departamento = Column(String(20), nullable=False)
    zona = Column(String(20), nullable=False, default="LP")
    estado = Column(Boolean, nullable=False, default=True)

    def __repr__(self):
        return f"<Sala {self.nombre_sala}>"

    def to_dict(self):
        """
        Convierte el objeto Sala a diccionario
        """
        return {
            "id_sala": self.id_sala,
            "nombre_sala": self.nombre_sala,
            "ubicacion": self.ubicacion,
            "link_ubicacion": self.link_ubicacion,
            "departamento": self.departamento,
            "zona": self.zona,
            "estado": self.estado
        }
