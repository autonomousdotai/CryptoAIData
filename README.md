ENV OS
```bash
DB_NAME=trashcan_dev
DB_USER=root
DB_PASSWORD=''
DB_HOST='127.0.0.1'

AUTONOMOUS_API_HOST='https://dev.autonomous.ai'

CONTRACT_ADDRESS='0x0c3d537e9acad54eb4a5ca297f81e93b9e780373'

FIREBASE_ADMIN_ACCOUNT='admin@autonomous.nyc'
FIREBASE_ADMIN_PASSWORD='Ab123456'
FIREBASE_API_KEY='AIzaSyDfviFngAts1xvYzkasrSrkLu_BIdmzghQ'
FIREBASE_DATABASE_URL='https://trashcan-test.firebaseio.com/'

```


Install package

```bash
brew install python3
brew install pandoc

mysql -u root -p -e "create database trashcan_dev"

pip3 install -r requirements.txt

export GOOGLE_APPLICATION_CREDENTIALS='/path/to/keyfile.json'

python3 manage.py migrate

python3 manage.py runserver 0.0.0.0:8000

```