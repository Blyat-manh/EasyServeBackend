import { useState, useEffect } from 'react';
import axios from 'axios';
import { apiUrl } from '../App';
import { useNavigate } from 'react-router-dom';
import '../styles/menu.scss';

const getDirectImageUrl = (url) => {
  if (typeof url !== 'string') return 'https://via.placeholder.com/400x250';
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)\//);
  if (driveMatch) return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
  if (url.includes('dropbox.com')) return url.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '');
  if (url.startsWith('http')) return url;
  return 'https://via.placeholder.com/400x250';
};

const Menu = () => {
  const [inventory, setInventory] = useState([]);
  const [tables, setTables] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedTable, setSelectedTable] = useState('');
  const [reservationName, setReservationName] = useState('');
  const [reservationPhone, setReservationPhone] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${apiUrl}/api/inventory`)
      .then(res => setInventory(res.data))
      .catch(err => console.error('Error fetching inventory:', err));

    axios.get(`${apiUrl}/api/tables`)
      .then(res => {
        const availableTables = res.data.filter(t => t.status === 'free');
        setTables(availableTables);
      })
      .catch(err => console.error('Error fetching tables:', err));
  }, []);

  const handleLogout = () => {
    navigate('/');
  };

  const handleReservation = () => {
    if (!selectedTable || !reservationName || !reservationPhone) {
      alert('Por favor completa todos los campos.');
      return;
    }

    axios.put(`${apiUrl}/api/tables/status/${selectedTable}`, {
      status: 'reserved',
      reservation_name: reservationName,
      reservation_phone: reservationPhone
    })
      .then(() => {
        alert('Reserva confirmada!');
        setShowPopup(false);
        setReservationName('');
        setReservationPhone('');
        setSelectedTable('');
        // Refrescar mesas disponibles tras reserva
        axios.get(`${apiUrl}/api/tables`)
          .then(res => {
            const availableTables = res.data.filter(t => t.status === 'free');
            setTables(availableTables);
          })
          .catch(err => console.error('Error fetching tables after reservation:', err));
      })
      .catch(err => {
        console.error('Error al reservar:', err);
        alert('Ocurrió un error al reservar. Inténtalo más tarde.');
      });
  };

  const renderItems = (type) =>
    inventory
      .filter(item => item.type === type)
      .sort((a, b) => a.price - b.price)
      .map(item => (
        <div className="card" key={item.id}>
          <div className="card-image">
            <img src={getDirectImageUrl(item.image)} alt={item.name} />
          </div>
          <div className="card-text">
            <h2 className="card-title">{item.name}</h2>
            <p className="card-body">{item.description || 'Delicious item to enjoy!'}</p>
          </div>
          <div className="card-price">${item.price}</div>
        </div>
      ));

  return (
    <div className="menu">
      <div id="header">
        <h1>Bar Casa Jose</h1>
        <p>Comida casera española</p>
        <button className="btn-login" onClick={handleLogout}>Ir al login</button>
        {/* Quitado el botón reservar del header */}
      </div>

      <section className="container">
        <h2>Bebidas</h2>
        {renderItems('bebida')}
      </section>

      <section className="container">
        <h2>Tapas</h2>
        {renderItems('tapa')}
      </section>

      <footer className="footer">
        <div className="footer-content">
          <h3>Bar Casa Jose</h3>
          <p>Dirección: Calle Falsa 123, Madrid, España</p>
          <p>
            Horario: Lun-Sab 06:00 - 15:30
          </p>
          <p>
            Reserva tu mesa: <a href="tel:+34911222333">+34 911 222 333</a>{' '}
            |{' '}
            <a
              href="#!"
              onClick={e => {
                e.preventDefault();
                setShowPopup(true);
              }}
            >
              Reservar mesa
            </a>
          </p>
          <p>© 2025 Bar Casa Jose. Todos los derechos reservados.</p>
        </div>
      </footer>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Reservar mesa</h3>
            <select value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)}>
              <option value="">Selecciona una mesa</option>
              {tables.map(table => (
                <option key={table.id} value={table.id}>
                  Mesa {table.table_number}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Tu nombre"
              value={reservationName}
              onChange={(e) => setReservationName(e.target.value)}
            />
            <input
              type="tel"
              placeholder="Tu teléfono"
              value={reservationPhone}
              onChange={(e) => setReservationPhone(e.target.value)}
            />
            <div className="popup-buttons">
              <button onClick={handleReservation}>Confirmar</button>
              <button onClick={() => setShowPopup(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;
