def send_booking_confirmation(
    email: str,
    booking_id: int
):
    message = (
        f"Booking #{booking_id} confirmed successfully "
        f"for {email}"
    )

    print(message)

    return {
        "success": True,
        "message": message
    }


def send_booking_cancellation(
    email: str,
    booking_id: int
):
    message = (
        f"Booking #{booking_id} cancelled "
        f"for {email}"
    )

    print(message)

    return {
        "success": True,
        "message": message
    }