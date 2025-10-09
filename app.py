# app.py. AQUÍ ESTÁN TODAS LAS FUNCIONALIDADES INCORPORADAS PARA LA TAREA 2 EN CUANTO A FLASK.

import os
import re
from datetime import datetime, timedelta
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename

# CONFIGURACIÓN INICIAL PARA Q FUNCIONE LA APLICACIÓN.
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://cc5002:programacionweb@localhost/tarea2'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key = 'clave_secreta_para_flash_messages'
UPLOAD_FOLDER = 'static/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

db = SQLAlchemy(app)

# MODELOS DE LA BASE DE DATOS (clases para región,comuna,y demás).
class Region(db.Model):
    __tablename__ = 'region'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(200), nullable=False)
    comunas = db.relationship('Comuna', backref='region', lazy=True)

class Comuna(db.Model):
    __tablename__ = 'comuna'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(200), nullable=False)
    region_id = db.Column(db.Integer, db.ForeignKey('region.id'), nullable=False)
    avisos = db.relationship('AvisoAdopcion', backref='comuna', lazy=True)

class AvisoAdopcion(db.Model):
    __tablename__ = 'aviso_adopcion'
    id = db.Column(db.Integer, primary_key=True)
    fecha_ingreso = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp())
    comuna_id = db.Column(db.Integer, db.ForeignKey('comuna.id'), nullable=False)
    sector = db.Column(db.String(100))
    nombre = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    celular = db.Column(db.String(15))
    tipo = db.Column(db.Enum('gato', 'perro'), nullable=False)
    cantidad = db.Column(db.Integer, nullable=False)
    edad = db.Column(db.Integer, nullable=False)
    unidad_medida = db.Column(db.Enum('a', 'm'), nullable=False)
    fecha_entrega = db.Column(db.DateTime, nullable=False)
    descripcion = db.Column(db.Text(500))
    fotos = db.relationship('Foto', backref='aviso', lazy=True, cascade="all, delete-orphan")
    contactos = db.relationship('ContactarPor', backref='aviso', lazy=True, cascade="all, delete-orphan")

class Foto(db.Model):
    __tablename__ = 'foto'
    id = db.Column(db.Integer, primary_key=True)
    ruta_archivo = db.Column(db.String(300), nullable=False)
    nombre_archivo = db.Column(db.String(300), nullable=False)
    aviso_id = db.Column(db.Integer, db.ForeignKey('aviso_adopcion.id'), nullable=False)

class ContactarPor(db.Model):
    __tablename__ = 'contactar_por'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.Enum('whatsapp', 'telegram', 'X', 'instagram', 'tiktok', 'otra'), nullable=False)
    identificador = db.Column(db.String(150), nullable=False)
    aviso_id = db.Column(db.Integer, db.ForeignKey('aviso_adopcion.id'), nullable=False)

# FUNCIÍN AUXILIAR PARA ARCHIVOS ---
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ESTABLECER RUTAS DE LA APLICACIÓN.
@app.route('/')
def index():
    ultimos_avisos = AvisoAdopcion.query.order_by(AvisoAdopcion.fecha_ingreso.desc()).limit(5).all()
    return render_template('index.html', avisos=ultimos_avisos)

@app.route('/agregar', methods=['GET', 'POST'])
def agregar_aviso_form():
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
                    save_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
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
            return redirect(url_for('index'))

        except Exception as e:
            db.session.rollback()
            print(f"ERROR: {e}") 
            flash(f'Ocurrió un error al guardar el aviso. Por favor, intente de nuevo.', 'danger')
            regiones = Region.query.order_by('id').all()
            return render_template('agregar-aviso.html', regiones=regiones, errors={}, form_data=request.form)
    else: # GET
        regiones = Region.query.order_by('id').all()
        return render_template('agregar-aviso.html', regiones=regiones)

@app.route('/get_comunas/<int:region_id>')
def get_comunas(region_id):
    comunas = Comuna.query.filter_by(region_id=region_id).order_by('nombre').all()
    comunas_list = [{'id': c.id, 'nombre': c.nombre} for c in comunas]
    return jsonify(comunas_list)

@app.route('/listado')
def listado_adopciones():
    # Para obtener el número de página de la URL.
    page = request.args.get('pagina', 1, type=int)
    
    # Realizar una consulta paginada
    avisos_paginados = AvisoAdopcion.query.order_by(AvisoAdopcion.fecha_ingreso.desc()).paginate(
        page=page, per_page=5, error_out=False
    )
    
    # Pasar el objeto de paginación completo a la plantilla.
    return render_template('listado-adopciones.html', pagination=avisos_paginados)

@app.route('/estadisticas')
def estadisticas():
    return render_template('estadisticas.html')

# NUEVA RUTA DE API PARA DETALLES DE AVISOS.
@app.route('/api/aviso/<int:aviso_id>')
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

# INICIAR LA APLICACIÓN.
if __name__ == '__main__':
    app.run(debug=True)