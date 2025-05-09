# Generated by Django 5.1.4 on 2025-04-12 15:11

import django.contrib.postgres.indexes
import django.contrib.postgres.search
from django.conf import settings
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("training", "0002_exercisetemplate_tags"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddIndex(
            model_name="exercisetemplate",
            index=django.contrib.postgres.indexes.GinIndex(
                django.contrib.postgres.search.SearchVector(
                    "name", "description", config="english"
                ),
                name="et_search_vector",
            ),
        ),
    ]
