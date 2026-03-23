from .db_connection import get_connection
from typing import Optional, Dict, Any

# ---------------------------------------------------------------------------
# Read helpers
# ---------------------------------------------------------------------------

def fetch_suppliers():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT supplier_id, supplier_name, contact_email, phone_number FROM Supplier"
        )
        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return data
    except Exception as e:
        print("ERROR:", e)
        return []


def fetch_products():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT p.product_id,
                   p.product_name,
                   c.category_name,
                   p.unit_price,
                   p.supplier_id,
                   s.supplier_name
            FROM Product p
            JOIN Supplier s ON p.supplier_id = s.supplier_id
            JOIN Category c ON p.category_id = c.category_id
            """
        )
        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return data
    except Exception:
        return []


def fetch_warehouses():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT warehouse_id, location, capacity FROM Warehouse"
        )
        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return data
    except Exception:
        return []


def fetch_employees():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT e.employee_id,
                   e.name,
                   r.role_name
            FROM Employee e
            JOIN Role r ON e.role_id = r.role_id
            """
        )
        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return data
    except Exception:
        return []

def add_permanent_employee(
    employee_id: int,
    monthly_salary: Optional[float],
    benefits: Optional[str]
) -> None:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO Permanent_Employee (employee_id, monthly_salary, benefits)
                VALUES (%s, %s, %s)
                """,
                (employee_id, monthly_salary, benefits),
            )
        conn.commit()


def add_contract_employee(
    employee_id: int,
    hourly_rate: Optional[float],
    contract_end_date: Optional[str]
) -> None:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO Contract_Employee (employee_id, hourly_rate, contract_end_date)
                VALUES (%s, %s, %s)
                """,
                (employee_id, hourly_rate, contract_end_date),
            )
        conn.commit()

def fetch_inventory():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT i.product_id,
                   p.product_name,
                   i.warehouse_id,
                   w.location,
                   i.quantity
            FROM Inventory i
            JOIN Product p ON i.product_id = p.product_id
            JOIN Warehouse w ON i.warehouse_id = w.warehouse_id
            """
        )
        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return data
    except Exception:
        return []


def fetch_stock_transactions():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT st.transaction_id,
                   st.transaction_date,
                   st.transaction_type,
                   st.quantity,
                   p.product_name,
                   w.location,
                   e.name AS employee_name
            FROM Stock_Transaction st
            JOIN Product p ON st.product_id = p.product_id
            JOIN Warehouse w ON st.warehouse_id = w.warehouse_id
            JOIN Employee e ON st.employee_id = e.employee_id
            ORDER BY st.transaction_date DESC
            """
        )
        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return data
    except Exception:
        return []

def fetch_employees_detailed():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT e.employee_id,
                   e.name,
                   r.role_name,
                   CASE
                       WHEN pe.employee_id IS NOT NULL THEN 'Permanent'
                       WHEN ce.employee_id IS NOT NULL THEN 'Contract'
                   END AS employee_type,
                   pe.monthly_salary,
                   pe.benefits,
                   ce.hourly_rate,
                   ce.contract_end_date
            FROM Employee e
            JOIN Role r ON e.role_id = r.role_id
            LEFT JOIN Permanent_Employee pe ON e.employee_id = pe.employee_id
            LEFT JOIN Contract_Employee ce ON e.employee_id = ce.employee_id
        """)

        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return data
    except Exception as e:
        print("ERROR:", e)
        return []
    
def fetch_products_detailed():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT p.product_id,
                   p.product_name,
                   c.category_name,
                   p.unit_price,
                   s.supplier_name
            FROM Product p
            JOIN Supplier s ON p.supplier_id = s.supplier_id
            JOIN Category c ON p.category_id = c.category_id
        """)

        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return data
    except Exception as e:
        print("ERROR:", e)
        return []
    



# ---------------------------------------------------------------------------
# Write helpers - CRUD
# ---------------------------------------------------------------------------

def create_supplier(name, email=None, phone=None):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            INSERT INTO Supplier (supplier_name, contact_email, phone_number)
            VALUES (%s, %s, %s)
            """,
            (name, email, phone),
        )
        conn.commit()
        return cursor.lastrowid
    except Exception:
        conn.rollback()
        return None
    finally:
        cursor.close()
        conn.close()


def update_supplier(supplier_id, name, email=None, phone=None):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            UPDATE Supplier
            SET supplier_name = %s,
                contact_email = %s,
                phone_number = %s
            WHERE supplier_id = %s
            """,
            (name, email, phone, supplier_id),
        )
        conn.commit()
        return cursor.rowcount > 0
    except Exception:
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()


def delete_supplier(supplier_id):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "DELETE FROM Supplier WHERE supplier_id = %s", (supplier_id,)
        )
        conn.commit()
        return cursor.rowcount > 0
    except Exception:
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()


def create_product(name, supplier_id, category_id=None, unit_price=None):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            INSERT INTO Product (product_name, supplier_id, category_id, unit_price)
            VALUES (%s, %s, %s, %s)
            """,
            (name, supplier_id, category_id, unit_price),
        )
        conn.commit()
        return cursor.lastrowid
    except Exception:
        conn.rollback()
        return None
    finally:
        cursor.close()
        conn.close()


def update_product(product_id, name, supplier_id, category_id=None, unit_price=None):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            UPDATE Product
            SET product_name = %s,
                supplier_id = %s,
                category_id = %s,
                unit_price = %s
            WHERE product_id = %s
            """,
            (name, supplier_id, category_id, unit_price, product_id),
        )
        conn.commit()
        return cursor.rowcount > 0
    except Exception:
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()


def delete_product(product_id):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "DELETE FROM Product WHERE product_id = %s", (product_id,)
        )
        conn.commit()
        return cursor.rowcount > 0
    except Exception:
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()


def create_warehouse(location, capacity=None):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            INSERT INTO Warehouse (location, capacity)
            VALUES (%s, %s)
            """,
            (location, capacity),
        )
        conn.commit()
        return cursor.lastrowid
    except Exception:
        conn.rollback()
        return None
    finally:
        cursor.close()
        conn.close()


def update_warehouse(warehouse_id, location, capacity=None):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            UPDATE Warehouse
            SET location = %s,
                capacity = %s
            WHERE warehouse_id = %s
            """,
            (location, capacity, warehouse_id),
        )
        conn.commit()
        return cursor.rowcount > 0
    except Exception:
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()


def delete_warehouse(warehouse_id):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "DELETE FROM Warehouse WHERE warehouse_id = %s", (warehouse_id,)
        )
        conn.commit()
        return cursor.rowcount > 0
    except Exception:
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()


def create_employee(name, role_id):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            INSERT INTO Employee (name, role_id)
            VALUES (%s, %s)
            """,
            (name, role_id),
        )
        conn.commit()
        return cursor.lastrowid
    except Exception:
        conn.rollback()
        return None
    finally:
        cursor.close()
        conn.close()


def update_employee(employee_id, name, role_id):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            UPDATE Employee
            SET name = %s,
                role_id = %s
            WHERE employee_id = %s
            """,
            (name, role_id, employee_id),
        )
        conn.commit()
        return cursor.rowcount > 0
    except Exception:
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()


def delete_employee(employee_id):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "DELETE FROM Employee WHERE employee_id = %s", (employee_id,)
        )
        conn.commit()
        return cursor.rowcount > 0
    except Exception:
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()


def add_stock_movement(prod_id, wh_id, emp_id, qty, t_type):
    if not all([prod_id, wh_id, emp_id, qty]):
        return False

    # Normalize transaction type to match ENUM('INWARD','OUTWARD')
    t_type = "INWARD" if str(t_type).upper().startswith("IN") else "OUTWARD"

    conn = get_connection()
    cursor = conn.cursor()
    try:
        conn.start_transaction()
        cursor.execute(
            """
            INSERT INTO Stock_Transaction
            (transaction_date, transaction_type, product_id, quantity, warehouse_id, employee_id)
            VALUES (NOW(), %s, %s, %s, %s, %s)
            """,
            (t_type, prod_id, qty, wh_id, emp_id),
        )

        adj_qty = int(qty) if t_type == "INWARD" else -int(qty)
        cursor.execute(
            """
            INSERT INTO Inventory (product_id, warehouse_id, quantity)
            VALUES (%s, %s, %s)
            ON DUPLICATE KEY UPDATE quantity = quantity + %s
            """,
            (prod_id, wh_id, adj_qty, adj_qty),
        )
        conn.commit()
        return True
    except Exception:
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()

# ── Add these to queries.py ──


def create_inventory(product_id: int, warehouse_id: int, quantity: int) -> bool:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO Inventory (product_id, warehouse_id, quantity)
                VALUES (%s, %s, %s)
                ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
                """,
                (product_id, warehouse_id, quantity),
            )
        conn.commit()
    return True


def update_inventory(product_id: int, warehouse_id: int, quantity: int) -> bool:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE Inventory
                SET quantity = %s
                WHERE product_id = %s AND warehouse_id = %s
                """,
                (quantity, product_id, warehouse_id),
            )
            updated = cur.rowcount
        conn.commit()
    return updated > 0


def delete_inventory(product_id: int, warehouse_id: int) -> bool:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "DELETE FROM Inventory WHERE product_id = %s AND warehouse_id = %s",
                (product_id, warehouse_id),
            )
            deleted = cur.rowcount
        conn.commit()
    return deleted > 0