from django.contrib.auth import get_user_model


def jwt_get_username_from_payload_handler(payload):
    model = get_user_model()
    username = payload.get('email')
    username_field = getattr(model, 'USERNAME_FIELD', 'username')

    kwargs = {
        username_field + '__iexact': username,
        'defaults': {username_field: username.lower()}
    }

    model.objects.get_or_create(**kwargs)
    return username
