# Generated by Django 2.0.5 on 2018-05-28 07:53

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0023_auto_20180528_0750'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='image',
            name='status',
        ),
    ]
