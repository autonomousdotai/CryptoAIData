from django.contrib import admin
from .models import Profile, Image, Product, Firmware

admin.site.register(Profile)
admin.site.register(Image)
admin.site.register(Product)
admin.site.register(Firmware)
