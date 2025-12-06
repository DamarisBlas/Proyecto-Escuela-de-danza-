from ..app import db
from sqlalchemy import Column, Integer, String, Date, Text, Boolean, ForeignKey, BigInteger

class Oferta(db.Model):
    __tablename__ = 'Oferta'
    id_oferta = Column(Integer, primary_key=True, autoincrement=True)
    ciclo_id_ciclo = Column(Integer, ForeignKey('ciclo.id_ciclo'), nullable=False)
    Subcategoria_id_subcategoria = Column(Integer, ForeignKey('Subcategoria.id_subcategoria'), nullable=False)
    fecha_inicio = Column(Date, nullable=False)
    fecha_fin = Column(Date, nullable=False)
    descripcion = Column(Text, nullable=True)
    estado = Column(Boolean, nullable=False, default=True)
    nombre_oferta = Column(String(100), nullable=False)
    whatsapplink = Column(Text, nullable=True)
    cantidad_cursos = Column(Integer, nullable=False)
    publico_objetivo = Column(String(200), nullable=True)
    repite_semanalmente = Column(Boolean, nullable=False, default=False)

    def __repr__(self):
        return f"<Oferta {self.nombre_oferta}>"

    def to_dict(self):
        """
        Convierte el objeto Oferta a diccionario
        """
        return {
            "id_oferta": self.id_oferta,
            "ciclo_id_ciclo": self.ciclo_id_ciclo,
            "Subcategoria_id_subcategoria": self.Subcategoria_id_subcategoria,
            "fecha_inicio": self.fecha_inicio.isoformat() if self.fecha_inicio else None,
            "fecha_fin": self.fecha_fin.isoformat() if self.fecha_fin else None,
            "descripcion": self.descripcion,
            "estado": self.estado,
            "nombre_oferta": self.nombre_oferta,
            "whatsapplink": self.whatsapplink,
            "cantidad_cursos": self.cantidad_cursos,
            "publico_objetivo": self.publico_objetivo,
            "repite_semanalmente": self.repite_semanalmente,
        }
