from backend.extensions.extension import db
import enum
from datetime import datetime
from sqlalchemy import UniqueConstraint

class Booking_status(enum.Enum):
    PENDING ='PENDING'
    CONFIRMED = 'CONFIRMED'
    CANCELLED = 'CANCELLED'

class Payment_status(enum.Enum):
    PENDING = 'PENDING'
    PAID = 'PAID'
    FAILED = 'FAILED'
    REFUNDED = 'REFUNDED'


class Booking(db.Model):
    __tablename__ = 'bookings'
    id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, nullable = False)
    trip_id = db.Column(db.Integer, db.ForeignKey('trips.id'), nullable = False)
    seat_number = db.Column(db.String(10))
    booking_status = db.Column(db.Enum(Booking_status), default = Booking_status.PENDING, nullable = False)
    payment_status = db.Column(db.Enum(Payment_status), default = Payment_status.PENDING, nullable = False)
    total_price = db.Column(db.Numeric(10,2), nullable = False, default = 0.00)
    is_created = db.Column(db.DateTime, server_default = db.func.current_timestamp(), nullable = False)
    is_updated = db.Column(db.DateTime, server_default = db.func.current_timestamp(), nullable = True)
    is_deleted = db.Column(db.DateTime, default = db.func.current_timestamp(), nullable = True)
    
    # Database Constraints
    __table_args__ = (
        # Double-booking protection: ensures a seat on a specific trip can only be taken once
        UniqueConstraint('trip_id', 'seat_number', name = 'unique_trip_seat'),
    )

    #Relationships
    trip = db.relationship('Trip', backref = 'bookings')


    #Add relationships to User and Trip models if needed for easier querying, e.g.:
