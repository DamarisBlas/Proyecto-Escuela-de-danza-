from ..app import db
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey

class Subcategoria(db.Model):
    __tablename__ = 'Subcategoria'
    id_subcategoria = Column(Integer, primary_key=True, autoincrement=True)
    Categoria_id_categoria = Column(Integer, ForeignKey('Categoria.id_categoria'), nullable=False)
    nombre_subcategoria = Column(String(50), nullable=False)
    descripcion_subcategoria = Column(String(500), nullable=False)
    estado = Column(Boolean, nullable=False, default=True)

    def __repr__(self):
        return f"<Subcategoria {self.nombre_subcategoria}>"

    def to_dict(self):
        """
        Convierte el objeto Subcategoria a diccionario
        """
        return {
            "id_subcategoria": self.id_subcategoria,
            "Categoria_id_categoria": self.Categoria_id_categoria,
            "nombre_subcategoria": self.nombre_subcategoria,
            "descripcion_subcategoria": self.descripcion_subcategoria,
            "estado": self.estado
        }
