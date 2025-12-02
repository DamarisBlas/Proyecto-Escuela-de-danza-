from src.repositories.profesor_repository import ProfesorRepository

class ProfesorService:
    
    @staticmethod
    def get_all_profesores():
        """Obtiene todos los profesores con su información"""
        try:
            profesores = ProfesorRepository.get_all()
            
            if not profesores:
                return {"profesores": []}, 200
            
            profesores_data = []
            for profesor, persona in profesores:
                profesores_data.append({
                    "id_profesor": profesor.id_profesor,
                    "nombre": persona.nombre,
                    "apellido": persona.apellido,
                    "email": persona.email,
                    "celular": persona.celular,
                    "frase": profesor.frase,
                    "descripcion": profesor.descripcion,
                    "redes_sociales": profesor.redes_sociales,
                    "cuidad": profesor.cuidad,
                    "experiencia": profesor.experiencia,
                    "signo": profesor.signo,
                    "musica": profesor.musica,
                    "estilos": profesor.estilos,
                    "temporal": persona.temporal,
                    "estado": profesor.estado
                })
            
            return {"profesores": profesores_data}, 200
        
        except Exception as e:
            return {"error": f"Error al obtener profesores: {str(e)}"}, 500
    
    @staticmethod
    def get_profesores_activos():
        """Obtiene todos los profesores activos"""
        try:
            profesores = ProfesorRepository.get_active()
            
            if not profesores:
                return {"profesores": []}, 200
            
            profesores_data = []
            for profesor, persona in profesores:
                profesores_data.append({
                    "id_profesor": profesor.id_profesor,
                    "nombre": persona.nombre,
                    "apellido": persona.apellido,
                    "email": persona.email,
                    "celular": persona.celular,
                    "frase": profesor.frase,
                    "descripcion": profesor.descripcion,
                    "redes_sociales": profesor.redes_sociales,
                    "cuidad": profesor.cuidad,
                    "experiencia": profesor.experiencia,
                    "signo": profesor.signo,
                    "musica": profesor.musica,
                    "estilos": profesor.estilos,
                    "temporal": persona.temporal,
                    "estado": profesor.estado
                })
            
            return {"profesores": profesores_data}, 200
        
        except Exception as e:
            return {"error": f"Error al obtener profesores activos: {str(e)}"}, 500
    
    @staticmethod
    def get_profesores_temporales():
        """Obtiene todos los profesores temporales"""
        try:
            profesores = ProfesorRepository.get_temporales()
            
            if not profesores:
                return {"profesores": []}, 200
            
            profesores_data = []
            for profesor, persona in profesores:
                profesores_data.append({
                    "id_profesor": profesor.id_profesor,
                    "nombre": persona.nombre,
                    "apellido": persona.apellido,
                    "email": persona.email,
                    "celular": persona.celular,
                    "frase": profesor.frase,
                    "descripcion": profesor.descripcion,
                    "redes_sociales": profesor.redes_sociales,
                    "cuidad": profesor.cuidad,
                    "experiencia": profesor.experiencia,
                    "signo": profesor.signo,
                    "musica": profesor.musica,
                    "estilos": profesor.estilos,
                    "temporal": persona.temporal,
                    "estado": profesor.estado
                })
            
            return {"profesores": profesores_data}, 200
        
        except Exception as e:
            return {"error": f"Error al obtener profesores temporales: {str(e)}"}, 500
    
    @staticmethod
    def get_profesor_by_id(profesor_id):
        """Obtiene un profesor por ID"""
        try:
            result = ProfesorRepository.get_profesor_with_persona(profesor_id)
            
            if not result:
                return {"error": "Profesor no encontrado"}, 404
            
            profesor, persona = result
            
            profesor_data = {
                "id_profesor": profesor.id_profesor,
                "nombre": persona.nombre,
                "apellido": persona.apellido,
                "email": persona.email,
                "celular": persona.celular,
                "frase": profesor.frase,
                "descripcion": profesor.descripcion,
                "redes_sociales": profesor.redes_sociales,
                "cuidad": profesor.cuidad,
                "experiencia": profesor.experiencia,
                "signo": profesor.signo,
                "musica": profesor.musica,
                "estilos": profesor.estilos,
                "temporal": persona.temporal,
                "estado": profesor.estado
            }
            
            return {"profesor": profesor_data}, 200
        
        except Exception as e:
            return {"error": f"Error al obtener profesor: {str(e)}"}, 500
    
    @staticmethod
    def create_profesor_temporal(data):
        """Crea un profesor temporal (sin cuenta)"""
        try:
            # Validar campos requeridos
            if not data.get('nombre'):
                return {"error": "El nombre es requerido"}, 400
            
            # Crear persona temporal
            persona_data = {
                'nombre': data.get('nombre'),
                'apellido': data.get('apellido'),
                'email': None,
                'celular': None,
                'password': None,
                'estado': False,  # Sin cuenta activa
                'temporal': True,  # Marca como temporal
                'tipo_cuenta': 'profesor'
            }
            
            persona = ProfesorRepository.create_persona(persona_data)
            
            # Crear profesor
            profesor_data = {
                'Persona_id_persona': persona.id_persona,
                'frase': data.get('frase'),
                'descripcion': data.get('descripcion'),
                'redes_sociales': data.get('redes_sociales'),
                'cuidad': data.get('cuidad'),
                'experiencia': data.get('experiencia'),
                'signo': data.get('signo'),
                'musica': data.get('musica'),
                'estilos': data.get('estilos'),
                'estado': True  # Profesor activo
            }
            
            profesor = ProfesorRepository.create_profesor(profesor_data)
            
            return {
                "message": "Profesor temporal creado exitosamente",
                "profesor": {
                    "id_profesor": profesor.id_profesor,
                    "nombre": persona.nombre,
                    "apellido": persona.apellido,
                    "redes_sociales": profesor.redes_sociales,
                    "cuidad": profesor.cuidad,
                    "experiencia": profesor.experiencia,
                    "frase": profesor.frase,
                    "descripcion": profesor.descripcion,
                    "signo": profesor.signo,
                    "musica": profesor.musica,
                    "estilos": profesor.estilos,
                    "temporal": True,
                    "estado": True
                }
            }, 201
        
        except Exception as e:
            return {"error": f"Error al crear profesor temporal: {str(e)}"}, 500
    
    @staticmethod
    def update_profesor(profesor_id, data):
        """Actualiza un profesor"""
        try:
            result = ProfesorRepository.get_profesor_with_persona(profesor_id)
            
            if not result:
                return {"error": "Profesor no encontrado"}, 404
            
            profesor, persona = result
            
            # Actualizar datos de persona si vienen en el request
            persona_updates = {}
            if 'nombre' in data:
                persona_updates['nombre'] = data['nombre']
            if 'apellido' in data:
                persona_updates['apellido'] = data['apellido']
            if 'email' in data:
                persona_updates['email'] = data['email']
            if 'celular' in data:
                persona_updates['celular'] = data['celular']
            
            if persona_updates:
                ProfesorRepository.update_persona(persona, persona_updates)
            
            # Actualizar datos de profesor
            profesor_updates = {}
            campos_profesor = ['frase', 'descripcion', 'redes_sociales', 'cuidad', 
                              'experiencia', 'signo', 'musica', 'estilos']
            
            for campo in campos_profesor:
                if campo in data:
                    profesor_updates[campo] = data[campo]
            
            if profesor_updates:
                ProfesorRepository.update_profesor(profesor, profesor_updates)
            
            # Obtener datos actualizados
            result_updated = ProfesorRepository.get_profesor_with_persona(profesor_id)
            profesor_updated, persona_updated = result_updated
            
            return {
                "message": "Profesor actualizado exitosamente",
                "profesor": {
                    "id_profesor": profesor_updated.id_profesor,
                    "nombre": persona_updated.nombre,
                    "apellido": persona_updated.apellido,
                    "email": persona_updated.email,
                    "celular": persona_updated.celular,
                    "frase": profesor_updated.frase,
                    "descripcion": profesor_updated.descripcion,
                    "redes_sociales": profesor_updated.redes_sociales,
                    "cuidad": profesor_updated.cuidad,
                    "experiencia": profesor_updated.experiencia,
                    "signo": profesor_updated.signo,
                    "musica": profesor_updated.musica,
                    "estilos": profesor_updated.estilos,
                    "temporal": persona_updated.temporal,
                    "estado": profesor_updated.estado
                }
            }, 200
        
        except Exception as e:
            return {"error": f"Error al actualizar profesor: {str(e)}"}, 500
    
    @staticmethod
    def delete_profesor(profesor_id):
        """Elimina un profesor de forma lógica"""
        try:
            profesor = ProfesorRepository.get_by_id(profesor_id)
            
            if not profesor:
                return {"error": "Profesor no encontrado"}, 404
            
            # Eliminación lógica
            ProfesorRepository.delete(profesor_id)
            
            return {"message": "Profesor eliminado exitosamente"}, 200
        
        except Exception as e:
            return {"error": f"Error al eliminar profesor: {str(e)}"}, 500

    @staticmethod
    def get_profesor_by_persona_id(persona_id):
        """
        Busca si una persona es profesor y devuelve sus datos
        
        Args:
            persona_id (int): ID de la persona
            
        Returns:
            dict: Datos del profesor si existe, o mensaje indicando que no es profesor
        """
        try:
            if not persona_id or persona_id <= 0:
                return {"error": "ID de persona inválido"}, 400
            
            # Buscar profesor por ID de persona
            profesor = ProfesorRepository.get_by_persona_id(persona_id)
            
            if not profesor:
                return {
                    "es_profesor": False,
                    "mensaje": "Esta persona no es un profesor registrado",
                    "persona_id": persona_id
                }, 200
            
            # Si existe, devolver los datos del profesor
            profesor_data = {
                "es_profesor": True,
                "id_profesor": profesor.id_profesor,
                "persona_id": profesor.Persona_id_persona,
                "frase": profesor.frase,
                "descripcion": profesor.descripcion,
                "redes_sociales": profesor.redes_sociales,
                "cuidad": profesor.cuidad,
                "experiencia": profesor.experiencia,
                "signo": profesor.signo,
                "musica": profesor.musica,
                "estilos": profesor.estilos,
                "estado": profesor.estado
            }
            
            return profesor_data, 200
            
        except Exception as e:
            return {"error": f"Error al buscar profesor: {str(e)}"}, 500
