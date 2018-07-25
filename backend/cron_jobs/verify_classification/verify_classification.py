import os
# from contract.dataset_factory import DatasetFactory
import itertools
import MySQLdb
import MySQLdb.cursors


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


def reward(db, image_labels):
	labels_num_max = 0
	chose_classify_id = -1
	for key, group in itertools.groupby(image_labels, key=lambda x: x['classify_id']):
		group_len = len(list(group))
		if group_len > labels_num_max:
			labels_num_max = group_len
			chose_classify_id = key

	items_with_true_label = filter(lambda i: i['classify_id'] == chose_classify_id, image_labels)
	inc_balance(db, list(items_with_true_label))



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


def inc_balance(db, items_with_true_label):
	for item in items_with_true_label:
		category_id = item['category_id']
		ether_address = item['ether_address']
		image_profile_id = item['image_profile_id']
		category_profile_id = item['category_profile_id']
		current_balance = item['balance']
		profile_id = item['profile_id']

		# tx = DatasetFactory().add_provider(category_id, ether_address, 1)
		tx = 'fake_tx'
		update_tx(db, image_profile_id, tx)
		if category_profile_id is None: # need to insert new one
			insert_category_profile(db, category_id, profile_id)
		else:
			update_balance(db, category_profile_id, current_balance)


def process(db):
	label_num = int(os.getenv('LABEL_NUM', 6))
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
	while True:
		row = cursor.fetchone()
		if row is None:
			break

		image_id = row['image_id']
		image_labels = get_image_labels(db, image_id)
		reward(db, image_labels)

	cursor.close()


def main():
	try:
		print('Start verifying classification...')
		db = get_db_connection()
		process(db)
		db.close()
		print('Finished verifying classification...')

	except Exception as e:
		raise e



if __name__ == '__main__':
	main()