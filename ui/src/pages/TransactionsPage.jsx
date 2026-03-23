import { useState } from "react";
import CRUDTable from "../CRUDTable";

const EMPTY = { product_id: "", warehouse_id: "", employee_id: "", quantity: "", transaction_type: "INWARD" };

export default function TransactionsPage({ transactions, products, warehouses, employees, onRefresh }) {
  const [form, setForm]     = useState(EMPTY);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.product_id || !form.warehouse_id || !form.employee_id || !form.quantity)
      return setStatus("⚠️ All fields are required.");
    setLoading(true); setStatus("");
    try {
      const res = await fetch("/stock-movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id:       parseInt(form.product_id),
          warehouse_id:     parseInt(form.warehouse_id),
          employee_id:      parseInt(form.employee_id),
          quantity:         parseInt(form.quantity),
          transaction_type: form.transaction_type,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus("✅ Transaction recorded!");
      setForm(EMPTY); onRefresh();
    } catch (e) { setStatus("❌ " + e.message); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Stock Transactions</h1>
        <p>Record inward and outward stock movements</p>
      </div>

      {/* Add Transaction */}
      <div className="panel">
        <h2>Record Stock Movement</h2>
        <div className="form-grid">
          <div className="form-row">
            <label>Transaction Type</label>
            <div className="toggle-group">
              <button type="button" className={`toggle-btn ${form.transaction_type === "INWARD"  ? "active" : ""}`} onClick={() => set("transaction_type", "INWARD")}>Inward</button>
              <button type="button" className={`toggle-btn ${form.transaction_type === "OUTWARD" ? "active" : ""}`} onClick={() => set("transaction_type", "OUTWARD")}>Outward</button>
            </div>
          </div>
          <div className="form-row">
            <label>Product *</label>
            <select value={form.product_id} onChange={e => set("product_id", e.target.value)}>
              <option value="">Select product...</option>
              {products.map(p => <option key={p.product_id} value={p.product_id}>{p.product_name}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label>Warehouse *</label>
            <select value={form.warehouse_id} onChange={e => set("warehouse_id", e.target.value)}>
              <option value="">Select warehouse...</option>
              {warehouses.map(w => <option key={w.warehouse_id} value={w.warehouse_id}>{w.location}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label>Employee *</label>
            <select value={form.employee_id} onChange={e => set("employee_id", e.target.value)}>
              <option value="">Select employee...</option>
              {employees.map(e => <option key={e.employee_id} value={e.employee_id}>{e.name}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label>Quantity *</label>
            <input type="number" min="1" value={form.quantity} onChange={e => set("quantity", e.target.value)} placeholder="e.g. 100" />
          </div>
        </div>
        <div className="btn-row">
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Recording..." : "Record Movement"}
          </button>
        </div>
        {status && <p className="status">{status}</p>}
      </div>

      {/* Transactions Log */}
      <div className="panel">
        <div className="panel-header">
          <h2>Transaction Log</h2>
          <span className="muted">{transactions.length} records</span>
        </div>
        <CRUDTable
          columns={[
            { key: "transaction_id",   label: "ID"   },
            { key: "transaction_date", label: "Date", render: v => v ? new Date(v).toLocaleDateString() : "—" },
            { key: "transaction_type", label: "Type", render: v => (
                <span className={`badge ${v === "INWARD" ? "badge-green" : "badge-red"}`}>{v}</span>
              )
            },
            { key: "product_name",  label: "Product"   },
            { key: "location",      label: "Warehouse"  },
            { key: "quantity",      label: "Qty"        },
            { key: "employee_name", label: "Employee"   },
          ]}
          rows={transactions}
          idKey="transaction_id"
          // No edit or delete — transactions are immutable logs
        />
      </div>
    </div>
  );
}