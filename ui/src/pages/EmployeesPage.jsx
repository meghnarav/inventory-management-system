import { useState } from "react";
import CRUDTable from "../CRUDTable";

const EMPTY_BASE    = { name: "", role_id: "" };
const EMPTY_PERM    = { monthly_salary: "", benefits: "" };
const EMPTY_CONTRACT= { hourly_rate: "", contract_end_date: "" };

export default function EmployeesPage({ employeesDetailed, roles, onRefresh }) {
  const [form, setForm]         = useState(EMPTY_BASE);
  const [empType, setEmpType]   = useState("permanent");
  const [subForm, setSubForm]   = useState(EMPTY_PERM);
  const [editing, setEditing]   = useState(null);
  const [status, setStatus]     = useState("");
  const [loading, setLoading]   = useState(false);

  const setF  = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setSub = (k, v) => setSubForm(f => ({ ...f, [k]: v }));

  const switchType = (t) => {
    setEmpType(t);
    setSubForm(t === "permanent" ? EMPTY_PERM : EMPTY_CONTRACT);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.role_id) return setStatus("⚠️ Name and role are required.");
    setLoading(true); setStatus("");
    try {
      if (editing) {
        // Update base employee only
        const res = await fetch(`/employees/${editing.employee_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, role_id: parseInt(form.role_id) }),
        });
        if (!res.ok) throw new Error(await res.text());
        setStatus("✅ Employee updated!");
      } else {
        // Create base employee
        const res = await fetch("/employees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, role_id: parseInt(form.role_id) }),
        });
        if (!res.ok) throw new Error(await res.text());
        const { employee_id } = await res.json();

        // Create subtype
        const subUrl = empType === "permanent" ? "/employees/permanent" : "/employees/contract";
        const subBody = empType === "permanent"
          ? { employee_id, monthly_salary: parseFloat(subForm.monthly_salary) || null, benefits: subForm.benefits || null }
          : { employee_id, hourly_rate: parseFloat(subForm.hourly_rate) || null, contract_end_date: subForm.contract_end_date || null };

        const subRes = await fetch(subUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subBody),
        });
        if (!subRes.ok) throw new Error(await subRes.text());
        setStatus("✅ Employee added!");
      }

      setForm(EMPTY_BASE); setSubForm(EMPTY_PERM); setEditing(null); onRefresh();
    } catch (e) { setStatus("❌ " + e.message); }
    finally { setLoading(false); }
  };

  const handleEdit = (row) => {
    setEditing(row);
    setForm({ name: row.name, role_id: row.role_id ?? "" });
    setStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (row) => {
  try {
    // Add the full backend URL (usually http://localhost:8000)
    const res = await fetch(`http://localhost:8000/employees/${row.employee_id}`, { 
      method: "DELETE" 
    });

    if (res.status === 204) {
      onRefresh();
    } else {
      console.error("Delete failed with status:", res.status);
    }
  } catch (e) {
    console.error("Network Error:", e);
  }
};

  const handleCancel = () => { setEditing(null); setForm(EMPTY_BASE); setSubForm(EMPTY_PERM); setStatus(""); };

  const permanent = employeesDetailed.filter(e => e.employee_type === "Permanent");
  const contract  = employeesDetailed.filter(e => e.employee_type === "Contract");

  return (
    <div>
      <div className="page-header">
        <h1>Employees</h1>
        <p>Manage permanent and contract employees</p>
      </div>

      {/* Form */}
      <div className="panel">
        <h2>{editing ? "Edit Employee" : "Add Employee"}</h2>
        <div className="form-grid">
          <div className="form-row">
            <label>Name *</label>
            <input value={form.name} onChange={e => setF("name", e.target.value)} placeholder="Full name" />
          </div>
          <div className="form-row">
            <label>Role *</label>
            <select value={form.role_id} onChange={e => setF("role_id", e.target.value)}>
              <option value="">Select role...</option>
              {roles.map(r => <option key={r.role_id} value={r.role_id}>{r.role_name}</option>)}
            </select>
          </div>
        </div>

        {/* Only show type toggle + subfields when adding */}
        {!editing && (
          <>
            <div className="form-row" style={{ marginTop: "0.75rem" }}>
              <label>Employee Type</label>
              <div className="toggle-group">
                <button type="button" className={`toggle-btn ${empType === "permanent" ? "active" : ""}`} onClick={() => switchType("permanent")}>Permanent</button>
                <button type="button" className={`toggle-btn ${empType === "contract"  ? "active" : ""}`} onClick={() => switchType("contract")}>Contract</button>
              </div>
            </div>

            <div className="form-grid" style={{ marginTop: "0.75rem" }}>
              {empType === "permanent" ? (
                <>
                  <div className="form-row">
                    <label>Monthly Salary (₹)</label>
                    <input type="number" min="0" value={subForm.monthly_salary} onChange={e => setSub("monthly_salary", e.target.value)} placeholder="e.g. 60000" />
                  </div>
                  <div className="form-row">
                    <label>Benefits</label>
                    <input value={subForm.benefits} onChange={e => setSub("benefits", e.target.value)} placeholder="e.g. Health Insurance" />
                  </div>
                </>
              ) : (
                <>
                  <div className="form-row">
                    <label>Hourly Rate (₹)</label>
                    <input type="number" min="0" value={subForm.hourly_rate} onChange={e => setSub("hourly_rate", e.target.value)} placeholder="e.g. 400" />
                  </div>
                  <div className="form-row">
                    <label>Contract End Date</label>
                    <input type="date" value={subForm.contract_end_date} onChange={e => setSub("contract_end_date", e.target.value)} />
                  </div>
                </>
              )}
            </div>
          </>
        )}

        <div className="btn-row" style={{ marginTop: "0.75rem" }}>
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : editing ? "Update Employee" : "Add Employee"}
          </button>
          {editing && <button className="btn-secondary" onClick={handleCancel}>Cancel</button>}
        </div>
        {status && <p className="status">{status}</p>}
      </div>

      {/* Permanent Table */}
      <div className="panel">
        <div className="panel-header">
          <h2>Permanent Employees</h2>
          <span className="muted">{permanent.length} records</span>
        </div>
        <CRUDTable
          columns={[
            { key: "name",           label: "Name"    },
            { key: "role_name",      label: "Role"    },
            { key: "monthly_salary", label: "Salary (₹)", render: v => v != null ? `₹${Number(v).toLocaleString()}` : "—" },
            { key: "benefits",       label: "Benefits" },
          ]}
          rows={permanent}
          idKey="employee_id"
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Contract Table */}
      <div className="panel">
        <div className="panel-header">
          <h2>Contract Employees</h2>
          <span className="muted">{contract.length} records</span>
        </div>
        <CRUDTable
          columns={[
            { key: "name",              label: "Name"      },
            { key: "role_name",         label: "Role"      },
            { key: "hourly_rate",       label: "Rate (₹/hr)", render: v => v != null ? `₹${v}` : "—" },
            { key: "contract_end_date", label: "End Date"  },
          ]}
          rows={contract}
          idKey="employee_id"
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}