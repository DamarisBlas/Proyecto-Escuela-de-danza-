from sqlalchemy import Column, BigInteger, Integer, Date, Numeric, String, Boolean, ForeignKey
from src.app import db


class Inscripcion(db.Model):
    __tablename__ = 'Inscripcion'

    id_inscripcion = Column(BigInteger, primary_key=True)
    Persona_id_persona = Column(BigInteger, ForeignKey('Persona.id_persona'), nullable=False)
    Paquete_id_paquete = Column(BigInteger, ForeignKey('Paquete.id_paquete'), nullable=False)
    Promocion_id_promocion = Column(BigInteger, ForeignKey('Promocion.id_promocion'), nullable=True)

    fecha_inscripcion = Column(Date, nullable=False)
    fecha_inicio = Column(Date, nullable=False)
    fecha_fin = Column(Date, nullable=False)

    precio_original = Column(Numeric(10, 2), nullable=False)
    descuento_aplicado = Column(Numeric(10, 2), nullable=False, default=0)
    precio_final = Column(Numeric(10, 2), nullable=False)

    estado_pago = Column(String(20), nullable=False)

    clases_usadas = Column(Integer, nullable=False, default=0)
    clases_restantes = Column(Integer, nullable=True)

    pago_a_cuotas = Column(Boolean, nullable=False, default=False)
    estado = Column(String(50), nullable=False)
    
    numero_cuotas = Column(Integer, nullable=True, default=1)
    montos_cuotas = Column(String(255), nullable=True)
    

    def to_dict(self):
        return {
            'id_inscripcion': self.id_inscripcion,
            'Persona_id_persona': self.Persona_id_persona,
            'Paquete_id_paquete': self.Paquete_id_paquete,
            'Promocion_id_promocion': self.Promocion_id_promocion,
            'fecha_inscripcion': self.fecha_inscripcion.isoformat() if self.fecha_inscripcion else None,
            'fecha_inicio': self.fecha_inicio.isoformat() if self.fecha_inicio else None,
            'fecha_fin': self.fecha_fin.isoformat() if self.fecha_fin else None,
            'precio_original': float(self.precio_original) if self.precio_original is not None else None,
            'descuento_aplicado': float(self.descuento_aplicado) if self.descuento_aplicado is not None else 0.0,
            'precio_final': float(self.precio_final) if self.precio_final is not None else None,
            'estado_pago': self.estado_pago,
            'clases_usadas': self.clases_usadas,
            'clases_restantes': self.clases_restantes,
            'pago_a_cuotas': self.pago_a_cuotas,
            'estado': self.estado,
            'numero_cuotas': self.numero_cuotas,
            'montos_cuotas': self.montos_cuotas
        }
