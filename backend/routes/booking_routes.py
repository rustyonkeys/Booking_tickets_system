from flask import request, jsonify, Blueprint
from backend.models.booking import Booking
from backend.extensions.extension import db

booking_users = Blueprint('booking_users', __name__)

@booking_users.route("/booking", methods=["POST"])
def create_booking():
    """
    Create booking
    ---
    tags:
      - Booking
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            user_id:
              type: integer
            schedule_id:
              type: integer
            seat_number:
              type: string
            booking_status:
              type: string
    responses:
      201:
        description: Booking created
    """

    data = request.get_json()

    if not data or "user_id" not in data or "schedule_id" not in data:
        return jsonify({"error": "user_id and schedule_id are required"}), 400

    new_booking = Booking(
        user_id=data["user_id"],
        schedule_id=data["schedule_id"],
        seat_number=data.get("seat_number"),
        booking_status=data.get("booking_status", "pending")
    )

    db.session.add(new_booking)
    db.session.commit()

    return jsonify({"message": "Booking has been made successfully"}), 201


@booking_users.route("/booking", methods=["GET"])
def get_bookings():
    """
    Get all bookings
    ---
    tags:
      - Booking
    responses:
      200:
        description: List of bookings
    """

    bookings = Booking.query.all()

    result = []
    for booking in bookings:
        result.append({
            "id": booking.id,
            "user_id": booking.user_id,
            "schedule_id": booking.schedule_id,
            "seat_number": booking.seat_number,
            "booking_status": booking.booking_status,
            "created_at": booking.created_at
        })

    return jsonify(result), 200


# @booking_users.route("/booking_details/<int:id>", methods = ["GET"])
# def get_booking(id):
#     """
#     Get booking by id
#     ---
#     tags:
#       - Booking
#     parameters:
#       - in: path
#         name: id
#         required: true
#         schema:
#           type: integer
#     responses:
#       200:
#         description: Booking details
#     """

#     booking = Booking.query.get(id)

#     if not booking:
#         return jsonify({"error": "Booking not found"}), 404

#     return jsonify({
#         "id": booking.id,
#         "user_id": booking.user_id,
#         "schedule_id": booking.schedule_id,
#         "seat_number": booking.seat_number,
#         "booking_status": booking.booking_status,
#         "created_at": booking.created_at
#     }), 200









# from flask import Blueprint, jsonify, request
# from backend.extensions.extension import db
# from my_models import Booking, Booking_status, Payment_status # Assuming models are imported

# booking_bp = Blueprint('booking', __name__)

# @booking_bp.route('/bookings/<int:booking_id>/confirm', methods=['POST'])
# def confirm_booking(booking_id):
#     # 1. Fetch the existing pending booking from the database
#     booking = Booking.query.get(booking_id)
    
#     if not booking:
#         return jsonify({"error": "Booking not found"}), 404
        
#     # Optional check: Ensure it's actually pending before changing it
#     if booking.booking_status != Booking_status.PENDING:
#         return jsonify({"message": "Booking is already processed"}), 400

#     # 2. Simulate/Verify processing (e.g., payment successful)
#     # inside your business logic...
#     payment_success = True 

#     if payment_success:
#         # 3. Update the statuses using your Enum classes
#         booking.booking_status = Booking_status.CONFIRMED
#         booking.payment_status = Payment_status.PAID
        
#         # 4. Save changes to the database
#         # (SQLAlchemy's 'onupdate' will automatically refresh the 'updated_at' timestamp here)
#         db.session.commit()
        
#         return jsonify({
#             "message": "Booking confirmed successfully!",
#             "booking_id": booking.id,
#             "status": booking.booking_status.value # Returns the string 'CONFIRMED'
#         }), 200
#     else:
#         # Handle payment failure scenario
#         booking.payment_status = Payment_status.FAILED
#         db.session.commit()
#         return jsonify({"error": "Payment failed"}), 400
