ENV OS
```bash
DB_NAME=trashcan_dev
DB_USER=root
DB_PASSWORD=''
DB_HOST='127.0.0.1'

GOOGLE_APPLICATION_CREDENTIALS='/path/to/keyfile.json'

AUTONOMOUS_API_HOST='https://dev.autonomous.ai'

```


Install package

```bash
mysql -u root -p -e "create database trashcan_dev"

brew install python3
brew install pandoc

pip3 install -r requirements.txt
python3 manage.py migrate
python3 manage.py loaddata fixtures/category.json
python3 manage.py loaddata fixtures/classify.json
python3 manage.py runserver 0.0.0.0:8000
python3 manage.py createsuperuser

```

Contract address EARTH Token: https://rinkeby.etherscan.io/address/0x0c3d537e9acad54eb4a5ca297f81e93b9e780373


API docs (admin auth): http://127.0.0.1:8000/docs/


EER:

![Alt text](/backend/doc/eer.png?raw=true "")
