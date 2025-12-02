from ..app import db
from sqlalchemy import Column, Integer, String, Text, Boolean

class Programa(db.Model):
    __tablename__ = 'Programa'
    id_programa = Column(Integer, primary_key=True, autoincrement=True)
    nombre_programa = Column(String(100), nullable=False)
    descricpcion_programa = Column(Text, nullable=False)
    estado = Column(Boolean, nullable=False, default=True)

    def __repr__(self):
        return f"<Programa {self.nombre_programa}>"

    def to_dict(self):
        """
        Convierte el objeto Programa a diccionario
        """
        return {
            "id_programa": self.id_programa,
            "nombre_programa": self.nombre_programa,
            "descricpcion_programa": self.descricpcion_programa,
            "estado": self.estado
        }
