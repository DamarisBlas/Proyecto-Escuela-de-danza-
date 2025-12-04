from src.repositories.notificacion_repository import NotificacionRepository
from datetime import date

class NotificacionService:
    """
    Servicio para lógica de negocio de Notificación
    """

    @staticmethod
    def get_all_notificaciones():
        """
        Obtiene todas las notificaciones
        """
        try:
            notificaciones = NotificacionRepository.get_all()
            return [notificacion.to_dict() for notificacion in notificaciones], 200
        except Exception as e:
            return {"error": f"Error al obtener notificaciones: {str(e)}"}, 500

    @staticmethod
    def get_notificacion_by_id(notificacion_id):
        """
        Obtiene una notificación por ID
        """
        try:
            notificacion = NotificacionRepository.get_by_id(notificacion_id)
            if not notificacion:
                return {"error": "Notificación no encontrada"}, 404
            return notificacion.to_dict(), 200
        except Exception as e:
            return {"error": f"Error al obtener notificación: {str(e)}"}, 500

    @staticmethod
    def get_active_notificaciones():
        """
        Obtiene todas las notificaciones activas
        """
        try:
            notificaciones = NotificacionRepository.get_active()
            return [notificacion.to_dict() for notificacion in notificaciones], 200
        except Exception as e:
            return {"error": f"Error al obtener notificaciones activas: {str(e)}"}, 500

    @staticmethod
    def get_notificaciones_by_tipo(tipo):
        """
        Obtiene notificaciones por tipo
        """
        try:
            notificaciones = NotificacionRepository.get_by_tipo(tipo)
            return [notificacion.to_dict() for notificacion in notificaciones], 200
        except Exception as e:
            return {"error": f"Error al obtener notificaciones por tipo: {str(e)}"}, 500

    @staticmethod
    def get_notificaciones_by_categoria(categoria):
        """
        Obtiene notificaciones por categoría
        """
        try:
            notificaciones = NotificacionRepository.get_by_categoria(categoria)
            return [notificacion.to_dict() for notificacion in notificaciones], 200
        except Exception as e:
            return {"error": f"Error al obtener notificaciones por categoría: {str(e)}"}, 500

    @staticmethod
    def get_notificaciones_by_prioridad(prioridad):
        """
        Obtiene notificaciones por prioridad
        """
        try:
            notificaciones = NotificacionRepository.get_by_prioridad(prioridad)
            return [notificacion.to_dict() for notificacion in notificaciones], 200
        except Exception as e:
            return {"error": f"Error al obtener notificaciones por prioridad: {str(e)}"}, 500

    @staticmethod
    def get_notificaciones_by_creador(creado_por):
        """
        Obtiene notificaciones por creador
        """
        try:
            notificaciones = NotificacionRepository.get_by_creador(creado_por)
            return [notificacion.to_dict() for notificacion in notificaciones], 200
        except Exception as e:
            return {"error": f"Error al obtener notificaciones por creador: {str(e)}"}, 500

    @staticmethod
    def get_notificaciones_by_fecha(fecha_creacion):
        """
        Obtiene notificaciones por fecha de creación
        """
        try:
            notificaciones = NotificacionRepository.get_by_fecha_creacion(fecha_creacion)
            return [notificacion.to_dict() for notificacion in notificaciones], 200
        except Exception as e:
            return {"error": f"Error al obtener notificaciones por fecha: {str(e)}"}, 500

    @staticmethod
    def create_notificacion(notificacion_data):
        """
        Crea una nueva notificación
        """
        try:
            # Validar campos requeridos
            required_fields = ['titulo', 'mensaje', 'tipo', 'categoria', 'prioridad', 'fecha_creacion']
            if not all(field in notificacion_data for field in required_fields):
                return {"error": "Faltan campos requeridos"}, 400

            # Validar tipos de datos
            if len(notificacion_data['titulo']) > 100:
                return {"error": "El título no puede exceder los 100 caracteres"}, 400
            if len(notificacion_data['mensaje']) > 600:
                return {"error": "El mensaje no puede exceder los 600 caracteres"}, 400
            
            # Validar valores permitidos
           
            tipos_validos = ['INFORMACION',
                              'AVISO',
                              'PELIGRO',
                              'EXITO'
                              ]
            if notificacion_data['tipo'] not in tipos_validos:
                return {"error": f"Tipo debe ser uno de: {tipos_validos}"}, 400
            
            categorias_validas = ['INSCRIPCION', 'PAGO',
                                  'ASISTENCIA', 'GENERAL', 
                                  'PROMOCION', 'SORTEO',
                                  'CLASE_CANCELADA', 'RECORDATORIO']
            if notificacion_data['categoria'] not in categorias_validas:
                return {"error": f"Categoría debe ser una de: {categorias_validas}"}, 400
            
            prioridades_validas = ['BAJA', 'MEDIA', 'ALTA']
            if notificacion_data['prioridad'] not in prioridades_validas:
                return {"error": f"Prioridad debe ser una de: {prioridades_validas}"}, 400

            # Convertir fecha si es string
            if isinstance(notificacion_data['fecha_creacion'], str):
                from datetime import datetime
                notificacion_data['fecha_creacion'] = datetime.strptime(notificacion_data['fecha_creacion'], '%Y-%m-%d').date()

            notificacion = NotificacionRepository.create(notificacion_data)
            return {"message": "Notificación creada exitosamente", "notificacion": notificacion.to_dict()}, 201

        except Exception as e:
            return {"error": f"Error al crear notificación: {str(e)}"}, 500

    @staticmethod
    def update_notificacion(notificacion_id, notificacion_data):
        """
        Actualiza una notificación existente
        """
        try:
            # Verificar que la notificación existe
            existing_notificacion = NotificacionRepository.get_by_id(notificacion_id)
            if not existing_notificacion:
                return {"error": "Notificación no encontrada"}, 404

            # Validar tipos de datos si se proporcionan
            if 'titulo' in notificacion_data and len(notificacion_data['titulo']) > 100:
                return {"error": "El título no puede exceder los 100 caracteres"}, 400
            if 'mensaje' in notificacion_data and len(notificacion_data['mensaje']) > 600:
                return {"error": "El mensaje no puede exceder los 600 caracteres"}, 400

            # Validar valores permitidos si se proporcionan
            if 'tipo' in notificacion_data:
                tipos_validos = ['INFORMATIVA', 'RECORDATORIO', 'URGENTE', 'PROMOCIONAL']
                if notificacion_data['tipo'] not in tipos_validos:
                    return {"error": f"Tipo debe ser uno de: {tipos_validos}"}, 400
            
            if 'categoria' in notificacion_data:
                categorias_validas = ['INSCRIPCION', 'PAGO', 'CLASE', 'GENERAL', 'PROMOCION']
                if notificacion_data['categoria'] not in categorias_validas:
                    return {"error": f"Categoría debe ser una de: {categorias_validas}"}, 400
            
            if 'prioridad' in notificacion_data:
                prioridades_validas = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA']
                if notificacion_data['prioridad'] not in prioridades_validas:
                    return {"error": f"Prioridad debe ser una de: {prioridades_validas}"}, 400

            notificacion = NotificacionRepository.update(notificacion_id, notificacion_data)
            return {"message": "Notificación actualizada exitosamente", "notificacion": notificacion.to_dict()}, 200

        except Exception as e:
            return {"error": f"Error al actualizar notificación: {str(e)}"}, 500

    @staticmethod
    def delete_notificacion(notificacion_id):
        """
        Elimina una notificación (eliminación lógica)
        """
        try:
            notificacion = NotificacionRepository.delete(notificacion_id)
            if not notificacion:
                return {"error": "Notificación no encontrada"}, 404
            return {"message": "Notificación eliminada exitosamente"}, 200
        except Exception as e:
            return {"error": f"Error al eliminar notificación: {str(e)}"}, 500