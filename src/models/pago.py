from sqlalchemy import Column, Integer, BigInteger, Numeric, DateTime, Date, String, ForeignKey
from src.app import db


class Pago(db.Model):
    __tablename__ = 'Pago'

    id_pago = Column(Integer, primary_key=True)
    Inscripcion_id_inscripcion = Column(Integer, ForeignKey('Inscripcion.id_inscripcion'), nullable=False)
    Metodo_pago_id_metodo_pago = Column(Integer, ForeignKey('Metodo_pago.id_metodo_pago'), nullable=False)

    numero_cuota = Column(Integer, nullable=False)
    monto = Column(Numeric(10, 2), nullable=False)
    
    # Stripe integration
    payment_intent_id = Column(String(255), nullable=True, unique=True)  # ID del pago en Stripe

    fecha_pago = Column(DateTime, nullable=True)
    fecha_vencimiento = Column(Date, nullable=False)
    fecha_confirmacion_director = Column(DateTime, nullable=True)

    confirmado_por = Column(Integer, nullable=False)
    observaciones = Column(String(100), nullable=True)
    estado = Column(String(50), nullable=False)

    def to_dict(self):
        return {
            'id_pago': self.id_pago,
            'Inscripcion_id_inscripcion': self.Inscripcion_id_inscripcion,
            'Metodo_pago_id_metodo_pago': self.Metodo_pago_id_metodo_pago,
            'numero_cuota': self.numero_cuota,
            'monto': float(self.monto) if self.monto is not None else None,
            'payment_intent_id': self.payment_intent_id,
            'fecha_pago': self.fecha_pago.isoformat() if self.fecha_pago else None,
            'fecha_vencimiento': self.fecha_vencimiento.isoformat() if self.fecha_vencimiento else None,
            'fecha_confirmacion_director': self.fecha_confirmacion_director.isoformat() if self.fecha_confirmacion_director else None,
            'confirmado_por': self.confirmado_por,
            'observaciones': self.observaciones,
            'estado': self.estado
        }
