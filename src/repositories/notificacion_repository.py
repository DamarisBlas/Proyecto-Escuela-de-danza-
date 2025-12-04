from src.models import Notificacion
from src.app import db
from datetime import date

class NotificacionRepository:
    """
    Repositorio para operaciones de base de datos de Notificacion
    """

    @staticmethod
    def get_all():
        """
        Obtiene todas las notificaciones
        """
        return Notificacion.query.all()

    @staticmethod
    def get_by_id(notificacion_id):
        """
        Obtiene una notificación por ID
        """
        return Notificacion.query.get(notificacion_id)

    @staticmethod
    def get_active():
        """
        Obtiene todas las notificaciones activas
        """
        return Notificacion.query.filter_by(estado=True).all()

    @staticmethod
    def get_by_tipo(tipo):
        """
        Obtiene notificaciones por tipo
        """
        return Notificacion.query.filter_by(tipo=tipo, estado=True).all()

    @staticmethod
    def get_by_categoria(categoria):
        """
        Obtiene notificaciones por categoría
        """
        return Notificacion.query.filter_by(categoria=categoria, estado=True).all()

    @staticmethod
    def get_by_prioridad(prioridad):
        """
        Obtiene notificaciones por prioridad
        """
        return Notificacion.query.filter_by(prioridad=prioridad, estado=True).all()

    @staticmethod
    def get_by_creador(creado_por):
        """
        Obtiene notificaciones por creador
        """
        return Notificacion.query.filter_by(creado_por=creado_por, estado=True).all()

    @staticmethod
    def get_by_fecha_creacion(fecha_creacion):
        """
        Obtiene notificaciones por fecha de creación
        """
        return Notificacion.query.filter_by(fecha_creacion=fecha_creacion, estado=True).all()

    @staticmethod
    def create(notificacion_data):
        """
        Crea una nueva notificación
        """
        nueva_notificacion = Notificacion(
            titulo=notificacion_data['titulo'],
            mensaje=notificacion_data['mensaje'],
            tipo=notificacion_data['tipo'],
            categoria=notificacion_data['categoria'],
            prioridad=notificacion_data['prioridad'],
            fecha_creacion=notificacion_data['fecha_creacion'],
            creado_por=notificacion_data.get('creado_por'),
            estado=notificacion_data.get('estado', True)
        )
        
        db.session.add(nueva_notificacion)
        db.session.commit()
        return nueva_notificacion

    @staticmethod
    def update(notificacion_id, notificacion_data):
        """
        Actualiza una notificación existente
        """
        notificacion = Notificacion.query.get(notificacion_id)
        if notificacion:
            notificacion.titulo = notificacion_data.get('titulo', notificacion.titulo)
            notificacion.mensaje = notificacion_data.get('mensaje', notificacion.mensaje)
            notificacion.tipo = notificacion_data.get('tipo', notificacion.tipo)
            notificacion.categoria = notificacion_data.get('categoria', notificacion.categoria)
            notificacion.prioridad = notificacion_data.get('prioridad', notificacion.prioridad)
            notificacion.creado_por = notificacion_data.get('creado_por', notificacion.creado_por)
            notificacion.estado = notificacion_data.get('estado', notificacion.estado)
            
            db.session.commit()
        return notificacion

    @staticmethod
    def delete(notificacion_id):
        """
        Eliminación lógica de una notificación (cambiar estado a False)
        """
        notificacion = Notificacion.query.get(notificacion_id)
        if notificacion:
            notificacion.estado = False
            db.session.commit()
        return notificacion