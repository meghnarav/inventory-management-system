import pandas as pd
import psycopg2

conn = psycopg2.connect(
    dbname="swims_db",
    user="postgres",
    password="password",
    host="localhost",
    port="5432"
)

cursor = conn.cursor()

def load_csv(table, file):
    df = pd.read_csv(file)

    for _, row in df.iterrows():
        columns = ','.join(df.columns)
        values = ','.join(['%s'] * len(row))
        query = f"INSERT INTO {table} ({columns}) VALUES ({values})"
        cursor.execute(query, tuple(row))

    conn.commit()

load_csv("Supplier", "../data/suppliers.csv")
load_csv("Warehouse", "../data/warehouses.csv")
load_csv("Product", "../data/products.csv")
load_csv("Employee", "../data/employees.csv")
load_csv("Inventory", "../data/inventory.csv")
load_csv("Stock_Transaction", "../data/transactions.csv")

cursor.close()
conn.close()

print("CSV data loaded successfully.")