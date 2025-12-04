from src.repositories.paquete_repository import PaqueteRepository
from src.repositories.oferta_repository import OfertaRepository

class PaqueteService:
    """
    Servicio para lógica de negocio de Paquete
    """

    @staticmethod
    def get_all_paquetes():
        """
        Obtiene todos los paquetes
        """
        try:
            paquetes = PaqueteRepository.get_all()
            return [paquete.to_dict() for paquete in paquetes], 200
        except Exception as e:
            return {"error": f"Error al obtener paquetes: {str(e)}"}, 500

    @staticmethod
    def get_paquete_by_id(paquete_id):
        """
        Obtiene un paquete por ID
        """
        try:
            paquete = PaqueteRepository.get_by_id(paquete_id)
            if not paquete:
                return {"error": "Paquete no encontrado"}, 404
            return paquete.to_dict(), 200
        except Exception as e:
            return {"error": f"Error al obtener paquete: {str(e)}"}, 500

    @staticmethod
    def get_active_paquetes():
        """
        Obtiene todos los paquetes activos
        """
        try:
            paquetes = PaqueteRepository.get_active()
            return [paquete.to_dict() for paquete in paquetes], 200
        except Exception as e:
            return {"error": f"Error al obtener paquetes activos: {str(e)}"}, 500

    @staticmethod
    def get_paquetes_by_oferta(oferta_id):
        """
        Obtiene todos los paquetes de una oferta
        """
        try:
            paquetes = PaqueteRepository.get_by_oferta(oferta_id)
            return [paquete.to_dict() for paquete in paquetes], 200
        except Exception as e:
            return {"error": f"Error al obtener paquetes de la oferta: {str(e)}"}, 500

    @staticmethod
    def create_paquete(paquete_data):
        """
        Crea un nuevo paquete
        """
        try:
            # Validaciones
            required_fields = ['nombre', 'oferta_id', 'precio']
            if not all(field in paquete_data for field in required_fields):
                return {"error": "Faltan campos requeridos: nombre, oferta_id, precio"}, 400

            # Verificar que la oferta existe
            oferta = OfertaRepository.get_by_id(paquete_data['oferta_id'])
            if not oferta:
                return {"error": "La oferta especificada no existe"}, 404

            # NOTA: Se removió validación de nombre único - se permiten nombres duplicados

            # Validar ilimitado vs cantidad_clases
            ilimitado = paquete_data.get('ilimitado', False)
            if ilimitado:
                paquete_data['cantidad_clases'] = None
            elif not paquete_data.get('cantidad_clases'):
                return {"error": "Debe especificar cantidad_clases o marcar como ilimitado"}, 400

            # Validar precio
            if float(paquete_data['precio']) <= 0:
                return {"error": "El precio debe ser mayor a 0"}, 400

            paquete = PaqueteRepository.create(paquete_data)
            return {
                "message": "Paquete creado exitosamente",
                "paquete": paquete.to_dict()
            }, 201

        except Exception as e:
            return {"error": f"Error al crear paquete: {str(e)}"}, 500

    @staticmethod
    def update_paquete(paquete_id, paquete_data):
        """
        Actualiza un paquete existente
        """
        try:
            # Verificar que el paquete existe
            existing_paquete = PaqueteRepository.get_by_id(paquete_id)
            if not existing_paquete:
                return {"error": "Paquete no encontrado"}, 404

            # NOTA: Se removió validación de nombre único - se permiten nombres duplicados

            # Validar oferta si se está cambiando
            if 'oferta_id' in paquete_data:
                oferta = OfertaRepository.get_by_id(paquete_data['oferta_id'])
                if not oferta:
                    return {"error": "La oferta especificada no existe"}, 404

            # Validar ilimitado vs cantidad_clases
            if 'ilimitado' in paquete_data and paquete_data['ilimitado']:
                paquete_data['cantidad_clases'] = None

            # Validar precio si se proporciona
            if 'precio' in paquete_data and float(paquete_data['precio']) <= 0:
                return {"error": "El precio debe ser mayor a 0"}, 400

            paquete = PaqueteRepository.update(paquete_id, paquete_data)
            return {
                "message": "Paquete actualizado exitosamente",
                "paquete": paquete.to_dict()
            }, 200

        except Exception as e:
            return {"error": f"Error al actualizar paquete: {str(e)}"}, 500

    @staticmethod
    def delete_paquete(paquete_id):
        """
        Elimina un paquete (borrado lógico)
        """
        try:
            paquete = PaqueteRepository.delete(paquete_id)
            if not paquete:
                return {"error": "Paquete no encontrado"}, 404

            return {"message": "Paquete eliminado exitosamente"}, 200

        except Exception as e:
            return {"error": f"Error al eliminar paquete: {str(e)}"}, 500

    @staticmethod
    def get_paquete_detailed_info(paquete_id):
        """
        Obtiene información detallada de un paquete incluyendo toda la información
        relacionada de oferta, ciclo y subcategoría
        """
        try:
            result = PaqueteRepository.get_detailed_info(paquete_id)
            
            if not result:
                return {"error": "Paquete no encontrado"}, 404
            
            paquete, oferta, ciclo, subcategoria = result
            
            # Construir respuesta con toda la información solicitada
            detailed_info = {
                "paquete": {
                    "id_paquete": paquete.id_paquete,
                    "nombre": paquete.nombre,
                    "cantidad_clases": paquete.cantidad_clases,
                    "ilimitado": paquete.ilimitado,
                    "dias_validez": paquete.dias_validez,
                    "precio": str(paquete.precio) if paquete.precio else None,
                    "estado": paquete.estado
                },
                "oferta": {
                    "id_oferta": oferta.id_oferta,
                    "nombre_oferta": oferta.nombre_oferta,
                    "whatsapplink": oferta.whatsapplink,
                    "descripcion": oferta.descripcion,
                    "fecha_inicio": oferta.fecha_inicio.isoformat() if oferta.fecha_inicio else None,
                    "fecha_fin": oferta.fecha_fin.isoformat() if oferta.fecha_fin else None,
                    "cantidad_cursos": oferta.cantidad_cursos,
                    "publico_objetivo": oferta.publico_objetivo,
                    "repite_semanalmente": oferta.repite_semanalmente
                },
                "ciclo": {
                    "id_ciclo": ciclo.id_ciclo,
                    "nombre_ciclo": ciclo.nombre,
                    "inicio": ciclo.inicio.isoformat() if ciclo.inicio else None,
                    "fin": ciclo.fin.isoformat() if ciclo.fin else None
                },
                "subcategoria": {
                    "id_subcategoria": subcategoria.id_subcategoria,
                    "nombre_subcategoria": subcategoria.nombre_subcategoria,
                    "descripcion_subcategoria": subcategoria.descripcion_subcategoria,
                    "categoria_id": subcategoria.Categoria_id_categoria
                }
            }
            
            return detailed_info, 200
            
        except Exception as e:
            return {"error": f"Error al obtener información detallada del paquete: {str(e)}"}, 500
