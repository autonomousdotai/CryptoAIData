# Generated by Django 2.0.7 on 2018-07-25 03:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0055_remove_buydataset_email'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='ref_id',
            field=models.IntegerField(null=True),
        ),
        migrations.AlterUniqueTogether(
            name='buydataset',
            unique_together=set(),
        ),
    ]
