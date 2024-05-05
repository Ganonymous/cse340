INSERT INTO account (account_firstname, account_lastname, account_email, account_password)
	VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

UPDATE account
	SET account_type = 'Admin'
	WHERE account_id = (SELECT account_id FROM account WHERE account_firstname = 'Tony' AND account_lastname = 'Stark');

DELETE FROM account WHERE account_id = (SELECT account_id FROM account WHERE account_firstname = 'Tony' AND account_lastname = 'Stark');

UPDATE inventory
	SET inv_description = REPLACE(inv_description, 'the small interiors', 'a huge interior')
	WHERE inv_id = (SELECT inv_id FROM inventory WHERE inv_make = 'GM' AND inv_model = 'Hummer');

SELECT inv_make, inv_model, classification_name
	FROM inventory i
		JOIN classification cl
		ON i.classification_id = cl.classification_id
	WHERE classification_name = 'Sport';

UPDATE inventory
	SET inv_image = REPLACE(inv_image, 'images/', 'images/vehicles/'), inv_thumbnail = REPLACE(inv_thumbnail, 'images/', 'images/vehicles/');