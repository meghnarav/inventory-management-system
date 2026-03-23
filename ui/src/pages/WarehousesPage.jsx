import { useState } from "react";
import CRUDTable from "../CRUDTable";

const EMPTY = { location: "", capacity: "" };

export default function WarehousesPage({ warehouses, onRefresh }) {
  const [form, setForm]       = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [status, setStatus]   = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.location) return setStatus("⚠️ Location is required.");
    setLoading(true); setStatus("");
    try {
      const url    = editing ? `/warehouses/${editing.warehouse_id}` : "/warehouses";
      const method = editing ? "PUT" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, capacity: parseInt(form.capacity) || null }),
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus(editing ? "✅ Updated!" : "✅ Warehouse added!");
      setForm(EMPTY); setEditing(null); onRefresh();
    } catch (e) { setStatus("❌ " + e.message); }
    finally { setLoading(false); }
  };

  const handleEdit = (row) => {
    setEditing(row);
    setForm({ location: row.location, capacity: row.capacity ?? "" });
    setStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (row) => {
    try {
      await fetch(`/warehouses/${row.warehouse_id}`, { method: "DELETE" });
      onRefresh();
    } catch (e) { setStatus("❌ " + e.message); }
  };

  const handleCancel = () => { setEditing(null); setForm(EMPTY); setStatus(""); };

  return (
    <div>
      <div className="page-header">
        <h1>Warehouses</h1>
        <p>Manage warehouse locations and storage capacity</p>
      </div>

      <div className="panel">
        <h2>{editing ? "Edit Warehouse" : "Add Warehouse"}</h2>
        <div className="form-grid">
          <div className="form-row">
            <label>Location *</label>
            <input value={form.location} onChange={e => set("location", e.target.value)} placeholder="e.g. Chennai" />
          </div>
          <div className="form-row">
            <label>Capacity (units)</label>
            <input type="number" min="1" value={form.capacity} onChange={e => set("capacity", e.target.value)} placeholder="e.g. 10000" />
          </div>
        </div>
        <div className="btn-row">
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : editing ? "Update Warehouse" : "Add Warehouse"}
          </button>
          {editing && <button className="btn-secondary" onClick={handleCancel}>Cancel</button>}
        </div>
        {status && <p className="status">{status}</p>}
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2>All Warehouses</h2>
          <span className="muted">{warehouses.length} records</span>
        </div>
        <CRUDTable
          columns={[
            { key: "warehouse_id", label: "ID"       },
            { key: "location",     label: "Location" },
            { key: "capacity",     label: "Capacity", render: v => v != null ? v.toLocaleString() : "—" },
          ]}
          rows={warehouses}
          idKey="warehouse_id"
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}