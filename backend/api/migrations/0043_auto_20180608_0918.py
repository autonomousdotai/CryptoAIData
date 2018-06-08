# Generated by Django 2.0.5 on 2018-06-08 09:18

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0042_merge_20180608_0820'),
    ]

    operations = [
        migrations.AddField(
            model_name='image',
            name='profile',
            field=models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.CASCADE, to='api.Profile'),
        ),
        migrations.AddField(
            model_name='profile',
            name='following_profiles',
            field=models.ManyToManyField(through='api.FollowingProfile', to='api.Profile'),
        ),
    ]
