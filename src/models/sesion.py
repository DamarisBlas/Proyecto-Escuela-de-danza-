from ..app import db
from sqlalchemy import Column, BigInteger, Integer, Date, Boolean, ForeignKey, String

class Sesion(db.Model):
    __tablename__ = 'Sesion'
    id_sesion = Column(BigInteger, primary_key=True, autoincrement=True)
    Horario_id_horario = Column(Integer, ForeignKey('Horario.id_horario'), nullable=False)
    fecha = Column(Date, nullable=False)
    motivo = Column(String(200), nullable=False)
    cancelado = Column(Boolean, nullable=False, default=False)
    estado = Column(Boolean, nullable=False, default=True)

    def __repr__(self):
        return f"<Sesion {self.id_sesion} fecha={self.fecha}>"
