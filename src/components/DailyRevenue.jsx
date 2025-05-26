import { useEffect, useState } from 'react';
import axios from 'axios';
import { apiUrl } from '../App';
import { useNavigate } from 'react-router-dom';
import { DateRange } from 'react-date-range';
import { format } from 'date-fns';
import '../styles/dailyRevenue.scss'
import { FiHome } from 'react-icons/fi';

const DailyRevenue = () => {
  const [dailyRevenues, setDailyRevenues] = useState([]);
  const [filteredRevenues, setFilteredRevenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [range, setRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchDailyRevenues();
  }, []);

  // Mostrar todos los ingresos cuando se cargan inicialmente
useEffect(() => {
  setFilteredRevenues(dailyRevenues);
}, [dailyRevenues]);

// Filtrar solo si el calendario está abierto
useEffect(() => {
  if (showCalendar) {
    filterRevenues();
  }
}, [range]);


  const fetchDailyRevenues = async () => {
    try {
      const res = await axios.get(apiUrl + '/api/dailyRevenue');
      setDailyRevenues(res.data);
    } catch (error) {
      console.error('Error fetching daily revenues:', error);
    }
  };

  const handleEndDay = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await axios.post(apiUrl + '/api/dailyRevenue/end-day');
      setMessage(`Día finalizado. Total ingresado: $${res.data.total}`);
      fetchDailyRevenues();
    } catch (error) {
      console.error('Error finalizando el día:', error);
      setMessage(error.response?.data?.message || 'Error finalizando el día');
    }
    setLoading(false);
  };

  const filterRevenues = () => {
    const start = format(range[0].startDate, 'yyyy-MM-dd');
    const end = format(range[0].endDate, 'yyyy-MM-dd');

    const filtered = dailyRevenues.filter((r) => {
      return r.date >= start && r.date <= end;
    });

    setFilteredRevenues(filtered);
  };

  return (
    <div>
      <h1>Ingresos Diarios</h1>
      <button className="home-btn" onClick={() => navigate('/dashboard')}>
          <FiHome />
        </button>
      <button onClick={handleEndDay} disabled={loading}>
        {loading ? 'Procesando...' : 'Finalizar Día'}
      </button>
      {message && <p>{message}</p>}

      <h2>Filtrar por rango de fechas</h2>
      <div className="calendar-wrapper" style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => {
            if (showCalendar) {
              // Cerrar calendario y resetear filtro
              const today = new Date();
              const resetRange = [{
                startDate: today,
                endDate: today,
                key: 'selection'
              }];
              setRange(resetRange);
              setFilteredRevenues(dailyRevenues); // Mostrar todos
              setShowCalendar(false);
            } else {
              setShowCalendar(true);
            }
          }}
        >
          {showCalendar ? 'Cerrar Calendario' : 'Seleccionar Rango de Fechas'}
        </button>

        {showCalendar && (
          <div className="calendar-container">
            <DateRange
              editableDateInputs={true}
              onChange={item => setRange([item.selection])}
              moveRangeOnFirstSelection={false}
              ranges={range}
            />
          </div>
        )}
      </div>

      <h2>Historial de ingresos</h2>
      {filteredRevenues.length === 0 ? (
        <p>No hay ingresos en el rango seleccionado.</p>
      ) : (
        <ul>
          {filteredRevenues.map(({ id, date, total }) => (
            <li key={id}>
              Fecha: {date} — Total: ${isNaN(total) ? 'N/A' : Number(total).toFixed(2)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DailyRevenue;
