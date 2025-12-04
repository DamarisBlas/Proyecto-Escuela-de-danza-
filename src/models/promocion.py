from sqlalchemy import Column, BigInteger, Integer, Date, Numeric, String, Boolean, ForeignKey, Text
from src.app import db


class Promocion(db.Model):
    __tablename__ = 'Promocion'

    id_promocion = Column(BigInteger, primary_key=True)
    Oferta_id_oferta = Column(BigInteger, ForeignKey('Oferta.id_oferta'), nullable=False)

    nombre_promocion = Column(String(50), nullable=False)
    descricpcion = Column(Text, nullable=True)  # mantengo el nombre tal como lo proporcionaste

    fecha_inicio = Column(Date, nullable=True)
    fecha_fin = Column(Date, nullable=False)

    img = Column(Text, nullable=True)
    publico_objetivo = Column(String(20), nullable=False)

    porcentaje_descuento = Column(Numeric(5, 2), nullable=False)
    paquetes_especificos = Column(String(50), nullable=False)

    aplica_nuevos_usuarios = Column(Boolean, nullable=True)
    tiene_sorteo = Column(Boolean, nullable=False)
    cantidad_premios = Column(Integer, nullable=True)
    activo = Column(Boolean, nullable=True, default=True)  # Campo que existe en BD

    estado = Column(Boolean, nullable=False)
    
    # Aumentado: ahora soporta números más grandes
    cantidad_beneficiarios = Column(Integer, nullable=True)
    cantidad_beneficiarios_inscritos = Column(Integer, nullable=True, default=0)

    def to_dict(self):
        return {
            'id_promocion': self.id_promocion,
            'Oferta_id_oferta': self.Oferta_id_oferta,
            'nombre_promocion': self.nombre_promocion,
            'descricpcion': self.descricpcion,
            'fecha_inicio': self.fecha_inicio.isoformat() if self.fecha_inicio else None,
            'fecha_fin': self.fecha_fin.isoformat() if self.fecha_fin else None,
            'img': self.img,
            'publico_objetivo': self.publico_objetivo,
            'porcentaje_descuento': float(self.porcentaje_descuento) if self.porcentaje_descuento is not None else None,
            'paquetes_especificos': self.paquetes_especificos,
            'aplica_nuevos_usuarios': self.aplica_nuevos_usuarios,
            'tiene_sorteo': self.tiene_sorteo,
            'cantidad_premios': self.cantidad_premios,
            'activo': self.activo,
            'estado': self.estado,
            'cantidad_beneficiarios': int(self.cantidad_beneficiarios) if self.cantidad_beneficiarios is not None else None,
            'cantidad_beneficiarios_inscritos': int(self.cantidad_beneficiarios_inscritos) if self.cantidad_beneficiarios_inscritos is not None else 0,
        }
