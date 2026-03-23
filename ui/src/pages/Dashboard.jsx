import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

function Card({ label, value }) {
  return (
    <div className="card">
      <div className="card-label">{label}</div>
      <div className="card-value">{value ?? "—"}</div>
    </div>
  );
}

export default function Dashboard({ kpis, inventoryByWarehouse, transactionsByDate }) {
  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Overview of warehouse inventory and activity</p>
      </div>

      <div className="kpi-row">
        <Card label="Products"     value={kpis.totalProducts}     />
        <Card label="Suppliers"    value={kpis.totalSuppliers}    />
        <Card label="Stock Units"  value={kpis.totalUnits}        />
        <Card label="Transactions" value={kpis.totalTransactions} />
      </div>

      <div className="layout-2col">
        <div className="panel">
          <h2>Stock by Warehouse</h2>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={inventoryByWarehouse}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="location" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantity" fill="#2563eb" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <h2>Daily Movements</h2>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <LineChart data={transactionsByDate}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="inQty"  name="Inward"  stroke="#16a34a" dot={false} />
                <Line type="monotone" dataKey="outQty" name="Outward" stroke="#dc2626" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}