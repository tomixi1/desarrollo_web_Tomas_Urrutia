import os
import re
from datetime import datetime, timedelta
from flask import render_template, request, redirect, url_for, flash, jsonify, current_app
from werkzeug.utils import secure_filename
from sqlalchemy import func

from . import db
from .models import Region, Comuna, AvisoAdopcion, Foto, ContactarPor, Comentario

# USO DE BLUEPRINTS
from flask import Blueprint
routes_bp = Blueprint('main', __name__)

def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# ESTABLECER RUTAS DE LA APLICACIÓN.
@routes_bp.route('/')
def index():
    ultimos_avisos = AvisoAdopcion.query.order_by(AvisoAdopcion.fecha_ingreso.desc()).limit(5).all()
    return render_template('index.html', avisos=ultimos_avisos)

@routes_bp.route('/agregar', methods=['GET', 'POST'])
def agregar_aviso_form():
    # Esto es para cuando la página se carga por primera vez (método GET)
    if request.method == 'GET':
        regiones = Region.query.order_by('id').all()
        return render_template('agregar-aviso.html', regiones=regiones)
    
    # Y para cuando el formulario es enviado (método POST)
    if request.method == 'POST':
        errors = {}
        region_id = request.form.get('region')
        comuna_id = request.form.get('comuna')
        sector = request.form.get('sector', '').strip()
        nombre = request.form.get('nombre', '').strip()
        email = request.form.get('email', '').strip()
        celular = request.form.get('celular', '').strip()
        contactar_por = request.form.getlist('contactar-por')
        contactar_id = request.form.get('contactar-por-id', '').strip()
        tipo_mascota = request.form.get('tipo-mascota')
        cantidad = request.form.get('cantidad')
        edad = request.form.get('edad')
        unidad_edad = request.form.get('unidad-edad')
        fecha_entrega_str = request.form.get('fecha-entrega')
        descripcion = request.form.get('descripcion', '').strip()
        fotos = request.files.getlist('fotos[]')

        if not comuna_id: errors['comuna'] = 'Debe seleccionar una comuna.'
        if not (3 <= len(nombre) <= 200): errors['nombre'] = 'El nombre debe tener entre 3 y 200 caracteres.'
        if not re.match(r"[^@]+@[^@]+\.[^@]+", email): errors['email'] = 'El formato del email no es válido.'
        if celular and not re.match(r"^\+569\d{8}$", celular): errors['celular'] = 'El formato del celular debe ser +56912345678.'
        if len(contactar_por) > 5: errors['contactar-por'] = 'Puede seleccionar un máximo de 5 medios de contacto.'
        if contactar_id and not (4 <= len(contactar_id) <= 50): errors['contactar-por-id'] = 'El ID/URL de contacto debe tener entre 4 y 50 caracteres.'
        if not tipo_mascota: errors['tipo-mascota'] = 'Debe seleccionar un tipo de mascota.'
        try:
            if not cantidad or int(cantidad) < 1: errors['cantidad'] = 'La cantidad mínima es 1.'
        except (ValueError, TypeError): errors['cantidad'] = 'La cantidad debe ser un número válido.'
        try:
            if not edad or int(edad) < 1: errors['edad'] = 'La edad mínima es 1.'
        except (ValueError, TypeError): errors['edad'] = 'La edad debe ser un número válido.'
        if not unidad_edad: errors['unidad-edad'] = 'Debe seleccionar meses o años.'
        fecha_entrega = None
        if not fecha_entrega_str:
            errors['fecha-entrega'] = 'Debe seleccionar una fecha de entrega.'
        else:
            try:
                fecha_entrega = datetime.strptime(fecha_entrega_str, '%Y-%m-%dT%H:%M')
                if fecha_entrega < datetime.now() + timedelta(hours=3):
                    errors['fecha-entrega'] = 'La fecha de entrega debe ser al menos 3 horas en el futuro.'
            except ValueError:
                errors['fecha-entrega'] = 'El formato de la fecha no es válido.'
        if not fotos or not any(f and allowed_file(f.filename) for f in fotos):
             errors['fotos'] = 'Debe subir al menos una foto válida (png, jpg, jpeg, gif).'
        
        if errors:
            regiones = Region.query.order_by('id').all()
            return render_template('agregar-aviso.html', regiones=regiones, errors=errors, form_data=request.form)

        try:
            nuevo_aviso = AvisoAdopcion(
                comuna_id=int(comuna_id),
                sector=sector,
                nombre=nombre,
                email=email,
                celular=celular,
                tipo=tipo_mascota,
                cantidad=int(cantidad),
                edad=int(edad),
                unidad_medida='m' if unidad_edad == 'meses' else 'a',
                fecha_entrega=fecha_entrega,
                descripcion=descripcion
            )
            db.session.add(nuevo_aviso)
            db.session.flush()

            for foto_file in fotos:
                if foto_file and allowed_file(foto_file.filename):
                    filename = secure_filename(foto_file.filename)
                    unique_filename = f"{nuevo_aviso.id}_{filename}"
                    save_path = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename)
                    foto_file.save(save_path)
                    ruta_para_db = f"uploads/{unique_filename}"
                    nueva_foto = Foto(
                        ruta_archivo=ruta_para_db,
                        nombre_archivo=filename,
                        aviso_id=nuevo_aviso.id
                    )
                    db.session.add(nueva_foto)
            
            if contactar_por and contactar_id:
                for medio in contactar_por:
                    nuevo_contacto = ContactarPor(
                        nombre=medio,
                        identificador=contactar_id,
                        aviso_id=nuevo_aviso.id
                    )
                    db.session.add(nuevo_contacto)

            db.session.commit()
            flash('¡El aviso de adopción ha sido agregado con éxito!', 'success')
            return redirect(url_for('main.index'))

        except Exception as e:
            db.session.rollback()
            print(f"ERROR: {e}") 
            flash(f'Ocurrió un error al guardar el aviso. Por favor, intente de nuevo.', 'danger')
            regiones = Region.query.order_by('id').all()
            return render_template('agregar-aviso.html', regiones=regiones, errors={}, form_data=request.form)

@routes_bp.route('/get_comunas/<int:region_id>')
def get_comunas(region_id):
    comunas = Comuna.query.filter_by(region_id=region_id).order_by('nombre').all()
    comunas_list = [{'id': c.id, 'nombre': c.nombre} for c in comunas]
    return jsonify(comunas_list)

@routes_bp.route('/listado')
def listado_adopciones():
    # Para obtener el número de página de la URL
    page = request.args.get('pagina', 1, type=int)
    
    # Realizar una consulta paginada
    avisos_paginados = AvisoAdopcion.query.order_by(AvisoAdopcion.fecha_ingreso.desc()).paginate(
        page=page, per_page=5, error_out=False
    )
    
    # Pasar el objeto de paginación completo a la plantilla.
    return render_template('listado-adopciones.html', pagination=avisos_paginados)

@routes_bp.route('/estadisticas')
def estadisticas():
    return render_template('estadisticas.html')

# NUEVA RUTA DE API PARA DETALLES DE AVISOS.
@routes_bp.route('/api/aviso/<int:aviso_id>')
def get_aviso_details(aviso_id):
    aviso = AvisoAdopcion.query.get_or_404(aviso_id)
    
    # Preparamos los datos para enviarlos como JSON
    fotos_list = [url_for('static', filename=foto.ruta_archivo) for foto in aviso.fotos]
    contactos_list = [{'nombre': c.nombre, 'identificador': c.identificador} for c in aviso.contactos]
    
    aviso_data = {
        'id': aviso.id,
        'fechaPublicacion': aviso.fecha_ingreso.strftime('%Y-%m-%d %H:%M'),
        'fechaEntrega': aviso.fecha_entrega.strftime('%Y-%m-%d %H:%M'),
        'comuna': aviso.comuna.nombre,
        'sector': aviso.sector,
        'nombreContacto': aviso.nombre,
        'emailContacto': aviso.email,
        'celularContacto': aviso.celular,
        'tipo': aviso.tipo,
        'cantidad': aviso.cantidad,
        'edad': f"{aviso.edad} {'meses' if aviso.unidad_medida == 'm' else 'años'}",
        'descripcion': aviso.descripcion,
        'fotos': fotos_list,
        'contactos': contactos_list
    }
    return jsonify(aviso_data)



# --- ruta de api PARA LAS ESTADÍSTICAS---
@routes_bp.route('/api/stats')
def get_stats_data():
    try:
        # --- Gráfico 1: Avisos por día (Líneas) ---
        avisos_por_dia = db.session.query(
            func.date(AvisoAdopcion.fecha_ingreso).label('fecha'),
            func.count(AvisoAdopcion.id).label('cantidad')
        ).group_by('fecha').order_by('fecha').all()
        
        line_chart_data = []
        for row in avisos_por_dia:
            dt_obj = datetime.combine(row.fecha, datetime.min.time())
            timestamp_ms = int(dt_obj.timestamp()) * 1000
            line_chart_data.append([timestamp_ms, row.cantidad])

        # --- Gráfico 2: Total por tipo de mascota (Torta) ---
        avisos_por_tipo = db.session.query(
            AvisoAdopcion.tipo,
            func.count(AvisoAdopcion.id).label('cantidad')
        ).group_by(AvisoAdopcion.tipo).all()
        
        pie_chart_data = [
            {'name': row.tipo.capitalize(), 'y': row.cantidad} for row in avisos_por_tipo
        ]

        # --- Gráfico 3: Gatos vs Perros por mes (Barras) ---
        avisos_por_mes = db.session.query(
            func.DATE_FORMAT(AvisoAdopcion.fecha_ingreso, '%Y-%m').label('mes'),
            AvisoAdopcion.tipo,
            func.count(AvisoAdopcion.id).label('cantidad')
        ).group_by('mes', 'tipo').order_by('mes').all()

        # Procesar los datos para el gráfico de barras
        meses = sorted(list(set([row.mes for row in avisos_por_mes])))
        gatos_data = [0] * len(meses)
        perros_data = [0] * len(meses)
        
        for row in avisos_por_mes:
            idx = meses.index(row.mes)
            if row.tipo == 'gato':
                gatos_data[idx] = row.cantidad
            elif row.tipo == 'perro':
                perros_data[idx] = row.cantidad

        bar_chart_data = {
            'categories': meses,
            'gatos_data': gatos_data,
            'perros_data': perros_data
        }

        # --- Ensamblaje del JSON final ---
        return jsonify({
            'lineChart': {'data': line_chart_data},
            'pieChart': {'data': pie_chart_data},
            'barChart': bar_chart_data
        })

    except Exception as e:
        print(f"ERROR al generar estadísticas: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'No se pudieron generar los datos'}), 500



# --- NUEVAS RUTAS DE API PARA COMENTARIOS ---


@routes_bp.route('/api/aviso/<int:aviso_id>/comentarios', methods=['GET'])
def get_comentarios(aviso_id):
    """
    Obtiene y devuelve todos los comentarios para un aviso específico.
    """
    # Primero, nos aseguramos de que el aviso exista primero
    aviso = AvisoAdopcion.query.get_or_404(aviso_id)
    
    # Ordenamos los comentarios del más reciente al más antiguo
    comentarios = sorted(aviso.comentarios, key=lambda c: c.fecha, reverse=True)
    
    comentarios_list = [
        {
            'id': c.id,
            'nombre': c.nombre,
            'texto': c.texto,
            'fecha': c.fecha.strftime('%d-%m-%Y %H:%M')
        } for c in comentarios
    ]
    return jsonify(comentarios_list)


@routes_bp.route('/api/aviso/<int:aviso_id>/comentarios', methods=['POST'])
def add_comentario(aviso_id):
    aviso = AvisoAdopcion.query.get_or_404(aviso_id)
    data = request.get_json()

    # --- Validación del lado del servidor ---
    nombre = data.get('nombre', '').strip()
    texto = data.get('texto', '').strip()

    if not (3 <= len(nombre) <= 80):
        return jsonify({'error': 'El nombre debe tener entre 3 y 80 caracteres.'}), 400
    if len(texto) < 5:
        return jsonify({'error': 'El comentario debe tener al menos 5 caracteres.'}), 400

    # --- Si la validación es exitosa, se guarda en la BD ---
    try:
        nuevo_comentario = Comentario(
            nombre=nombre,
            texto=texto,
            aviso_id=aviso.id
        )
        db.session.add(nuevo_comentario)
        db.session.commit()
        
        return jsonify({
            'id': nuevo_comentario.id,
            'nombre': nuevo_comentario.nombre,
            'texto': nuevo_comentario.texto,
            'fecha': nuevo_comentario.fecha.strftime('%d-%m-%Y %H:%M')
        }), 201 

    except Exception as e:
        db.session.rollback()
        print(f"Error al guardar comentario: {e}")
        return jsonify({'error': 'Ocurrió un error interno al guardar el comentario.'}), 500