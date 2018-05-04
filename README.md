```bash
brew install python3
brew install pandoc

mysql -u root -p -e "create database trashcan_dev"

pip3 install -r requirements.txt

export GOOGLE_APPLICATION_CREDENTIALS='/path/to/keyfile.json'

python3 manage.py migrate

python3 manage.py runserver

```