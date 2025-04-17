const pool = require('../utils/db');

// Finalizar el día y guardar los pedidos completados en la caja
const endDay = async (req, res) => {
  const { orders, total } = req.body;
  const date = new Date().toISOString().slice(0, 10);
  try {
    await pool.query('INSERT INTO cash (date, orders, total) VALUES (?, ?, ?)', [date, JSON.stringify(orders), total]);
    await pool.query('DELETE FROM orders WHERE completed = true');
    res.json({ message: 'Day ended and cash updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener todos los registros de caja
const getAllCashRecords = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM cash');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { endDay, getAllCashRecords };