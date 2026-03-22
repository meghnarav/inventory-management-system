from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from . import queries


app = FastAPI(title="SWIMS API", version="1.0.0")

# Allow local React dev server by default
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _ensure_found(ok: bool, entity: str) -> None:
    if not ok:
        raise HTTPException(status_code=404, detail=f"{entity} not found")


# ---------------------- Read endpoints ---------------------- #

@app.get("/categories", response_model=List[Dict[str, Any]])
def get_categories() -> List[Dict[str, Any]]:
    from .db_connection import get_connection
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT category_id, category_name FROM Category")
    data = cursor.fetchall()
    cursor.close()
    conn.close()
    return data


@app.get("/roles", response_model=List[Dict[str, Any]])
def get_roles() -> List[Dict[str, Any]]:
    from .db_connection import get_connection
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT role_id, role_name FROM Role")
    data = cursor.fetchall()
    cursor.close()
    conn.close()
    return data

@app.get("/suppliers", response_model=List[Dict[str, Any]])
def get_suppliers() -> List[Dict[str, Any]]:
    return queries.fetch_suppliers()


@app.get("/products", response_model=List[Dict[str, Any]])
def get_products() -> List[Dict[str, Any]]:
    return queries.fetch_products()


@app.get("/warehouses", response_model=List[Dict[str, Any]])
def get_warehouses() -> List[Dict[str, Any]]:
    return queries.fetch_warehouses()


@app.get("/employees", response_model=List[Dict[str, Any]])
def get_employees() -> List[Dict[str, Any]]:
    return queries.fetch_employees()


@app.get("/inventory", response_model=List[Dict[str, Any]])
def get_inventory() -> List[Dict[str, Any]]:
    return queries.fetch_inventory()


@app.get("/transactions", response_model=List[Dict[str, Any]])
def get_transactions() -> List[Dict[str, Any]]:
    return queries.fetch_stock_transactions()




# ---------------------- Supplier CRUD ---------------------- #


@app.post("/suppliers", status_code=201)
def create_supplier(payload: Dict[str, Any]) -> Dict[str, Any]:
    name: Optional[str] = payload.get("supplier_name") or payload.get("name")
    if not name:
        raise HTTPException(status_code=400, detail="supplier_name is required")
    email = payload.get("contact_email")
    phone = payload.get("phone_number")
    new_id = queries.create_supplier(name, email, phone)
    if new_id is None:
        raise HTTPException(status_code=500, detail="Failed to create supplier")
    return {"supplier_id": new_id}


@app.put("/suppliers/{supplier_id}")
def update_supplier(supplier_id: int, payload: Dict[str, Any]) -> Dict[str, Any]:
    name: Optional[str] = payload.get("supplier_name") or payload.get("name")
    if not name:
        raise HTTPException(status_code=400, detail="supplier_name is required")
    email = payload.get("contact_email")
    phone = payload.get("phone_number")
    ok = queries.update_supplier(supplier_id, name, email, phone)
    _ensure_found(ok, "Supplier")
    return {"ok": True}


@app.delete("/suppliers/{supplier_id}", status_code=204)
def delete_supplier(supplier_id: int) -> None:
    ok = queries.delete_supplier(supplier_id)
    _ensure_found(ok, "Supplier")


# ---------------------- Product CRUD ---------------------- #


@app.post("/products", status_code=201)
def create_product(payload: Dict[str, Any]) -> Dict[str, Any]:
    name: Optional[str] = payload.get("product_name") or payload.get("name")
    supplier_id = payload.get("supplier_id")
    if not name or not supplier_id:
        raise HTTPException(
            status_code=400,
            detail="product_name and supplier_id are required",
        )
    category = payload.get("category")
    unit_price = payload.get("unit_price")
    new_id = queries.create_product(name, supplier_id, category, unit_price)
    if new_id is None:
        raise HTTPException(status_code=500, detail="Failed to create product")
    return {"product_id": new_id}


@app.put("/products/{product_id}")
def update_product(product_id: int, payload: Dict[str, Any]) -> Dict[str, Any]:
    name: Optional[str] = payload.get("product_name") or payload.get("name")
    supplier_id = payload.get("supplier_id")
    if not name or not supplier_id:
        raise HTTPException(
            status_code=400,
            detail="product_name and supplier_id are required",
        )
    category = payload.get("category")
    unit_price = payload.get("unit_price")
    ok = queries.update_product(product_id, name, supplier_id, category, unit_price)
    _ensure_found(ok, "Product")
    return {"ok": True}


@app.delete("/products/{product_id}", status_code=204)
def delete_product(product_id: int) -> None:
    ok = queries.delete_product(product_id)
    _ensure_found(ok, "Product")


# ---------------------- Warehouse CRUD ---------------------- #


@app.post("/warehouses", status_code=201)
def create_warehouse(payload: Dict[str, Any]) -> Dict[str, Any]:
    location: Optional[str] = payload.get("location")
    if not location:
        raise HTTPException(status_code=400, detail="location is required")
    capacity = payload.get("capacity")
    new_id = queries.create_warehouse(location, capacity)
    if new_id is None:
        raise HTTPException(status_code=500, detail="Failed to create warehouse")
    return {"warehouse_id": new_id}


@app.put("/warehouses/{warehouse_id}")
def update_warehouse(warehouse_id: int, payload: Dict[str, Any]) -> Dict[str, Any]:
    location: Optional[str] = payload.get("location")
    if not location:
        raise HTTPException(status_code=400, detail="location is required")
    capacity = payload.get("capacity")
    ok = queries.update_warehouse(warehouse_id, location, capacity)
    _ensure_found(ok, "Warehouse")
    return {"ok": True}


@app.delete("/warehouses/{warehouse_id}", status_code=204)
def delete_warehouse(warehouse_id: int) -> None:
    ok = queries.delete_warehouse(warehouse_id)
    _ensure_found(ok, "Warehouse")


# ---------------------- Employee CRUD ---------------------- #


@app.post("/employees", status_code=201)
def create_employee(payload: Dict[str, Any]) -> Dict[str, Any]:
    name: Optional[str] = payload.get("name")
    role: Optional[str] = payload.get("role")
    if not name or not role:
        raise HTTPException(status_code=400, detail="name and role are required")
    new_id = queries.create_employee(name, role)
    if new_id is None:
        raise HTTPException(status_code=500, detail="Failed to create employee")
    return {"employee_id": new_id}


@app.put("/employees/{employee_id}")
def update_employee(employee_id: int, payload: Dict[str, Any]) -> Dict[str, Any]:
    name: Optional[str] = payload.get("name")
    role: Optional[str] = payload.get("role")
    if not name or not role:
        raise HTTPException(status_code=400, detail="name and role are required")
    ok = queries.update_employee(employee_id, name, role)
    _ensure_found(ok, "Employee")
    return {"ok": True}


@app.delete("/employees/{employee_id}", status_code=204)
def delete_employee(employee_id: int) -> None:
    ok = queries.delete_employee(employee_id)
    _ensure_found(ok, "Employee")


# ---------------------- Stock movement ---------------------- #


@app.post("/stock-movements", status_code=201)
def create_stock_movement(payload: Dict[str, Any]) -> Dict[str, Any]:
    product_id = payload.get("product_id")
    warehouse_id = payload.get("warehouse_id")
    employee_id = payload.get("employee_id")
    quantity = payload.get("quantity")
    t_type = payload.get("transaction_type") or payload.get("type")

    if not all([product_id, warehouse_id, employee_id, quantity, t_type]):
        raise HTTPException(
            status_code=400,
            detail="product_id, warehouse_id, employee_id, quantity, and transaction_type are required",
        )

    ok = queries.add_stock_movement(product_id, warehouse_id, employee_id, quantity, t_type)
    if not ok:
        raise HTTPException(status_code=500, detail="Failed to record stock movement")
    return {"ok": True}


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}

