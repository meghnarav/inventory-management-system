import { useState } from "react";
import CRUDTable from "../CRUDTable";

const EMPTY = { supplier_name: "", contact_email: "", phone_number: "" };

export default function SuppliersPage({ suppliers, onRefresh }) {
  const [form, setForm]       = useState(EMPTY);
  const [editing, setEditing] = useState(null); // row being edited
  const [status, setStatus]   = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.supplier_name) return setStatus("⚠️ Supplier name is required.");
    setLoading(true); setStatus("");
    try {
      const url    = editing ? `/suppliers/${editing.supplier_id}` : "/suppliers";
      const method = editing ? "PUT" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus(editing ? "✅ Updated!" : "✅ Supplier added!");
      setForm(EMPTY); setEditing(null); onRefresh();
    } catch (e) { setStatus("❌ " + e.message); }
    finally { setLoading(false); }
  };

  const handleEdit = (row) => {
    setEditing(row);
    setForm({ supplier_name: row.supplier_name, contact_email: row.contact_email ?? "", phone_number: row.phone_number ?? "" });
    setStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (row) => {
    try {
      await fetch(`/suppliers/${row.supplier_id}`, { method: "DELETE" });
      onRefresh();
    } catch (e) { setStatus("❌ " + e.message); }
  };

  const handleCancel = () => { setEditing(null); setForm(EMPTY); setStatus(""); };

  return (
    <div>
      <div className="page-header">
        <h1>Suppliers</h1>
        <p>Manage product suppliers and their contact details</p>
      </div>

      {/* Form */}
      <div className="panel">
        <h2>{editing ? "Edit Supplier" : "Add Supplier"}</h2>
        <div className="form-grid">
          <div className="form-row">
            <label>Supplier Name *</label>
            <input value={form.supplier_name} onChange={e => set("supplier_name", e.target.value)} placeholder="e.g. Arctic Foods" />
          </div>
          <div className="form-row">
            <label>Contact Email</label>
            <input value={form.contact_email} onChange={e => set("contact_email", e.target.value)} placeholder="e.g. contact@supplier.com" />
          </div>
          <div className="form-row">
            <label>Phone Number</label>
            <input value={form.phone_number} onChange={e => set("phone_number", e.target.value)} placeholder="10-digit number" />
          </div>
        </div>
        <div className="btn-row">
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : editing ? "Update Supplier" : "Add Supplier"}
          </button>
          {editing && <button className="btn-secondary" onClick={handleCancel}>Cancel</button>}
        </div>
        {status && <p className="status">{status}</p>}
      </div>

      {/* Table */}
      <div className="panel">
        <div className="panel-header">
          <h2>All Suppliers</h2>
          <span className="muted">{suppliers.length} records</span>
        </div>
        <CRUDTable
          columns={[
            { key: "supplier_id",   label: "ID"    },
            { key: "supplier_name", label: "Name"  },
            { key: "contact_email", label: "Email" },
            { key: "phone_number",  label: "Phone" },
          ]}
          rows={suppliers}
          idKey="supplier_id"
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}