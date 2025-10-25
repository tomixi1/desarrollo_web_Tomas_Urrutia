import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def create_app():
    app = Flask(__name__, instance_relative_config=True)
    # --- CONFIGURACIÓN DE LA APLICACIÓN ---
    app.config.from_mapping(
        SECRET_KEY='clave_secreta_para_flash_messages',
        SQLALCHEMY_DATABASE_URI='mysql+pymysql://cc5002:programacionweb@localhost/tarea2',
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        UPLOAD_FOLDER=os.path.join(app.root_path, 'static', 'uploads')
    )
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    # Inicializar la base de datos con la aplicación
    db.init_app(app)
    # Con el contexto de la aplicación, importamos las rutas
    with app.app_context():
        from . import routes  # IMPORTACIÓN
        app.register_blueprint(routes.routes_bp)
    return app