# Generated by Django 2.0.5 on 2018-05-28 07:50

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0022_auto_20180523_0745'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='image',
            name='type',
        ),
        migrations.RemoveField(
            model_name='imageprofile',
            name='type',
        ),
    ]