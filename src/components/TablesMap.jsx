import { useState, useEffect } from "react";
import axios from "axios";
import '../styles/tablesManager.scss';
import { apiUrl } from "../App";

const TablesMap = () => {
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);

  const [showPopup, setShowPopup] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [reservationName, setReservationName] = useState("");
  const [reservationPhone, setReservationPhone] = useState("");

  const fetchTables = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/tables`);
      setTables(res.data);
    } catch (error) {
      console.error("Error cargando mesas", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/orders/active`);
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching active orders:", err);
    }
  };

  useEffect(() => {
    fetchTables();
    fetchOrders();
  }, []);

  const getTableColor = (table) => {
    if (table.status === 'reserved') return 'yellow';
    if (orders.some(order => order.table_id === table.id)) return 'red';
    return 'green';
  };

  const isTableOccupied = (tableId) => {
    return orders.some(order => order.table_id === tableId);
  };

  const openReservationPopup = (table) => {
    if (isTableOccupied(table.id)) return;
    if (table.status === 'reserved') {
      toggleReservation(table);
      return;
    }
    setSelectedTable(table);
    setReservationName("");
    setReservationPhone("");
    setShowPopup(true);
  };

  const confirmReservation = async () => {
    if (!reservationName.trim()) {
      alert("Por favor ingrese un nombre para la reserva.");
      return;
    }

    try {
      await axios.put(`${apiUrl}/api/tables/status/${selectedTable.id}`, {
        status: 'reserved',
        reservation_name: reservationName.trim(),
        reservation_phone: reservationPhone.trim() || null
      });

      setShowPopup(false);
      setSelectedTable(null);
      setReservationName("");
      setReservationPhone("");
      fetchTables();
    } catch (error) {
      console.error("Error al guardar la reserva:", error);
      alert("Error guardando la reserva");
    }
  };

  const toggleReservation = async (table) => {
    if (isTableOccupied(table.id)) return;

    const newStatus = table.status === 'reserved' ? 'free' : 'reserved';

    try {
      await axios.put(`${apiUrl}/api/tables/status/${table.id}`, {
        status: newStatus,
        reservation_name: newStatus === 'free' ? null : table.reservation_name || null,
        reservation_phone: newStatus === 'free' ? null : table.reservation_phone || null,
      });
      fetchTables();
    } catch (error) {
      console.error("Error al cambiar el estado de la mesa:", error);
    }
  };

  const reservedTables = tables.filter(t => t.status === 'reserved');

  return (
    <div>
      <h2>Mapa de Reservas</h2>
      <div className="tables-map">
        {tables.map((table) => (
          <div
            key={table.id}
            className="table-cube"
            style={{ backgroundColor: getTableColor(table) }}
            onClick={() => openReservationPopup(table)}
            title={`Mesa ${table.table_number}`}
          >
            {table.table_number}
          </div>
        ))}
      </div>

      {/* Popup para nombre de reserva */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Reservar Mesa {selectedTable.table_number}</h3>
            <input
              type="text"
              placeholder="Nombre de la reserva"
              value={reservationName}
              onChange={(e) => setReservationName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Teléfono de contacto (opcional)"
              value={reservationPhone}
              onChange={(e) => setReservationPhone(e.target.value)}
            />
            <div className="popup-buttons">
              <button onClick={confirmReservation}>Confirmar</button>
              <button onClick={() => setShowPopup(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de mesas reservadas */}
      <div className="reserved-tables-list">
        <h3>Mesas Reservadas</h3>
        {reservedTables.length === 0 && <p>No hay mesas reservadas</p>}
        <ul>
          {reservedTables.map((table) => (
            <li key={table.id}>
              Mesa {table.table_number} - {table.reservation_name || "Sin nombre"}{' '}
              {table.reservation_phone ? `(Tel: ${table.reservation_phone})` : "(Tel: N/A)"}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TablesMap;
