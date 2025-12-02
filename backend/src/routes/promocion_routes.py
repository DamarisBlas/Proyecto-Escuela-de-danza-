from flask import Blueprint, request, jsonify, send_from_directory, current_app
from werkzeug.utils import secure_filename
from uuid import uuid4
import os
from src.services.promocion_service import PromocionService

promocion_bp = Blueprint('promocion', __name__, url_prefix='/promociones')

# Configuración de upload de imágenes
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads', 'promociones')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'}

# Crear directorio si no existe
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    """Verifica si la extensión del archivo es permitida"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@promocion_bp.route('/', methods=['GET'])
def get_all_promociones():
    """
    Obtiene todas las promociones
    """
    result, status_code = PromocionService.get_all_promociones()
    return jsonify(result), status_code

@promocion_bp.route('/<int:promocion_id>', methods=['GET'])
def get_promocion_by_id(promocion_id):
    """
    Obtiene una promoción por ID
    """
    result, status_code = PromocionService.get_promocion_by_id(promocion_id)
    return jsonify(result), status_code

@promocion_bp.route('/activas', methods=['GET'])
def get_active_promociones():
    """
    Obtiene todas las promociones activas
    """
    result, status_code = PromocionService.get_active_promociones()
    return jsonify(result), status_code

@promocion_bp.route('/vigentes', methods=['GET'])
def get_vigentes_promociones():
    """
    Obtiene todas las promociones vigentes (dentro del rango de fechas)
    """
    result, status_code = PromocionService.get_vigentes_promociones()
    return jsonify(result), status_code

@promocion_bp.route('/oferta/<int:oferta_id>', methods=['GET'])
def get_promociones_by_oferta(oferta_id):
    """
    Obtiene todas las promociones de una oferta específica
    """
    result, status_code = PromocionService.get_promociones_by_oferta(oferta_id)
    return jsonify(result), status_code

@promocion_bp.route('/upload-imagen', methods=['POST'])
def upload_imagen():
    """
    Endpoint para subir imagen de promoción
    
    Acepta: multipart/form-data con campo 'image'
    Formatos permitidos: png, jpg, jpeg, webp, gif
    
    Retorna:
    {
        "success": true,
        "imageUrl": "/uploads/promociones/promo_<uuid>.jpg",
        "filename": "promo_<uuid>.jpg"
    }
    """
    # Debugging: list incoming files
    current_app.logger.debug(f"[upload_imagen] request.files keys: {list(request.files.keys())}")
    # Accept several common field names to be forgiving for different clients
    field_candidates = ['image', 'file', 'photo']
    present_fields = [k for k in field_candidates if k in request.files]
    if not present_fields:
        # If client used an unexpected single field name (e.g. '1') accept it as fallback
        if len(request.files) == 1:
            first_key = list(request.files.keys())[0]
            current_app.logger.debug('No standard field found, falling back to single field: %s', first_key)
            chosen_field = first_key
            file = request.files[chosen_field]
        else:
            current_app.logger.debug('Upload failed: no image field found. request.files keys: %s', list(request.files.keys()))
            # More explicit message to help clients debug
            return jsonify({'error': "No se envió imagen - envíe un multipart/form-data con campo 'image' (o 'file'/'photo')"}), 400

    if 'file' not in locals():
        chosen_field = present_fields[0]
        file = request.files[chosen_field]
    current_app.logger.debug('Using upload field: %s', chosen_field)
    
    if file.filename == '':
        return jsonify({'error': 'No se seleccionó archivo (filename vacío)'}), 400
    
    # Check extension explicitly and log
    ext = None
    try:
        ext = file.filename.rsplit('.', 1)[1].lower()
    except Exception:
        ext = ''

    current_app.logger.debug(f"[upload_imagen] filename={file.filename}, ext={ext}, allowed={ext in ALLOWED_EXTENSIONS}")

    if not file or ext not in ALLOWED_EXTENSIONS:
        return jsonify({'error': 'Tipo de archivo no permitido. Use: png, jpg, jpeg, webp, gif'}), 400
    
    # Generar nombre único con UUID
    # ext already computed above
    filename = f"promo_{uuid4()}.{ext}"
    
    # Guardar archivo
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)
    
    # Retornar URL pública
    image_url = f"/uploads/promociones/{filename}"
    
    return jsonify({
        'success': True,
        'imageUrl': image_url,
        'filename': filename
    }), 200

@promocion_bp.route('/uploads/promociones/<filename>')
def serve_promo_image(filename):
    """
    Servir imágenes de promociones estáticas
    """
    return send_from_directory(UPLOAD_FOLDER, filename)


@promocion_bp.route('/uploads', methods=['GET'])
def list_promocion_images():
    """
    Lista todos los archivos de imagen subidos para promociones.

    Query params (opcionales):
      prefix: filtra por prefijo de filename (útil si guardas metadata en nombre)
      ext: filtra por extensión (png, jpg, jpeg, webp, gif)

    Esto es útil para mostrar miniaturas/galería en el front.
    """
    try:
        prefix = request.args.get('prefix')
        ext_filter = request.args.get('ext')

        files = []
        for name in os.listdir(UPLOAD_FOLDER):
            if not any(name.lower().endswith(f'.{e}') for e in ALLOWED_EXTENSIONS):
                continue
            if prefix and not name.startswith(prefix):
                continue
            if ext_filter and not name.lower().endswith(f'.{ext_filter.lower()}'):
                continue

            fpath = os.path.join(UPLOAD_FOLDER, name)
            if not os.path.isfile(fpath):
                continue

            stat = os.stat(fpath)
            files.append({
                'filename': name,
                'url': f'/promociones/uploads/promociones/{name}',
                'size': stat.st_size,
                'modified': stat.st_mtime
            })

        return jsonify({'images': files}), 200

    except Exception as e:
        current_app.logger.exception('Error listing promotion images')
        return jsonify({'error': 'Error al listar las imágenes'}), 500

@promocion_bp.route('/', methods=['POST'])
def create_promocion():
    """
    Crea una nueva promoción con funcionalidad completa
    
    IMPORTANTE: Primero use POST /promociones/upload-imagen para subir la imagen
    y obtener la URL, luego use esa URL en el campo 'img'
    
    Funcionalidades:
    - Guarda URL de la imagen en la base de datos (NO base64)
    - Si tiene_sorteo=true, crea automáticamente premios en la tabla Premios
    - Valida todos los campos requeridos
    - Retorna información completa incluyendo premios creados
    
    FLUJO RECOMENDADO:
    1. POST /promociones/upload-imagen con la imagen (multipart/form-data)
    2. Obtener imageUrl de la respuesta
    3. POST /promociones/ con imageUrl en el campo 'img'
    
    Body JSON ejemplo SIN sorteo:
    {
        "nombre_promocion": "Descuento Enero",
        "descripcion": "Descuento especial para enero 2025",
        "fecha_inicio": "2025-01-01",
        "fecha_fin": "2025-01-31",
        "Oferta_id_oferta": 1,
        "porcentaje_descuento": 20.0,
        "paquetes_especificos": "1,3,5",
        "publico_objetivo": "Nuevos usuarios",
        "img": "/uploads/promociones/promo_123e4567-e89b-12d3-a456-426614174000.jpg",
        "tiene_sorteo": false,
        "aplica_nuevos_usuarios": true
    }
    
    Body JSON ejemplo CON sorteo:
    {
        "nombre_promocion": "Sorteo San Valentín",
        "descripcion": "Sorteo especial con premios increíbles",
        "fecha_inicio": "2025-02-01",
        "fecha_fin": "2025-02-14",
        "Oferta_id_oferta": 2,
        "porcentaje_descuento": 30.0,
        "paquetes_especificos": "2,4,6",
        "publico_objetivo": "Todos",
        "img": "/uploads/promociones/promo_987f6543-e21c-45d6-b789-123456789abc.png",
        "tiene_sorteo": true,
        "cantidad_premios": 5,
        "aplica_nuevos_usuarios": false
    }
    
    Respuesta exitosa incluye:
    - Información de la promoción creada
    - Lista de premios creados (si tiene_sorteo=true)
    - Información adicional con ID de promoción y descuento
    """
    if not request.is_json:
        return jsonify({"error": "Content-Type debe ser application/json"}), 400
    
    promocion_data = request.get_json()
    result, status_code = PromocionService.create_promocion(promocion_data)
    return jsonify(result), status_code

@promocion_bp.route('/<int:promocion_id>', methods=['PUT'])
def update_promocion(promocion_id):
    """
    Actualiza una promoción existente
    
    Body JSON ejemplo:
    {
        "nombre_promocion": "Nuevo nombre",
        "percentage_descuento": 25.0,
        "fecha_fin": "2025-02-28"
    }
    """
    if not request.is_json:
        return jsonify({"error": "Content-Type debe ser application/json"}), 400
    
    promocion_data = request.get_json()
    result, status_code = PromocionService.update_promocion(promocion_id, promocion_data)
    return jsonify(result), status_code

@promocion_bp.route('/<int:promocion_id>', methods=['DELETE'])
def delete_promocion(promocion_id):
    """
    Elimina una promoción (borrado lógico)
    """
    result, status_code = PromocionService.delete_promocion(promocion_id)
    return jsonify(result), status_code