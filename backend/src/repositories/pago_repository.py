from src.models.pago import Pago
from src.app import db

class PagoRepository:
    """
    Repositorio para operaciones CRUD de Pago
    """

    @staticmethod
    def get_all():
        """
        Obtiene todos los pagos
        """
        return Pago.query.all()

    @staticmethod
    def get_by_id(pago_id):
        """
        Obtiene un pago por ID
        """
        return Pago.query.get(pago_id)

    @staticmethod
    def get_by_inscripcion(inscripcion_id):
        """
        Obtiene todos los pagos de una inscripción
        """
        return Pago.query.filter_by(Inscripcion_id_inscripcion=inscripcion_id).order_by(Pago.numero_cuota).all()

    @staticmethod
    def get_by_estado(estado):
        """
        Obtiene pagos por estado específico
        """
        return Pago.query.filter_by(estado=estado).all()

    @staticmethod
    def get_by_metodo_pago(metodo_pago_id):
        """
        Obtiene pagos por método de pago
        """
        return Pago.query.filter_by(Metodo_pago_id_metodo_pago=metodo_pago_id).all()

    @staticmethod
    def get_pagos_pendientes():
        """
        Obtiene pagos pendientes
        """
        return Pago.query.filter_by(estado='PENDIENTE').all()

    @staticmethod
    def get_pagos_vencidos():
        """
        Obtiene pagos vencidos (fecha_vencimiento < hoy y estado pendiente)
        """
        from datetime import date
        today = date.today()
        return Pago.query.filter(
            Pago.fecha_vencimiento < today,
            Pago.estado == 'PENDIENTE'
        ).all()

    @staticmethod
    def get_pagos_confirmados():
        """
        Obtiene pagos confirmados
        """
        return Pago.query.filter_by(estado='CONFIRMADO').all()

    @staticmethod
    def create(pago_data):
        """
        Crea un nuevo pago
        """
        pago = Pago(**pago_data)
        db.session.add(pago)
        db.session.flush()  # Para obtener el ID
        return pago

    @staticmethod
    def update(pago_id, pago_data):
        """
        Actualiza un pago existente
        """
        pago = Pago.query.get(pago_id)
        if not pago:
            return None

        for key, value in pago_data.items():
            if hasattr(pago, key):
                setattr(pago, key, value)

        db.session.flush()
        return pago

    @staticmethod
    def delete(pago_id):
        """
        Elimina un pago (borrado lógico)
        """
        pago = Pago.query.get(pago_id)
        if not pago:
            return None

        pago.estado = 'CANCELADO'
        db.session.flush()
        return pago

    @staticmethod
    def get_cuotas_by_inscripcion(inscripcion_id):
        """
        Obtiene el resumen de cuotas de una inscripción
        """
        pagos = Pago.query.filter_by(Inscripcion_id_inscripcion=inscripcion_id).order_by(Pago.numero_cuota).all()
        
        total_pagos = len(pagos)
        pagos_confirmados = len([p for p in pagos if p.estado == 'CONFIRMADO'])
        pagos_pendientes = len([p for p in pagos if p.estado == 'PENDIENTE'])
        monto_total = sum([float(p.monto) for p in pagos])
        monto_pagado = sum([float(p.monto) for p in pagos if p.estado == 'CONFIRMADO'])
        
        return {
            'total_cuotas': total_pagos,
            'cuotas_pagadas': pagos_confirmados,
            'cuotas_pendientes': pagos_pendientes,
            'monto_total': monto_total,
            'monto_pagado': monto_pagado,
            'monto_pendiente': monto_total - monto_pagado,
            'pagos': [pago.to_dict() for pago in pagos]
        }