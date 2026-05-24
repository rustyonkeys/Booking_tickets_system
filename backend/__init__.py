from flask import Flask
from backend.Config.config import config
from backend.extensions.extension import db
from backend.routes.booking_routes import booking_users
from backend.routes.bus_routes import bus_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(config)
    db.init_app(app)

    from backend.models import booking, bus_model, trips, user

    app.register_blueprint(booking_users)
    app.register_blueprint(bus_bp)
    
    return app
