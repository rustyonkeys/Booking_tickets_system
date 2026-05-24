from backend.extensions.extension import db

class User(db.Model):

    __tablename__ = 'users'

    id = db.Column(db.Integer, nullable = False, primary_key = True, autoincrement = True, unique = True)
    role = db.Column(db.String(10), nullable = False, default = 'user')
    name = db.Column(db.String(100), nullable = False)
    email = db.Column(db.String(50), nullable = False, unique = True)
    password = db.Column(db.String(20), nullable = False)
    phone_number = db.Column(db.String(10), nullable = False, unique = True)
    is_created = db.Column(db.DateTime, default = db.func.current_timestamp(), nullable = False)
    is_deleted = db.Column(db.DateTime, default = None, nullable = True)
