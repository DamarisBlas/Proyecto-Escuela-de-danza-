from src.repositories.ganador_repository import GanadorRepository
from src.repositories.sorteo_repository import SorteoRepository
from src.repositories.persona_repository import PersonaRepository
from src.repositories.premio_repository import PremioRepository
from src.repositories.inscripcion_repository import InscripcionRepository
from src.app import db
from datetime import datetime, date
from decimal import Decimal

class GanadorService:
    """
    Servicio para lógica de negocio de Ganador
    """

    @staticmethod
    def get_all_ganadores():
        """
        Obtiene todos los ganadores
        """
        try:
            ganadores = GanadorRepository.get_all()
            return [ganador.to_dict() for ganador in ganadores], 200
        except Exception as e:
            return {"error": f"Error al obtener ganadores: {str(e)}"}, 500

    @staticmethod
    def get_ganador_by_id(ganador_id):
        """
        Obtiene un ganador por ID
        """
        try:
            ganador = GanadorRepository.get_by_id(ganador_id)
            if not ganador:
                return {"error": "Ganador no encontrado"}, 404
            return ganador.to_dict(), 200
        except Exception as e:
            return {"error": f"Error al obtener ganador: {str(e)}"}, 500

    @staticmethod
    def get_active_ganadores():
        """
        Obtiene todos los ganadores activos
        """
        try:
            ganadores = GanadorRepository.get_active()
            return [ganador.to_dict() for ganador in ganadores], 200
        except Exception as e:
            return {"error": f"Error al obtener ganadores activos: {str(e)}"}, 500

    @staticmethod
    def get_ganadores_by_sorteo(sorteo_id):
        """
        Obtiene todos los ganadores de un sorteo
        """
        try:
            ganadores = GanadorRepository.get_by_sorteo(sorteo_id)
            return [ganador.to_dict() for ganador in ganadores], 200
        except Exception as e:
            return {"error": f"Error al obtener ganadores del sorteo: {str(e)}"}, 500

    @staticmethod
    def get_ganadores_by_persona(persona_id):
        """
        Obtiene todos los ganadores de una persona
        """
        try:
            ganadores = GanadorRepository.get_by_persona(persona_id)
            return [ganador.to_dict() for ganador in ganadores], 200
        except Exception as e:
            return {"error": f"Error al obtener ganadores de la persona: {str(e)}"}, 500

    @staticmethod
    def create_ganador(ganador_data):
        """
        Crea un nuevo ganador
        La fecha se toma automáticamente del sorteo
        El estado siempre es True al crear
        """
        try:
            # Validaciones
            required_fields = ['Persona_id_persona', 'Sorteo_id_sorteo', 'Premios_id_premio']
            if not all(field in ganador_data for field in required_fields):
                return {"error": "Persona_id_persona, Sorteo_id_sorteo y Premios_id_premio son requeridos"}, 400

            # Verificar que la persona existe
            persona = PersonaRepository.get_by_id(ganador_data['Persona_id_persona'])
            if not persona:
                return {"error": "Persona no encontrada"}, 404

            # Verificar que el sorteo existe
            sorteo = SorteoRepository.get_by_id(ganador_data['Sorteo_id_sorteo'])
            if not sorteo:
                return {"error": "Sorteo no encontrado"}, 404

            # Verificar que el sorteo está activo
            if not sorteo.estado:
                return {"error": "El sorteo no está activo"}, 400

            # Verificar que el premio existe
            premio = PremioRepository.get_by_id(ganador_data['Premios_id_premio'])
            if not premio:
                return {"error": "Premio no encontrado"}, 404

            # Verificar que el premio pertenece a la promoción del sorteo
            if premio.Promocion_id_promocion != sorteo.Promocion_id_promocion:
                return {"error": "El premio no pertenece a la promoción del sorteo"}, 400

            # Establecer fecha automáticamente desde el sorteo
            ganador_data['fecha'] = sorteo.fecha_sorteo
            
            # Establecer estado automáticamente
            ganador_data['estado'] = True

            # Verificar que la persona esté inscrita en la promoción del sorteo
            inscripciones = InscripcionRepository.get_by_promocion(sorteo.Promocion_id_promocion)
            inscripcion_persona = None
            for inscripcion in inscripciones:
                if inscripcion.Persona_id_persona == ganador_data['Persona_id_persona']:
                    inscripcion_persona = inscripcion
                    break
            
            if not inscripcion_persona:
                return {"error": "La persona no está inscrita en la promoción del sorteo"}, 400

            # Crear el ganador
            ganador = GanadorRepository.create(ganador_data)
            db.session.flush()

            # Actualizar la inscripción con el descuento del premio ganado
            descuento_premio = float(premio.descuento)
            precio_original = float(inscripcion_persona.precio_original)
            
            # Calcular el nuevo descuento total y precio final
            nuevo_descuento_aplicado = Decimal(str(descuento_premio))
            nuevo_precio_final = Decimal(str(precio_original)) * (Decimal('1') - (nuevo_descuento_aplicado / Decimal('100')))
            
            # Actualizar la inscripción
            inscripcion_update_data = {
                'descuento_aplicado': nuevo_descuento_aplicado,
                'precio_final': nuevo_precio_final
            }
            
            InscripcionRepository.update(inscripcion_persona.id_inscripcion, inscripcion_update_data)
            
            # Commit de todas las transacciones
            db.session.commit()

            return {
                "message": "Ganador creado exitosamente y descuento aplicado a la inscripción",
                "ganador": ganador.to_dict(),
                "inscripcion_actualizada": {
                    "id_inscripcion": inscripcion_persona.id_inscripcion,
                    "descuento_aplicado": float(nuevo_descuento_aplicado),
                    "precio_final": float(nuevo_precio_final)
                }
            }, 201

        except Exception as e:
            db.session.rollback()
            return {"error": f"Error al crear ganador: {str(e)}"}, 500

    @staticmethod
    def update_ganador(ganador_id, ganador_data):
        """
        Actualiza un ganador existente
        """
        try:
            # Verificar que el ganador existe
            existing_ganador = GanadorRepository.get_by_id(ganador_id)
            if not existing_ganador:
                return {"error": "Ganador no encontrado"}, 404

            # Validar fecha si se proporciona
            if 'fecha' in ganador_data:
                try:
                    fecha_ganador = datetime.strptime(ganador_data['fecha'], '%Y-%m-%d').date()
                except ValueError:
                    return {"error": "Formato de fecha inválido. Use YYYY-MM-DD"}, 400

                # Verificar que coincida con la fecha del sorteo
                sorteo = SorteoRepository.get_by_id(existing_ganador.Sorteo_id_sorteo)
                if sorteo and fecha_ganador != sorteo.fecha_sorteo:
                    return {"error": "La fecha del ganador debe coincidir con la fecha del sorteo"}, 400

            ganador = GanadorRepository.update(ganador_id, ganador_data)
            return {
                "message": "Ganador actualizado exitosamente",
                "ganador": ganador.to_dict()
            }, 200

        except Exception as e:
            return {"error": f"Error al actualizar ganador: {str(e)}"}, 500

    @staticmethod
    def delete_ganador(ganador_id):
        """
        Elimina un ganador (borrado lógico)
        """
        try:
            ganador = GanadorRepository.get_by_id(ganador_id)
            if not ganador:
                return {"error": "Ganador no encontrado"}, 404

            GanadorRepository.delete(ganador_id)
            return {"message": "Ganador eliminado exitosamente"}, 200

        except Exception as e:
            return {"error": f"Error al eliminar ganador: {str(e)}"}, 500