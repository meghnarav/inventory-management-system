-- SETTINGS
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE Stock_Transaction;
TRUNCATE TABLE Inventory;
TRUNCATE TABLE Contract_Employee;
TRUNCATE TABLE Permanent_Employee;
TRUNCATE TABLE Product;
TRUNCATE TABLE Employee;
TRUNCATE TABLE Warehouse;
TRUNCATE TABLE Supplier;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. TOP 5 SUPPLIERS
INSERT INTO Supplier (supplier_id, supplier_name, contact_email, phone_number) VALUES
(1,'Arctic Foods','contact@arcticfoods.com','9876543210'),
(2,'Fresh Dairy Co','info@freshdairy.com','9812345670'),
(3,'Polar Treats','sales@polartreats.com','9123456789'),
(4,'Cool Cream Ltd','support@coolcream.com','9988776655'),
(5,'Frozen Valley','contact@frozenvalley.com','9090909090');

-- 2. 5 MAJOR CITIES (WAREHOUSES)
INSERT INTO Warehouse (warehouse_id, location, capacity) VALUES
(1,'Chennai',10000),
(2,'Bengaluru',8000),
(3,'Hyderabad',7500),
(4,'Mumbai',12000),
(5,'Delhi',9000);

-- 3. CORE EMPLOYEES
INSERT INTO Role (role_id, role_name) VALUES
(1,'Manager'),
(2,'Supervisor'),
(3,'Operator'),
(4,'Warehouse Staff');

INSERT INTO Employee (employee_id, name, role_id) VALUES
(1,'Sanya Malhotra',1),
(2,'Smriti Mandanna',2),
(3,'Shreyas Iyer',3),
(4,'Shahid Kapoor',3),
(5,'Madhavan Ranganathan',4);

INSERT INTO Permanent_Employee (employee_id, monthly_salary, benefits) VALUES
(1,60000,'Health Insurance'),
(2,50000,'Health Insurance');

INSERT INTO Contract_Employee (employee_id, hourly_rate, contract_end_date) VALUES
(3,400,'2026-12-31'),
(4,350,'2026-10-31'),
(5,300,'2026-09-30');

-- 4. 10 KEY PRODUCTS
INSERT INTO Category (category_id, category_name) VALUES
(1,'Ice Cream'),
(2,'Sorbet'),
(3,'Gelato'),
(4,'Traditional');

INSERT INTO Product (product_id, product_name, supplier_id, category_id, unit_price) VALUES
(1,'Vanilla Ice Cream',1,1,120),
(2,'Chocolate Ice Cream',2,1,130),
(3,'Strawberry Ice Cream',3,1,125),
(4,'Mango Sorbet',4,2,110),
(5,'Blueberry Gelato',5,3,150),
(6,'Butterscotch Cone',1,1,140),
(7,'Pistachio Kulfi',2,4,160),
(8,'Cookie Crumble',3,1,170),
(9,'Mint Choco Chip',4,1,135),
(10,'Coffee Gelato',5,3,155);

-- 5. CONCENTRATED INVENTORY
INSERT INTO Inventory (product_id, warehouse_id, quantity) VALUES
(1,1,500), (1,2,300), (2,1,450), (3,3,250), (4,4,350), 
(5,5,200), (6,1,150), (7,3,180), (8,4,220), (9,2,110);

-- 6. RECENT TRANSACTIONS (CLEAN TIMELINE)
INSERT INTO Stock_Transaction 
(transaction_id, transaction_date, transaction_type, product_id, quantity, warehouse_id, employee_id)
VALUES
(1,'2026-03-01','INWARD',1,100,1,3),
(2,'2026-03-02','OUTWARD',2,20,1,4),
(3,'2026-03-03','INWARD',3,50,3,3),
(4,'2026-03-04','OUTWARD',1,30,2,5),
(5,'2026-03-05','INWARD',4,80,4,4);