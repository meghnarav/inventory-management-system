from .db_connection import get_connection
import mysql.connector

# --- READ OPERATIONS ---

def fetch_suppliers():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT Supplier_id, supplier_name, contact_email, phone_number FROM SUPPLIER")
    data = cursor.fetchall()
    cursor.close()
    conn.close()
    return data

def fetch_products():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT p.Product_id, p.Product_name, p.category, p.unit_price, s.supplier_name 
        FROM PRODUCT p
        JOIN SUPPLIER s ON p.supplier_id = s.Supplier_id
    """)
    data = cursor.fetchall()
    cursor.close()
    conn.close()
    return data

def fetch_inventory():
    conn = get_connection()
    cursor = conn.close() # Fixed variable collision
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT i.Product_id, p.Product_name, i.warehouse_id, w.Location, i.quantity
        FROM INVENTORY i
        JOIN PRODUCT p ON i.Product_id = p.Product_id
        JOIN WAREHOUSE w ON i.warehouse_id = w.warehouse_id
    """)
    data = cursor.fetchall()
    cursor.close()
    conn.close()
    return data

def fetch_stock_transactions():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT st.transaction_id, st.Transaction_date, st.transaction_type, st.quantity,
               p.Product_name, w.Location, e.name AS employee_name
        FROM STOCK_TRANSACTION st
        JOIN PRODUCT p ON st.product_id = p.Product_id
        JOIN WAREHOUSE w ON st.warehouse_id = w.warehouse_id
        JOIN EMPLOYEE e ON st.employee_id = e.Employee_id
        ORDER BY st.Transaction_date DESC
    """)
    data = cursor.fetchall()
    cursor.close()
    conn.close()
    return data

def fetch_warehouses():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT warehouse_id, Location, capacity FROM WAREHOUSE")
    data = cursor.fetchall()
    cursor.close()
    conn.close()
    return data

def fetch_employees():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT Employee_id, name, role FROM EMPLOYEE")
    data = cursor.fetchall()
    cursor.close()
    conn.close()
    return data

# --- WRITE OPERATIONS (The "Functional" Part) ---

def add_stock_movement(prod_id, wh_id, emp_id, qty, t_type):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        conn.start_transaction()

        # 1. Insert into STOCK_TRANSACTION
        query_ts = """
            INSERT INTO STOCK_TRANSACTION 
            (Transaction_date, transaction_type, product_id, quantity, warehouse_id, employee_id)
            VALUES (NOW(), %s, %s, %s, %s, %s)
        """
        cursor.execute(query_ts, (t_type, prod_id, qty, wh_id, emp_id))

        # 2. Update INVENTORY (UPSERT logic)
        adj_qty = int(qty) if t_type == 'IN' else -int(qty)
        query_inv = """
            INSERT INTO INVENTORY (Product_id, warehouse_id, quantity)
            VALUES (%s, %s, %s)
            ON DUPLICATE KEY UPDATE quantity = quantity + %s
        """
        cursor.execute(query_inv, (prod_id, wh_id, adj_qty, adj_qty))

        conn.commit()
        return True
    except Exception as e:
        conn.rollback()
        print(f"Error: {e}")
        return False
    finally:
        cursor.close()
        conn.close()