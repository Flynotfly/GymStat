from django.contrib.auth.base_user import BaseUserManager


class CustomUserManager(BaseUserManager):
    @classmethod
    def normalize_email(cls, email):
        return email.strip().lower()

    def create_user(self, email, password, first_name, last_name, **extra_fields):
        """
        Create and save a user with the given email and password.
        """
        if not email:
            raise ValueError("The Email must be set")
        if not first_name:
            raise ValueError("The first name must be set")
        if not last_name:
            raise ValueError("The last name must be set")

        email = self.normalize_email(email)
        user = self.model(
            email=email,
            first_name=first_name,
            last_name=last_name,
            **extra_fields
        )
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password, first_name, last_name, **extra_fields):
        """
        Create and save a SuperUser with the given email and password.
        """
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        return self.create_user(email, password, first_name, last_name, **extra_fields)
