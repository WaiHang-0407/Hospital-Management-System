INSERT INTO medicines (name, category, strength, unit, stock_quantity)
SELECT 'Paracetamol', 'Pain relief', '500mg', 'Tablet', 200
WHERE NOT EXISTS (SELECT 1 FROM medicines WHERE LOWER(name) = LOWER('Paracetamol'));

INSERT INTO medicines (name, category, strength, unit, stock_quantity)
SELECT 'Ibuprofen', 'Pain relief', '200mg', 'Tablet', 120
WHERE NOT EXISTS (SELECT 1 FROM medicines WHERE LOWER(name) = LOWER('Ibuprofen'));

INSERT INTO medicines (name, category, strength, unit, stock_quantity)
SELECT 'Amoxicillin', 'Antibiotic', '500mg', 'Capsule', 90
WHERE NOT EXISTS (SELECT 1 FROM medicines WHERE LOWER(name) = LOWER('Amoxicillin'));

INSERT INTO medicines (name, category, strength, unit, stock_quantity)
SELECT 'Cetirizine', 'Antihistamine', '10mg', 'Tablet', 150
WHERE NOT EXISTS (SELECT 1 FROM medicines WHERE LOWER(name) = LOWER('Cetirizine'));

INSERT INTO medicines (name, category, strength, unit, stock_quantity)
SELECT 'Metformin', 'Diabetes', '500mg', 'Tablet', 100
WHERE NOT EXISTS (SELECT 1 FROM medicines WHERE LOWER(name) = LOWER('Metformin'));

INSERT INTO medicines (name, category, strength, unit, stock_quantity)
SELECT 'Amlodipine', 'Blood pressure', '5mg', 'Tablet', 110
WHERE NOT EXISTS (SELECT 1 FROM medicines WHERE LOWER(name) = LOWER('Amlodipine'));

INSERT INTO medicines (name, category, strength, unit, stock_quantity)
SELECT 'Omeprazole', 'Gastric', '20mg', 'Capsule', 130
WHERE NOT EXISTS (SELECT 1 FROM medicines WHERE LOWER(name) = LOWER('Omeprazole'));

INSERT INTO medicines (name, category, strength, unit, stock_quantity)
SELECT 'Salbutamol Inhaler', 'Respiratory', '100mcg', 'Inhaler', 60
WHERE NOT EXISTS (SELECT 1 FROM medicines WHERE LOWER(name) = LOWER('Salbutamol Inhaler'));

INSERT INTO medicines (name, category, strength, unit, stock_quantity)
SELECT 'Loratadine', 'Antihistamine', '10mg', 'Tablet', 100
WHERE NOT EXISTS (SELECT 1 FROM medicines WHERE LOWER(name) = LOWER('Loratadine'));

INSERT INTO medicines (name, category, strength, unit, stock_quantity)
SELECT 'Cough Syrup', 'Cough and cold', '100ml', 'Bottle', 80
WHERE NOT EXISTS (SELECT 1 FROM medicines WHERE LOWER(name) = LOWER('Cough Syrup'));
