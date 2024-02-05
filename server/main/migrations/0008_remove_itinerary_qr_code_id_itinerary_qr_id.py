# Generated by Django 4.1.13 on 2024-01-30 06:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0007_itinerary_qr_code_id'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='itinerary',
            name='qr_code_id',
        ),
        migrations.AddField(
            model_name='itinerary',
            name='qr_id',
            field=models.CharField(default=1, max_length=100),
            preserve_default=False,
        ),
    ]