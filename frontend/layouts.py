from dash import html, dash_table
from backend import queries

suppliers = queries.fetch_suppliers()
products = queries.fetch_products()
inventory = queries.fetch_inventory()
transactions = queries.fetch_stock_transactions()

layout = html.Div([
    html.H1("SWIMS - Supplier-Warehouse Inventory Dashboard"),

    html.H2("Suppliers"),
    dash_table.DataTable(
        columns=[{"name": i, "id": i} for i in suppliers[0].keys()],
        data=suppliers
    ),

    html.H2("Products"),
    dash_table.DataTable(
        columns=[{"name": i, "id": i} for i in products[0].keys()],
        data=products
    ),

    html.H2("Inventory"),
    dash_table.DataTable(
        columns=[{"name": i, "id": i} for i in inventory[0].keys()],
        data=inventory
    ),

    html.H2("Stock Transactions"),
    dash_table.DataTable(
        columns=[{"name": i, "id": i} for i in transactions[0].keys()],
        data=transactions
    ),
])