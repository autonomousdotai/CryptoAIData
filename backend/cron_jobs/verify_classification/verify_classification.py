import os
import MySQLdb
import MySQLdb.cursors
import requests
from itertools import groupby
from operator import itemgetter


def get_db_connection():
	mysql_host = os.getenv('MYSQL_HOST', 'localhost')
	mysql_user = os.getenv('MYSQL_USER', 'root')
	mysql_password = os.getenv('MYSQL_PASSWORD', 'minhduc0812112')
	mysql_db = os.getenv('MYSQL_DB', 'trashcan_dev')
	db = MySQLdb.connect(host=mysql_host, user=mysql_user, passwd=mysql_password, db=mysql_db, cursorclass=MySQLdb.cursors.DictCursor)
	return db


def get_image_labels(db, image_id):
	cursor = db.cursor()
	cursor.execute(
		"""
			SELECT ip.id as image_profile_id, ip.image_id, ip.profile_id, ip.classify_id,
				i.category_id, p.ether_address, cp.balance, cp.id as category_profile_id
			FROM api_imageprofile ip
			INNER JOIN api_image i on i.id = ip.image_id
			INNER JOIN api_profile p on p.id = ip.profile_id
			LEFT JOIN api_categoryprofile cp on (cp.category_id = i.category_id and cp.profile_id = ip.profile_id)
			WHERE ip.image_id = {image_id}
		""" \
		.format(image_id=image_id)
	)
	image_labels = cursor.fetchall()
	cursor.close()
	return list(image_labels)


def collect(image_labels, eligible_items):
	labels_num_max = 0
	chose_classify_id = -1
	for key, group in groupby(image_labels, key=lambda x: x['classify_id']):
		group_len = len(list(group))
		if group_len > labels_num_max:
			labels_num_max = group_len
			chose_classify_id = key

	is_majority = labels_num_max >= (int(len(image_labels) / 2) + 1)
	if is_majority:
		items_with_true_label = filter(lambda i: i['classify_id'] == chose_classify_id, image_labels)
		eligible_items = eligible_items + list(items_with_true_label)
	return eligible_items



def inc_balance(db, category_id, ether_address, balance, image_ids, profile_id):
	api_host = os.getenv('API_HOST', 'http://localhost')
	api_port = os.getenv('API_PORT', 8000)

	res = requests.post(
		'{api_host}:{api_port}/api/contract/inc-balance/'.format(api_host=api_host, api_port=api_port),
		data = {
			"category_id": category_id,
			"ether_address": ether_address,
			"balance": balance
		}
	)
	if res.status_code != 200:
		raise Exception("""Failed to call to smart contract for increasing balance
			with (category_id: {category_id}, ether_address: {ether_address}, balance: {balance})""" \
			.format(category_id=category_id, ether_address=ether_address, balance=balance))

	res_content = res.json()
	tx = res_content['tx']
	update_tx(db, profile_id, image_ids, tx)



def update_tx(db, profile_id, image_ids, tx):
	cursor = db.cursor()
	image_ids_tuple = tuple(image_ids)
	query = """
		UPDATE api_imageprofile
		SET tx = '{tx}'
		WHERE image_id in {image_ids_tuple}
		AND profile_id = {profile_id}
	""" \
	.format(tx=tx, image_ids_tuple=image_ids_tuple, profile_id=profile_id)

	print('query: ', query)
	cursor.execute(query)
	db.commit()
	cursor.close()


def reward(db, eligible_items):
	grouper = itemgetter('category_id', 'profile_id', 'ether_address')
	for key, grp in groupby(sorted(eligible_items, key = grouper), grouper):
		print('key: ', key)
		group_detail = list(grp)

		category_id = key[0]
		profile_id = key[1]
		ether_address = key[2]
		num = len(group_detail)
		image_ids = [o['image_id'] for o in group_detail]
		inc_balance(db, category_id, ether_address, num, image_ids, profile_id)



def update_tx(db, image_profile_id, tx):
	cursor = db.cursor()
	cursor.execute(
		"""
			UPDATE api_imageprofile
			SET tx = '{tx}'
			WHERE id = {image_profile_id}
		""" \
		.format(tx=tx, image_profile_id=image_profile_id)
	)
	db.commit()
	cursor.close()


def update_balance(db, category_profile_id, current_balance):
	cursor = db.cursor()
	cursor.execute(
		"""
			UPDATE api_categoryprofile
			SET balance = {current_balance} + 1
			WHERE id = {category_profile_id}
		""" \
		.format(current_balance=current_balance, category_profile_id=category_profile_id)
	)
	db.commit()
	cursor.close()


def insert_category_profile(db, category_id, profile_id):
	cursor = db.cursor()
	cursor.execute(
		"""
			INSERT INTO api_categoryprofile(balance, category_id, profile_id)
			VALUES (1, {category_id}, {profile_id});
		""" \
		.format(category_id=category_id, profile_id=profile_id)
	)
	db.commit()
	cursor.close()



def process(db):
	label_num = int(os.getenv('LABEL_NUM', 10))
	cursor = db.cursor()
	cursor.execute(
		"""
			SELECT image_id
			FROM api_imageprofile
			GROUP BY image_id
			HAVING COUNT(*) >= {label_num}
			   AND image_id NOT IN (SELECT DISTINCT image_id
			                        FROM api_imageprofile
			                        WHERE tx IS NOT NULL
			                        OR    tx <> '')
		""" \
		.format(label_num=label_num)
	)

	eligible_items = []
	while True:
		row = cursor.fetchone()
		if row is None:
			break

		image_id = row['image_id']
		image_labels = get_image_labels(db, image_id)
		# reward(db, image_labels)
		eligible_items = collect(image_labels, eligible_items)

	print('eligible_items: ', eligible_items)
	reward(db, eligible_items)

	cursor.close()


def main():
	print('Start verifying classification...')
	db = get_db_connection()
	process(db)
	db.close()
	print('Finished verifying classification...')


if __name__ == '__main__':
	main()