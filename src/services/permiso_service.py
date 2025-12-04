from src.repositories.permiso_repository import PermisoRepository
from datetime import datetime

class PermisoService:
    
    @staticmethod
    def get_all_permisos():
        """Obtiene todos los permisos"""
        try:
            permisos = PermisoRepository.get_all()
            return [permiso.to_dict() for permiso in permisos], 200
        except Exception as e:
            return {"error": f"Error interno del servidor: {str(e)}"}, 500
    
    @staticmethod
    def get_all_permisos_detallados():
        """Obtiene todos los permisos con información detallada"""
        try:
            results = PermisoRepository.get_all_detailed()
            permisos_detallados = []
            
            for result in results:
                permiso, persona, asistencia, horario_sesion, horario, estilo, inscripcion, paquete, oferta, ciclo = result
                
                permiso_detallado = {
                    "permiso_id": permiso.permiso_id,
                    "motivo": permiso.motivo,
                    "fecha_solicitud": permiso.fecha_solicitud.isoformat() if permiso.fecha_solicitud else None,
                    "estado_permiso": permiso.estado_permiso,
                    "fecha_respuesta": permiso.fecha_respuesta.isoformat() if permiso.fecha_respuesta else None,
                    "motivo_rechazo": permiso.motivo_rechazo,
                    "persona": {
                        "id_persona": persona.id_persona,
                        "nombre": persona.nombre,
                        "apellido": persona.apellido,
                        "email": persona.email,
                        "celular": persona.celular
                    },
                    "horario_sesion": {
                        "id_horario_sesion": horario_sesion.id_horario_sesion,
                        "fecha": horario_sesion.fecha.isoformat() if horario_sesion.fecha else None,
                        "hora_inicio": horario_sesion.hora_inicio.strftime('%H:%M') if horario_sesion.hora_inicio else None,
                        "hora_fin": horario_sesion.hora_fin.strftime('%H:%M') if horario_sesion.hora_fin else None
                    },
                    "clase": {
                        "nombre_estilo": estilo.nombre_estilo,
                        "nivel": horario.nivel,
                        "dias": horario.dias
                    },
                    "paquete": {
                        "nombre": paquete.nombre,
                        "cantidad_clases": paquete.cantidad_clases
                    },
                    "oferta": {
                        "nombre_oferta": oferta.nombre_oferta
                    },
                    "ciclo": {
                        "nombre": ciclo.nombre
                    }
                }
                
                # Agregar quien respondió si existe
                if permiso.respondida_por:
                    from src.repositories.persona_repository import PersonaRepository
                    persona_respondio = PersonaRepository.get_by_id(permiso.respondida_por)
                    if persona_respondio:
                        permiso_detallado["respondida_por"] = {
                            "nombre": persona_respondio.nombre,
                            "apellido": persona_respondio.apellido
                        }
                
                permisos_detallados.append(permiso_detallado)
            
            return permisos_detallados, 200
        except Exception as e:
            print(f"Error al obtener permisos detallados: {str(e)}")
            import traceback
            traceback.print_exc()
            return {"error": f"Error interno del servidor: {str(e)}"}, 500
    
    @staticmethod
    def get_active_permisos():
        """Obtiene todos los permisos activos"""
        try:
            permisos = PermisoRepository.get_active()
            return [permiso.to_dict() for permiso in permisos], 200
        except Exception as e:
            return {"error": f"Error interno del servidor: {str(e)}"}, 500
    
    @staticmethod
    def get_permiso_by_id(permiso_id):
        """Obtiene un permiso por ID"""
        try:
            if not permiso_id or permiso_id <= 0:
                return {"error": "ID de permiso inválido"}, 400
            
            permiso = PermisoRepository.get_by_id(permiso_id)
            if not permiso:
                return {"error": "Permiso no encontrado"}, 404
            
            return permiso.to_dict(), 200
        except Exception as e:
            return {"error": f"Error interno del servidor: {str(e)}"}, 500
    
    @staticmethod
    def get_permiso_detallado(permiso_id):
        """Obtiene un permiso con información detallada de todas sus relaciones"""
        try:
            if not permiso_id or permiso_id <= 0:
                return {"error": "ID de permiso inválido"}, 400
            
            result = PermisoRepository.get_detailed_info(permiso_id)
            if not result:
                return {"error": "Permiso no encontrado"}, 404
            
            # Desempaquetar el resultado
            permiso, persona, asistencia, horario_sesion, horario, estilo, inscripcion, paquete, oferta, ciclo = result
            
            # Construir respuesta detallada
            response = {
                "permiso": {
                    "permiso_id": permiso.permiso_id,
                    "motivo": permiso.motivo,
                    "fecha_solicitud": permiso.fecha_solicitud.isoformat() if permiso.fecha_solicitud else None,
                    "estado_permiso": permiso.estado_permiso,
                    "fecha_respuesta": permiso.fecha_respuesta.isoformat() if permiso.fecha_respuesta else None,
                    "motivo_rechazo": permiso.motivo_rechazo,
                    "activo": permiso.activo
                },
                "persona_solicitante": {
                    "id_persona": persona.id_persona,
                    "nombre": persona.nombre,
                    "apellido": persona.apellido,
                    "email": persona.email,
                    "celular": persona.celular,
                    "tipo_cuenta": persona.tipo_cuenta
                },
                "asistencia_original": {
                    "id_asistencia": asistencia.id_asistencia,
                    "asistio": asistencia.asistio,
                    "fecha": asistencia.fecha.isoformat() if asistencia.fecha else None
                },
                "horario_sesion": {
                    "id_horario_sesion": horario_sesion.id_horario_sesion,
                    "fecha": horario_sesion.fecha.isoformat() if horario_sesion.fecha else None,
                    "dia": horario_sesion.dia,
                    "hora_inicio": horario_sesion.hora_inicio.strftime('%H:%M') if horario_sesion.hora_inicio else None,
                    "hora_fin": horario_sesion.hora_fin.strftime('%H:%M') if horario_sesion.hora_fin else None,
                    "duracion": float(horario_sesion.duracion) if horario_sesion.duracion else None,
                    "cancelado": horario_sesion.cancelado,
                    "capacidad_maxima": horario_sesion.capacidad_maxima,
                    "cupos_ocupados": horario_sesion.cupos_ocupados
                },
                "clase": {
                    "id_horario": horario.id_horario,
                    "estilo": {
                        "id_estilo": estilo.id_estilo,
                        "nombre_estilo": estilo.nombre_estilo,
                        "descripcion_estilo": estilo.descripcion_estilo
                    },
                    "nivel": horario.nivel,
                    "dias": horario.dias,
                    "hora_inicio": horario.hora_inicio.strftime('%H:%M') if horario.hora_inicio else None,
                    "hora_fin": horario.hora_fin.strftime('%H:%M') if horario.hora_fin else None,
                    "capacidad": horario.capacidad
                },
                "inscripcion": {
                    "id_inscripcion": inscripcion.id_inscripcion,
                    "fecha_inscripcion": inscripcion.fecha_inscripcion.isoformat() if inscripcion.fecha_inscripcion else None,
                    "fecha_inicio": inscripcion.fecha_inicio.isoformat() if inscripcion.fecha_inicio else None,
                    "fecha_fin": inscripcion.fecha_fin.isoformat() if inscripcion.fecha_fin else None,
                    "estado": inscripcion.estado,
                    "clases_usadas": inscripcion.clases_usadas,
                    "clases_restantes": inscripcion.clases_restantes
                },
                "paquete": {
                    "id_paquete": paquete.id_paquete,
                    "nombre": paquete.nombre,
                    "cantidad_clases": paquete.cantidad_clases,
                    "dias_validez": paquete.dias_validez,
                    "ilimitado": paquete.ilimitado,
                    "precio": float(paquete.precio) if paquete.precio else None
                },
                "oferta": {
                    "id_oferta": oferta.id_oferta,
                    "nombre_oferta": oferta.nombre_oferta,
                    "descripcion": oferta.descripcion,
                    "fecha_inicio": oferta.fecha_inicio.isoformat() if oferta.fecha_inicio else None,
                    "fecha_fin": oferta.fecha_fin.isoformat() if oferta.fecha_fin else None,
                    "cantidad_cursos": oferta.cantidad_cursos,
                    "publico_objetivo": oferta.publico_objetivo
                },
                "ciclo": {
                    "id_ciclo": ciclo.id_ciclo,
                    "nombre": ciclo.nombre,
                    "inicio": ciclo.inicio.isoformat() if ciclo.inicio else None,
                    "fin": ciclo.fin.isoformat() if ciclo.fin else None
                }
            }
            
            # Agregar información de quien respondió si existe
            if permiso.respondida_por:
                from src.repositories.persona_repository import PersonaRepository
                persona_respondio = PersonaRepository.get_by_id(permiso.respondida_por)
                if persona_respondio:
                    response["respondida_por"] = {
                        "id_persona": persona_respondio.id_persona,
                        "nombre": persona_respondio.nombre,
                        "apellido": persona_respondio.apellido,
                        "email": persona_respondio.email,
                        "tipo_cuenta": persona_respondio.tipo_cuenta
                    }
            
            # Agregar información de asistencia de reemplazo si existe
            if permiso.asistencia_reemplazo_id:
                from src.repositories.asistencia_repository import AsistenciaRepository
                asistencia_reemplazo = AsistenciaRepository.get_by_id(permiso.asistencia_reemplazo_id)
                if asistencia_reemplazo:
                    response["asistencia_reemplazo"] = {
                        "id_asistencia": asistencia_reemplazo.id_asistencia,
                        "asistio": asistencia_reemplazo.asistio,
                        "fecha": asistencia_reemplazo.fecha.isoformat() if asistencia_reemplazo.fecha else None
                    }
            
            return response, 200
            
        except Exception as e:
            print(f"Error al obtener permiso detallado: {str(e)}")
            import traceback
            traceback.print_exc()
            return {"error": f"Error interno del servidor: {str(e)}"}, 500
    
    @staticmethod
    def get_permisos_by_persona(persona_id):
        """Obtiene permisos de una persona"""
        try:
            if not persona_id or persona_id <= 0:
                return {"error": "ID de persona inválido"}, 400
            
            permisos = PermisoRepository.get_by_persona(persona_id)
            return [permiso.to_dict() for permiso in permisos], 200
        except Exception as e:
            return {"error": f"Error interno del servidor: {str(e)}"}, 500
    
    @staticmethod
    def get_permisos_by_inscripcion(inscripcion_id):
        """Obtiene permisos de una inscripción"""
        try:
            if not inscripcion_id or inscripcion_id <= 0:
                return {"error": "ID de inscripción inválido"}, 400
            
            permisos = PermisoRepository.get_by_inscripcion(inscripcion_id)
            return [permiso.to_dict() for permiso in permisos], 200
        except Exception as e:
            return {"error": f"Error interno del servidor: {str(e)}"}, 500
    
    @staticmethod
    def get_permisos_by_estado(estado):
        """Obtiene permisos por estado"""
        try:
            estados_validos = ['PENDIENTE', 'APROBADO', 'RECHAZADO']
            if estado not in estados_validos:
                return {"error": f"Estado debe ser uno de: {estados_validos}"}, 400
            
            permisos = PermisoRepository.get_by_estado(estado)
            return [permiso.to_dict() for permiso in permisos], 200
        except Exception as e:
            return {"error": f"Error interno del servidor: {str(e)}"}, 500
    
    @staticmethod
    def get_permisos_pendientes():
        """Obtiene permisos pendientes"""
        try:
            permisos = PermisoRepository.get_pendientes()
            return [permiso.to_dict() for permiso in permisos], 200
        except Exception as e:
            return {"error": f"Error interno del servidor: {str(e)}"}, 500
    
    @staticmethod
    def get_permisos_by_horario_sesion(horario_sesion_id):
        """Obtiene permisos por sesión de horario"""
        try:
            if not horario_sesion_id or horario_sesion_id <= 0:
                return {"error": "ID de horario sesión inválido"}, 400
            
            permisos = PermisoRepository.get_by_horario_sesion(horario_sesion_id)
            return [permiso.to_dict() for permiso in permisos], 200
        except Exception as e:
            return {"error": f"Error interno del servidor: {str(e)}"}, 500
    
    @staticmethod
    def get_permisos_respondidos_por(persona_id):
        """Obtiene permisos respondidos por una persona"""
        try:
            if not persona_id or persona_id <= 0:
                return {"error": "ID de persona inválido"}, 400
            
            permisos = PermisoRepository.get_respondidos_por(persona_id)
            return [permiso.to_dict() for permiso in permisos], 200
        except Exception as e:
            return {"error": f"Error interno del servidor: {str(e)}"}, 500
    
    @staticmethod
    def create_permiso(permiso_data):
        """Crea un nuevo permiso"""
        try:
            # Validar campos requeridos
            campos_requeridos = [
                'Persona_id_persona', 'Inscripcion_id_inscripcion', 
                'Asistencia_original_id', 'motivo', 'Horario_sesion_id_horario_sesion'
            ]
            
            for campo in campos_requeridos:
                if campo not in permiso_data or not permiso_data[campo]:
                    return {"error": f"El campo '{campo}' es requerido"}, 400
            
            # Validar tipos de datos
            if len(permiso_data['motivo']) > 1000:
                return {"error": "El motivo no puede exceder los 1000 caracteres"}, 400
            
            # Verificar que las entidades relacionadas existan (validaciones básicas)
            # TODO: Activar validaciones completas después de arreglar los repositorios
            
            # Validaciones básicas de IDs y mapeo de nombres
            # Mapear los nombres del JSON a los nombres de columnas de la BD
            mapped_data = {
                'persona_id_persona': permiso_data['Persona_id_persona'],
                'inscripcion_id_inscripcion': permiso_data['Inscripcion_id_inscripcion'],
                'asistencia_original_id': permiso_data['Asistencia_original_id'],
                'motivo': permiso_data['motivo'],
                'horario_sesion_id_horario_sesion': permiso_data['Horario_sesion_id_horario_sesion']
            }
            
            if mapped_data['persona_id_persona'] <= 0:
                return {"error": "ID de persona inválido"}, 400
            if mapped_data['inscripcion_id_inscripcion'] <= 0:
                return {"error": "ID de inscripción inválido"}, 400
            if mapped_data['asistencia_original_id'] <= 0:
                return {"error": "ID de asistencia inválido"}, 400
            if mapped_data['horario_sesion_id_horario_sesion'] <= 0:
                return {"error": "ID de horario sesión inválido"}, 400
            
            # Establecer valores por defecto
            mapped_data['fecha_solicitud'] = datetime.utcnow()
            mapped_data['estado_permiso'] = 'PENDIENTE'
            mapped_data['activo'] = True
            
            # Crear permiso
            nuevo_permiso = PermisoRepository.create(mapped_data)
            if not nuevo_permiso:
                return {"error": "No se pudo crear el permiso"}, 500
            
            return {
                "message": "Permiso creado exitosamente",
                "permiso": nuevo_permiso.to_dict()
            }, 201
            
        except Exception as e:
            return {"error": f"Error interno del servidor: {str(e)}"}, 500
    
    @staticmethod
    def update_permiso(permiso_id, permiso_data):
        """Actualiza un permiso existente"""
        try:
            if not permiso_id or permiso_id <= 0:
                return {"error": "ID de permiso inválido"}, 400
            
            # Verificar que el permiso existe
            existing_permiso = PermisoRepository.get_by_id(permiso_id)
            if not existing_permiso:
                return {"error": "Permiso no encontrado"}, 404
            
            # Validar tipos de datos si se proporcionan
            if 'motivo' in permiso_data and len(permiso_data['motivo']) > 1000:
                return {"error": "El motivo no puede exceder los 1000 caracteres"}, 400
            
            if 'motivo_rechazo' in permiso_data and permiso_data['motivo_rechazo'] and len(permiso_data['motivo_rechazo']) > 1000:
                return {"error": "El motivo de rechazo no puede exceder los 1000 caracteres"}, 400
            
            # Validar estados permitidos
            if 'estado_permiso' in permiso_data:
                estados_validos = ['PENDIENTE', 'APROBADO', 'RECHAZADO']
                if permiso_data['estado_permiso'] not in estados_validos:
                    return {"error": f"Estado debe ser uno de: {estados_validos}"}, 400
            
            # Actualizar permiso
            permiso_actualizado = PermisoRepository.update(permiso_id, permiso_data)
            if not permiso_actualizado:
                return {"error": "No se pudo actualizar el permiso"}, 500
            
            return {
                "message": "Permiso actualizado exitosamente",
                "permiso": permiso_actualizado.to_dict()
            }, 200
            
        except Exception as e:
            return {"error": f"Error interno del servidor: {str(e)}"}, 500
    
    @staticmethod
    def delete_permiso(permiso_id):
        """Elimina lógicamente un permiso"""
        try:
            if not permiso_id or permiso_id <= 0:
                return {"error": "ID de permiso inválido"}, 400
            
            # Verificar que el permiso existe
            permiso = PermisoRepository.get_by_id(permiso_id)
            if not permiso:
                return {"error": "Permiso no encontrado"}, 404
            
            # Eliminar permiso
            if PermisoRepository.delete(permiso_id):
                return {"message": "Permiso eliminado exitosamente"}, 200
            else:
                return {"error": "No se pudo eliminar el permiso"}, 500
                
        except Exception as e:
            return {"error": f"Error interno del servidor: {str(e)}"}, 500
    
    @staticmethod
    def aprobar_permiso(permiso_id, aprobacion_data):
        """Aprueba un permiso"""
        try:
            if not permiso_id or permiso_id <= 0:
                return {"error": "ID de permiso inválido"}, 400
            
            # Validar campos requeridos
            if 'respondida_por' not in aprobacion_data:
                return {"error": "El campo 'respondida_por' es requerido"}, 400
            
            # Verificar que la persona que responde existe
            from src.repositories.persona_repository import PersonaRepository
            persona = PersonaRepository.get_by_id(aprobacion_data['respondida_por'])
            if not persona:
                return {"error": "Persona que responde no encontrada"}, 404
            
            # Aprobar permiso (permite cambiar decisión previa)
            permiso_aprobado = PermisoRepository.aprobar_permiso(
                permiso_id, 
                aprobacion_data['respondida_por'],
                aprobacion_data.get('Asistencia_reemplazo_id')
            )
            
            if not permiso_aprobado:
                return {"error": "No se pudo aprobar el permiso. Verifique que exista y esté activo"}, 400
            
            return {
                "message": "Permiso aprobado exitosamente",
                "permiso": permiso_aprobado.to_dict()
            }, 200
            
        except Exception as e:
            return {"error": f"Error interno del servidor: {str(e)}"}, 500
    
    @staticmethod
    def rechazar_permiso(permiso_id, rechazo_data):
        """Rechaza un permiso"""
        try:
            if not permiso_id or permiso_id <= 0:
                return {"error": "ID de permiso inválido"}, 400
            
            # Validar campos requeridos
            campos_requeridos = ['respondida_por', 'motivo_rechazo']
            for campo in campos_requeridos:
                if campo not in rechazo_data or not rechazo_data[campo]:
                    return {"error": f"El campo '{campo}' es requerido"}, 400
            
            # Verificar que la persona que responde existe
            from src.repositories.persona_repository import PersonaRepository
            persona = PersonaRepository.get_by_id(rechazo_data['respondida_por'])
            if not persona:
                return {"error": "Persona que responde no encontrada"}, 404
            
            # Validar longitud del motivo de rechazo
            if len(rechazo_data['motivo_rechazo']) > 1000:
                return {"error": "El motivo de rechazo no puede exceder los 1000 caracteres"}, 400
            
            # Rechazar permiso (permite cambiar decisión previa)
            permiso_rechazado = PermisoRepository.rechazar_permiso(
                permiso_id,
                rechazo_data['respondida_por'],
                rechazo_data['motivo_rechazo']
            )
            
            if not permiso_rechazado:
                return {"error": "No se pudo rechazar el permiso. Verifique que exista y esté activo"}, 400
            
            return {
                "message": "Permiso rechazado exitosamente",
                "permiso": permiso_rechazado.to_dict()
            }, 200
            
        except Exception as e:
            return {"error": f"Error interno del servidor: {str(e)}"}, 500
    
    @staticmethod
    def get_estadisticas_permisos():
        """Obtiene estadísticas de permisos"""
        try:
            estadisticas = PermisoRepository.get_estadisticas()
            return estadisticas, 200
        except Exception as e:
            return {"error": f"Error interno del servidor: {str(e)}"}, 500