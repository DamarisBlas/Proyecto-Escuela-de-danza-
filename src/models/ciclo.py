from ..app import db
from sqlalchemy import Column, Integer, String, Date, Boolean

class Ciclo(db.Model):
    __tablename__ = 'ciclo'
    id_ciclo = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(20), nullable=False)
    inicio = Column(Date, nullable=False)
    fin = Column(Date, nullable=False)
    estado = Column(Boolean, nullable=False, default=True)
    activo = Column(Boolean, nullable=True, default=True)

    def __repr__(self):
        return f"<Ciclo {self.nombre}>"

    def to_dict(self):
        """
        Convierte el objeto Ciclo a diccionario
        """
        return {
            "id_ciclo": self.id_ciclo,
            "nombre": self.nombre,
            "inicio": self.inicio.isoformat() if self.inicio else None,
            "fin": self.fin.isoformat() if self.fin else None,
            "estado": self.estado,
            "activo": self.activo
        }
