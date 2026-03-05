-- SUPPLIERS
INSERT INTO Supplier (supplier_id, supplier_name, contact_email, phone_number) VALUES
(1,'Arctic Foods','contact@arcticfoods.com','9876543210'),
(2,'Fresh Dairy Co','info@freshdairy.com','9812345670'),
(3,'Polar Treats','sales@polartreats.com','9123456789'),
(4,'Cool Cream Ltd','support@coolcream.com','9988776655'),
(5,'Frozen Valley','contact@frozenvalley.com','9090909090');

-- WAREHOUSES
INSERT INTO Warehouse (warehouse_id, location, capacity) VALUES
(1,'Chennai',10000),
(2,'Bangalore',8000),
(3,'Hyderabad',7500),
(4,'Mumbai',12000),
(5,'Delhi',9000);

-- EMPLOYEES
INSERT INTO Employee (employee_id, name, role) VALUES
(1,'Rahul Sharma','Manager'),
(2,'Priya Iyer','Supervisor'),
(3,'Amit Verma','Operator'),
(4,'Sneha Kapoor','Operator'),
(5,'Karan Mehta','Warehouse Staff');

-- PERMANENT EMP
INSERT INTO Permanent_Emp (employee_id, monthly_salary, benefits) VALUES
(1,60000,'Health Insurance'),
(2,50000,'Health Insurance');

-- CONTRACT EMP
INSERT INTO Contract_Emp (employee_id, hourly_rate, contract_end_date) VALUES
(3,400,'2026-12-31'),
(4,350,'2026-10-31'),
(5,300,'2026-09-30');

-- PRODUCTS
INSERT INTO Product (product_id, product_name, supplier_id, category, unit_price) VALUES
(1,'Vanilla Ice Cream',1,'Ice Cream',120),
(2,'Chocolate Ice Cream',2,'Ice Cream',130),
(3,'Strawberry Ice Cream',3,'Ice Cream',125),
(4,'Mango Sorbet',4,'Sorbet',110),
(5,'Blueberry Gelato',5,'Gelato',150);

-- INVENTORY
INSERT INTO Inventory (product_id, warehouse_id, quantity) VALUES
(1,1,500),
(1,2,300),
(2,1,400),
(3,3,250),
(4,4,350),
(5,5,200);

-- STOCK TRANSACTIONS
INSERT INTO Stock_Transaction
(transaction_id, transaction_date, transaction_type, product_id, quantity, warehouse_id, employee_id)
VALUES
(1,'2026-01-10','INWARD',1,200,1,3),
(2,'2026-01-12','OUTWARD',2,50,1,4),
(3,'2026-01-15','INWARD',3,150,3,3),
(4,'2026-01-20','OUTWARD',1,70,2,5),
(5,'2026-01-25','INWARD',4,120,4,4);