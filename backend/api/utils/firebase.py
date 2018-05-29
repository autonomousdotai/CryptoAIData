import pyrebase
from django.conf import settings


class Singleton(type):
    _instances = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super(Singleton, cls).__call__(*args, **kwargs)
        return cls._instances[cls]


class FirebaseUtil(metaclass=Singleton):
    FIREBASE_CONFIG = {
        "apiKey": settings.FIREBASE_API_KEY,
        "authDomain": "",
        "databaseURL": settings.FIREBASE_DATABASE_URL,
        "serviceAccount": "",
        "storageBucket": "",
    }
    firebase = pyrebase.initialize_app(FIREBASE_CONFIG)
    auth = firebase.auth()

    def send(self, channel, message):
        user = self.auth.sign_in_with_email_and_password(settings.FIREBASE_ADMIN_ACCOUNT, settings.FIREBASE_ADMIN_PASSWORD)
        db = self.firebase.database()
        db.child(channel).push(message, user['idToken'])
