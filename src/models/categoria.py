from ..app import db
from sqlalchemy import Column, Integer, String, Boolean, Text, ForeignKey

class Categoria(db.Model):
    __tablename__ = 'Categoria'
    id_categoria = Column(Integer, primary_key=True, autoincrement=True)
    Programa_id_programa = Column(Integer, ForeignKey('Programa.id_programa'), nullable=False)
    nombre_categoria = Column(String(50), nullable=False)
    descripcion_categoria = Column(String(500), nullable=True)
    estado = Column(Boolean, nullable=False, default=True)

    def __repr__(self):
        return f"<Categoria {self.nombre_categoria}>"

    def to_dict(self):
        """
        Convierte el objeto Categoria a diccionario
        """
        return {
            "id_categoria": self.id_categoria,
            "Programa_id_programa": self.Programa_id_programa,
            "nombre_categoria": self.nombre_categoria,
            "descripcion_categoria": self.descripcion_categoria,
            "estado": self.estado
        }
