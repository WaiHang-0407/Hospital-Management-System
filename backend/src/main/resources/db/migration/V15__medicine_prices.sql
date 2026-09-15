ALTER TABLE medicines
ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2) NOT NULL DEFAULT 0.00;

UPDATE medicines SET price = 4.50 WHERE LOWER(name) = LOWER('Paracetamol') AND price = 0.00;
UPDATE medicines SET price = 6.00 WHERE LOWER(name) = LOWER('Ibuprofen') AND price = 0.00;
UPDATE medicines SET price = 18.00 WHERE LOWER(name) = LOWER('Amoxicillin') AND price = 0.00;
UPDATE medicines SET price = 5.50 WHERE LOWER(name) = LOWER('Cetirizine') AND price = 0.00;
UPDATE medicines SET price = 12.00 WHERE LOWER(name) = LOWER('Metformin') AND price = 0.00;
UPDATE medicines SET price = 14.00 WHERE LOWER(name) = LOWER('Amlodipine') AND price = 0.00;
UPDATE medicines SET price = 10.50 WHERE LOWER(name) = LOWER('Omeprazole') AND price = 0.00;
UPDATE medicines SET price = 28.00 WHERE LOWER(name) = LOWER('Salbutamol Inhaler') AND price = 0.00;
UPDATE medicines SET price = 5.00 WHERE LOWER(name) = LOWER('Loratadine') AND price = 0.00;
UPDATE medicines SET price = 8.50 WHERE LOWER(name) = LOWER('Cough Syrup') AND price = 0.00;
