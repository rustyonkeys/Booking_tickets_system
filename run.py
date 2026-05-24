from backend import create_app
from backend.extensions.extension import db
from flask_migrate import Migrate
from flasgger import Swagger

app = create_app()
migrate = Migrate(app, db)
swagger = Swagger(app)

if __name__ == "__main__":
    app.run(debug = True)