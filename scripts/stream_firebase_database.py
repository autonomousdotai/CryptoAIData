import pyrebase

config = {
  "apiKey": "AIzaSyDfviFngAts1xvYzkasrSrkLu_BIdmzghQ",
  "authDomain": "",
  "databaseURL": "https://trashcan-test.firebaseio.com/",
  "storageBucket": ""
}

firebase = pyrebase.initialize_app(config)

db = firebase.database()

def stream_handler(message):
    print(message["event"]) # put
    print(message["path"]) # /-K7yGTTEp7O549EzTYtI
    print(message["data"]) # {'title': 'Pyrebase', "body": "etc..."}

product_id = '123'
my_stream = db.child(product_id).stream(stream_handler)
