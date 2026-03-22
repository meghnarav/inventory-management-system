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
  const { data: products } = usePolling("/products");
  const { data: inventory } = usePolling("/inventory");
  const { data: transactions } = usePolling("/transactions");
  const { data: suppliers } = usePolling("/suppliers");
  const { data: warehouses } = usePolling("/warehouses");
  const { data: employees } = usePolling("/employees");
  const { data: categories } = usePolling("/categories");
  const { data: roles } = usePolling("/roles");

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
        <p className="muted">Supplier-Warehouse Inventory Management</p>
      </aside>

      <main className="main">
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
          <div className="col">
            <div className="panel">
              <h2>Stock by Warehouse</h2>
              <div style={{ width: "100%", height: 220 }}>
                <ResponsiveContainer>
                  <BarChart data={inventoryByWarehouse}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="location" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="quantity" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="col">
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
                    <Line type="monotone" dataKey="inQty" name="Inward Qty" stroke="#16a34a" />
                    <Line type="monotone" dataKey="outQty" name="Outward Qty" stroke="#dc2626" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        <section className="layout-2col">
          <div className="col">
            <div className="panel">
              <h2>Inventory by Warehouse</h2>
              <Table
                columns={["product_name", "location", "quantity"]}
                rows={inventory}
              />
            </div>
          </div>
          <div className="col">
            <StockMovementForm
              products={products}
              warehouses={warehouses}
              employees={employees}
            />

            <div className="panel" style={{ marginTop: "1rem" }}>
              <h2>Recent Transactions</h2>
              <Table
                columns={[
                  "transaction_date",
                  "transaction_type",
                  "product_name",
                  "location",
                  "quantity",
                  "employee_name",
                ]}
                rows={transactions.slice(0, 10)}
              />
            </div>
          </div>
        </section>

        <section className="layout-3col">
          <SimpleCreateForm
            title="Add Supplier"
            endpoint="/suppliers"
            fields={[
              { name: "supplier_name", label: "Supplier Name", required: true },
              { name: "contact_email", label: "Email" },
              { name: "phone_number", label: "Phone" },
            ]}
          />
          <SimpleCreateForm
            title="Add Product"
            endpoint="/products"
            fields={[
              { name: "product_name", label: "Product Name", required: true },
              { name: "supplier_id", label: "Supplier ID", required: true },
              { name: "category_id", label: "Category ID", type: "select", required: true,
                options: categories.map(c => ({ value: c.category_id, label: c.category_name }))
              }
            ]}
          />
          <SimpleCreateForm
            title="Add Employee"
            endpoint="/employees"
            fields={[
              { name: "name", label: "Name", required: true },
              { name: "role_id", label: "Role", type: "select", required: true,
                options: roles.map(r => ({ value: r.role_id, label: r.role_name}))
              }
            ]}
          />
        </section>
      </main>
    </div>
  );
}