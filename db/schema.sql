-- SWIMS Database
DROP DATABASE IF EXISTS swims;
CREATE DATABASE swims;
USE swims;

CREATE TABLE Supplier (
    supplier_id INT PRIMARY KEY AUTO_INCREMENT,
    supplier_name VARCHAR(100) NOT NULL,
    contact_email VARCHAR(100),
    phone_number VARCHAR(20)
);

CREATE TABLE Product (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
    product_name VARCHAR(100) NOT NULL,
    supplier_id INT NOT NULL,
    category VARCHAR(50),
    unit_price DECIMAL(10,2),
    FOREIGN KEY (supplier_id) REFERENCES Supplier(supplier_id)
);

CREATE TABLE Warehouse (
    warehouse_id INT PRIMARY KEY AUTO_INCREMENT,
    location VARCHAR(100) NOT NULL,
    capacity INT
);

CREATE TABLE Inventory (
    product_id INT NOT NULL,
    warehouse_id INT NOT NULL,
    quantity INT DEFAULT 0,
    PRIMARY KEY (product_id, warehouse_id),
    FOREIGN KEY (product_id) REFERENCES Product(product_id),
    FOREIGN KEY (warehouse_id) REFERENCES Warehouse(warehouse_id)
);

CREATE TABLE Employee (
    employee_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    role VARCHAR(50)
);

CREATE TABLE Permanent_Employee (
    employee_id INT PRIMARY KEY,
    monthly_salary DECIMAL(10,2),
    benefits VARCHAR(200),
    FOREIGN KEY (employee_id) REFERENCES Employee(employee_id)
);

CREATE TABLE Contract_Employee (
    employee_id INT PRIMARY KEY,
    hourly_rate DECIMAL(10,2),
    contract_end_date DATE,
    FOREIGN KEY (employee_id) REFERENCES Employee(employee_id)
);

CREATE TABLE Stock_Transaction (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    transaction_type ENUM('INWARD','OUTWARD') NOT NULL,
    product_id INT NOT NULL,
    warehouse_id INT NOT NULL,
    employee_id INT NOT NULL,
    quantity INT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES Product(product_id),
    FOREIGN KEY (warehouse_id) REFERENCES Warehouse(warehouse_id),
    FOREIGN KEY (employee_id) REFERENCES Employee(employee_id)
);