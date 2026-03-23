import { useState } from "react";

/**
 * CRUDTable
 * Props:
 *   columns   – array of { key, label }
 *   rows      – array of objects
 *   onEdit    – fn(row) called when Edit clicked
 *   onDelete  – fn(row) called when Delete clicked
 *   idKey     – primary key field name (default "id")
 */
export default function CRUDTable({ columns, rows, onEdit, onDelete, idKey = "id" }) {
  const [confirmId, setConfirmId] = useState(null);

  const handleDelete = (row) => {
    if (confirmId === row[idKey]) {
      onDelete(row);
      setConfirmId(null);
    } else {
      setConfirmId(row[idKey]);
    }
  };

  if (!rows || rows.length === 0) {
    return <p className="muted" style={{ padding: "0.5rem 0" }}>No records found.</p>;
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key}>{col.label}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row[idKey] ?? i}>
              {columns.map(col => (
                <td key={col.key}>
                  {col.render ? col.render(row[col.key], row) : (row[col.key] ?? "—")}
                </td>
              ))}
              <td>
                {onEdit && (
                  <button className="btn-edit" onClick={() => onEdit(row)}>
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(row)}
                    title={confirmId === row[idKey] ? "Click again to confirm" : "Delete"}
                  >
                    {confirmId === row[idKey] ? "Confirm?" : "Delete"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}