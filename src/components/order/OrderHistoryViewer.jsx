import { useState, useEffect } from "react";
import axios from "axios";
import { apiUrl } from "../../App";
import { useNavigate } from 'react-router-dom';

const OrderHistoryViewer = () => {
  const [orders, setOrders] = useState([]);
  const [visibleOrders, setVisibleOrders] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
  const fetchOrders = () => {
    axios.get(`${apiUrl}/api/orders`)
      .then(res => {
        const sorted = res.data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        setOrders(sorted);

        setVisibleOrders(prev => {
          const updated = { ...prev };
          sorted.forEach(order => {
            if (!(order.id in updated)) {
              updated[order.id] = true;
            }
          });
          return updated;
        });
      })
      .catch(err => console.error("Error cargando historial de pedidos:", err));
  };

  fetchOrders(); // llamada inicial
  const interval = setInterval(fetchOrders, 5000); // cada 5 segundos recarga para ver si hay nuevos pedidos

  return () => clearInterval(interval);
}, []);


  const toggleVisibility = (orderId) => {
    setVisibleOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  return (
    <div>
      <h2>Historial de Pedidos</h2>
      <button onClick={() => navigate('/dashboard')}>Volver</button>
      {orders.map(order => (
        <div key={order.id} style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>Mesa: {order.table_number}</strong>
            <button onClick={() => toggleVisibility(order.id)}>
              {visibleOrders[order.id] ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          {visibleOrders[order.id] && (
            <ul style={{ marginTop: "0.5rem" }}>
              {order.items.map((item, index) => (
                <li key={index}>
                  {item.name} — {item.quantity} unidad{item.quantity > 1 ? "es" : ""}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};

export default OrderHistoryViewer;
