from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from ...models import UserSettings

User = get_user_model()


class Command(BaseCommand):
    help = 'Create default UserSettings for existing users'

    def handle(self, *args, **kwargs):
        counter_created = 0
        for user in User.objects.all():
            settings, created = UserSettings.objects.get_or_create(user=user)
            if created:
                counter_created += 1
        self.stdout.write(f'Created settings model for {counter_created} users')
