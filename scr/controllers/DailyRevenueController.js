const pool = require('../utils/db');

// Función para finalizar el día:
// suma el total de todos los pedidos actuales, los guarda en daily_revenue, y luego borra los pedidos.
const endDay = async (req, res) => {
  try {
    const date = new Date().toISOString().slice(0, 10);

    // Sumar total de todos los pedidos del día actual (no cobrados todavía)
    const [orders] = await pool.query('SELECT total FROM orders WHERE DATE(created_at) = ?', [date]);

    if (orders.length === 0) {
      return res.status(400).json({ message: 'No hay pedidos para finalizar hoy' });
    }

    const total = orders.reduce((acc, order) => acc + parseFloat(order.total), 0);

    // Insertar o actualizar total en daily_revenue
    const [existing] = await pool.query('SELECT * FROM daily_revenue WHERE date = ?', [date]);

    if (existing.length > 0) {
      await pool.query('UPDATE daily_revenue SET total = total + ? WHERE date = ?', [total, date]);
    } else {
      await pool.query('INSERT INTO daily_revenue (date, total) VALUES (?, ?)', [date, total]);
    }

    // Borrar pedidos del día finalizado
    await pool.query('DELETE FROM orders WHERE DATE(created_at) = ?', [date]);

    res.json({ message: 'Día finalizado, ingresos guardados y pedidos eliminados', total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener todos los registros de ingresos diarios
const getAllDailyRevenue = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM daily_revenue ORDER BY date DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { endDay, getAllDailyRevenue };
