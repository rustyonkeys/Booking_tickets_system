from backend.extensions.extension import db

class Bus(db.Model):
    __tablename__ = 'buses'
    id = db.Column(db.Integer, primary_key = True)
    bus_name = db.Column(db.String(50), nullable = False)
    bus_number = db.Column(db.String(20), nullable = False, unique = True)
    capacity = db.Column(db.Integer, nullable = False)
    is_created = db.Column(db.DateTime, default = db.func.current_timestamp())





    #add constraints and relationships if needed