from backend.extensions.extension import db
from datetime import datetime

class Trip(db.Model):

    __tablename__ = 'trips'

    id = db.Column(db.Integer, primary_key = True, nullable = False, unique = True)
    bus_id = db.Column(db.Integer, db.ForeignKey('buses.id'), nullable = False) 
    source = db.Column(db.String(100), nullable = False)
    destination = db.Column(db.String(100), nullable = False)
    departure_time = db.Column(db.DateTime, nullable = False)
    arrival_time = db.Column(db.DateTime, nullable = False)
    price = db.Column(db.Numeric(10,2), nullable = False, default = 0.00)
    is_created = db.Column(db.DateTime, default = db.func.current_timestamp(), nullable = False)


    #relationsips 
    bus = db.relationship('Bus', backref = 'trips')