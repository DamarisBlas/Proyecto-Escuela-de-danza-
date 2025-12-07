from src.repositories.persona_repository import PersonaRepository
from src.models.profesor import Profesor
from src.models.alumno import Alumno
from src.models.alumno_femme import AlumnoFemme
from src.models.elenco import Elenco
from src.models.director import Director
from src.app import db

class PersonaService:
    """
    Servicio para lógica de negocio de Persona
    """

    @staticmethod
    def get_all_personas():
        """
        Obtiene todas las personas con campos específicos
        """
        try:
            personas = PersonaRepository.get_all()
            # Filtrar solo los campos solicitados
            personas_filtradas = []
            for persona in personas:
                persona_dict = {
                    'id_persona': persona.id_persona,
                    'nombre': persona.nombre,
                    'apellido_paterno': persona.apellido_paterno,
                    'apellido_materno': persona.apellido_materno,
                    'email': persona.email,
                    'celular': persona.celular,
                    'fecha_creacion': persona.fecha_creacion.isoformat() if persona.fecha_creacion else None,
                    'solicitud_user_especial': persona.solicitud_user_especial,
                    'estado': persona.estado,
                    'tipo_cuenta': persona.tipo_cuenta,
                    'temporal': persona.temporal
                }
                personas_filtradas.append(persona_dict)

            return personas_filtradas, 200
        except Exception as e:
            return {"error": f"Error al obtener personas: {str(e)}"}, 500

    @staticmethod
    def get_persona_by_id(persona_id):
        """
        Obtiene una persona por ID con campos específicos
        """
        try:
            persona = PersonaRepository.get_by_id(persona_id)
            if not persona:
                return {"error": "Persona no encontrada"}, 404

            persona_dict = {
                'id_persona': persona.id_persona,
                'nombre': persona.nombre,
                'apellido_paterno': persona.apellido_paterno,
                    'apellido_materno': persona.apellido_materno,
                'email': persona.email,
                'celular': persona.celular,
                'fecha_creacion': persona.fecha_creacion.isoformat() if persona.fecha_creacion else None,
                'solicitud_user_especial': persona.solicitud_user_especial,
                'estado': persona.estado,
                'tipo_cuenta': persona.tipo_cuenta,
                'temporal': persona.temporal
            }

            return persona_dict, 200
        except Exception as e:
            return {"error": f"Error al obtener persona: {str(e)}"}, 500
    def update_persona(persona_id, persona_data):
        """
        Actualiza una persona existente.
        Si tipo_cuenta se cambia a 'profesor' y no existe registro en Profesor, lo crea automáticamente.
        """
        try:
            # Verificar que la persona existe
            persona = PersonaRepository.get_by_id(persona_id)
            if not persona:
                return {"error": "Persona no encontrada"}, 404

            # Campos permitidos para actualizar (excluir campos sensibles)
            campos_permitidos = [
                'nombre', 'apellido_paterno', 'apellido_materno', 'email', 'celular',
                'solicitud_user_especial', 'estado', 'tipo_cuenta', 'temporal'
            ]

            # Filtrar solo los campos permitidos
            datos_actualizar = {}
            for campo in campos_permitidos:
                if campo in persona_data:
                    datos_actualizar[campo] = persona_data[campo]

            # Validar email si se está actualizando
            if 'email' in datos_actualizar and datos_actualizar['email']:
                # Verificar que el email no esté siendo usado por otra persona
                persona_existente = PersonaRepository.get_by_email(datos_actualizar['email'])
                if persona_existente and persona_existente.id_persona != persona_id:
                    return {"error": "El email ya está siendo usado por otra persona"}, 400

            # Validar nombre (requerido)
            if 'nombre' in datos_actualizar and not datos_actualizar['nombre']:
                return {"error": "El nombre no puede estar vacío"}, 400

            # Si se está cambiando a tipo_cuenta = 'profesor', verificar/crear/actualizar registro en Profesor
            crear_profesor = False
            actualizar_profesor = False
            desactivar_profesor = False
            
            if 'tipo_cuenta' in datos_actualizar and datos_actualizar['tipo_cuenta'] == 'profesor':
                # Verificar el campo 'activar' (por defecto True si no se especifica)
                activar = persona_data.get('activar', True)
                
                # Verificar si ya existe un registro de profesor para esta persona
                profesor_existente = db.session.query(Profesor).filter_by(
                    Persona_id_persona=persona_id
                ).first()
                
                if activar:
                    # Activar profesor
                    if profesor_existente:
                        # Si existe, actualizar su estado a True
                        profesor_existente.estado = True
                        actualizar_profesor = True
                    else:
                        # Si no existe, crear nuevo registro
                        crear_profesor = True
                else:
                    # Desactivar profesor
                    if profesor_existente:
                        profesor_existente.estado = False
                        desactivar_profesor = True

            # Actualizar la persona
            persona_actualizada = PersonaRepository.update(persona_id, datos_actualizar)
            
            # Crear registro de Profesor si es necesario
            if crear_profesor:
                nuevo_profesor = Profesor(
                    Persona_id_persona=persona_id,
                    frase=None,
                    descripcion=None,
                    redes_sociales=None,
                    pais_origen=None,
                    cuando_comenzo_danza=None,
                    signo=None,
                    musica=None,
                    estado=True  # Activar al profesor por defecto
                )
                db.session.add(nuevo_profesor)
                db.session.commit()
            elif actualizar_profesor or desactivar_profesor:
                db.session.commit()

            mensaje = "Persona actualizada exitosamente"
            if crear_profesor:
                mensaje += " y activada como profesor"
            elif actualizar_profesor:
                mensaje += " y profesor activado"
            elif desactivar_profesor:
                mensaje += " y profesor desactivado"
            
            return {
                "message": mensaje,
                "persona": {
                    'id_persona': persona_actualizada.id_persona,
                    'nombre': persona_actualizada.nombre,
                    'apellido_paterno': persona_actualizada.apellido_paterno,
                    'apellido_materno': persona_actualizada.apellido_materno,
                    'email': persona_actualizada.email,
                    'celular': persona_actualizada.celular,
                    'fecha_creacion': persona_actualizada.fecha_creacion.isoformat() if persona_actualizada.fecha_creacion else None,
                    'solicitud_user_especial': persona_actualizada.solicitud_user_especial,
                    'estado': persona_actualizada.estado,
                    'tipo_cuenta': persona_actualizada.tipo_cuenta,
                    'temporal': persona_actualizada.temporal
                },
                "profesor_creado": crear_profesor,
                "profesor_activado": actualizar_profesor,
                "profesor_desactivado": desactivar_profesor
            }, 200

        except Exception as e:
            db.session.rollback()
            return {"error": f"Error al actualizar persona: {str(e)}"}, 500

    @staticmethod
    def get_persona_detallada(persona_id):
        """
        Obtiene información detallada de una persona según su tipo_cuenta.
        Incluye todos los campos de Persona (excepto password) y campos específicos
        de la tabla de rol correspondiente (Profesor, Alumno, AlumnoFemme, Elenco, Director).
        """
        try:
            # Buscar persona por ID
            persona = PersonaRepository.get_by_id(persona_id)
            if not persona:
                return {"error": "Persona no encontrada"}, 404

            # Datos básicos de Persona (sin password)
            persona_dict = {
                'id_persona': persona.id_persona,
                'nombre': persona.nombre,
                'apellido_paterno': persona.apellido_paterno,
                'apellido_materno': persona.apellido_materno,
                'email': persona.email,
                'celular': persona.celular,
                'fecha_creacion': persona.fecha_creacion.isoformat() if persona.fecha_creacion else None,
                'solicitud_user_especial': persona.solicitud_user_especial,
                'estado': persona.estado,
                'tipo_cuenta': persona.tipo_cuenta,
                'temporal': persona.temporal
            }

            # Buscar datos específicos según tipo_cuenta
            role_data = None
            tipo_cuenta = persona.tipo_cuenta

            if tipo_cuenta == 'profesor':
                profesor = db.session.query(Profesor).filter_by(Persona_id_persona=persona_id).first()
                if profesor:
                    role_data = {
                        'Persona_id_persona': profesor.Persona_id_persona,
                        'frase': profesor.frase,
                        'descripcion': profesor.descripcion,
                        'redes_sociales': profesor.redes_sociales,
                        'pais_origen': profesor.pais_origen,
                        'cuando_comenzo_danza': profesor.cuando_comenzo_danza.isoformat() if profesor.cuando_comenzo_danza else None,
                        'signo': profesor.signo,
                        'musica': profesor.musica,
                        'estado_rol': profesor.estado
                    }
            
            elif tipo_cuenta == 'alumno':
                alumno = db.session.query(Alumno).filter_by(Persona_id_persona=persona_id).first()
                if alumno:
                    role_data = {
                        'Persona_id_persona': alumno.Persona_id_persona,
                        'departamento': alumno.departamento,
                        'estado_rol': alumno.estado
                    }
            
            elif tipo_cuenta == 'alumno_femme':
                alumno_femme = db.session.query(AlumnoFemme).filter_by(Persona_id_persona=persona_id).first()
                if alumno_femme:
                    role_data = {
                        'Persona_id_persona': alumno_femme.Persona_id_persona,
                        'cumpleanos': alumno_femme.cumpleanos.isoformat() if alumno_femme.cumpleanos else None,
                        'signo': alumno_femme.signo,
                        'departamento': alumno_femme.departamento,
                        'estado_rol': alumno_femme.estado
                    }
            
            elif tipo_cuenta == 'elenco':
                elenco = db.session.query(Elenco).filter_by(Persona_id_persona=persona_id).first()
                if elenco:
                    role_data = {
                        'Persona_id_persona': elenco.Persona_id_persona,
                        'departamento': elenco.departamento,
                        'cumpleanos': elenco.cumpleanos.isoformat() if elenco.cumpleanos else None,
                        'signo': elenco.signo,
                        'instagram': elenco.instagram,
                        'estado_rol': elenco.estado
                    }
            
            elif tipo_cuenta == 'director':
                director = db.session.query(Director).filter_by(Persona_id_persona=persona_id).first()
                if director:
                    role_data = {
                        'Persona_id_persona': director.Persona_id_persona,
                        'departamento': director.departamento,
                        'estado_rol': director.estado
                    }

            # Combinar datos de persona con datos de rol
            if role_data:
                persona_dict['datos_rol'] = role_data
            else:
                persona_dict['datos_rol'] = None

            return persona_dict, 200

        except Exception as e:
            return {"error": f"Error al obtener persona detallada: {str(e)}"}, 500