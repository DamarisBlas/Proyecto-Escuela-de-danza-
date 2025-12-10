from src.repositories.promocion_repository import PromocionRepository
from src.repositories.premio_repository import PremioRepository
from src.models.promocion import Promocion
from src.app import db
from datetime import datetime, date

class PromocionService:
    """
    Servicio para lógica de negocio de Promocion
    """

    @staticmethod
    def get_all_promociones():
        """
        Obtiene todas las promociones
        """
        try:
            promociones = PromocionRepository.get_all()
            return [promocion.to_dict() for promocion in promociones], 200
        except Exception as e:
            return {"error": f"Error al obtener promociones: {str(e)}"}, 500

    @staticmethod
    def get_promocion_by_id(promocion_id):
        """
        Obtiene una promoción por ID
        """
        try:
            promocion = PromocionRepository.get_by_id(promocion_id)
            if not promocion:
                return {"error": "Promoción no encontrada"}, 404
            return promocion.to_dict(), 200
        except Exception as e:
            return {"error": f"Error al obtener promoción: {str(e)}"}, 500

    @staticmethod
    def get_active_promociones():
        """
        Obtiene todas las promociones activas
        """
        try:
            promociones = PromocionRepository.get_active()
            return [promocion.to_dict() for promocion in promociones], 200
        except Exception as e:
            return {"error": f"Error al obtener promociones activas: {str(e)}"}, 500

    @staticmethod
    def get_promociones_vigentes():
        """
        Obtiene promociones vigentes (fecha actual entre inicio y fin)
        """
        try:
            promociones = PromocionRepository.get_vigentes()
            return [promocion.to_dict() for promocion in promociones], 200
        except Exception as e:
            return {"error": f"Error al obtener promociones vigentes: {str(e)}"}, 500

    @staticmethod
    def get_promociones_by_oferta(oferta_id):
        """
        Obtiene todas las promociones de una oferta
        """
        try:
            promociones = PromocionRepository.get_by_oferta(oferta_id)
            return [promocion.to_dict() for promocion in promociones], 200
        except Exception as e:
            return {"error": f"Error al obtener promociones de la oferta: {str(e)}"}, 500

    @staticmethod
    def get_premios_by_promocion(promocion_id):
        """
        Obtiene todos los premios de una promoción específica
        """
        try:
            # Verificar que la promoción existe
            promocion = PromocionRepository.get_by_id(promocion_id)
            if not promocion:
                return {"error": "Promoción no encontrada"}, 404

            # Obtener premios de la promoción
            premios = PremioRepository.get_by_promocion(promocion_id)
            return [premio.to_dict() for premio in premios], 200
            
        except Exception as e:
            return {"error": f"Error al obtener premios de la promoción: {str(e)}"}, 500

    @staticmethod
    def create_promocion(promocion_data):
        """
        Crea una nueva promoción con validaciones y lógica compleja
        
        Campos requeridos:
        - nombre_promocion: string
        - descripcion: string  
        - fecha_inicio: date (YYYY-MM-DD)
        - fecha_fin: date (YYYY-MM-DD)
        - Oferta_id_oferta: int
        - porcentaje_descuento: float (0-100)
        - paquetes_especificos: string (IDs separados por coma)
        - publico_objetivo: string
        - img: string (base64 o URL de imagen)
        - tiene_sorteo: boolean
        - cantidad_premios: int (requerido si tiene_sorteo=true)
        - premios: array de floats (opcional - ej: [25.0, 20.0, 15.0])
        - cantidad_beneficiarios: int (opcional - número máximo de beneficiarios)
        """
        try:
            # Validaciones requeridas
            required_fields = [
                'nombre_promocion', 'descripcion', 'fecha_inicio', 'fecha_fin', 
                'Oferta_id_oferta', 'porcentaje_descuento', 'paquetes_especificos',
                'publico_objetivo', 'img', 'tiene_sorteo'
            ]
            
            missing_fields = [field for field in required_fields if field not in promocion_data]
            if missing_fields:
                return {"error": f"Faltan campos requeridos: {', '.join(missing_fields)}"}, 400

            # Validar que el porcentaje esté entre 0 y 100
            porcentaje = float(promocion_data['porcentaje_descuento'])
            if porcentaje < 0 or porcentaje > 100:
                return {"error": "El porcentaje de descuento debe estar entre 0 y 100"}, 400

            # Validar fechas
            try:
                fecha_inicio = datetime.strptime(promocion_data['fecha_inicio'], '%Y-%m-%d').date()
                fecha_fin = datetime.strptime(promocion_data['fecha_fin'], '%Y-%m-%d').date()
            except ValueError:
                return {"error": "Formato de fecha inválido. Use YYYY-MM-DD"}, 400
                
            if fecha_inicio >= fecha_fin:
                return {"error": "La fecha de inicio debe ser anterior a la fecha de fin"}, 400

            # Validar sorteo y cantidad de premios
            tiene_sorteo = promocion_data.get('tiene_sorteo', False)
            
            # Extraer el array de premios si viene del frontend
            premios_descuentos = promocion_data.pop('premios', None)
            
            if tiene_sorteo:
                if 'cantidad_premios' not in promocion_data:
                    return {"error": "Campo 'cantidad_premios' requerido cuando tiene_sorteo=true"}, 400
                
                cantidad_premios = int(promocion_data['cantidad_premios'])
                if cantidad_premios <= 0:
                    return {"error": "La cantidad de premios debe ser mayor a 0"}, 400
            else:
                promocion_data['cantidad_premios'] = None

            # Valores por defecto
            promocion_data.setdefault('aplica_nuevos_usuarios', True)
            promocion_data.setdefault('estado', True)
            promocion_data.setdefault('cantidad_beneficiarios', None)
            
            # Remover activo del POST si viene (no se puede enviar, se genera automáticamente)
            promocion_data.pop('activo', None)
            
            # Normalizar el campo descripcion (el modelo tiene 'descricpcion')
            if 'descripcion' in promocion_data:
                promocion_data['descricpcion'] = promocion_data.pop('descripcion')

            # Crear la promoción
            promocion = PromocionRepository.create(promocion_data)
            db.session.flush()  # Para obtener el ID de la promoción

            # Crear premios según lo que envíe el frontend
            premios_creados = []
            
            # Si el frontend envió array de premios, usarlo
            if premios_descuentos and isinstance(premios_descuentos, list):
                premios_data = []
                for descuento_valor in premios_descuentos:
                    # Validar que cada descuento esté entre 0 y 100
                    descuento_float = float(descuento_valor)
                    if descuento_float < 0 or descuento_float > 100:
                        db.session.rollback()
                        return {"error": f"El descuento {descuento_float} debe estar entre 0 y 100"}, 400
                    
                    premio_data = {
                        'Promocion_id_promocion': promocion.id_promocion,
                        'descuento': descuento_float,
                        'estado': True
                    }
                    premios_data.append(premio_data)
                
                # Crear todos los premios
                premios_creados = PremioRepository.create_multiple(premios_data)
            
            # Si no viene array de premios pero tiene_sorteo=true, usar cantidad_premios
            elif tiene_sorteo and cantidad_premios > 0:
                premios_data = []
                for i in range(cantidad_premios):
                    premio_data = {
                        'Promocion_id_promocion': promocion.id_promocion,
                        'descuento': porcentaje,  # Usar el mismo descuento de la promoción
                        'estado': True
                    }
                    premios_data.append(premio_data)
                
                # Crear todos los premios
                premios_creados = PremioRepository.create_multiple(premios_data)

            # Commit de toda la transacción
            db.session.commit()

            # Preparar respuesta con información completa
            response_data = {
                "message": "Promoción creada exitosamente",
                "promocion": promocion.to_dict(),
                "informacion_adicional": {
                    "id_promocion": promocion.id_promocion,
                    "descuento": float(porcentaje),
                    "premios_creados": len(premios_creados) if premios_creados else 0
                }
            }

            # Si se crearon premios, incluir la información
            if premios_creados:
                response_data["premios"] = [premio.to_dict() for premio in premios_creados]
                response_data["informacion_adicional"]["tiene_sorteo"] = True
            else:
                response_data["informacion_adicional"]["tiene_sorteo"] = False

            return response_data, 201

        except Exception as e:
            db.session.rollback()
            return {"error": f"Error al crear promoción: {str(e)}"}, 500

    @staticmethod
    def update_promocion(promocion_id, promocion_data):
        """
        Actualiza una promoción existente
        """
        try:
            # Verificar que la promoción existe
            existing_promocion = PromocionRepository.get_by_id(promocion_id)
            if not existing_promocion:
                return {"error": "Promoción no encontrada"}, 404

            # Validar porcentaje si se actualiza
            if 'porcentaje_descuento' in promocion_data:
                porcentaje = float(promocion_data['porcentaje_descuento'])
                if porcentaje < 0 or porcentaje > 100:
                    return {"error": "El porcentaje de descuento debe estar entre 0 y 100"}, 400

            promocion = PromocionRepository.update(promocion_id, promocion_data)
            db.session.commit()

            return {
                "message": "Promoción actualizada exitosamente",
                "promocion": promocion.to_dict()
            }, 200

        except Exception as e:
            db.session.rollback()
            return {"error": f"Error al actualizar promoción: {str(e)}"}, 500

    @staticmethod
    def delete_promocion(promocion_id):
        """
        Elimina una promoción (borrado lógico)
        """
        try:
            promocion = PromocionRepository.delete(promocion_id)
            if not promocion:
                return {"error": "Promoción no encontrada"}, 404

            db.session.commit()
            return {"message": "Promoción eliminada exitosamente"}, 200

        except Exception as e:
            db.session.rollback()
            return {"error": f"Error al eliminar promoción: {str(e)}"}, 500

    @staticmethod
    def get_sorteos():
        """
        Obtiene todas las promociones que tienen sorteo (tiene_sorteo=true y estado=true)
        Incluye información detallada de la oferta, ciclo, categoria y subcategoria
        """
        try:
            from src.models.promocion import Promocion
            from src.models.oferta import Oferta
            from src.models.ciclo import Ciclo
            from src.models.subcategoria import Subcategoria
            from src.models.categoria import Categoria

            # Consulta con joins para obtener toda la información relacionada
            sorteos_query = db.session.query(
                Promocion,
                Oferta.nombre_oferta,
                Ciclo.nombre.label('nombre_ciclo'),
                Categoria.nombre_categoria,
                Subcategoria.nombre_subcategoria
            ).join(
                Oferta, Promocion.Oferta_id_oferta == Oferta.id_oferta
            ).join(
                Ciclo, Oferta.ciclo_id_ciclo == Ciclo.id_ciclo
            ).join(
                Subcategoria, Oferta.Subcategoria_id_subcategoria == Subcategoria.id_subcategoria
            ).join(
                Categoria, Subcategoria.Categoria_id_categoria == Categoria.id_categoria
            ).filter(
                Promocion.tiene_sorteo == True,
                Promocion.estado == True,
                Promocion.activo == True
                
                
            ).all()

            # Convertir resultados a lista de diccionarios
            sorteos = []
            for promocion, nombre_oferta, nombre_ciclo, nombre_categoria, nombre_subcategoria in sorteos_query:
                sorteo_dict = promocion.to_dict()
                sorteo_dict.update({
                    'oferta': {
                        'nombre_oferta': nombre_oferta
                    },
                    'ciclo': {
                        'nombre_ciclo': nombre_ciclo
                    },
                    'categoria': {
                        'nombre_categoria': nombre_categoria
                    },
                    'subcategoria': {
                        'nombre_subcategoria': nombre_subcategoria
                    }
                })
                sorteos.append(sorteo_dict)

            return sorteos, 200

        except Exception as e:
            return {"error": f"Error al obtener sorteos: {str(e)}"}, 500

    @staticmethod
    def get_personas_de_sorteo(promocion_id):
        """
        Obtiene todas las personas inscritas a una promoción específica (sorteo)
        Incluye información detallada de las personas y sus inscripciones
        """
        try:
            from src.models.inscripcion import Inscripcion
            from src.models.persona import Persona
            from src.models.promocion import Promocion

            # Verificar que la promoción existe y tiene sorteo
            promocion = Promocion.query.get(promocion_id)
            if not promocion:
                return {"error": "Promoción no encontrada"}, 404

            if not promocion.tiene_sorteo:
                return {"error": "Esta promoción no tiene sorteo"}, 400

            # Consulta con joins para obtener personas inscritas
            personas_query = db.session.query(
                Persona,
                Inscripcion.fecha_inscripcion,
                Inscripcion.estado.label('estado_inscripcion'),
                Inscripcion.estado_pago
            ).join(
                Inscripcion, Persona.id_persona == Inscripcion.Persona_id_persona
            ).filter(
                Inscripcion.Promocion_id_promocion == promocion_id,
                Inscripcion.estado == 'ACTIVO'  # Solo inscripciones activas
            ).order_by(
                Inscripcion.fecha_inscripcion.desc()
            ).all()

            # Convertir resultados a lista de diccionarios
            personas_inscritas = []
            for persona, fecha_inscripcion, estado_inscripcion, estado_pago in personas_query:
                persona_dict = {
                    'id_persona': persona.id_persona,
                    'nombre': persona.nombre,
                    'apellido_paterno': persona.apellido_paterno,
                    'apellido_materno': persona.apellido_materno,
                    'email': persona.email,
                    'celular': persona.celular,
                    'tipo_cuenta': persona.tipo_cuenta,
                    'fecha_inscripcion': fecha_inscripcion.isoformat() if fecha_inscripcion else None,
                    'estado_inscripcion': estado_inscripcion,
                    'estado_pago': estado_pago
                }
                personas_inscritas.append(persona_dict)

            return {
                'promocion': {
                    'id_promocion': promocion.id_promocion,
                    'nombre_promocion': promocion.nombre_promocion,
                    'tiene_sorteo': promocion.tiene_sorteo,
                    'cantidad_premios': promocion.cantidad_premios
                },
                'total_inscritos': len(personas_inscritas),
                'personas': personas_inscritas
            }, 200

        except Exception as e:
            return {"error": f"Error al obtener personas del sorteo: {str(e)}"}, 500

    @staticmethod
    def get_personas_de_sorteo(promocion_id):
        """
        Obtiene las personas inscritas en una promoción específica para el sorteo
        """
        try:
            from src.services.inscripcion_service import InscripcionService
            
            # Verificar que la promoción existe
            promocion = PromocionRepository.get_by_id(promocion_id)
            if not promocion:
                return {"error": "Promoción no encontrada"}, 404
            
            # Obtener personas inscritas usando el servicio de inscripciones
            personas, status_code = InscripcionService.get_personas_por_promocion(promocion_id)
            
            if status_code != 200:
                return personas, status_code
            
            return {
                'promocion': {
                    'id_promocion': promocion.id_promocion,
                    'nombre_promocion': promocion.nombre_promocion,
                    'tiene_sorteo': promocion.tiene_sorteo,
                    'cantidad_premios': promocion.cantidad_premios
                },
                'total_inscritos': len(personas),
                'personas': personas
            }, 200
            
        except Exception as e:
            return {"error": f"Error al obtener personas del sorteo: {str(e)}"}, 500