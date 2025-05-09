from django.conf import settings
from django.db import migrations
from django.contrib.postgres.operations import TrigramExtension


class Migration(migrations.Migration):

    dependencies = [
        ("training", "0003_exercisetemplate_et_search_vector"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [TrigramExtension()]
