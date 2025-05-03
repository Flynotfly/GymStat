from django.contrib.auth import get_user_model


User = get_user_model()


user = User.objects.create_user(
    email="test@example.com",
    first_name="Test",
    last_name="User",
    password="testpass",
)

other_user = User.objects.create_user(
    email="other@example.com",
    first_name="Other",
    last_name="User",
    password="otherpass",
)
