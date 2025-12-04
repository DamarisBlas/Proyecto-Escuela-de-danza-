from src.repositories.horario_sesion_repository import HorarioSesionRepository
from src.repositories.horario_repository import HorarioRepository
from src.repositories.estilo_repository import EstiloRepository
from src.repositories.profesor_repository import ProfesorRepository
from src.repositories.sala_repository import SalaRepository
from src.repositories.oferta_repository import OfertaRepository
from src.repositories.ciclo_repository import CicloRepository
from src.repositories.subcategoria_repository import SubcategoriaRepository
from src.repositories.persona_repository import PersonaRepository
from datetime import datetime

class HorarioSesionService:
    """
    Servicio para lógica de negocio de HorarioSesion
    """

    @staticmethod
    def get_sesion_by_id(sesion_id):
        """
        Obtiene una sesión por ID
        """
        try:
            sesion = HorarioSesionRepository.get_by_id(sesion_id)
            if not sesion:
                return {"error": "Sesión no encontrada"}, 404
            return sesion.to_dict(), 200
        except Exception as e:
            return {"error": f"Error al obtener sesión: {str(e)}"}, 500

    @staticmethod
    def get_sesion_with_horario_info(sesion_id):
        """
        Obtiene una sesión por ID junto con toda la información del horario relacionado
        """
        try:
            # Obtener la sesión
            sesion = HorarioSesionRepository.get_by_id(sesion_id)
            if not sesion:
                return {"error": "Sesión no encontrada"}, 404

            # Obtener el horario relacionado
            horario = HorarioRepository.get_by_id(sesion.Horario_id_horario)
            if not horario:
                return {"error": "Horario relacionado no encontrado"}, 404

            # Obtener información completa del estilo
            estilo = None
            if horario.Estilo_id_estilo:
                estilo = EstiloRepository.get_by_id(horario.Estilo_id_estilo)

            # Obtener información completa del profesor
            profesor = None
            persona_profesor = None
            if horario.Profesor_id_profesor:
                profesor = ProfesorRepository.get_by_id(horario.Profesor_id_profesor)
                # Si existe el profesor, obtener también la información de la persona
                if profesor and profesor.Persona_id_persona:
                    persona_profesor = PersonaRepository.get_by_id(profesor.Persona_id_persona)

            # Obtener información completa de la sala
            sala = None
            if horario.Sala_id_sala:
                sala = SalaRepository.get_by_id(horario.Sala_id_sala)

            # Obtener información completa de la oferta
            oferta = None
            ciclo = None
            subcategoria = None
            if horario.Oferta_id_oferta:
                oferta = OfertaRepository.get_by_id(horario.Oferta_id_oferta)
                # Si existe la oferta, obtener también el ciclo y subcategoría relacionados
                if oferta:
                    if oferta.ciclo_id_ciclo:
                        ciclo = CicloRepository.get_by_id(oferta.ciclo_id_ciclo)
                    if oferta.Subcategoria_id_subcategoria:
                        subcategoria = SubcategoriaRepository.get_by_id(oferta.Subcategoria_id_subcategoria)

            # Combinar la información
            sesion_data = sesion.to_dict()
            horario_data = horario.to_dict()

            # Preparar información de oferta con ciclo y subcategoría
            oferta_info = None
            if oferta:
                oferta_info = oferta.to_dict()
                if ciclo:
                    oferta_info['ciclo'] = ciclo.to_dict()
                if subcategoria:
                    oferta_info['subcategoria'] = subcategoria.to_dict()

            response = {
                "id_horario_sesion": sesion_data['id_horario_sesion'],
                "fecha": sesion_data['fecha'],
                "dia": sesion_data['dia'],
                "hora_inicio": sesion_data['hora_inicio'],
                "hora_fin": sesion_data['hora_fin'],
                "duracion": sesion_data['duracion'],
                "estado": sesion_data['estado'],
                "motivo": sesion_data['motivo'],
                "cancelado": sesion_data['cancelado'],
                "capacidad_maxima": sesion_data['capacidad_maxima'],
                "cupos_ocupados": sesion_data['cupos_ocupados'],
                "cupos_disponibles": sesion_data['cupos_disponibles'],
                "horario": {
                    "id_horario": horario_data['id_horario'],
                    "dias": horario_data['dias'],
                    "hora_inicio": horario_data['hora_inicio'],
                    "hora_fin": horario_data['hora_fin'],
                    "capacidad": horario_data['capacidad'],
                    "estado": horario_data['estado'],
                    "nivel": horario_data['nivel'],
                    "estilo": estilo.to_dict() if estilo else None,
                    "profesor": HorarioSesionService._build_profesor_info(profesor, persona_profesor),
                    "sala": sala.to_dict() if sala else None,
                    "oferta": oferta_info
                }
            }

            return response, 200

        except Exception as e:
            return {"error": f"Error al obtener sesión con información del horario: {str(e)}"}, 500

    @staticmethod
    def get_sesiones_by_horario(horario_id):
        """
        Obtiene todas las sesiones de un horario
        """
        try:
            sesiones = HorarioSesionRepository.get_by_horario(horario_id)
            return [sesion.to_dict() for sesion in sesiones], 200
        except Exception as e:
            return {"error": f"Error al obtener sesiones: {str(e)}"}, 500

    @staticmethod
    def get_active_sesiones_by_horario(horario_id):
        """
        Obtiene todas las sesiones activas de un horario
        """
        try:
            sesiones = HorarioSesionRepository.get_active_by_horario(horario_id)
            return [sesion.to_dict() for sesion in sesiones], 200
        except Exception as e:
            return {"error": f"Error al obtener sesiones activas: {str(e)}"}, 500

    @staticmethod
    def update_sesion(sesion_id, sesion_data):
        """
        Actualiza una sesión existente
        """
        try:
            # Verificar que la sesión existe
            existing_sesion = HorarioSesionRepository.get_by_id(sesion_id)
            if not existing_sesion:
                return {"error": "Sesión no encontrada"}, 404

            # Si se actualizan hora_inicio o hora_fin, recalcular duración
            if 'hora_inicio' in sesion_data or 'hora_fin' in sesion_data:
                hora_inicio = sesion_data.get('hora_inicio', existing_sesion.hora_inicio.strftime('%H:%M'))
                hora_fin = sesion_data.get('hora_fin', existing_sesion.hora_fin.strftime('%H:%M'))
                
                inicio = datetime.strptime(hora_inicio, "%H:%M")
                fin = datetime.strptime(hora_fin, "%H:%M")
                duracion = (fin - inicio).total_seconds() / 3600
                sesion_data['duracion'] = duracion

            sesion = HorarioSesionRepository.update(sesion_id, sesion_data)
            return {
                "message": "Sesión actualizada exitosamente",
                "sesion": sesion.to_dict()
            }, 200

        except Exception as e:
            return {"error": f"Error al actualizar sesión: {str(e)}"}, 500

    @staticmethod
    def delete_sesion(sesion_id):
        """
        Elimina una sesión (borrado lógico)
        """
        try:
            sesion = HorarioSesionRepository.delete(sesion_id)
            if not sesion:
                return {"error": "Sesión no encontrada"}, 404

            return {"message": "Sesión eliminada exitosamente"}, 200

        except Exception as e:
            return {"error": f"Error al eliminar sesión: {str(e)}"}, 500

    @staticmethod
    def get_agenda_semanal(fecha_desde, fecha_hasta):
        """
        Obtiene todas las sesiones activas en un rango de fechas
        con toda la información completa para mostrar en la agenda
        """
        try:
            import json
            
            sesiones_data = HorarioSesionRepository.get_sesiones_agenda(fecha_desde, fecha_hasta)
            
            result = []
            for item in sesiones_data:
                sesion_tuple = item['sesion_data']
                paquetes = item['paquetes']
                
                sesion, horario, oferta, estilo, profesor, persona, sala, ciclo = sesion_tuple
                
                # Parsear redes sociales si es JSON string
                redes_sociales = {}
                if profesor.redes_sociales:
                    try:
                        redes_sociales = json.loads(profesor.redes_sociales)
                    except:
                        # Si no es JSON, tratarlo como texto simple
                        redes_sociales = {"info": profesor.redes_sociales}
                
                sesion_data = {
                    # Datos de la sesión
                    "id_sesion": sesion.id_horario_sesion,
                    "fecha": sesion.fecha.isoformat() if sesion.fecha else None,
                    "hora_inicio": sesion.hora_inicio.strftime('%H:%M') if sesion.hora_inicio else None,
                    "hora_fin": sesion.hora_fin.strftime('%H:%M') if sesion.hora_fin else None,
                    "duracion": float(sesion.duracion) if sesion.duracion else None,
                    "cancelado": sesion.cancelado,
                    "motivo": sesion.motivo,
                    "estado": "CANCELLED" if sesion.cancelado else "ACTIVE",
                    
                    # Datos de capacidad y cupos
                    "capacidad_maxima": sesion.capacidad_maxima,
                    "cupos_ocupados": sesion.cupos_ocupados,
                    "cupos_disponibles": sesion.capacidad_maxima - sesion.cupos_ocupados,
                    
                    # Datos del horario
                    "horario_id": horario.id_horario,
                    "capacidad": horario.capacidad,
                    "nivel": horario.nivel,
                    
                    # Datos de la oferta
                    "oferta": {
                        "id_oferta": oferta.id_oferta,
                        "nombre_oferta": oferta.nombre_oferta,
                        "tipo": "REGULAR" if oferta.repite_semanalmente else "TALLER",
                        "ciclo": ciclo.nombre if ciclo else None,
                        "descripcion": oferta.descripcion,
                        "publico_objetivo": oferta.publico_objetivo,
                        "whatsapplink": oferta.whatsapplink
                    },
                    
                    # Datos del estilo
                    "estilo": {
                        "id_estilo": estilo.id_estilo,
                        "nombre_estilo": estilo.nombre_estilo,
                        "descripcion_estilo": estilo.descripcion_estilo,
                        "beneficios_estilo": estilo.beneficios_estilo
                    },
                    
                    # Datos del profesor
                    "profesor": {
                        "id_profesor": profesor.id_profesor,
                        "nombre": persona.nombre,
                        "apellido": persona.apellido,
                        "email": persona.email,
                        "celular": persona.celular,
                        "redes_sociales": redes_sociales,
                        "frase": profesor.frase,
                        "descripcion": profesor.descripcion,
                        "ciudad": profesor.cuidad,
                        "experiencia": profesor.experiencia,
                        "signo": profesor.signo,
                        "musica_favorita": profesor.musica,
                        "estilos": profesor.estilos
                    },
                    
                    # Datos de la sala
                    "sala": {
                        "id_sala": sala.id_sala,
                        "nombre_sala": sala.nombre_sala,
                        "zona": sala.zona,
                        "direccion": sala.ubicacion,
                        "link_ubicacion": sala.link_ubicacion,
                        "departamento": sala.departamento
                    },
                    
                    # Paquetes disponibles de la oferta
                    "paquetes": [
                        {
                            "id_paquete": paquete.id_paquete,
                            "nombre": paquete.nombre,
                            "cantidad_clases": paquete.cantidad_clases,
                            "dias_validez": paquete.dias_validez,
                            "ilimitado": paquete.ilimitado,
                            "precio": float(paquete.precio)
                        }
                        for paquete in paquetes
                    ]
                }
                
                result.append(sesion_data)
            
            return {"sesiones": result, "total": len(result)}, 200
            
        except Exception as e:
            return {"error": f"Error al obtener agenda: {str(e)}"}, 500

    @staticmethod
    def _build_profesor_info(profesor, persona_profesor):
        """
        Construye la información completa del profesor incluyendo datos de la persona
        """
        if not profesor:
            return None
            
        profesor_info = profesor.to_dict()
        
        # Agregar información de la persona si está disponible
        if persona_profesor:
            persona_data = persona_profesor.to_dict()
            profesor_info['persona'] = {
                'nombre': persona_data.get('nombre'),
                'apellido': persona_data.get('apellido'), 
                'celular': persona_data.get('celular'),
                'email': persona_data.get('email')
            }
        
        return profesor_info

    @staticmethod
    def get_sesiones_by_horario_fecha(horario_id, fecha_inicio, fecha_fin, persona_id=None):
        """
        Obtiene horarios sesión filtrados por:
        - ID de horario
        - Rango de fechas (fecha_inicio, fecha_fin)
        - Estado activo (estado = True)
        - No cancelados (cancelado = False)
        - Con cupos disponibles (cupos_ocupados < capacidad_maxima)
        - Opcionalmente: excluye sesiones donde la persona ya está inscrita
        
        Retorna información detallada de cada sesión incluyendo:
        - Datos de la sesión
        - Información del horario
        - Nombre del estilo
        - Nombre de la sala
        - Nombre y apellido del profesor
        - Nombre de la oferta
        - Nombre del ciclo
        - Otros atributos importantes
        
        Args:
            horario_id: ID del horario
            fecha_inicio: Fecha inicial en formato YYYY-MM-DD
            fecha_fin: Fecha final en formato YYYY-MM-DD
            persona_id: ID de la persona (opcional). Si se proporciona, excluye sesiones ya inscritas
        """
        try:
            # Validar parámetros
            if not horario_id or horario_id <= 0:
                return {"error": "ID de horario inválido"}, 400
            
            if not fecha_inicio or not fecha_fin:
                return {"error": "Las fechas de inicio y fin son requeridas"}, 400
            
            # Convertir strings a fecha
            try:
                fecha_inicio_obj = datetime.strptime(fecha_inicio, '%Y-%m-%d').date()
                fecha_fin_obj = datetime.strptime(fecha_fin, '%Y-%m-%d').date()
            except ValueError:
                return {"error": "Formato de fecha inválido. Use YYYY-MM-DD"}, 400
            
            if fecha_inicio_obj > fecha_fin_obj:
                return {"error": "La fecha de inicio no puede ser mayor a la fecha fin"}, 400
            
            # Obtener sesiones con información completa usando el repositorio
            from src.models.horario_sesion import HorarioSesion
            from src.models.horario import Horario
            from src.models.estilo import Estilo
            from src.models.sala import Sala
            from src.models.profesor import Profesor
            from src.models.persona import Persona
            from src.models.oferta import Oferta
            from src.models.ciclo import Ciclo
            from src.models.inscripcion import Inscripcion
            from src.models.asistencia import Asistencia
            from src.app import db
            
            # Si se proporciona persona_id, obtener las sesiones a las que ya está inscrito
            sesiones_inscritas = []
            if persona_id:
                # Obtener todas las inscripciones activas de la persona
                inscripciones = db.session.query(Inscripcion).filter(
                    Inscripcion.Persona_id_persona == persona_id,
                    Inscripcion.estado == 'ACTIVO'
                ).all()
                
                if inscripciones:
                    inscripcion_ids = [insc.id_inscripcion for insc in inscripciones]
                    
                    # Obtener todas las asistencias de esas inscripciones
                    asistencias = db.session.query(Asistencia).filter(
                        Asistencia.Inscripcion_id_inscripcion.in_(inscripcion_ids)
                    ).all()
                    
                    # Extraer los IDs de horario_sesion
                    sesiones_inscritas = [asist.Horario_sesion_id_horario_sesion for asist in asistencias]
            
            # Query con todos los joins necesarios
            query = db.session.query(
                HorarioSesion,
                Horario,
                Estilo,
                Sala,
                Profesor,
                Persona,
                Oferta,
                Ciclo
            ).join(
                Horario, HorarioSesion.Horario_id_horario == Horario.id_horario
            ).join(
                Estilo, Horario.Estilo_id_estilo == Estilo.id_estilo
            ).join(
                Sala, Horario.Sala_id_sala == Sala.id_sala
            ).join(
                Profesor, Horario.Profesor_id_profesor == Profesor.id_profesor
            ).join(
                Persona, Profesor.Persona_id_persona == Persona.id_persona
            ).join(
                Oferta, Horario.Oferta_id_oferta == Oferta.id_oferta
            ).join(
                Ciclo, Oferta.ciclo_id_ciclo == Ciclo.id_ciclo
            ).filter(
                HorarioSesion.Horario_id_horario == horario_id,
                HorarioSesion.fecha >= fecha_inicio_obj,
                HorarioSesion.fecha <= fecha_fin_obj,
                HorarioSesion.estado == True,
                HorarioSesion.cancelado == False,
                HorarioSesion.cupos_ocupados < HorarioSesion.capacidad_maxima
            )
            
            # Si hay sesiones inscritas, excluirlas
            if sesiones_inscritas:
                query = query.filter(
                    ~HorarioSesion.id_horario_sesion.in_(sesiones_inscritas)
                )
            
            sesiones_query = query.order_by(
                HorarioSesion.fecha,
                HorarioSesion.hora_inicio
            ).all()
            
            if not sesiones_query:
                return {
                    "horario_id": horario_id,
                    "fecha_inicio": fecha_inicio,
                    "fecha_fin": fecha_fin,
                    "total_sesiones": 0,
                    "sesiones": [],
                    "mensaje": "No se encontraron sesiones disponibles en el rango de fechas especificado"
                }, 200
            
            # Formatear resultado
            sesiones_detalladas = []
            for sesion, horario, estilo, sala, profesor, persona, oferta, ciclo in sesiones_query:
                sesion_dict = {
                    # Información de la sesión
                    "sesion": {
                        "id_horario_sesion": sesion.id_horario_sesion,
                        "fecha": sesion.fecha.isoformat() if sesion.fecha else None,
                        "dia": sesion.dia,
                        "hora_inicio": sesion.hora_inicio.strftime('%H:%M') if sesion.hora_inicio else None,
                        "hora_fin": sesion.hora_fin.strftime('%H:%M') if sesion.hora_fin else None,
                        "duracion": float(sesion.duracion) if sesion.duracion else None,
                        "capacidad_maxima": sesion.capacidad_maxima,
                        "cupos_ocupados": sesion.cupos_ocupados,
                        "cupos_disponibles": sesion.capacidad_maxima - sesion.cupos_ocupados,
                        "estado": sesion.estado,
                        "cancelado": sesion.cancelado,
                        "motivo": sesion.motivo
                    },
                    
                    # Información del horario
                    "horario": {
                        "id_horario": horario.id_horario,
                        "nivel": horario.nivel,
                        "capacidad": horario.capacidad,
                        "dias": horario.dias,
                        "hora_inicio": horario.hora_inicio.strftime('%H:%M') if horario.hora_inicio else None,
                        "hora_fin": horario.hora_fin.strftime('%H:%M') if horario.hora_fin else None,
                        "estado": horario.estado
                    },
                    
                    # Información del estilo
                    "estilo": {
                        "id_estilo": estilo.id_estilo,
                        "nombre_estilo": estilo.nombre_estilo,
                        "descripcion_estilo": estilo.descripcion_estilo,
                        "beneficios_estilo": estilo.beneficios_estilo,
                        "estado": estilo.estado
                    },
                    
                    # Información de la sala
                    "sala": {
                        "id_sala": sala.id_sala,
                        "nombre_sala": sala.nombre_sala,
                        "ubicacion": sala.ubicacion,
                        "link_ubicacion": sala.link_ubicacion,
                        "departamento": sala.departamento,
                        "zona": sala.zona,
                        "estado": sala.estado
                    },
                    
                    # Información del profesor
                    "profesor": {
                        "id_profesor": profesor.id_profesor,
                        "nombre": persona.nombre,
                        "apellido": persona.apellido,
                        "email": persona.email,
                        "celular": persona.celular
                    },
                    
                    # Información de la oferta
                    "oferta": {
                        "id_oferta": oferta.id_oferta,
                        "nombre_oferta": oferta.nombre_oferta,
                        "descripcion": oferta.descripcion,
                        "fecha_inicio": oferta.fecha_inicio.isoformat() if oferta.fecha_inicio else None,
                        "fecha_fin": oferta.fecha_fin.isoformat() if oferta.fecha_fin else None,
                        "cantidad_cursos": oferta.cantidad_cursos,
                        "publico_objetivo": oferta.publico_objetivo,
                        "repite_semanalmente": oferta.repite_semanalmente,
                        "estado": oferta.estado
                    },
                    
                    # Información del ciclo
                    "ciclo": {
                        "id_ciclo": ciclo.id_ciclo,
                        "nombre": ciclo.nombre,
                        "inicio": ciclo.inicio.isoformat() if ciclo.inicio else None,
                        "fin": ciclo.fin.isoformat() if ciclo.fin else None,
                        "estado": ciclo.estado
                    }
                }
                
                sesiones_detalladas.append(sesion_dict)
            
            return {
                "horario_id": horario_id,
                "fecha_inicio": fecha_inicio,
                "fecha_fin": fecha_fin,
                "total_sesiones": len(sesiones_detalladas),
                "sesiones": sesiones_detalladas
            }, 200
            
        except Exception as e:
            return {"error": f"Error al obtener sesiones: {str(e)}"}, 500
