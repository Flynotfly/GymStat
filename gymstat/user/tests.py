from django.contrib.auth import get_user_model

User = get_user_model()


user_data = {
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "User",
    "password": "testpass",
}

other_user_data = {
    "email": "other@example.com",
    "first_name": "Other",
    "last_name": "User",
    "password": "otherpass",
}

admin_user_data = {
    "email": "admin@example.com",
    "first_name": "Admin",
    "last_name": "User",
    "password": "adminpass",
    "is_staff": True,
}

login_data = {
    "email": "test@example.com",
    "password": "testpass",
}
