from src.repositories.horario_repository import HorarioRepository
from src.repositories.oferta_repository import OfertaRepository
from src.models.horario_sesion import HorarioSesion
from src.app import db
from datetime import datetime, timedelta

class HorarioService:
    """paquetes
    Manejo de errores para formato de fecha 
    Servicio para lógica de negocio de Horario
    """

    @staticmethod
    def get_all_horarios():
        """
        Obtiene todos los horarios
        """
        try:
            horarios = HorarioRepository.get_all()
            return [horario.to_dict() for horario in horarios], 200
        except Exception as e:
            return {"error": f"Error al obtener horarios: {str(e)}"}, 500

    @staticmethod
    def get_horario_by_id(horario_id):
        """
        Obtiene un horario por ID
        """
        try:
            horario = HorarioRepository.get_by_id(horario_id)
            if not horario:
                return {"error": "Horario no encontrado"}, 404
            return horario.to_dict(), 200
        except Exception as e:
            return {"error": f"Error al obtener horario: {str(e)}"}, 500

    @staticmethod
    def get_active_horarios():
        """
        Obtiene todos los horarios activos
        """
        try:
            horarios = HorarioRepository.get_active()
            return [horario.to_dict() for horario in horarios], 200
        except Exception as e:
            return {"error": f"Error al obtener horarios activos: {str(e)}"}, 500

    @staticmethod
    def get_horarios_by_oferta(oferta_id):
        """
        Obtiene todos los horarios de una oferta
        """
        try:
            horarios = HorarioRepository.get_by_oferta(oferta_id)
            return [horario.to_dict() for horario in horarios], 200
        except Exception as e:
            return {"error": f"Error al obtener horarios de la oferta: {str(e)}"}, 500

    @staticmethod
    def create_horario(horario_data):
        """
        Crea un nuevo horario y genera automáticamente sus sesiones
        """
        try:
            # Validaciones
            required_fields = ['oferta_id', 'estilo_id', 'nivel', 'profesor_id', 
                             'sala_id', 'capacidad', 'dias', 'hora_inicio', 'hora_fin']
            if not all(field in horario_data for field in required_fields):
                return {"error": "Faltan campos requeridos"}, 400

            # Obtener la oferta para las fechas
            oferta = OfertaRepository.get_by_id(horario_data['oferta_id'])
            if not oferta:
                return {"error": "Oferta no encontrada"}, 404

            # Convertir días de array a string: [1,3,5] -> "1,3,5"
            if isinstance(horario_data['dias'], list):
                horario_data['dias'] = ','.join(map(str, horario_data['dias']))

            # Crear el horario
            horario = HorarioRepository.create(horario_data)

            # Generar sesiones automáticamente (siempre)
            sesiones_creadas = HorarioService._generar_sesiones(
                horario, 
                oferta.fecha_inicio, 
                oferta.fecha_fin,
                horario_data['hora_inicio'],
                horario_data['hora_fin'],
                oferta.repite_semanalmente
            )

            db.session.commit()

            return {
                "message": "Horario creado exitosamente",
                "horario": horario.to_dict(),
                "sesiones_creadas": len(sesiones_creadas),
                "sesiones": [s.to_dict() for s in sesiones_creadas[:5]]  # Primeras 5 como muestra
            }, 201

        except Exception as e:
            db.session.rollback()
            return {"error": f"Error al crear horario: {str(e)}"}, 500

    @staticmethod
    def _generar_sesiones(horario, fecha_inicio, fecha_fin, hora_inicio_str, hora_fin_str, repite_semanalmente=True):
        """
        Genera sesiones automáticamente basándose en los días y fechas
        
        Args:
            horario: Objeto Horario
            fecha_inicio: Fecha de inicio del rango
            fecha_fin: Fecha de fin del rango
            hora_inicio_str: Hora de inicio en formato "HH:MM"
            hora_fin_str: Hora de fin en formato "HH:MM"
            repite_semanalmente: Si es True, genera sesiones recurrentes. 
                                Si es False, genera solo una sesión por cada día seleccionado en el rango.
        
        Ejemplos:
            - Curso Regular (repite_semanalmente=True):
              Fechas: 1 oct - 30 oct, Días: [2] (Martes)
              Genera: 7 oct, 14 oct, 21 oct, 28 oct (todos los martes)
            
            - Taller/Intensivo (repite_semanalmente=False):
              Fechas: 1-2 nov, Días: [6,7] (Sábado, Domingo)
              Genera: 1 nov (Sábado), 2 nov (Domingo) (solo una vez cada día)
        """
        # Convertir string de días a lista: "1,3,5" -> [1, 3, 5]
        dias_seleccionados = [int(d) for d in horario.dias.split(',')]
        
        # Calcular duración en horas
        hora_inicio = datetime.strptime(hora_inicio_str, "%H:%M")
        hora_fin = datetime.strptime(hora_fin_str, "%H:%M")
        duracion = (hora_fin - hora_inicio).total_seconds() / 3600

        sesiones = []
        fecha_actual = fecha_inicio

        if repite_semanalmente:
            # MODO RECURRENTE: Genera sesiones que se repiten semanalmente
            # Ejemplo: Curso regular - Todos los martes de octubre
            while fecha_actual <= fecha_fin:
                # weekday() retorna 0=Lunes, 6=Domingo
                # Convertimos a nuestro formato: 1=Lunes, 7=Domingo
                dia_semana = fecha_actual.weekday() + 1

                if dia_semana in dias_seleccionados:
                    sesion = HorarioSesion(
                        Horario_id_horario=horario.id_horario,
                        dia=dia_semana,
                        hora_inicio=hora_inicio_str,
                        hora_fin=hora_fin_str,
                        duracion=duracion,
                        fecha=fecha_actual,
                        cancelado=False,
                        motivo=None,
                        estado=True,
                        capacidad_maxima=horario.capacidad,  # ✅ Heredar capacidad del horario
                        cupos_ocupados=0  # ✅ Inicializar en 0
                    )
                    db.session.add(sesion)
                    sesiones.append(sesion)

                fecha_actual += timedelta(days=1)
        else:
            # MODO ÚNICO: Genera sesiones solo una vez por cada día seleccionado
            # Ejemplo: Taller intensivo - Solo sábado 1 nov y domingo 2 nov
            dias_ya_creados = set()  # Para evitar duplicados
            
            while fecha_actual <= fecha_fin:
                dia_semana = fecha_actual.weekday() + 1

                # Solo crea la sesión si el día está seleccionado Y no se ha creado antes
                if dia_semana in dias_seleccionados and dia_semana not in dias_ya_creados:
                    sesion = HorarioSesion(
                        Horario_id_horario=horario.id_horario,
                        dia=dia_semana,
                        hora_inicio=hora_inicio_str,
                        hora_fin=hora_fin_str,
                        duracion=duracion,
                        fecha=fecha_actual,
                        cancelado=False,
                        motivo=None,
                        estado=True,
                        capacidad_maxima=horario.capacidad,  # ✅ Heredar capacidad del horario
                        cupos_ocupados=0  # ✅ Inicializar en 0
                    )
                    db.session.add(sesion)
                    sesiones.append(sesion)
                    dias_ya_creados.add(dia_semana)  # Marcar como creado

                fecha_actual += timedelta(days=1)

        return sesiones

    @staticmethod
    def update_horario(horario_id, horario_data):
        """
        Actualiza un horario existente y regenera sus sesiones si es necesario
        """
        try:
            # Verificar que el horario existe
            existing_horario = HorarioRepository.get_by_id(horario_id)
            if not existing_horario:
                return {"error": "Horario no encontrado"}, 404

            # Convertir días si viene como array
            if 'dias' in horario_data and isinstance(horario_data['dias'], list):
                horario_data['dias'] = ','.join(map(str, horario_data['dias']))

            # Verificar si se actualizaron campos que afectan las sesiones
            regenerar_sesiones = any(key in horario_data for key in ['dias', 'hora_inicio', 'hora_fin'])

            # Actualizar el horario
            horario = HorarioRepository.update(horario_id, horario_data)

            # Si cambió días u horarios, regenerar sesiones
            sesiones_regeneradas = 0
            if regenerar_sesiones:
                # Obtener la oferta para las fechas
                oferta = OfertaRepository.get_by_id(horario.Oferta_id_oferta)
                
                if oferta:
                    # Eliminar sesiones existentes (lógicamente)
                    HorarioService._eliminar_sesiones_horario(horario_id)
                    
                    # Regenerar sesiones con los nuevos datos
                    sesiones = HorarioService._generar_sesiones(
                        horario, 
                        oferta.fecha_inicio, 
                        oferta.fecha_fin,
                        horario.hora_inicio.strftime('%H:%M'),
                        horario.hora_fin.strftime('%H:%M'),
                        oferta.repite_semanalmente
                    )
                    sesiones_regeneradas = len(sesiones)

            db.session.commit()

            return {
                "message": "Horario actualizado exitosamente",
                "horario": horario.to_dict(),
                "sesiones_regeneradas": sesiones_regeneradas if regenerar_sesiones else 0
            }, 200

        except Exception as e:
            db.session.rollback()
            return {"error": f"Error al actualizar horario: {str(e)}"}, 500

    @staticmethod
    def _eliminar_sesiones_horario(horario_id):
        """
        Elimina (lógicamente) todas las sesiones de un horario
        """
        sesiones = HorarioSesion.query.filter_by(Horario_id_horario=horario_id).all()
        for sesion in sesiones:
            sesion.estado = False
        # No hacemos commit aquí, se hace en el método que llama

    @staticmethod
    def delete_horario(horario_id):
        """
        Elimina un horario (borrado lógico)
        """
        try:
            horario = HorarioRepository.delete(horario_id)
            if not horario:
                return {"error": "Horario no encontrado"}, 404

            return {"message": "Horario eliminado exitosamente"}, 200

        except Exception as e:
            return {"error": f"Error al eliminar horario: {str(e)}"}, 500

    @staticmethod
    def get_horarios_by_profesor(profesor_id):
        """
        Obtiene todos los horarios de un profesor con información completa
        
        Incluye datos detallados de:
        - Oferta (nombre, ciclo con nombre, subcategoria, categoria, programa)
        - Sala (todos los datos)
        - Estilo (todos los datos)
        - Total de inscritos por horario (calculado desde asistencias activas)
        """
        try:
            if not profesor_id or profesor_id <= 0:
                return {"error": "ID de profesor inválido"}, 400
            
            # Obtener horarios con joins a las tablas relacionadas
            horarios_completos = HorarioRepository.get_horarios_completos_by_profesor(profesor_id)
            
            if not horarios_completos:
                return {"horarios": [], "mensaje": "El profesor no tiene horarios asignados"}, 200
            
            # Formatear la respuesta con información completa
            horarios_formateados = []
            for horario, oferta, ciclo, sala, estilo, subcategoria, categoria, programa, total_inscritos in horarios_completos:
                horario_dict = {
                    "id_horario": horario.id_horario,
                    "nivel": horario.nivel,
                    "capacidad": horario.capacidad,
                    "estado": horario.estado,
                    "dias": horario.dias,
                    "hora_inicio": horario.hora_inicio.strftime('%H:%M') if horario.hora_inicio else None,
                    "hora_fin": horario.hora_fin.strftime('%H:%M') if horario.hora_fin else None,
                    "total_inscritos": int(total_inscritos),  # Cantidad total de inscritos en todas las sesiones del horario
                    
                    # Información completa de la oferta
                    "oferta": {
                        "id_oferta": oferta.id_oferta,
                        "nombre_oferta": oferta.nombre_oferta,
                        "descripcion": oferta.descripcion,
                        "fecha_inicio": oferta.fecha_inicio.isoformat() if oferta.fecha_inicio else None,
                        "fecha_fin": oferta.fecha_fin.isoformat() if oferta.fecha_fin else None,
                        "estado": oferta.estado,
                        "cantidad_cursos": oferta.cantidad_cursos,
                        "publico_objetivo": oferta.publico_objetivo,
                        "repite_semanalmente": oferta.repite_semanalmente,
                        "ciclo": {
                            "id_ciclo": ciclo.id_ciclo,
                            "nombre_ciclo": ciclo.nombre
                        } if ciclo else None
                        ,
                        # Subcategoria, Categoria y Programa asociados a la oferta
                        "subcategoria": {
                            "id_subcategoria": subcategoria.id_subcategoria,
                            "nombre_subcategoria": subcategoria.nombre_subcategoria
                        } if subcategoria else None,
                        "categoria": {
                            "id_categoria": categoria.id_categoria,
                            "nombre_categoria": categoria.nombre_categoria
                        } if categoria else None,
                        "programa": {
                            "id_programa": programa.id_programa,
                            "nombre_programa": programa.nombre_programa
                        } if programa else None
                    },
                    
                    # Información completa de la sala
                    "sala": {
                        "id_sala": sala.id_sala,
                        "nombre_sala": sala.nombre_sala,
                        "ubicacion": sala.ubicacion,
                        "link_ubicacion": sala.link_ubicacion,
                        "departamento": sala.departamento,
                        "zona": sala.zona,
                        "estado": sala.estado
                    } if sala else None,
                    
                    # Información completa del estilo
                    "estilo": {
                        "id_estilo": estilo.id_estilo,
                        "nombre_estilo": estilo.nombre_estilo,
                        "descripcion_estilo": estilo.descripcion_estilo,
                        "beneficios_estilo": estilo.beneficios_estilo,
                        "estado": estilo.estado
                    } if estilo else None
                }
                horarios_formateados.append(horario_dict)
            
            return {
                "horarios": horarios_formateados,
                "total_horarios": len(horarios_formateados),
                "profesor_id": profesor_id
            }, 200
            
        except Exception as e:
            return {"error": f"Error al obtener horarios del profesor: {str(e)}"}, 500

    @staticmethod
    def get_todos_horarios_detallados():
        """
        Obtiene todos los horarios con información detallada completa:
        - Profesor: nombre, apellido, email, celular
        - Sala: nombre, ubicación
        - Estilo: nombre
        - Oferta: nombre
        - Ciclo: nombre
        - Subcategoria: nombre
        - Categoria: nombre
        - Programa: nombre
        - Días transformados a nombres (1=Lunes, 2=Martes, etc.)
        - Total de inscritos por horario
        """
        try:
            # Obtener horarios con joins a todas las tablas relacionadas
            horarios_completos = HorarioRepository.get_todos_horarios_detallados()

            if not horarios_completos:
                return {"horarios": [], "mensaje": "No hay horarios disponibles"}, 200

            # Función para transformar días
            def transformar_dias(dias_str):
                if not dias_str:
                    return ""
                dias_map = {
                    '1': 'Lunes',
                    '2': 'Martes',
                    '3': 'Miércoles',
                    '4': 'Jueves',
                    '5': 'Viernes',
                    '6': 'Sábado',
                    '7': 'Domingo'
                }
                dias_lista = [d.strip() for d in dias_str.split(',')]
                dias_nombres = [dias_map.get(d, d) for d in dias_lista]
                return ', '.join(dias_nombres)

            # Formatear la respuesta con información completa
            horarios_formateados = []
            for horario, profesor, persona, sala, estilo, oferta, ciclo, subcategoria, categoria, programa, total_inscritos in horarios_completos:
                horario_dict = {
                    "id_horario": horario.id_horario,
                    "nivel": horario.nivel,
                    "capacidad": horario.capacidad,
                    "estado": horario.estado,
                    "dias": transformar_dias(horario.dias),  # Transformar números a nombres de días
                    "hora_inicio": horario.hora_inicio.strftime('%H:%M') if horario.hora_inicio else None,
                    "hora_fin": horario.hora_fin.strftime('%H:%M') if horario.hora_fin else None,
                    "total_inscritos": int(total_inscritos),  # Cantidad total de inscritos en todas las sesiones del horario

                    # Información completa del profesor
                    "profesor": {
                        "id_profesor": profesor.id_profesor,
                        "estado": profesor.estado,
                        "persona": {
                            "id_persona": persona.id_persona,
                            "nombre": persona.nombre,
                            "apellido": persona.apellido,
                            "email": persona.email,
                            "celular": persona.celular,
                            "estado": persona.estado
                        } if persona else None
                    } if profesor else None,

                    # Información completa de la oferta
                    "oferta": {
                        "id_oferta": oferta.id_oferta,
                        "nombre_oferta": oferta.nombre_oferta,
                        "descripcion": oferta.descripcion,
                        "fecha_inicio": oferta.fecha_inicio.isoformat() if oferta.fecha_inicio else None,
                        "fecha_fin": oferta.fecha_fin.isoformat() if oferta.fecha_fin else None,
                        "estado": oferta.estado,
                        "cantidad_cursos": oferta.cantidad_cursos,
                        "publico_objetivo": oferta.publico_objetivo,
                        "repite_semanalmente": oferta.repite_semanalmente,
                        "ciclo": {
                            "id_ciclo": ciclo.id_ciclo,
                            "nombre_ciclo": ciclo.nombre
                        } if ciclo else None,
                        # Subcategoria, Categoria y Programa asociados a la oferta
                        "subcategoria": {
                            "id_subcategoria": subcategoria.id_subcategoria,
                            "nombre_subcategoria": subcategoria.nombre_subcategoria
                        } if subcategoria else None,
                        "categoria": {
                            "id_categoria": categoria.id_categoria,
                            "nombre_categoria": categoria.nombre_categoria
                        } if categoria else None,
                        "programa": {
                            "id_programa": programa.id_programa,
                            "nombre_programa": programa.nombre_programa
                        } if programa else None
                    } if oferta else None,

                    # Información completa de la sala
                    "sala": {
                        "id_sala": sala.id_sala,
                        "nombre_sala": sala.nombre_sala,
                        "ubicacion": sala.ubicacion,
                        "link_ubicacion": sala.link_ubicacion,
                        "departamento": sala.departamento,
                        "zona": sala.zona,
                        "estado": sala.estado
                    } if sala else None,

                    # Información completa del estilo
                    "estilo": {
                        "id_estilo": estilo.id_estilo,
                        "nombre_estilo": estilo.nombre_estilo,
                        "descripcion_estilo": estilo.descripcion_estilo,
                        "beneficios_estilo": estilo.beneficios_estilo,
                        "estado": estilo.estado
                    } if estilo else None
                }
                horarios_formateados.append(horario_dict)

            return {
                "horarios": horarios_formateados,
                "total_horarios": len(horarios_formateados)
            }, 200

        except Exception as e:
            return {"error": f"Error al obtener horarios detallados: {str(e)}"}, 500

    @staticmethod
    def marcado_automatico(fecha_inicio, fecha_fin, horarios_ids, cantidad_clases):
        """
        Selecciona automáticamente los IDs de horario_sesion basándose en:
        - fecha_inicio: fecha de inicio del periodo
        - fecha_fin: fecha final del periodo
        - horarios_ids: lista de IDs de horarios seleccionados por el usuario
        - cantidad_clases: número de clases del paquete (ilimitado si None)
        
        Retorna los IDs de sesiones ordenados por fecha que cumplan:
        - Pertenezcan a los horarios especificados
        - Estén dentro del rango de fechas
        - Estén activas y no canceladas
        - Tengan cupos disponibles
        - No excedan la cantidad de clases del paquete
        """
        try:
            from datetime import datetime
            
            # Validar parámetros
            if not horarios_ids or not isinstance(horarios_ids, list):
                return {"error": "horarios_ids debe ser una lista no vacía"}, 400
            
            # Convertir fechas de string a date
            try:
                fecha_inicio_dt = datetime.strptime(fecha_inicio, '%Y-%m-%d').date()
                fecha_fin_dt = datetime.strptime(fecha_fin, '%Y-%m-%d').date()
            except ValueError:
                return {"error": "Formato de fecha inválido. Use YYYY-MM-DD"}, 400
            
            if fecha_inicio_dt > fecha_fin_dt:
                return {"error": "fecha_inicio no puede ser mayor que fecha_fin"}, 400
            
            # Buscar sesiones que cumplan los criterios
            sesiones = db.session.query(HorarioSesion).filter(
                HorarioSesion.Horario_id_horario.in_(horarios_ids),
                HorarioSesion.fecha >= fecha_inicio_dt,
                HorarioSesion.fecha <= fecha_fin_dt,
                HorarioSesion.estado == True,
                HorarioSesion.cancelado == False
            ).order_by(HorarioSesion.fecha, HorarioSesion.hora_inicio).all()
            
            # Filtrar sesiones con cupos disponibles
            sesiones_disponibles = [
                s for s in sesiones 
                if (s.capacidad_maxima - s.cupos_ocupados) > 0
            ]
            
            # Limitar según cantidad de clases del paquete
            if cantidad_clases is not None and cantidad_clases > 0:
                sesiones_seleccionadas = sesiones_disponibles[:cantidad_clases]
            else:
                # Paquete ilimitado: tomar todas las sesiones disponibles
                sesiones_seleccionadas = sesiones_disponibles
            
            # Extraer solo los IDs y construir respuesta detallada
            sesiones_info = []
            ids_seleccionados = []
            
            for sesion in sesiones_seleccionadas:
                ids_seleccionados.append(sesion.id_horario_sesion)
                sesiones_info.append({
                    "id_horario_sesion": sesion.id_horario_sesion,
                    "horario_id": sesion.Horario_id_horario,
                    "fecha": sesion.fecha.isoformat(),
                    "dia": sesion.dia,
                    "hora_inicio": sesion.hora_inicio.strftime('%H:%M'),
                    "hora_fin": sesion.hora_fin.strftime('%H:%M'),
                    "cupos_disponibles": sesion.capacidad_maxima - sesion.cupos_ocupados,
                    "capacidad_maxima": sesion.capacidad_maxima
                })
            
            return {
                "ids_horario_sesion": ids_seleccionados,
                "total_sesiones_seleccionadas": len(ids_seleccionados),
                "cantidad_clases_paquete": cantidad_clases if cantidad_clases else "ilimitado",
                "sesiones_disponibles_totales": len(sesiones_disponibles),
                "fecha_inicio": fecha_inicio,
                "fecha_fin": fecha_fin,
                "horarios_consultados": horarios_ids,
                "sesiones_detalle": sesiones_info
            }, 200
            
        except Exception as e:
            return {"error": f"Error en marcado automático: {str(e)}"}, 500

    @staticmethod
    def get_horarios_cursos_regulares_vigentes():
        """
        Obtiene los horarios de cursos regulares del ciclo activo vigente
        Filtra por:
        - Oferta con estado=true
        - Subcategoría nombre='Regular'
        - Ciclo con estado=true y activo=true
        - Oferta vigente (fecha actual entre fecha_inicio y fecha_fin)
        
        Retorna información completa de la oferta vigente con todos sus horarios y datos relacionados
        """
        try:
            from src.models.oferta import Oferta
            from src.models.subcategoria import Subcategoria
            from src.models.categoria import Categoria
            from src.models.programa import Programa
            from src.models.horario import Horario
            from src.models.estilo import Estilo
            from src.models.profesor import Profesor
            from src.models.persona import Persona
            from src.models.sala import Sala
            from datetime import date
            
            # Importar Ciclo directamente desde el módulo
            from src.app import db as database
            from sqlalchemy import Table, MetaData
            
            fecha_actual = date.today()
            
            # Acceder a la tabla ciclo directamente
            metadata = MetaData()
            metadata.reflect(bind=database.engine)
            tabla_ciclo = metadata.tables['ciclo']
            
            # Query complejo con todos los joins necesarios
            ofertas_query = database.session.query(
                Oferta, 
                tabla_ciclo.c.id_ciclo,
                tabla_ciclo.c.nombre,
                tabla_ciclo.c.inicio,
                tabla_ciclo.c.fin,
                tabla_ciclo.c.estado.label('ciclo_estado'),
                tabla_ciclo.c.activo,
                Subcategoria, 
                Categoria, 
                Programa
            ).join(
                tabla_ciclo, Oferta.ciclo_id_ciclo == tabla_ciclo.c.id_ciclo
            ).join(
                Subcategoria, Oferta.Subcategoria_id_subcategoria == Subcategoria.id_subcategoria
            ).join(
                Categoria, Subcategoria.Categoria_id_categoria == Categoria.id_categoria
            ).join(
                Programa, Categoria.Programa_id_programa == Programa.id_programa
            ).filter(
                Oferta.estado == True,
                Subcategoria.nombre_subcategoria == 'Regular',
                tabla_ciclo.c.estado == True,
                tabla_ciclo.c.activo == True,
                Oferta.fecha_inicio <= fecha_actual,
                Oferta.fecha_fin >= fecha_actual
            ).all()
            
            if not ofertas_query:
                return {
                    "mensaje": "No se encontró ninguna oferta de curso regular vigente",
                    "fecha_actual": fecha_actual.isoformat()
                }, 404
            
            # Si hay múltiples ofertas, tomar la primera (debería ser solo una por el filtro de fechas)
            resultado_query = ofertas_query[0]
            oferta = resultado_query[0]
            ciclo_id = resultado_query[1]
            ciclo_nombre = resultado_query[2]
            ciclo_inicio = resultado_query[3]
            ciclo_fin = resultado_query[4]
            ciclo_estado = resultado_query[5]
            ciclo_activo = resultado_query[6]
            subcategoria = resultado_query[7]
            categoria = resultado_query[8]
            programa = resultado_query[9]
            
            # Obtener todos los horarios activos de esta oferta con información completa
            horarios_query = db.session.query(
                Horario, Estilo, Profesor, Persona, Sala
            ).join(
                Estilo, Horario.Estilo_id_estilo == Estilo.id_estilo
            ).join(
                Profesor, Horario.Profesor_id_profesor == Profesor.Persona_id_persona
            ).join(
                Persona, Profesor.Persona_id_persona == Persona.id_persona
            ).join(
                Sala, Horario.Sala_id_sala == Sala.id_sala
            ).filter(
                Horario.Oferta_id_oferta == oferta.id_oferta,
                Horario.estado == True
            ).order_by(
                Horario.dias,
                Horario.hora_inicio
            ).all()
            
            # Formatear horarios
            horarios_detallados = []
            for horario, estilo, profesor, persona, sala in horarios_query:
                # Convertir días de string a lista de nombres
                dias_numeros = [int(d.strip()) for d in horario.dias.split(',')]
                dias_nombres = {
                    1: 'Lunes',
                    2: 'Martes', 
                    3: 'Miércoles',
                    4: 'Jueves',
                    5: 'Viernes',
                    6: 'Sábado',
                    7: 'Domingo'
                }
                dias_texto = ', '.join([dias_nombres.get(d, str(d)) for d in dias_numeros])
                
                horario_dict = {
                    "id_horario": horario.id_horario,
                    "estilo": {
                        "id_estilo": estilo.id_estilo,
                        "nombre_estilo": estilo.nombre_estilo,
                        "descripcion_estilo": estilo.descripcion_estilo,
                        "beneficios_estilo": estilo.beneficios_estilo
                    },
                    "nivel": horario.nivel,
                    "profesor": {
                        "id_profesor": profesor.id_profesor,
                        "nombre": persona.nombre,
                        "apellido": persona.apellido
                    },
                    "sala": {
                        "id_sala": sala.id_sala,
                        "nombre_sala": sala.nombre_sala,
                        "zona": sala.zona
                    },
                    "dias": dias_texto,
                    "dias_numeros": dias_numeros,
                    "hora_inicio": horario.hora_inicio.strftime('%H:%M') if horario.hora_inicio else None,
                    "hora_fin": horario.hora_fin.strftime('%H:%M') if horario.hora_fin else None,
                    "capacidad": horario.capacidad
                }
                horarios_detallados.append(horario_dict)
            
            # Construir respuesta completa
            resultado = {
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
                    "id_ciclo": ciclo_id,
                    "nombre": ciclo_nombre,
                    "inicio": ciclo_inicio.isoformat() if ciclo_inicio else None,
                    "fin": ciclo_fin.isoformat() if ciclo_fin else None
                },
                "subcategoria": {
                    "id_subcategoria": subcategoria.id_subcategoria,
                    "nombre_subcategoria": subcategoria.nombre_subcategoria
                },
                "categoria": {
                    "id_categoria": categoria.id_categoria,
                    "nombre_categoria": categoria.nombre_categoria
                },
                "programa": {
                    "id_programa": programa.id_programa,
                    "nombre_programa": programa.nombre_programa
                },
                "total_horarios": len(horarios_detallados),
                "horarios": horarios_detallados,
                "fecha_consulta": fecha_actual.isoformat()
            }
            
            return resultado, 200
            
        except Exception as e:
            return {"error": f"Error al obtener horarios de cursos regulares: {str(e)}"}, 500
