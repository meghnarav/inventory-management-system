import { useState, useEffect, useCallback } from "react";
import Dashboard        from "./pages/Dashboard";
import SuppliersPage    from "./pages/SuppliersPage";
import ProductsPage     from "./pages/ProductsPage";
import WarehousesPage   from "./pages/WarehousesPage";
import InventoryPage    from "./pages/InventoryPage";
import EmployeesPage    from "./pages/EmployeesPage";
import TransactionsPage from "./pages/TransactionsPage";

const NAV = [
  { group: "Overview" },
  { id: "dashboard",    label: "Dashboard",    icon: "📊" },

  { group: "Stock" },
  { id: "products",     label: "Products",     icon: "📦" },
  { id: "inventory",    label: "Inventory",    icon: "🗃️"  },
  { id: "transactions", label: "Transactions", icon: "🔁" },

  { group: "Management" },
  { id: "suppliers",    label: "Suppliers",    icon: "🏭" },
  { id: "employees",    label: "Employees",    icon: "👤" },
  { id: "warehouses",   label: "Warehouses",   icon: "🏢" },
];

async function fetchAll(setters) {
  const [
    suppliers, products, warehouses, employees,
    inventory, transactions, categories, roles,
    productsDetailed, employeesDetailed,
  ] = await Promise.all([
    fetch("/suppliers").then(r => r.json()),
    fetch("/products").then(r => r.json()),
    fetch("/warehouses").then(r => r.json()),
    fetch("/employees").then(r => r.json()),
    fetch("/inventory").then(r => r.json()),
    fetch("/transactions").then(r => r.json()),
    fetch("/categories").then(r => r.json()),
    fetch("/roles").then(r => r.json()),
    fetch("/products-detailed").then(r => r.json()),
    fetch("/employees-detailed").then(r => r.json()),
  ]);
  setters.setSuppliers(suppliers);
  setters.setProducts(products);
  setters.setWarehouses(warehouses);
  setters.setEmployees(employees);
  setters.setInventory(inventory);
  setters.setTransactions(transactions);
  setters.setCategories(categories);
  setters.setRoles(roles);
  setters.setProductsDetailed(productsDetailed);
  setters.setEmployeesDetailed(employeesDetailed);
}

export default function App() {
  const [page, setPage] = useState("dashboard");

  const [suppliers,         setSuppliers]        = useState([]);
  const [products,          setProducts]          = useState([]);
  const [warehouses,        setWarehouses]        = useState([]);
  const [employees,         setEmployees]         = useState([]);
  const [inventory,         setInventory]         = useState([]);
  const [transactions,      setTransactions]      = useState([]);
  const [categories,        setCategories]        = useState([]);
  const [roles,             setRoles]             = useState([]);
  const [productsDetailed,  setProductsDetailed]  = useState([]);
  const [employeesDetailed, setEmployeesDetailed] = useState([]);

  const refresh = useCallback(() => {
    fetchAll({
      setSuppliers, setProducts, setWarehouses, setEmployees,
      setInventory, setTransactions, setCategories, setRoles,
      setProductsDetailed, setEmployeesDetailed,
    });
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const kpis = {
    totalProducts:     products.length,
    totalSuppliers:    suppliers.length,
    totalUnits:        inventory.reduce((s, r) => s + (r.quantity || 0), 0),
    totalTransactions: transactions.length,
  };

  const inventoryByWarehouse = Object.values(
    inventory.reduce((acc, r) => {
      if (!acc[r.location]) acc[r.location] = { location: r.location, quantity: 0 };
      acc[r.location].quantity += r.quantity || 0;
      return acc;
    }, {})
  );

  const transactionsByDate = Object.values(
    transactions.reduce((acc, r) => {
      const d = r.transaction_date?.slice(0, 10) ?? "unknown";
      if (!acc[d]) acc[d] = { date: d, inQty: 0, outQty: 0 };
      if (r.transaction_type === "INWARD")  acc[d].inQty  += r.quantity || 0;
      if (r.transaction_type === "OUTWARD") acc[d].outQty += r.quantity || 0;
      return acc;
    }, {})
  ).sort((a, b) => a.date.localeCompare(b.date));

  const renderPage = () => {
    switch (page) {
      case "dashboard":    return <Dashboard kpis={kpis} inventoryByWarehouse={inventoryByWarehouse} transactionsByDate={transactionsByDate} />;
      case "suppliers":    return <SuppliersPage suppliers={suppliers} onRefresh={refresh} />;
      case "products":     return <ProductsPage products={productsDetailed} suppliers={suppliers} categories={categories} onRefresh={refresh} />;
      case "warehouses":   return <WarehousesPage warehouses={warehouses} onRefresh={refresh} />;
      case "inventory":    return <InventoryPage inventory={inventory} products={products} warehouses={warehouses} onRefresh={refresh} />;
      case "employees":    return <EmployeesPage employeesDetailed={employeesDetailed} roles={roles} onRefresh={refresh} />;
      case "transactions": return <TransactionsPage transactions={transactions} products={products} warehouses={warehouses} employees={employees} onRefresh={refresh} />;
      default:             return null;
    }
  };

  return (
    <div className="app-shell">

      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar__brand">
          <h1>SWIMS</h1>
          <p>Supplier-Warehouse Inventory Management</p>
        </div>
        <nav className="sidebar__nav">
          {NAV.map((item, i) => {
            // Group label
            if (item.group) return (
              <div key={`group-${i}`} className="nav-section-label">{item.group}</div>
            );
            // Nav link
            return (
              <a
                key={item.id}
                className={page === item.id ? "active" : ""}
                onClick={() => setPage(item.id)}
              >
                <span>{item.icon}</span>
                {item.label}
              </a>
            );
          })}
        </nav>
      </aside>

      {/* ── Page content ── */}
      <div className="page-content">
        {renderPage()}
      </div>

    </div>
  );
}