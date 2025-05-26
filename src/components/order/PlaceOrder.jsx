import { useState, useEffect } from "react";
import axios from "axios";
import { apiUrl } from "../../App";
import { useNavigate } from "react-router-dom";
import '../../styles/placeOrder.scss';
import OrderForm from "./OrderForm";
import OrderSummary from "./OrderSummary";
import TablesOrders from "./TablesOrders";
import EditOrderModal from "./EditOrderModal";
import { FiHome } from "react-icons/fi";

const PlaceOrder = () => {
  const [tables, setTables] = useState({});
  const [selectedTable, setSelectedTable] = useState("");
  const [inventory, setInventory] = useState([]);
  const [order, setOrder] = useState([]);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editingTable, setEditingTable] = useState(null);
  const [discountRates, setDiscountRates] = useState([]);
  const [availableTables, setAvailableTables] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${apiUrl}/api/discounts`)
      .then((res) => setDiscountRates(res.data))
      .catch((err) => console.error("Error al cargar descuentos:", err));

    axios
      .get(`${apiUrl}/api/inventory`)
      .then((res) => setInventory(res.data))
      .catch((err) => console.error("Error cargando inventario:", err));

    axios
      .get(`${apiUrl}/api/tables`)
      .then((res) => setAvailableTables(res.data))
      .catch((err) => console.error("Error al cargar mesas:", err));

    fetchOrders(); // Nuevo
  }, []);

  const fetchOrders = () => {
    axios
      .get(`${apiUrl}/api/orders`)
      .then((res) => {
        const grouped = res.data.reduce((acc, order) => {
          const table = order.table_number;
          if (!acc[table]) acc[table] = [];
          acc[table].push(order);
          return acc;
        }, {});
        setTables(grouped);
      })
      .catch((err) => console.error("Error cargando pedidos:", err));
  };


  const applyDiscount = (subtotal) => {
    for (const rate of discountRates) {
      if (subtotal >= rate.min_order_amount) {
        const discountAmount = subtotal * (rate.discount_rate / 100);
        return {
          discountRate: rate.discount_rate,
          discountAmount,
          total: subtotal - discountAmount,
        };
      }
    }
    return { discountRate: 0, discountAmount: 0, total: subtotal };
  };

  const handleAddToOrder = (item) => {
    setOrder((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      return existing
        ? prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
        : [...prev, { ...item, quantity: 1 }];
    });
  };

  const handleRemoveFromOrder = (item) => {
    setOrder((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (!existing) return prev;
      if (existing.quantity > 1) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i
        );
      } else {
        return prev.filter((i) => i.id !== item.id);
      }
    });
  };

  const handleConfirmOrder = () => {
  if (!selectedTable || order.length === 0) {
    return alert("Mesa y pedido requeridos");
  }

  // Buscamos la mesa seleccionada en availableTables
  const selectedTableObj = availableTables.find(
    (table) => table.id === selectedTable
  );

  if (!selectedTableObj) {
    return alert("Mesa seleccionada no válida");
  }

  if (selectedTableObj.status === "reserved") {
    return alert("La mesa seleccionada está reservada. Por favor, elige otra mesa.");
  }

  const subtotal = order.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const { total } = applyDiscount(subtotal);

  const userId = localStorage.getItem("user_id"); // ejemplo, o context, o prop

  const newOrder = {
    table_number: selectedTableObj.table_number, // O id, depende de lo que espere tu API
    user_id: userId,
    items: order.map((item) => ({
      inventory_id: item.id,
      quantity: item.quantity,
      price: item.price,
    })),
  };

  axios
    .post(`${apiUrl}/api/orders`, newOrder)
    .then(() => {
      setOrder([]); // Limpia la orden
      fetchOrders(); // Recarga pedidos
    })
    .catch((err) => console.error("Error al crear pedido:", err));
};



  const handleDeleteOrder = (orderId, tableNumber) => {
    if (!window.confirm("¿Estás seguro de eliminar este pedido?")) return;

    axios
      .delete(`${apiUrl}/api/orders/${orderId}`)
      .then(() => {
        const updated = { ...tables };
        updated[tableNumber] = updated[tableNumber].filter(
          (o) => o.order_id !== orderId
        );
        if (updated[tableNumber].length === 0) {
          delete updated[tableNumber];
        }
        setTables(updated);
      })
      .catch((err) => console.error("Error eliminando pedido:", err));
  };

  const handleMarkAsPaid = (tableNumber) => {
    axios.post(`${apiUrl}/api/orders/chargeByTable/${tableNumber}`)
      .then(() => {
        const updated = { ...tables };
        delete updated[tableNumber];
        setTables(updated);
      })
      .catch(err => console.error("Error cobrando mesa:", err));
  };




  const handleEditOrder = (order, table) => {
    setEditingOrder({ ...order });
    setEditingTable(table);
  };

  const handleChangeEditingItem = (idx, action) => {
    const updatedItems = [...editingOrder.items];
    if (action === "remove") {
      updatedItems.splice(idx, 1);
    } else if (action === "increase") {
      updatedItems[idx].quantity += 1;
    } else if (action === "decrease" && updatedItems[idx].quantity > 1) {
      updatedItems[idx].quantity -= 1;
    }
    setEditingOrder({ ...editingOrder, items: updatedItems });
  };

  const handleSaveEdit = () => {
    const subtotal = editingOrder.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const { total } = applyDiscount(subtotal);

    const updatedOrder = {
      ...editingOrder,
      total,
    };

    axios
      .put(`${apiUrl}/api/orders/${editingOrder.id}`, updatedOrder)
      .then((res) => {
        const updated = { ...tables };
        updated[editingTable] = updated[editingTable].map((o) =>
          o.id === res.data.id ? res.data : o
        );
        setTables(updated);
        setEditingOrder(null);
        setEditingTable(null);
      })
      .catch((err) => console.error("Error actualizando pedido:", err));
  };

  return (
    <div className="place-order-container">
      <header className="place-order-header">
        <h1>Hacer Pedido</h1>
        <button className="home-btn" onClick={() => navigate('/dashboard')}>
          <FiHome />
        </button>
      </header>

      <main className={`place-order-main ${order.length > 0 ? "with-summary" : "no-summary"}`}>
        {/* Mostrar solo si hay mesas disponibles para seleccionar */}
        {availableTables.length > 0 && (
          <section className="order-selection">
            <OrderForm
              inventory={inventory}
              onAddToOrder={handleAddToOrder}
              selectedTable={selectedTable}
              setSelectedTable={setSelectedTable}
              availableTables={availableTables.filter(table => table.status !== 'reserved')}
            />

          </section>
        )}

        {/* Mostrar solo si hay productos añadidos al pedido */}
        {order.length > 0 && (
          <section className="order-summary-section">
            <OrderSummary
              order={order}
              applyDiscount={applyDiscount}
              onRemove={handleRemoveFromOrder}
              onConfirm={handleConfirmOrder}
            />
          </section>
        )}
      </main>

      {/* Mostrar solo si hay pedidos en alguna mesa */}
      {Object.keys(tables).length > 0 && (
        <section className="tables-orders-section">
          <TablesOrders
            tables={tables}
            onDelete={handleDeleteOrder}
            onEdit={handleEditOrder}
            onCharge={handleMarkAsPaid}
          />
        </section>
      )}

      {editingOrder && (
        <EditOrderModal
          order={editingOrder}
          table={editingTable}
          onChange={handleChangeEditingItem}
          onSave={handleSaveEdit}
          onCancel={() => setEditingOrder(null)}
        />
      )}
    </div>
  );

};

export default PlaceOrder;
