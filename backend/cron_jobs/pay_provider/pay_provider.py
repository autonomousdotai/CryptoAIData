import os
import MySQLdb
import MySQLdb.cursors
import requests
from itertools import groupby
from operator import itemgetter
from dataset import Dataset


def get_db_connection():
    mysql_host = os.getenv('MYSQL_HOST', '127.0.0.1')
    mysql_user = os.getenv('MYSQL_USER', '')
    mysql_password = os.getenv('MYSQL_PASSWORD', '')
    mysql_db = os.getenv('MYSQL_DB', 'trashcan_dev')
    db = MySQLdb.connect(host=mysql_host, user=mysql_user, passwd=mysql_password, db=mysql_db, cursorclass=MySQLdb.cursors.DictCursor)
    return db


def pay_provider(cat_id, provider):
    api_host = os.getenv('API_HOST', 'http://localhost')
    api_port = os.getenv('API_PORT', 8000)

    res = requests.post(
            '{api_host}:{api_port}/api/contract/pay/'.format(api_host=api_host, api_port=api_port),
            data = {
                    "category": cat_id,
                    "provider": provider
            }
    )
    if res.status_code != 201:
            raise Exception("""Failed to call to smart contract for increasing balance
                    with (category_id: {cat_id}, provider: {provider})""" \
                    .format(cat_id=cat_id, provider=provider))


def pay_providers(cat_id, providers):
    if len(providers) == 0:
        return

    for provider in providers:
        print('Pay for provider %s in category %d' %(provider, cat_id))
        pay_provider(cat_id, provider)


def get_categories(db):
    cur = db.cursor()
    cur.execute("SELECT * FROM api_category WHERE contract_addr IS NOT NULL")
    numrows = cur.rowcount

    print('Found %d categories' % numrows)

    for x in range(0, numrows):
        row = cur.fetchone()

        ds = Dataset(row['contract_addr'])
        providers = ds.get_providers()
        print('Found %d providers of category %d' % (len(providers), row['id']))

        pay_providers(row['id'], providers)
    cur.close()


def process(db):
    get_categories(db)


def main():
	print('Start paying for providers...')
	db = get_db_connection()
	process(db)
	db.close()
	print('Finished paying for providers...')


if __name__ == '__main__':
	main()
