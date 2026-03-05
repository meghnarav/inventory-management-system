import dash
from dash import dcc, html
import dash_table
from layouts import layout

app = dash.Dash(__name__)
app.title = "SWIMS Dashboard"
app.layout = layout

if __name__ == "__main__":
    app.run_server(debug=True)