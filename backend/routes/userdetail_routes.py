import email
from os import name
from flask import request, jsonify, Blueprint
from backend.models.user_details import User
from backend.extensions.extension import db

userdetails_bp = Blueprint('userdetails', __name__)

@userdetails_bp.route('/login', methods= ["POST"])
def create_user():
    """
Create a new user
---
tags:
  - User
parameters:
  - in: body
    name: body
    schema:
      type: object
      required:
        - name
        - email
        - password
        - phone_number
      properties:
        name:
          type: string
          example: John Doe
        email:
          type: string
          example: john.doe@example.com
        password:
          type: string
          example: password123
        phone_number:
          type: string
          example: "1234567890"
responses:
  201:
    description: User is created successfully
  400:
    description: Name, email, password and phone number are required
"""

    data = request.get_json()

    if "name" not in data or "email" not in data or "password" not in data or "phone_number" not in data:
        return jsonify({"error": "name, email, password and phone_number are required"}), 400
    
    if User.query.filter_by(email = data["email"]).first():
        return jsonify({"error": "Email already exists"}), 400
    
    if User.query.filter_by(phone_number = data["phone_number"]).first():
        return jsonify({"error": "Phone number already exists"}), 400

    new_user = User(
            name = data["name"],
            email = data["email"],
            password = data["password"],
            phone_number = data["phone_number"]
        )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User is created successfully"}), 201


@userdetails_bp.route('/profile', methods= ["GET"])
def get_profile():
    """
      Get a user's profile by ID
      ---
      tags:
        - User
      parameters:
        - in: path
          name: id
          required: true
          type: integer
          description: ID of the user
          example: 1
      responses:
        200:
          description: Profile retrieved successfully
        404:
          description: Profile not found
      """

    profile = User.query.filter_by(id = current_user.id).first()

    if not profile:
      return jsonify({"error": "Profile not found"}), 404
    
    return jsonify({
      "id": profile.id,
      "name": profile.name,
      "role": profile.role,
      "email": profile.email,
      "phone_number": profile.phone_number,
      "password": profile.password,
      "is_created": profile.is_created
    }), 200