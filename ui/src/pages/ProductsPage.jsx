import { useState } from "react";
import CRUDTable from "../CRUDTable";

const EMPTY = { product_name: "", supplier_id: "", category_id: "", unit_price: "" };

export default function ProductsPage({ products, suppliers, categories, onRefresh }) {
  const [form, setForm]       = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [status, setStatus]   = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.product_name || !form.supplier_id) return setStatus("⚠️ Product name and supplier are required.");
    setLoading(true); setStatus("");
    try {
      const url    = editing ? `/products/${editing.product_id}` : "/products";
      const method = editing ? "PUT" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, supplier_id: parseInt(form.supplier_id), category_id: parseInt(form.category_id), unit_price: parseFloat(form.unit_price) || null }),
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus(editing ? "✅ Updated!" : "✅ Product added!");
      setForm(EMPTY); setEditing(null); onRefresh();
    } catch (e) { setStatus("❌ " + e.message); }
    finally { setLoading(false); }
  };

  const handleEdit = (row) => {
    setEditing(row);
    setForm({ product_name: row.product_name, supplier_id: row.supplier_id ?? "", category_id: row.category_id ?? "", unit_price: row.unit_price ?? "" });
    setStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (row) => {
    try {
      await fetch(`/products/${row.product_id}`, { method: "DELETE" });
      onRefresh();
    } catch (e) { setStatus("❌ " + e.message); }
  };

  const handleCancel = () => { setEditing(null); setForm(EMPTY); setStatus(""); };

  return (
    <div>
      <div className="page-header">
        <h1>Products</h1>
        <p>Manage products, categories and pricing</p>
      </div>

      <div className="panel">
        <h2>{editing ? "Edit Product" : "Add Product"}</h2>
        <div className="form-grid">
          <div className="form-row">
            <label>Product Name *</label>
            <input value={form.product_name} onChange={e => set("product_name", e.target.value)} placeholder="e.g. Vanilla Ice Cream" />
          </div>
          <div className="form-row">
            <label>Supplier *</label>
            <select value={form.supplier_id} onChange={e => set("supplier_id", e.target.value)}>
              <option value="">Select supplier...</option>
              {suppliers.map(s => <option key={s.supplier_id} value={s.supplier_id}>{s.supplier_name}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label>Category</label>
            <select value={form.category_id} onChange={e => set("category_id", e.target.value)}>
              <option value="">Select category...</option>
              {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label>Unit Price (₹)</label>
            <input type="number" min="0" value={form.unit_price} onChange={e => set("unit_price", e.target.value)} placeholder="e.g. 120" />
          </div>
        </div>
        <div className="btn-row">
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : editing ? "Update Product" : "Add Product"}
          </button>
          {editing && <button className="btn-secondary" onClick={handleCancel}>Cancel</button>}
        </div>
        {status && <p className="status">{status}</p>}
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2>All Products</h2>
          <span className="muted">{products.length} records</span>
        </div>
        <CRUDTable
          columns={[
            { key: "product_id",    label: "ID"       },
            { key: "product_name",  label: "Name"     },
            { key: "supplier_name", label: "Supplier" },
            { key: "category_name", label: "Category" },
            { key: "unit_price",    label: "Price (₹)", render: v => v != null ? `₹${v}` : "—" },
          ]}
          rows={products}
          idKey="product_id"
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}