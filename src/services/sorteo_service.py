from src.repositories.sorteo_repository import SorteoRepository
from src.repositories.promocion_repository import PromocionRepository
from src.app import db
from datetime import datetime, date

class SorteoService:
    """
    Servicio para lógica de negocio de Sorteo
    """

    @staticmethod
    def get_all_sorteos():
        """
        Obtiene todos los sorteos
        """
        try:
            sorteos = SorteoRepository.get_all()
            return [sorteo.to_dict() for sorteo in sorteos], 200
        except Exception as e:
            return {"error": f"Error al obtener sorteos: {str(e)}"}, 500

    @staticmethod
    def get_sorteo_by_id(sorteo_id):
        """
        Obtiene un sorteo por ID
        """
        try:
            sorteo = SorteoRepository.get_by_id(sorteo_id)
            if not sorteo:
                return {"error": "Sorteo no encontrado"}, 404
            return sorteo.to_dict(), 200
        except Exception as e:
            return {"error": f"Error al obtener sorteo: {str(e)}"}, 500

    @staticmethod
    def get_active_sorteos():
        """
        Obtiene todos los sorteos activos
        """
        try:
            sorteos = SorteoRepository.get_active()
            return [sorteo.to_dict() for sorteo in sorteos], 200
        except Exception as e:
            return {"error": f"Error al obtener sorteos activos: {str(e)}"}, 500

    @staticmethod
    def get_sorteos_by_promocion(promocion_id):
        """
        Obtiene todos los sorteos de una promoción
        """
        try:
            sorteos = SorteoRepository.get_by_promocion(promocion_id)
            return [sorteo.to_dict() for sorteo in sorteos], 200
        except Exception as e:
            return {"error": f"Error al obtener sorteos de la promoción: {str(e)}"}, 500

    @staticmethod
    def get_sorteos_vigentes():
        """
        Obtiene sorteos vigentes (fecha actual <= fecha_sorteo)
        """
        try:
            sorteos = SorteoRepository.get_vigentes()
            return [sorteo.to_dict() for sorteo in sorteos], 200
        except Exception as e:
            return {"error": f"Error al obtener sorteos vigentes: {str(e)}"}, 500

    @staticmethod
    def get_ganadores_detalle(sorteo_id):
        """
        Obtiene información detallada de los ganadores de un sorteo
        Incluye nombre de persona, premio ganado y datos de inscripción actualizada
        """
        try:
            from src.repositories.ganador_repository import GanadorRepository
            from src.models.promocion import Promocion
            
            # Verificar que el sorteo existe
            sorteo = SorteoRepository.get_by_id(sorteo_id)
            if not sorteo:
                return {"error": "Sorteo no encontrado"}, 404
            
            # Obtener información de la promoción
            promocion = Promocion.query.get(sorteo.Promocion_id_promocion)
            
            # Obtener ganadores con información detallada (join con Persona y Premio)
            ganadores_detallados = GanadorRepository.get_ganadores_detallados_by_sorteo(sorteo_id)
            
            ganadores_info = []
            for ganador, persona, premio in ganadores_detallados:
                # Buscar la inscripción actualizada
                from src.repositories.inscripcion_repository import InscripcionRepository
                inscripciones = InscripcionRepository.get_by_promocion(sorteo.Promocion_id_promocion)
                inscripcion_persona = None
                for inscripcion in inscripciones:
                    if inscripcion.Persona_id_persona == persona.id_persona:
                        inscripcion_persona = inscripcion
                        break
                
                ganador_detalle = {
                    "id_ganador": ganador.id_ganador,
                    "nombre_completo": f"{persona.nombre} {persona.apellido_paterno or ''}".strip(),
                    "email": persona.email,
                    "celular": persona.celular,
                    "tipo_cuenta": persona.tipo_cuenta,
                    "premio": {
                        "id_premio": premio.id_premio,
                        "descuento": float(premio.descuento),
                        "descripcion": f"{float(premio.descuento)}% de descuento"
                    },
                    "inscripcion_actualizada": {
                        "id_inscripcion": inscripcion_persona.id_inscripcion if inscripcion_persona else None,
                        "precio_original": float(inscripcion_persona.precio_original) if inscripcion_persona else None,
                        "descuento_aplicado": float(inscripcion_persona.descuento_aplicado) if inscripcion_persona else None,
                        "precio_final": float(inscripcion_persona.precio_final) if inscripcion_persona else None
                    } if inscripcion_persona else None
                }
                ganadores_info.append(ganador_detalle)
            
            return {
                "sorteo": {
                    "id_sorteo": sorteo.id_sorteo,
                    "fecha_sorteo": sorteo.fecha_sorteo.isoformat() if sorteo.fecha_sorteo else None,
                    "promocion": promocion.nombre_promocion if promocion else None,
                    "Promocion_id_promocion": sorteo.Promocion_id_promocion
                },
                "total_ganadores": len(ganadores_info),
                "ganadores": ganadores_info
            }, 200
            
        except Exception as e:
            return {"error": f"Error al obtener ganadores detallados: {str(e)}"}, 500

    @staticmethod
    def get_all_ganadores_detalle():
        """
        Obtiene información detallada de TODOS los ganadores de TODOS los sorteos
        Incluye nombre de persona, premio ganado y datos de inscripción actualizada
        """
        try:
            from src.repositories.ganador_repository import GanadorRepository
            from src.models.promocion import Promocion
            from src.models.sorteo import Sorteo
            
            # Obtener todos los sorteos
            todos_sorteos = SorteoRepository.get_all()
            
            resultado_completo = []
            
            for sorteo in todos_sorteos:
                # Obtener información de la promoción
                promocion = Promocion.query.get(sorteo.Promocion_id_promocion)
                
                # Obtener ganadores con información detallada (join con Persona y Premio)
                ganadores_detallados = GanadorRepository.get_ganadores_detallados_by_sorteo(sorteo.id_sorteo)
                
                ganadores_info = []
                for ganador, persona, premio in ganadores_detallados:
                    # Buscar la inscripción actualizada
                    from src.repositories.inscripcion_repository import InscripcionRepository
                    inscripciones = InscripcionRepository.get_by_promocion(sorteo.Promocion_id_promocion)
                    inscripcion_persona = None
                    for inscripcion in inscripciones:
                        if inscripcion.Persona_id_persona == persona.id_persona:
                            inscripcion_persona = inscripcion
                            break
                    
                    ganador_detalle = {
                        "id_ganador": ganador.id_ganador,
                        "nombre_completo": f"{persona.nombre} {persona.apellido_paterno or ''}".strip(),
                        "email": persona.email,
                        "celular": persona.celular,
                        "tipo_cuenta": persona.tipo_cuenta,
                        "premio": {
                            "id_premio": premio.id_premio,
                            "descuento": float(premio.descuento),
                            "descripcion": f"{float(premio.descuento)}% de descuento"
                        },
                        "inscripcion_actualizada": {
                            "id_inscripcion": inscripcion_persona.id_inscripcion if inscripcion_persona else None,
                            "precio_original": float(inscripcion_persona.precio_original) if inscripcion_persona else None,
                            "descuento_aplicado": float(inscripcion_persona.descuento_aplicado) if inscripcion_persona else None,
                            "precio_final": float(inscripcion_persona.precio_final) if inscripcion_persona else None
                        } if inscripcion_persona else None
                    }
                    ganadores_info.append(ganador_detalle)
                
                # Solo agregar sorteos que tengan ganadores
                if ganadores_info:
                    sorteo_con_ganadores = {
                        "sorteo": {
                            "id_sorteo": sorteo.id_sorteo,
                            "fecha_sorteo": sorteo.fecha_sorteo.isoformat() if sorteo.fecha_sorteo else None,
                            "promocion": promocion.nombre_promocion if promocion else None,
                            "Promocion_id_promocion": sorteo.Promocion_id_promocion
                        },
                        "total_ganadores": len(ganadores_info),
                        "ganadores": ganadores_info
                    }
                    resultado_completo.append(sorteo_con_ganadores)
            
            return {
                "total_sorteos": len(resultado_completo),
                "sorteos": resultado_completo
            }, 200
            
        except Exception as e:
            return {"error": f"Error al obtener todos los ganadores: {str(e)}"}, 500

    @staticmethod
    def create_sorteo(sorteo_data):
        """
        Crea un nuevo sorteo
        La fecha del sorteo es la fecha actual (cuando se realiza el sorteo)
        El estado siempre es True al crear
        """
        try:
            # Validaciones
            required_fields = ['Promocion_id_promocion']
            if not all(field in sorteo_data for field in required_fields):
                return {"error": "Promocion_id_promocion es requerido"}, 400

            # Verificar que la promoción existe
            promocion = PromocionRepository.get_by_id(sorteo_data['Promocion_id_promocion'])
            if not promocion:
                return {"error": "Promoción no encontrada"}, 404

            # Verificar que la promoción tiene sorteo habilitado
            if not promocion.tiene_sorteo:
                return {"error": "La promoción no tiene sorteo habilitado"}, 400

            # Generar fecha del sorteo (fecha actual)
            fecha_sorteo_actual = date.today()

            # Establecer valores automáticos
            sorteo_data['fecha_sorteo'] = fecha_sorteo_actual
            sorteo_data['estado'] = True

            sorteo = SorteoRepository.create(sorteo_data)
            db.session.commit()
            
            return {
                "message": "Sorteo creado exitosamente",
                "sorteo": sorteo.to_dict()
            }, 201

        except Exception as e:
            db.session.rollback()
            return {"error": f"Error al crear sorteo: {str(e)}"}, 500

    @staticmethod
    def update_sorteo(sorteo_id, sorteo_data):
        """
        Actualiza un sorteo existente
        """
        try:
            # Verificar que el sorteo existe
            existing_sorteo = SorteoRepository.get_by_id(sorteo_id)
            if not existing_sorteo:
                return {"error": "Sorteo no encontrado"}, 404

            # Validar fecha si se proporciona
            if 'fecha_sorteo' in sorteo_data:
                try:
                    fecha_sorteo = datetime.strptime(sorteo_data['fecha_sorteo'], '%Y-%m-%d').date()
                except ValueError:
                    return {"error": "Formato de fecha inválido. Use YYYY-MM-DD"}, 400

                # Verificar que la fecha esté dentro del rango de la promoción
                promocion = PromocionRepository.get_by_id(existing_sorteo.Promocion_id_promocion)
                if promocion and (fecha_sorteo < promocion.fecha_inicio or fecha_sorteo > promocion.fecha_fin):
                    return {"error": "La fecha del sorteo debe estar dentro del rango de la promoción"}, 400

            sorteo = SorteoRepository.update(sorteo_id, sorteo_data)
            return {
                "message": "Sorteo actualizado exitosamente",
                "sorteo": sorteo.to_dict()
            }, 200

        except Exception as e:
            return {"error": f"Error al actualizar sorteo: {str(e)}"}, 500

    @staticmethod
    def delete_sorteo(sorteo_id):
        """
        Elimina un sorteo (borrado lógico)
        """
        try:
            sorteo = SorteoRepository.get_by_id(sorteo_id)
            if not sorteo:
                return {"error": "Sorteo no encontrado"}, 404

            SorteoRepository.delete(sorteo_id)
            return {"message": "Sorteo eliminado exitosamente"}, 200

        except Exception as e:
            return {"error": f"Error al eliminar sorteo: {str(e)}"}, 500