import dash
from dash import html, dcc, dash_table, Input, Output, State, callback
import dash_bootstrap_components as dbc
import pandas as pd
import plotly.express as px
import sys
import os

# Adds the root directory (swims) to the python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend import queries
# ... rest of your imports

# Initialize App with a professional Slate theme
app = dash.Dash(__name__, external_stylesheets=[dbc.themes.SLATE])
app.title = "SWIMS | Inventory Management"

# ======================
# DATA FETCHING WRAPPER
# ======================
def get_data():
    products = pd.DataFrame(queries.fetch_products())
    suppliers = pd.DataFrame(queries.fetch_suppliers())
    inventory = pd.DataFrame(queries.fetch_inventory())
    transactions = pd.DataFrame(queries.fetch_stock_transactions())
    return products, suppliers, inventory, transactions

# ======================
# UI COMPONENTS
# ======================

def create_kpi_card(title, value, color="primary"):
    return dbc.Card([
        dbc.CardBody([
            html.H5(title, className="card-title text-light"),
            html.H2(value, className=f"text-{color} font-weight-bold"),
        ])
    ], style={"margin": "10px"})

# The Modal Form for adding stock
modal_form = dbc.Modal([
    dbc.ModalHeader(dbc.ModalTitle("Log Stock Movement")),
    dbc.ModalBody([
        dbc.Label("Select Product"),
        dcc.Dropdown(id='prod-select', placeholder="Choose Product..."),
        html.Br(),
        dbc.Label("Quantity"),
        dbc.Input(id='qty-input', type='number', placeholder="Enter amount..."),
        html.Br(),
        dbc.Label("Transaction Type"),
        dcc.Dropdown(
            id='type-select',
            options=[{'label': 'Receive', 'value': 'IN'}, {'label': 'Remove', 'value': 'OUT'}],
            value='IN'
        ),
    ]),
    dbc.ModalFooter(
        dbc.Button("Submit Transaction", id="submit-val", color="success", n_clicks=0)
    ),
], id="modal-form", is_open=False)

# ======================
# LAYOUT
# ======================

sidebar = html.Div([
    html.H2("SWIMS", className="display-4 text-primary"),
    html.Hr(),
    html.P("Supplier-Warehouse Inventory System", className="lead"),
    dbc.Nav([
        dbc.NavLink("Dashboard", href="/", active="exact"),
        dbc.NavLink("Inventory List", href="/inventory", active="exact"),
        dbc.NavLink("Suppliers", href="/suppliers", active="exact"),
    ], vertical=True, pills=True),
    html.Hr(),
    dbc.Button("Add Stock +", id="open-modal-btn", color="success", className="w-100")
], style={"padding": "2rem", "height": "100vh", "backgroundColor": "#1a1a1a"})

content = html.Div([
    # KPI Row
    dbc.Row(id="kpi-container"),
    
    # Main Tabs
    dbc.Tabs([
        dbc.Tab(label="Inventory Overview", children=[
            dbc.Row([
                dbc.Col(dcc.Graph(id='inv-graph'), width=6),
                dbc.Col(dcc.Graph(id='trans-graph'), width=6),
            ]),
            html.H3("Live Stock Levels", className="mt-4"),
            html.Div(id="inventory-table-container")
        ]),
        dbc.Tab(label="Transaction Logs", children=[
            html.H3("Movement History", className="mt-4"),
            html.Div(id="transaction-table-container")
        ]),
    ])
], style={"padding": "2rem"})

app.layout = dbc.Container([
    dbc.Row([
        dbc.Col(sidebar, width=3, style={"padding": "0"}),
        dbc.Col(content, width=9),
    ]),
    modal_form,
    dcc.Interval(id='interval-component', interval=10*1000, n_intervals=0) # Refresh every 10s
], fluid=True)

# ======================
# CALLBACKS (The "Functional" Part)
# ======================

# 1. Toggle Modal
@app.callback(
    Output("modal-form", "is_open"),
    [Input("open-modal-btn", "n_clicks"), Input("submit-val", "n_clicks")],
    [State("modal-form", "is_open")]
)
def toggle_modal(n1, n2, is_open):
    if n1 or n2:
        return not is_open
    return is_open

# 2. Main Data Update (Triggered by interval or button click)
@app.callback(
    [Output("kpi-container", "children"),
     Output("inventory-table-container", "children"),
     Output("transaction-table-container", "children"),
     Output("inv-graph", "figure"),
     Output("trans-graph", "figure"),
     Output("prod-select", "options")],
    [Input("interval-component", "n_intervals"), Input("submit-val", "n_clicks")]
)
def update_dashboard(n, n_clicks):
    products_df, suppliers_df, inventory_df, transactions_df = get_data()

    # KPI Calculation
    kpis = [
        dbc.Col(create_kpi_card("Total SKUs", len(products_df))),
        dbc.Col(create_kpi_card("Total Suppliers", len(suppliers_df), "info")),
        dbc.Col(create_kpi_card("Stock on Hand", inventory_df['quantity'].sum(), "success")),
    ]

    # Tables
    inv_table = dash_table.DataTable(
        data=inventory_df.to_dict('records'),
        columns=[{"name": i, "id": i} for i in inventory_df.columns],
        filter_action="native", sort_action="native", page_size=10,
        style_header={'backgroundColor': 'rgb(30, 30, 30)', 'color': 'white'},
        style_data={'backgroundColor': 'rgb(50, 50, 50)', 'color': 'white'}
    )
    
    trans_table = dash_table.DataTable(
        data=transactions_df.to_dict('records'),
        columns=[{"name": i, "id": i} for i in transactions_df.columns],
        page_size=10,
        style_header={'backgroundColor': 'rgb(30, 30, 30)', 'color': 'white'},
        style_data={'backgroundColor': 'rgb(50, 50, 50)', 'color': 'white'}
    )

    # Graphs
    fig1 = px.bar(inventory_df, x="location", y="quantity", color="product_name", template="plotly_dark")
    fig2 = px.line(transactions_df, x="timestamp", y="quantity", color="transaction_type", template="plotly_dark")

    # Dropdown Options
    dropdown_options = [{'label': row['product_name'], 'value': row['id']} for _, row in products_df.iterrows()]

    return kpis, inv_table, trans_table, fig1, fig2, dropdown_options

if __name__ == "__main__":
    app.run(debug=True, port=8050)