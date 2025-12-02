from src.repositories.notificacion_persona_repository import NotificacionPersonaRepository
from src.repositories.notificacion_repository import NotificacionRepository
from src.repositories.persona_repository import PersonaRepository
from datetime import datetime

class NotificacionPersonaService:
    """
    Servicio para lógica de negocio de NotificacionPersona
    """

    @staticmethod
    def get_all_notificaciones_personas():
        """
        Obtiene todas las asignaciones de notificaciones a personas
        """
        try:
            notificaciones_personas = NotificacionPersonaRepository.get_all()
            return [np.to_dict() for np in notificaciones_personas], 200
        except Exception as e:
            return {"error": f"Error al obtener notificaciones de personas: {str(e)}"}, 500

    @staticmethod
    def get_notificacion_persona_by_id(notificacion_persona_id):
        """
        Obtiene una asignación de notificación por ID
        """
        try:
            notificacion_persona = NotificacionPersonaRepository.get_by_id(notificacion_persona_id)
            if not notificacion_persona:
                return {"error": "Asignación de notificación no encontrada"}, 404
            return notificacion_persona.to_dict(), 200
        except Exception as e:
            return {"error": f"Error al obtener asignación de notificación: {str(e)}"}, 500

    @staticmethod
    def get_active_notificaciones_personas():
        """
        Obtiene todas las asignaciones activas
        """
        try:
            notificaciones_personas = NotificacionPersonaRepository.get_active()
            return [np.to_dict() for np in notificaciones_personas], 200
        except Exception as e:
            return {"error": f"Error al obtener asignaciones activas: {str(e)}"}, 500

    @staticmethod
    def get_notificaciones_by_persona(persona_id):
        """
        Obtiene todas las notificaciones de una persona específica
        """
        try:
            notificaciones_personas = NotificacionPersonaRepository.get_by_persona(persona_id)
            return [np.to_dict() for np in notificaciones_personas], 200
        except Exception as e:
            return {"error": f"Error al obtener notificaciones de la persona: {str(e)}"}, 500

    @staticmethod
    def get_notificaciones_no_leidas_by_persona(persona_id):
        """
        Obtiene notificaciones no leídas de una persona
        """
        try:
            notificaciones_personas = NotificacionPersonaRepository.get_no_leidas_by_persona(persona_id)
            return {
                "total_no_leidas": len(notificaciones_personas),
                "notificaciones": [np.to_dict() for np in notificaciones_personas]
            }, 200
        except Exception as e:
            return {"error": f"Error al obtener notificaciones no leídas: {str(e)}"}, 500

    @staticmethod
    def get_notificaciones_leidas_by_persona(persona_id):
        """
        Obtiene notificaciones leídas de una persona
        """
        try:
            notificaciones_personas = NotificacionPersonaRepository.get_leidas_by_persona(persona_id)
            return [np.to_dict() for np in notificaciones_personas], 200
        except Exception as e:
            return {"error": f"Error al obtener notificaciones leídas: {str(e)}"}, 500

    @staticmethod
    def get_notificaciones_by_inscripcion(inscripcion_id):
        """
        Obtiene notificaciones relacionadas con una inscripción
        """
        try:
            notificaciones_personas = NotificacionPersonaRepository.get_by_inscripcion(inscripcion_id)
            return [np.to_dict() for np in notificaciones_personas], 200
        except Exception as e:
            return {"error": f"Error al obtener notificaciones de la inscripción: {str(e)}"}, 500

    @staticmethod
    def create_notificacion_persona(notificacion_persona_data):
        """
        Crea una nueva asignación de notificación a persona
        """
        try:
            # Validar campos requeridos
            required_fields = ['Notificacion_id_notificacion', 'Persona_id_persona']
            if not all(field in notificacion_persona_data for field in required_fields):
                return {"error": "Faltan campos requeridos"}, 400

            # Verificar que la notificación existe
            notificacion = NotificacionRepository.get_by_id(notificacion_persona_data['Notificacion_id_notificacion'])
            if not notificacion:
                return {"error": "Notificación no encontrada"}, 404

            # Verificar que la persona existe
            from src.repositories.persona_repository import PersonaRepository
            persona = PersonaRepository.get_by_id(notificacion_persona_data['Persona_id_persona'])
            if not persona:
                return {"error": "Persona no encontrada"}, 404

            # Verificar que la inscripción existe si se proporciona
            if notificacion_persona_data.get('Inscricpcion_id_inscricpcion'):
                from src.repositories.inscripcion_repository import InscripcionRepository
                inscripcion = InscripcionRepository.get_by_id(notificacion_persona_data['Inscricpcion_id_inscricpcion'])
                if not inscripcion:
                    return {"error": "Inscripción no encontrada"}, 404

            notificacion_persona = NotificacionPersonaRepository.create(notificacion_persona_data)
            return {
                "message": "Asignación de notificación creada exitosamente", 
                "notificacion_persona": notificacion_persona.to_dict()
            }, 201

        except Exception as e:
            return {"error": f"Error al crear asignación de notificación: {str(e)}"}, 500

    @staticmethod
    def create_notificacion_masiva(notificacion_data, personas_ids, inscripcion_id=None):
        """
        Crea una notificación y la asigna a múltiples personas
        """
        try:
            from src.services.notificacion_service import NotificacionService
            
            # Crear la notificación principal
            result, status_code = NotificacionService.create_notificacion(notificacion_data)
            if status_code != 201:
                return result, status_code
            
            notificacion = result['notificacion']
            
            # Preparar datos para asignaciones masivas
            notificaciones_personas_data = []
            for persona_id in personas_ids:
                np_data = {
                    'Notificacion_id_notificacion': notificacion['id_notificacion'],
                    'Persona_id_persona': persona_id,
                    'Inscricpcion_id_inscricpcion': inscripcion_id
                }
                notificaciones_personas_data.append(np_data)
            
            # Crear asignaciones masivas
            notificaciones_personas = NotificacionPersonaRepository.create_bulk(notificaciones_personas_data)
            
            return {
                "message": f"Notificación creada y enviada a {len(personas_ids)} personas",
                "notificacion": notificacion,
                "total_asignaciones": len(notificaciones_personas),
                "asignaciones": [np.to_dict() for np in notificaciones_personas]
            }, 201

        except Exception as e:
            return {"error": f"Error al crear notificación masiva: {str(e)}"}, 500

    @staticmethod
    def marcar_como_leida(notificacion_persona_id):
        """
        Marca una notificación como leída
        """
        try:
            notificacion_persona = NotificacionPersonaRepository.marcar_como_leida(notificacion_persona_id)
            if not notificacion_persona:
                return {"error": "Asignación de notificación no encontrada"}, 404
            return {
                "message": "Notificación marcada como leída",
                "notificacion_persona": notificacion_persona.to_dict()
            }, 200
        except Exception as e:
            return {"error": f"Error al marcar como leída: {str(e)}"}, 500

    @staticmethod
    def marcar_envio_whatsapp(notificacion_persona_id):
        """
        Marca una notificación como enviada por WhatsApp
        """
        try:
            notificacion_persona = NotificacionPersonaRepository.marcar_envio_whatsapp(notificacion_persona_id)
            if not notificacion_persona:
                return {"error": "Asignación de notificación no encontrada"}, 404
            return {
                "message": "Envío por WhatsApp registrado",
                "notificacion_persona": notificacion_persona.to_dict()
            }, 200
        except Exception as e:
            return {"error": f"Error al marcar envío WhatsApp: {str(e)}"}, 500

    @staticmethod
    def marcar_envio_push(notificacion_persona_id):
        """
        Marca una notificación como enviada por Push
        """
        try:
            notificacion_persona = NotificacionPersonaRepository.marcar_envio_push(notificacion_persona_id)
            if not notificacion_persona:
                return {"error": "Asignación de notificación no encontrada"}, 404
            return {
                "message": "Envío por Push registrado",
                "notificacion_persona": notificacion_persona.to_dict()
            }, 200
        except Exception as e:
            return {"error": f"Error al marcar envío Push: {str(e)}"}, 500

    @staticmethod
    def update_notificacion_persona(notificacion_persona_id, notificacion_persona_data):
        """
        Actualiza una asignación de notificación
        """
        try:
            # Verificar que la asignación existe
            existing_np = NotificacionPersonaRepository.get_by_id(notificacion_persona_id)
            if not existing_np:
                return {"error": "Asignación de notificación no encontrada"}, 404

            notificacion_persona = NotificacionPersonaRepository.update(notificacion_persona_id, notificacion_persona_data)
            return {
                "message": "Asignación actualizada exitosamente",
                "notificacion_persona": notificacion_persona.to_dict()
            }, 200

        except Exception as e:
            return {"error": f"Error al actualizar asignación: {str(e)}"}, 500

    @staticmethod
    def delete_notificacion_persona(notificacion_persona_id):
        """
        Elimina una asignación de notificación (eliminación lógica)
        """
        try:
            notificacion_persona = NotificacionPersonaRepository.delete(notificacion_persona_id)
            if not notificacion_persona:
                return {"error": "Asignación de notificación no encontrada"}, 404
            return {"message": "Asignación eliminada exitosamente"}, 200
        except Exception as e:
            return {"error": f"Error al eliminar asignación: {str(e)}"}, 500

    @staticmethod
    def get_estadisticas_persona(persona_id):
        """
        Obtiene estadísticas de notificaciones para una persona
        """
        try:
            todas = NotificacionPersonaRepository.get_by_persona(persona_id)
            leidas = NotificacionPersonaRepository.get_leidas_by_persona(persona_id)
            no_leidas = NotificacionPersonaRepository.get_no_leidas_by_persona(persona_id)
            
            return {
                "total_notificaciones": len(todas),
                "leidas": len(leidas),
                "no_leidas": len(no_leidas),
                "porcentaje_leidas": round((len(leidas) / len(todas) * 100) if len(todas) > 0 else 0, 2)
            }, 200
        except Exception as e:
            return {"error": f"Error al obtener estadísticas: {str(e)}"}, 500