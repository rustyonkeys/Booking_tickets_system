import os
from dotenv import load_dotenv

load_dotenv()

class config:
    #Database configuration
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    DEBUG = True
    SQLALCHEMY_TRACK_MODIFICATIONS = False