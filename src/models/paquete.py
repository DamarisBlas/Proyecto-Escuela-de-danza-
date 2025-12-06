from ..app import db
from sqlalchemy import Column, Integer, String, Boolean, Numeric, BigInteger, ForeignKey

class Paquete(db.Model):
    __tablename__ = 'Paquete'
    id_paquete = Column(Integer, primary_key=True, autoincrement=True)
    
    
    nombre = Column(String(50), nullable=False) 
    cantidad_clases = Column(Integer, nullable=True)  # NULL si es ilimitado
     
    dias_validez = Column(Integer, nullable=False, default=30)
    estado = Column(Boolean, nullable=False, default=True)

    ilimitado = Column(Boolean, nullable=False, default=False)
    
    Oferta_id_oferta = Column(Integer, ForeignKey('Oferta.id_oferta'), nullable=False)
    precio = Column(Numeric(10, 2), nullable=False)
   
    def __repr__(self):
        return f"<Paquete {self.nombre}>"
    
    def to_dict(self):
        return {
            'id_paquete': self.id_paquete,
            'nombre': self.nombre,
            'cantidad_clases': self.cantidad_clases,
            'dias_validez': self.dias_validez,
            'estado': self.estado,
            'ilimitado': self.ilimitado,
            'oferta_id': self.Oferta_id_oferta,
            'precio': float(self.precio) if self.precio else None,
        }
