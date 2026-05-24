from flask import request, jsonify, Blueprint
from backend.models.bus_model import Bus
from backend.extensions.extension import db

bus_bp = Blueprint('bus_model', __name__)

@bus_bp.route('/bus_details', methods=["POST"])
def create_bus():
    """
    Create a new bus
    ---
    tags:
      - Bus
    parameters:
      - in: body
        name: body
        schema:
          type: object
          required:
            - bus_name
            - bus_number
            - capacity
          properties:
            bus_name:
              type: string
              example: Volvo Express
            bus_number:
              type: string
              example: MH-14-AB-1234
            capacity:
              type: integer
              example: 40
    responses:
      201:
        description: Bus has been added successfully
      400:
        description: bus_name, bus_number and capacity are required
    """
    data = request.get_json()

    if not data or "bus_name" not in data or "bus_number" not in data or "capacity" not in data:
        return jsonify({"error": "bus_name, bus_number and capacity are required"}), 400

    new_bus = Bus(
        bus_name=data["bus_name"],
        bus_number=data["bus_number"],
        capacity=data["capacity"]
    )

    db.session.add(new_bus)
    db.session.commit()

    return jsonify({"message": "Bus has been added successfully"}), 201


@bus_bp.route('/bus_details', methods=["GET"])
def get_bus():
    """
    Get all buses
    ---
    tags:
      - Bus
    responses:
      200:
        description: A list of all buses
        schema:
          type: array
          items:
            type: object
            properties:
              id:
                type: integer
              bus_name:
                type: string
              bus_number:
                type: string
              capacity:
                type: integer
    """
    buses = Bus.query.all()

    result = []
    for bus in buses:
        result.append({
            "id" : bus.id,
            "bus_name" : bus.bus_name,
            "bus_number" : bus.bus_number,
            "capacity" : bus.capacity
        })

    return jsonify(result), 200



@bus_bp.route('/bus_details/<int:id>', methods = ["GET"])
def get_bus_by_id(id):
    """
    Get a specific bus by ID
    ---
    tags:
      - Bus
    parameters:
      - in: path
        name: id
        type: integer
        required: true
        description: ID of the bus to retrieve
    responses:
      200:
        description: Bus details retrieved successfully
        schema:
          type: object
          properties:
            id:
              type: integer
            bus_name:
              type: string
            bus_number:
              type: string
            capacity:
              type: integer
      404:
        description: Bus not found
    """
    bus = Bus.query.get(id)

    if not bus:
        return jsonify({"error": "Bus not found"}), 404

    return jsonify({
        "id" : bus.id,
        "bus_name" : bus.bus_name,
        "bus_number" : bus.bus_number,
        "capacity" : bus.capacity
    }), 200


@bus_bp.route('/bus_details/<int:id>', methods = ["PUT"])
def update_bus(id):
    """
    Update bus details
    ---
    tags:
      - Bus
    parameters:
      - in: path
        name: id
        type: integer
        required: true
        description: ID of the bus to update
      - in: body
        name: body
        schema:
          type: object
          required:
            - bus_name
            - bus_number
            - capacity
          properties:
            bus_name:
              type: string
              example: Volvo Express Updated
            bus_number:
              type: string
              example: MH-14-AB-1234
            capacity:
              type: integer
              example: 45
    responses:
      200:
        description: Bus has been updated successfully
      400:
        description: bus_name, bus_number and capacity are required
      404:
        description: Bus not found
    """
    bus = Bus.query.get(id)

    if not bus:
        return jsonify({"error": "Bus not found"}), 404

    data = request.get_json()

    if not data or "bus_name" not in data or "bus_number" not in data or "capacity" not in data:
        return jsonify({"error": "bus_name, bus_number and capacity are required"}), 400

    bus.bus_name = data["bus_name"]
    bus.bus_number = data["bus_number"]
    bus.capacity = data["capacity"]

    db.session.commit()

    return jsonify({"message": "Bus has been updated successfully"}), 200
