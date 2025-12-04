from datetime import datetime
from src.repositories.asistencia_repository import AsistenciaRepository
from src.repositories.inscripcion_repository import InscripcionRepository
from src.repositories.horario_sesion_repository import HorarioSesionRepository
from src.app import db


class AsistenciaService:
    
    @staticmethod
    def get_all_asistencias():
        """
        Obtiene todas las asistencias
        """
        try:
            asistencias = AsistenciaRepository.get_all()
            return [asistencia.to_dict() for asistencia in asistencias], 200
        except Exception as e:
            return {"error": f"Error al obtener asistencias: {str(e)}"}, 500

    @staticmethod
    def get_asistencias_activas():
        """
        Obtiene solo las asistencias activas (estado = True)
        """
        try:
            asistencias = AsistenciaRepository.get_all()
            asistencias_activas = [asistencia.to_dict() for asistencia in asistencias if asistencia.estado]
            return asistencias_activas, 200
        except Exception as e:
            return {"error": f"Error al obtener asistencias activas: {str(e)}"}, 500

    @staticmethod
    def get_asistencia_by_id(asistencia_id):
        """
        Obtiene una asistencia por su ID
        """
        try:
            asistencia = AsistenciaRepository.get_by_id(asistencia_id)
            if not asistencia:
                return {"error": "Asistencia no encontrada"}, 404
            return asistencia.to_dict(), 200
        except Exception as e:
            return {"error": f"Error al obtener la asistencia: {str(e)}"}, 500

    @staticmethod
    def get_asistencias_by_inscripcion(inscripcion_id):
        """
        Obtiene todas las asistencias de una inscripción específica
        """
        try:
            # Verificar que la inscripción existe
            inscripcion = InscripcionRepository.get_by_id(inscripcion_id)
            if not inscripcion:
                return {"error": "Inscripción no encontrada"}, 404

            asistencias = AsistenciaRepository.get_all()
            asistencias_inscripcion = [
                asistencia.to_dict() for asistencia in asistencias 
                if asistencia.Inscripcion_id_inscripcion == inscripcion_id
            ]
            
            return {
                "inscripcion_id": inscripcion_id,
                "total_asistencias": len(asistencias_inscripcion),
                "asistencias": asistencias_inscripcion
            }, 200
        except Exception as e:
            return {"error": f"Error al obtener asistencias de la inscripción: {str(e)}"}, 500

    @staticmethod
    def get_asistencias_by_sesion(sesion_id):
        """
        Obtiene todas las asistencias de una sesión específica
        """
        try:
            # Verificar que la sesión existe
            sesion = HorarioSesionRepository.get_by_id(sesion_id)
            if not sesion:
                return {"error": "Sesión no encontrada"}, 404

            asistencias = AsistenciaRepository.get_all()
            asistencias_sesion = [
                asistencia.to_dict() for asistencia in asistencias 
                if asistencia.Horario_sesion_id_horario_sesion == sesion_id
            ]
            
            return {
                "sesion_id": sesion_id,
                "total_asistencias": len(asistencias_sesion),
                "asistencias": asistencias_sesion
            }, 200
        except Exception as e:
            return {"error": f"Error al obtener asistencias de la sesión: {str(e)}"}, 500

    @staticmethod
    def create_asistencia(asistencia_data):
        """
        Crea una nueva asistencia
        
        Esperado en asistencia_data:
        - Inscripcion_id_inscripcion (required)
        - Horario_sesion_id_horario_sesion (required)
        - asistio (optional, nullable)
        - fecha (optional, nullable)
        - estado (optional, default True)
        """
        try:
            # Validar campos requeridos
            required_fields = ['Inscripcion_id_inscripcion', 'Horario_sesion_id_horario_sesion']
            for field in required_fields:
                if field not in asistencia_data or asistencia_data[field] is None:
                    return {"error": f"Campo requerido faltante: {field}"}, 400

            # Verificar que la inscripción existe
            inscripcion = InscripcionRepository.get_by_id(asistencia_data['Inscripcion_id_inscripcion'])
            if not inscripcion:
                return {"error": "Inscripción no encontrada"}, 404

            # Verificar que la sesión existe
            sesion = HorarioSesionRepository.get_by_id(asistencia_data['Horario_sesion_id_horario_sesion'])
            if not sesion:
                return {"error": "Sesión no encontrada"}, 404

            # Verificar que no existe ya una asistencia para esta inscripción y sesión
            asistencias_existentes = AsistenciaRepository.get_all()
            for asistencia in asistencias_existentes:
                if (asistencia.Inscripcion_id_inscripcion == asistencia_data['Inscripcion_id_inscripcion'] and
                    asistencia.Horario_sesion_id_horario_sesion == asistencia_data['Horario_sesion_id_horario_sesion']):
                    return {"error": "Ya existe una asistencia para esta inscripción y sesión"}, 409

            # Valores por defecto
            asistencia_data.setdefault('estado', True)
            asistencia_data.setdefault('asistio', None)
            asistencia_data.setdefault('fecha', None)

            # Crear la asistencia
            asistencia = AsistenciaRepository.create(asistencia_data)
            db.session.commit()
            
            return {
                "message": "Asistencia creada exitosamente",
                "asistencia": asistencia.to_dict()
            }, 201

        except Exception as e:
            return {"error": f"Error al crear la asistencia: {str(e)}"}, 500

    @staticmethod
    def update_asistencia(asistencia_id, asistencia_data):
        """
        Actualiza una asistencia existente
        """
        try:
            asistencia = AsistenciaRepository.get_by_id(asistencia_id)
            if not asistencia:
                return {"error": "Asistencia no encontrada"}, 404

            # Si se está actualizando las FKs, validar que existan
            if 'Inscripcion_id_inscripcion' in asistencia_data:
                inscripcion = InscripcionRepository.get_by_id(asistencia_data['Inscripcion_id_inscripcion'])
                if not inscripcion:
                    return {"error": "Inscripción no encontrada"}, 404

            if 'Horario_sesion_id_horario_sesion' in asistencia_data:
                sesion = HorarioSesionRepository.get_by_id(asistencia_data['Horario_sesion_id_horario_sesion'])
                if not sesion:
                    return {"error": "Sesión no encontrada"}, 404

            # Actualizar la asistencia
            asistencia_actualizada = AsistenciaRepository.update(asistencia_id, asistencia_data)
            db.session.commit()
            
            return {
                "message": "Asistencia actualizada exitosamente",
                "asistencia": asistencia_actualizada.to_dict()
            }, 200

        except Exception as e:
            return {"error": f"Error al actualizar la asistencia: {str(e)}"}, 500

    @staticmethod
    def delete_asistencia(asistencia_id):
        """
        Borrado lógico de una asistencia (estado = False)
        """
        try:
            asistencia = AsistenciaRepository.get_by_id(asistencia_id)
            if not asistencia:
                return {"error": "Asistencia no encontrada"}, 404

            # Borrado lógico
            asistencia_actualizada = AsistenciaRepository.update(asistencia_id, {'estado': False})
            db.session.commit()
            
            return {
                "message": "Asistencia eliminada exitosamente",
                "asistencia": asistencia_actualizada.to_dict()
            }, 200

        except Exception as e:
            return {"error": f"Error al eliminar la asistencia: {str(e)}"}, 500

    @staticmethod
    def marcar_asistencia(asistencia_id, asistio=True):
        """
        Marca una asistencia como presente o ausente y registra la fecha
        """
        try:
            asistencia = AsistenciaRepository.get_by_id(asistencia_id)
            if not asistencia:
                return {"error": "Asistencia no encontrada"}, 404

            # Actualizar asistencia y fecha
            fecha_actual = datetime.now().date()
            update_data = {
                'asistio': asistio,
                'fecha': fecha_actual
            }
            
            asistencia_actualizada = AsistenciaRepository.update(asistencia_id, update_data)
            db.session.commit()
            
            mensaje = "Asistencia marcada como presente" if asistio else "Asistencia marcada como ausente"
            
            return {
                "message": mensaje,
                "asistencia": asistencia_actualizada.to_dict()
            }, 200

        except Exception as e:
            return {"error": f"Error al marcar la asistencia: {str(e)}"}, 500

    @staticmethod
    def get_estadisticas_asistencia(inscripcion_id):
        """
        Obtiene estadísticas de asistencia para una inscripción
        """
        try:
            inscripcion = InscripcionRepository.get_by_id(inscripcion_id)
            if not inscripcion:
                return {"error": "Inscripción no encontrada"}, 404

            asistencias = AsistenciaRepository.get_all()
            asistencias_inscripcion = [
                asistencia for asistencia in asistencias 
                if asistencia.Inscripcion_id_inscripcion == inscripcion_id and asistencia.estado
            ]

            total_clases = len(asistencias_inscripcion)
            clases_asistidas = len([a for a in asistencias_inscripcion if a.asistio == True])
            clases_no_asistidas = len([a for a in asistencias_inscripcion if a.asistio == False])
            clases_pendientes = len([a for a in asistencias_inscripcion if a.asistio is None])

            porcentaje_asistencia = (clases_asistidas / total_clases * 100) if total_clases > 0 else 0

            return {
                "inscripcion_id": inscripcion_id,
                "estadisticas": {
                    "total_clases_programadas": total_clases,
                    "clases_asistidas": clases_asistidas,
                    "clases_no_asistidas": clases_no_asistidas,
                    "clases_pendientes": clases_pendientes,
                    "porcentaje_asistencia": round(porcentaje_asistencia, 2)
                }
            }, 200

        except Exception as e:
            return {"error": f"Error al obtener estadísticas: {str(e)}"}, 500

    @staticmethod
    def get_personas_inscritas_por_horario_y_fecha(horario_id, fecha_str):
        """
        Obtiene la lista de personas inscritas en un horario específico en una fecha
        con información completa de inscripción, asistencia, horario y sesión
        
        Parámetros:
        - horario_id: ID del horario
        - fecha_str: Fecha en formato YYYY-MM-DD
        
        Retorna lista de personas con información completa de todas las entidades relacionadas
        """
        try:
            from datetime import datetime
            
            # Convertir fecha string a date
            try:
                fecha = datetime.strptime(fecha_str, '%Y-%m-%d').date()
            except ValueError:
                return {"error": "Formato de fecha inválido. Use YYYY-MM-DD"}, 400
            
            # Obtener los resultados del repository
            resultados = AsistenciaRepository.get_personas_inscritas_por_horario_y_fecha(horario_id, fecha)
            
            # Formatear la respuesta con información completa
            personas_inscritas = []
            for persona, inscripcion, asistencia, horario_sesion, horario in resultados:
                registro = {
                    "persona": persona.to_dict(),
                    "inscripcion": inscripcion.to_dict(),
                    "asistencia": asistencia.to_dict(),
                    "horario_sesion": horario_sesion.to_dict(),
                    "horario": horario.to_dict()
                }
                personas_inscritas.append(registro)
            
            return {
                "horario_id": horario_id,
                "fecha": fecha_str,
                "total_inscritos": len(personas_inscritas),
                "inscritos": personas_inscritas
            }, 200
            
        except Exception as e:
            return {"error": f"Error al obtener personas inscritas: {str(e)}"}, 500

    @staticmethod
    def get_personas_inscritas_por_horario(horario_id):
        """
        Obtiene la lista de personas inscritas en todas las sesiones de un horario específico
        con información completa de inscripción, asistencia, horario y sesión
        
        Parámetros:
        - horario_id: ID del horario
        
        Retorna lista de personas con información completa de todas las entidades relacionadas
        """
        try:
            # Obtener los resultados del repository
            resultados = AsistenciaRepository.get_personas_inscritas_por_horario(horario_id)
            
            # Formatear la respuesta con información completa
            personas_inscritas = []
            for persona, inscripcion, asistencia, horario_sesion, horario in resultados:
                registro = {
                    "persona": persona.to_dict(),
                    "inscripcion": inscripcion.to_dict(),
                    "asistencia": asistencia.to_dict(),
                    "horario_sesion": horario_sesion.to_dict(),
                    "horario": horario.to_dict()
                }
                personas_inscritas.append(registro)
            
            return {
                "horario_id": horario_id,
                "total_inscritos": len(personas_inscritas),
                "inscritos": personas_inscritas
            }, 200
            
        except Exception as e:
            return {"error": f"Error al obtener personas inscritas: {str(e)}"}, 500

    @staticmethod
    def get_inscritos_completos_por_horario(horario_id):
        """
        Obtiene la lista completa de personas inscritas a un horario específico
        agrupadas por persona con toda su información y lista de sesiones inscritas
        
        Parámetros:
        - horario_id: ID del horario
        
        Retorna lista de personas agrupadas con información completa y lista de sesiones
        """
        try:
            # Obtener los resultados del repository
            resultados = AsistenciaRepository.get_inscritos_completos_por_horario(horario_id)
            
            # Agrupar por persona
            personas_agrupadas = {}
            
            for persona, inscripcion, asistencia, horario_sesion, horario, oferta, ciclo, subcategoria, categoria, programa in resultados:
                persona_id = persona.id_persona
                
                if persona_id not in personas_agrupadas:
                    # Crear entrada para nueva persona
                    personas_agrupadas[persona_id] = {
                        "persona": persona.to_dict(),
                        "inscripcion": inscripcion.to_dict(),
                        "oferta": oferta.to_dict(),
                        "ciclo": ciclo.to_dict(),
                        "subcategoria": subcategoria.to_dict(),
                        "categoria": categoria.to_dict(),
                        "programa": programa.to_dict(),
                        "horario": horario.to_dict(),
                        "sesiones": []
                    }
                
                # Agregar información de la sesión actual
                sesion_info = {
                    "horario_sesion": horario_sesion.to_dict(),
                    "asistencia": asistencia.to_dict()
                }
                personas_agrupadas[persona_id]["sesiones"].append(sesion_info)
            
            # Convertir el diccionario a lista
            inscritos_agrupados = list(personas_agrupadas.values())
            
            return {
                "horario_id": horario_id,
                "total_personas": len(inscritos_agrupados),
                "inscritos": inscritos_agrupados
            }, 200
            
        except Exception as e:
            return {"error": f"Error al obtener inscritos completos: {str(e)}"}, 500

    @staticmethod
    def verificar_inscripcion_persona(persona_id):
        """
        Verifica si una persona está inscrita en algún horario sesión.
        
        Retorna:
        - persona_id: ID de la persona consultada
        - tiene_inscripciones: Boolean indicando si tiene inscripciones activas
        - total_inscripciones_activas: Cantidad de inscripciones activas
        - sesiones_inscritas: Lista de IDs de horario_sesion donde está inscrito
        """
        try:
            from src.models.inscripcion import Inscripcion
            from src.models.asistencia import Asistencia
            
            # Buscar inscripciones activas de la persona (estado = 'ACTIVO')
            inscripciones_activas = db.session.query(Inscripcion).filter(
                Inscripcion.Persona_id_persona == persona_id,
                Inscripcion.estado == 'ACTIVO'
            ).all()
            
            if not inscripciones_activas:
                return {
                    "persona_id": persona_id,
                    "tiene_inscripciones": False,
                    "total_inscripciones_activas": 0,
                    "sesiones_inscritas": []
                }, 200
            
            # Obtener IDs de inscripciones activas
            inscripcion_ids = [insc.id_inscripcion for insc in inscripciones_activas]
            
            # Buscar todas las asistencias (activas) de esas inscripciones
            asistencias = db.session.query(Asistencia).filter(
                Asistencia.Inscripcion_id_inscripcion.in_(inscripcion_ids),
                Asistencia.estado == True
            ).all()
            
            # Extraer IDs únicos de horario_sesion
            sesiones_inscritas = list(set([asist.Horario_sesion_id_horario_sesion for asist in asistencias]))
            
            return {
                "persona_id": persona_id,
                "tiene_inscripciones": True,
                "total_inscripciones_activas": len(inscripciones_activas),
                "total_sesiones_inscritas": len(sesiones_inscritas),
                "sesiones_inscritas": sesiones_inscritas
            }, 200
            
        except Exception as e:
            return {"error": f"Error al verificar inscripción: {str(e)}"}, 500