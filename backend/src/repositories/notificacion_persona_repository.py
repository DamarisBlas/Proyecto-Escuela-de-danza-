from src.models import NotificacionPersona
from src.app import db
from datetime import datetime

class NotificacionPersonaRepository:
    """
    Repositorio para operaciones de base de datos de NotificacionPersona
    """

    @staticmethod
    def get_all():
        """
        Obtiene todas las notificaciones de personas
        """
        return NotificacionPersona.query.all()

    @staticmethod
    def get_by_id(notificacion_persona_id):
        """
        Obtiene una notificación de persona por ID
        """
        return NotificacionPersona.query.get(notificacion_persona_id)

    @staticmethod
    def get_active():
        """
        Obtiene todas las notificaciones de personas activas
        """
        return NotificacionPersona.query.filter_by(estado=True).all()

    @staticmethod
    def get_by_persona(persona_id):
        """
        Obtiene todas las notificaciones de una persona específica
        """
        return NotificacionPersona.query.filter_by(Persona_id_persona=persona_id, estado=True).all()

    @staticmethod
    def get_by_notificacion(notificacion_id):
        """
        Obtiene todas las asignaciones de una notificación específica
        """
        return NotificacionPersona.query.filter_by(Notificacion_id_notificacion=notificacion_id, estado=True).all()

    @staticmethod
    def get_by_inscripcion(inscripcion_id):
        """
        Obtiene notificaciones relacionadas con una inscripción
        """
        return NotificacionPersona.query.filter_by(Inscricpcion_id_inscricpcion=inscripcion_id, estado=True).all()

    @staticmethod
    def get_leidas_by_persona(persona_id):
        """
        Obtiene notificaciones leídas por una persona
        """
        return NotificacionPersona.query.filter_by(Persona_id_persona=persona_id, leida=True, estado=True).all()

    @staticmethod
    def get_no_leidas_by_persona(persona_id):
        """
        Obtiene notificaciones no leídas por una persona
        """
        return NotificacionPersona.query.filter_by(Persona_id_persona=persona_id, leida=False, estado=True).all()

    @staticmethod
    def get_enviadas_whatsapp():
        """
        Obtiene notificaciones enviadas por WhatsApp
        """
        return NotificacionPersona.query.filter_by(enviada_whatsapp=True, estado=True).all()

    @staticmethod
    def get_enviadas_push():
        """
        Obtiene notificaciones enviadas por Push
        """
        return NotificacionPersona.query.filter_by(enviada_push=True, estado=True).all()

    @staticmethod
    def create(notificacion_persona_data):
        """
        Crea una nueva asignación de notificación a persona
        """
        nueva_notificacion_persona = NotificacionPersona(
            Notificacion_id_notificacion=notificacion_persona_data['Notificacion_id_notificacion'],
            Persona_id_persona=notificacion_persona_data['Persona_id_persona'],
            Inscricpcion_id_inscricpcion=notificacion_persona_data.get('Inscricpcion_id_inscricpcion'),
            leida=notificacion_persona_data.get('leida', False),
            fecha_leida=notificacion_persona_data.get('fecha_leida'),
            enviada_sistema=notificacion_persona_data.get('enviada_sistema', True),
            enviada_whatsapp=notificacion_persona_data.get('enviada_whatsapp', False),
            enviada_push=notificacion_persona_data.get('enviada_push', False),
            fecha_envio_push=notificacion_persona_data.get('fecha_envio_push'),
            fecha_envio_whatsapp=notificacion_persona_data.get('fecha_envio_whatsapp'),
            estado=notificacion_persona_data.get('estado', True)
        )
        
        db.session.add(nueva_notificacion_persona)
        db.session.commit()
        return nueva_notificacion_persona

    @staticmethod
    def create_bulk(notificaciones_personas_data):
        """
        Crea múltiples asignaciones de notificación a personas de forma masiva
        """
        notificaciones_personas = []
        for data in notificaciones_personas_data:
            notificacion_persona = NotificacionPersona(
                Notificacion_id_notificacion=data['Notificacion_id_notificacion'],
                Persona_id_persona=data['Persona_id_persona'],
                Inscricpcion_id_inscricpcion=data.get('Inscricpcion_id_inscricpcion'),
                leida=data.get('leida', False),
                enviada_sistema=data.get('enviada_sistema', True),
                enviada_whatsapp=data.get('enviada_whatsapp', False),
                enviada_push=data.get('enviada_push', False),
                estado=data.get('estado', True)
            )
            notificaciones_personas.append(notificacion_persona)
        
        db.session.add_all(notificaciones_personas)
        db.session.commit()
        return notificaciones_personas

    @staticmethod
    def update(notificacion_persona_id, notificacion_persona_data):
        """
        Actualiza una asignación de notificación a persona existente
        """
        notificacion_persona = NotificacionPersona.query.get(notificacion_persona_id)
        if notificacion_persona:
            notificacion_persona.leida = notificacion_persona_data.get('leida', notificacion_persona.leida)
            notificacion_persona.fecha_leida = notificacion_persona_data.get('fecha_leida', notificacion_persona.fecha_leida)
            notificacion_persona.enviada_sistema = notificacion_persona_data.get('enviada_sistema', notificacion_persona.enviada_sistema)
            notificacion_persona.enviada_whatsapp = notificacion_persona_data.get('enviada_whatsapp', notificacion_persona.enviada_whatsapp)
            notificacion_persona.enviada_push = notificacion_persona_data.get('enviada_push', notificacion_persona.enviada_push)
            notificacion_persona.fecha_envio_push = notificacion_persona_data.get('fecha_envio_push', notificacion_persona.fecha_envio_push)
            notificacion_persona.fecha_envio_whatsapp = notificacion_persona_data.get('fecha_envio_whatsapp', notificacion_persona.fecha_envio_whatsapp)
            notificacion_persona.estado = notificacion_persona_data.get('estado', notificacion_persona.estado)
            
            db.session.commit()
        return notificacion_persona

    @staticmethod
    def marcar_como_leida(notificacion_persona_id):
        """
        Marca una notificación como leída
        """
        notificacion_persona = NotificacionPersona.query.get(notificacion_persona_id)
        if notificacion_persona:
            notificacion_persona.leida = True
            notificacion_persona.fecha_leida = datetime.now()
            db.session.commit()
        return notificacion_persona

    @staticmethod
    def marcar_envio_whatsapp(notificacion_persona_id):
        """
        Marca una notificación como enviada por WhatsApp
        """
        notificacion_persona = NotificacionPersona.query.get(notificacion_persona_id)
        if notificacion_persona:
            notificacion_persona.enviada_whatsapp = True
            notificacion_persona.fecha_envio_whatsapp = datetime.now()
            db.session.commit()
        return notificacion_persona

    @staticmethod
    def marcar_envio_push(notificacion_persona_id):
        """
        Marca una notificación como enviada por Push
        """
        notificacion_persona = NotificacionPersona.query.get(notificacion_persona_id)
        if notificacion_persona:
            notificacion_persona.enviada_push = True
            notificacion_persona.fecha_envio_push = datetime.now()
            db.session.commit()
        return notificacion_persona

    @staticmethod
    def delete(notificacion_persona_id):
        """
        Eliminación lógica de una asignación de notificación (cambiar estado a False)
        """
        notificacion_persona = NotificacionPersona.query.get(notificacion_persona_id)
        if notificacion_persona:
            notificacion_persona.estado = False
            db.session.commit()
        return notificacion_persona