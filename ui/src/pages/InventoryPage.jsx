import { useState } from "react";
import CRUDTable from "../CRUDTable";

const EMPTY = { product_id: "", warehouse_id: "", quantity: "" };

export default function InventoryPage({ inventory, products, warehouses, onRefresh }) {
  const [form, setForm]       = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [status, setStatus]   = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.product_id || !form.warehouse_id) return setStatus("⚠️ Product and warehouse are required.");
    setLoading(true); setStatus("");
    try {
      const body = { product_id: parseInt(form.product_id), warehouse_id: parseInt(form.warehouse_id), quantity: parseInt(form.quantity) || 0 };
      const url    = editing ? `/inventory/${editing.product_id}/${editing.warehouse_id}` : "/inventory";
      const method = editing ? "PUT" : "POST";
      const res    = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error(await res.text());
      setStatus(editing ? "✅ Updated!" : "✅ Inventory record added!");
      setForm(EMPTY); setEditing(null); onRefresh();
    } catch (e) { setStatus("❌ " + e.message); }
    finally { setLoading(false); }
  };

  const handleEdit = (row) => {
    setEditing(row);
    setForm({ product_id: row.product_id, warehouse_id: row.warehouse_id, quantity: row.quantity });
    setStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (row) => {
    try {
      await fetch(`/inventory/${row.product_id}/${row.warehouse_id}`, { method: "DELETE" });
      onRefresh();
    } catch (e) { setStatus("❌ " + e.message); }
  };

  const handleCancel = () => { setEditing(null); setForm(EMPTY); setStatus(""); };

  return (
    <div>
      <div className="page-header">
        <h1>Inventory</h1>
        <p>Track stock quantities per product per warehouse</p>
      </div>

      <div className="panel">
        <h2>{editing ? "Edit Inventory Record" : "Add Inventory Record"}</h2>
        <div className="form-grid">
          <div className="form-row">
            <label>Product *</label>
            <select value={form.product_id} onChange={e => set("product_id", e.target.value)} disabled={!!editing}>
              <option value="">Select product...</option>
              {products.map(p => <option key={p.product_id} value={p.product_id}>{p.product_name}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label>Warehouse *</label>
            <select value={form.warehouse_id} onChange={e => set("warehouse_id", e.target.value)} disabled={!!editing}>
              <option value="">Select warehouse...</option>
              {warehouses.map(w => <option key={w.warehouse_id} value={w.warehouse_id}>{w.location}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label>Quantity</label>
            <input type="number" min="0" value={form.quantity} onChange={e => set("quantity", e.target.value)} placeholder="e.g. 500" />
          </div>
        </div>
        <div className="btn-row">
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : editing ? "Update Quantity" : "Add Record"}
          </button>
          {editing && <button className="btn-secondary" onClick={handleCancel}>Cancel</button>}
        </div>
        {status && <p className="status">{status}</p>}
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2>All Inventory</h2>
          <span className="muted">{inventory.length} records</span>
        </div>
        <CRUDTable
          columns={[
            { key: "product_name",  label: "Product"   },
            { key: "location",      label: "Warehouse"  },
            { key: "quantity",      label: "Qty", render: v => v?.toLocaleString() },
          ]}
          rows={inventory}
          idKey="product_id"
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}