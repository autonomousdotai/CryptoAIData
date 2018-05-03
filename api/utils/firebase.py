import pyrebase
from django.conf import settings


class Singleton(type):
    _instances = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super(Singleton, cls).__call__(*args, **kwargs)
        return cls._instances[cls]


class FirebaseUtil(metaclass=Singleton):
    FIREBASE_CONFIG_staging = {
        "apiKey": "AIzaSyDfviFngAts1xvYzkasrSrkLu_BIdmzghQ",
        "authDomain": "",
        "databaseURL": "https://trashcan-test.firebaseio.com/",
        "serviceAccount": "",
        "storageBucket": "",
    }

    FIREBASE_CONFIG_production = {
        "apiKey": "AIzaSyBlkizgHz2N1HbOqmFPfxrEWIV51RPrGo8",
        "authDomain": "",
        "databaseURL": "https://aos-brain.firebaseio.com/",
        "serviceAccount": "",
        "storageBucket": "",
    }

    FIREBASE_CONFIG = {
        'production': FIREBASE_CONFIG_production,
        'staging': FIREBASE_CONFIG_staging,
        'localhost': FIREBASE_CONFIG_staging
    }

    firebase = pyrebase.initialize_app(FIREBASE_CONFIG[settings.ENV_NAME])
    auth = firebase.auth()
    user = auth.sign_in_with_email_and_password('admin@autonomous.nyc', 'Ab123456')
    db = firebase.database()

    def send(self, channel, message):
        self.db.child(channel).push(message, self.user['idToken'])

    # @classmethod
    # def send(cls, channel, message):
    #     cls.db.child(channel).set(message)
