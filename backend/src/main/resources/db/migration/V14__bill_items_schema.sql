CREATE TABLE IF NOT EXISTS bill_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    item_name VARCHAR(150) NOT NULL,
    item_type VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bill_items_bill_id ON bill_items(bill_id);

INSERT INTO bill_items (bill_id, item_name, item_type, quantity, unit_price, total_price)
SELECT b.id, b.description, 'CONSULTATION', 1, b.amount, b.amount
FROM bills b
WHERE NOT EXISTS (
    SELECT 1
    FROM bill_items bi
    WHERE bi.bill_id = b.id
);
