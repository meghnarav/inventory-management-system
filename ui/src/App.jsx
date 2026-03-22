import React, { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts";

const API_BASE = "http://127.0.0.1:8000";

async function fetchJson(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

function usePolling(path, intervalMs = 5000) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const json = await fetchJson(path);
        if (active) {
          setData(json);
          setError(null);
        }
      } catch (e) {
        if (active) setError(e.message || "Error");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    const id = setInterval(load, intervalMs);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [path, intervalMs]);

  return { data, loading, error };
}

function Card({ label, value }) {
  return (
    <div className="card">
      <div className="card-label">{label}</div>
      <div className="card-value">{value}</div>
    </div>
  );
}

function Table({ columns, rows }) {
  if (!rows || rows.length === 0) {
    return <div className="muted">No data</div>;
  }
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx}>
              {columns.map((c) => (
                <td key={c}>{r[c]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StockMovementForm({ products, warehouses, employees, onSubmitted }) {
  const [productId, setProductId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [qty, setQty] = useState(1);
  const [type, setType] = useState("INWARD");
  const [status, setStatus] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("");
    try {
      const res = await fetch(`${API_BASE}/stock-movements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: Number(productId),
          warehouse_id: Number(warehouseId),
          employee_id: Number(employeeId),
          quantity: Number(qty),
          transaction_type: type,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || "Failed");
      }
      setStatus("Saved");
      if (onSubmitted) onSubmitted();
    } catch (err) {
      setStatus(err.message || "Error");
    }
  }

  return (
    <form className="panel form" onSubmit={handleSubmit}>
      <h2>Log Stock Movement</h2>
      <div className="form-row">
        <label>Product</label>
        <select value={productId} onChange={(e) => setProductId(e.target.value)} required>
          <option value="">Select product</option>
          {products.map((p) => (
            <option key={p.product_id} value={p.product_id}>
              {p.product_name}
            </option>
          ))}
        </select>
      </div>
      <div className="form-row">
        <label>Warehouse</label>
        <select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)} required>
          <option value="">Select warehouse</option>
          {warehouses.map((w) => (
            <option key={w.warehouse_id} value={w.warehouse_id}>
              {w.location}
            </option>
          ))}
        </select>
      </div>
      <div className="form-row">
        <label>Employee</label>
        <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required>
          <option value="">Select employee</option>
          {employees.map((e) => (
            <option key={e.employee_id} value={e.employee_id}>
              {e.name}
            </option>
          ))}
        </select>
      </div>
      <div className="form-row">
        <label>Quantity</label>
        <input
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          required
        />
      </div>
      <div className="form-row">
        <label>Type</label>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="INWARD">INWARD (Stock In)</option>
          <option value="OUTWARD">OUTWARD (Stock Out)</option>
        </select>
      </div>
      <button type="submit">Submit</button>
      {status && <div className="status">{status}</div>}
    </form>
  );
}

function SimpleCreateForm({ title, fields, endpoint, onCreated }) {
  const [values, setValues] = useState(
    Object.fromEntries(fields.map((f) => [f.name, ""]))
  );
  const [status, setStatus] = useState("");

  function setField(name, value) {
    setValues((v) => ({ ...v, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("");
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || "Failed");
      }
      setStatus("Saved");
      if (onCreated) onCreated();
    } catch (err) {
      setStatus(err.message || "Error");
    }
  }

  return (
    <form className="panel form" onSubmit={handleSubmit}>
      <h2>{title}</h2>
      {fields.map((f) => (
        <div className="form-row" key={f.name}>
          <label>{f.label}</label>
          {f.type === "select" ? (
            <select
              value={values[f.name]}
              onChange={(e) => setField(f.name, e.target.value)}
              required={f.required}
            >
              <option value="">Select</option>
              {f.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={f.type || "text"}
              value={values[f.name]}
              onChange={(e) => setField(f.name, e.target.value)}
              required={f.required}
            />
          )}
        </div>
      ))}
      <button type="submit">Create</button>
      {status && <div className="status">{status}</div>}
    </form>
  );
}

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const { data: products } = usePolling("/products");
  const { data: inventory } = usePolling("/inventory");
  const { data: transactions } = usePolling("/transactions");
  const { data: suppliers } = usePolling("/suppliers");
  const { data: warehouses } = usePolling("/warehouses");
  const { data: employees } = usePolling("/employees");
  const { data: categories } = usePolling("/categories");
  const { data: roles } = usePolling("/roles");
  const { data: employeesDetailed } = usePolling("/employees-detailed");
  const { data: productsDetailed } = usePolling("/products-detailed");

  const kpis = useMemo(() => {
    const totalProducts = products.length;
    const totalSuppliers = suppliers.length;
    const totalUnits = inventory.reduce((sum, r) => sum + (r.quantity || 0), 0);
    const totalTransactions = transactions.length;
    return { totalProducts, totalSuppliers, totalUnits, totalTransactions };
  }, [products, suppliers, inventory, transactions]);

  const inventoryByWarehouse = useMemo(() => {
    const map = {};
    for (const row of inventory) {
      const key = row.location;
      map[key] = (map[key] || 0) + (row.quantity || 0);
    }
    return Object.entries(map).map(([location, quantity]) => ({ location, quantity }));
  }, [inventory]);

  const transactionsByDate = useMemo(() => {
    const map = {};
    for (const t of transactions) {
      const date = (t.transaction_date || "").slice(0, 10);
      if (!date) continue;
      const dir = t.transaction_type === "OUTWARD" ? -1 : 1;
      if (!map[date]) map[date] = { date, inQty: 0, outQty: 0 };
      if (dir > 0) map[date].inQty += t.quantity || 0;
      else map[date].outQty += t.quantity || 0;
    }
    return Object.values(map).sort((a, b) => (a.date < b.date ? -1 : 1));
  }, [transactions]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>SWIMS</h1>
        <p className="muted">Inventory System</p>

        <nav className="nav">
          <button onClick={() => setTab("dashboard")}>Dashboard</button>
          <button onClick={() => setTab("products")}>Products</button>
          <button onClick={() => setTab("employees")}>Employees</button>
          <button onClick={() => setTab("master")}>Master Data</button>
        </nav>
      </aside>

      <main className="main">

        {/* DASHBOARD */}
        {tab === "dashboard" && (
          <>
            <header className="topbar">
              <h2>Inventory Dashboard</h2>
            </header>

            <section className="kpi-row">
              <Card label="Products" value={kpis.totalProducts} />
              <Card label="Suppliers" value={kpis.totalSuppliers} />
              <Card label="Stock Units" value={kpis.totalUnits} />
              <Card label="Transactions" value={kpis.totalTransactions} />
            </section>

            <section className="layout-2col">
              <div className="panel">
                <h2>Stock by Warehouse</h2>
                <ResponsiveContainer height={220}>
                  <BarChart data={inventoryByWarehouse}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="location" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="quantity" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="panel">
                <h2>Daily Movements</h2>
                <ResponsiveContainer height={220}>
                  <LineChart data={transactionsByDate}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line dataKey="inQty" />
                    <Line dataKey="outQty" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
          </>
        )}

        {/* PRODUCTS */}
        {tab === "products" && (
          <div className="panel">
            <h2>Products</h2>
            <Table
              columns={["product_name", "category_name", "supplier_name", "unit_price"]}
              rows={productsDetailed}
            />
          </div>
        )}

        {/* EMPLOYEES */}
        {tab === "employees" && (
          <div className="panel">
            <h2>Employees</h2>
            <Table
              columns={[
                "name",
                "role_name",
                "employee_type",
                "monthly_salary",
                "benefits",
                "hourly_rate",
                "contract_end_date",
              ]}
              rows={employeesDetailed}
            />
          </div>
        )}

        {/* MASTER DATA */}
        {tab === "master" && (
          <div className="layout-2col">
            <div className="panel">
              <h2>Categories</h2>
              <Table columns={["category_id", "category_name"]} rows={categories} />
            </div>

            <div className="panel">
              <h2>Roles</h2>
              <Table columns={["role_id", "role_name"]} rows={roles} />
            </div>
          </div>
        )}

      </main>
    </div>
  );
}