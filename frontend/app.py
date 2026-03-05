import sys
import os
import pandas as pd
import dash
from dash import html, dcc, dash_table, Input, Output, State, callback
import dash_bootstrap_components as dbc
import plotly.express as px

# Path fix for local running
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from backend import queries

app = dash.Dash(__name__, external_stylesheets=[dbc.themes.FLATLY])
app.title = "SWIMS Management"

# ======================
# UI LAYOUT COMPONENTS
# ======================

sidebar = html.Div([
    html.H2("SWIMS", className="display-6 text-primary"),
    html.P("Warehouse System", className="text-muted"),
    html.Hr(),
    dbc.Nav([
        dbc.NavLink("Dashboard", href="/", active="exact"),
        dbc.NavLink("Inventory Control", href="#", active="exact"),
    ], vertical=True, pills=True),
    html.Hr(),
    dbc.Button("Log Stock Move", id="open-modal-btn", color="success", className="w-100")
], style={"padding": "2rem", "height": "100vh", "backgroundColor": "#f8f9fa", "position": "fixed", "width": "16rem"})

modal = dbc.Modal([
    dbc.ModalHeader(dbc.ModalTitle("Stock Transaction")),
    dbc.ModalBody([
        dbc.Row([
            dbc.Col([
                dbc.Label("Product"),
                dcc.Dropdown(id='m-prod', placeholder="Select..."),
            ], width=12),
            dbc.Col([
                dbc.Label("Warehouse"),
                dcc.Dropdown(id='m-wh', placeholder="Select..."),
            ], width=6, className="mt-3"),
            dbc.Col([
                dbc.Label("Employee"),
                dcc.Dropdown(id='m-emp', placeholder="Select..."),
            ], width=6, className="mt-3"),
            dbc.Col([
                dbc.Label("Quantity"),
                dbc.Input(id='m-qty', type='number', min=1),
            ], width=6, className="mt-3"),
            dbc.Col([
                dbc.Label("Type"),
                dbc.Select(id='m-type', options=[
                    {"label": "Receive (IN)", "value": "IN"},
                    {"label": "Dispatch (OUT)", "value": "OUT"}
                ], value="IN"),
            ], width=6, className="mt-3"),
        ])
    ]),
    dbc.ModalFooter(dbc.Button("Save to Database", id="save-db-btn", color="primary"))
], id="modal-move", is_open=False)

content = html.Div([
    dbc.Row(id="kpi-row", className="mb-4"),
    dbc.Row([
        dbc.Col(dcc.Graph(id='graph-inv'), width=7),
        dbc.Col(dcc.Graph(id='graph-trans'), width=5),
    ]),
    html.H4("Inventory Master List", className="mt-4"),
    html.Div(id="table-inventory"),
], style={"marginLeft": "18rem", "padding": "2rem"})

app.layout = html.Div([sidebar, content, modal, dcc.Interval(id='refresher', interval=30000)])

# ======================
# CALLBACKS
# ======================

@app.callback(
    Output("modal-move", "is_open"),
    [Input("open-modal-btn", "n_clicks"), Input("save-db-btn", "n_clicks")],
    [State("modal-move", "is_open")]
)
def toggle_modal(n1, n2, is_open):
    if n1 or n2: return not is_open
    return is_open

@app.callback(
    Output("save-db-btn", "disabled"),
    Input("save-db-btn", "n_clicks"),
    [State("m-prod", "value"), State("m-wh", "value"), State("m-emp", "value"), 
     State("m-qty", "value"), State("m-type", "value")]
)
def handle_save(n_clicks, p, w, e, q, t):
    if n_clicks:
        queries.add_stock_movement(p, w, e, q, t)
    return False

@app.callback(
    [Output("kpi-row", "children"),
     Output("table-inventory", "children"),
     Output("graph-inv", "figure"),
     Output("graph-trans", "figure"),
     Output("m-prod", "options"),
     Output("m-wh", "options"),
     Output("m-emp", "options")],
    [Input("refresher", "n_intervals"), Input("save-db-btn", "n_clicks")]
)
def refresh_data(n, n_save):
    # Fetch dataframes
    df_p = pd.DataFrame(queries.fetch_products())
    df_i = pd.DataFrame(queries.fetch_inventory())
    df_t = pd.DataFrame(queries.fetch_stock_transactions())
    df_w = pd.DataFrame(queries.fetch_warehouses())
    df_e = pd.DataFrame(queries.fetch_employees())

    # KPI Cards
    kpis = [
        dbc.Col(dbc.Card(dbc.CardBody([html.H6("Total Items"), html.H3(len(df_p))]), color="primary", outline=True)),
        dbc.Col(dbc.Card(dbc.CardBody([html.H6("Total Stock"), html.H3(df_i['quantity'].sum())]), color="success", outline=True)),
        dbc.Col(dbc.Card(dbc.CardBody([html.H6("Warehouses"), html.H3(len(df_w))]), color="info", outline=True)),
    ]

    # Tables
    tbl = dash_table.DataTable(
        data=df_i.to_dict('records'),
        columns=[{"name": i, "id": i} for i in df_i.columns],
        page_size=10, style_table={'overflowX': 'auto'},
        filter_action="native", sort_action="native"
    )

    # Charts
    fig_i = px.bar(df_i, x="Location", y="quantity", color="Product_name", title="Stock by Location")
    
    # Check if transaction date exists for line chart
    if not df_t.empty:
        df_t["Transaction_date"] = pd.to_datetime(df_t["Transaction_date"])
        fig_t = px.line(df_t, x="Transaction_date", y="quantity", color="transaction_type", title="Movement Trends")
    else:
        fig_t = px.scatter(title="No transactions yet")

    # Options
    opt_p = [{"label": r.Product_name, "value": r.Product_id} for r in df_p.itertuples()]
    opt_w = [{"label": r.Location, "value": r.warehouse_id} for r in df_w.itertuples()]
    opt_e = [{"label": r.name, "value": r.Employee_id} for r in df_e.itertuples()]

    return kpis, tbl, fig_i, fig_t, opt_p, opt_w, opt_e

if __name__ == "__main__":
    app.run_server(debug=True, port=8050)