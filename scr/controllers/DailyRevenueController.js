const pool = require('../utils/db');

// Cobrar un pedido: mueve a paid_orders y elimina de orders
const markOrderAsPaid = async (req, res) => {
  const orderId = req.params.id;
  try {
    const [orderResult] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (orderResult.length === 0) return res.status(404).json({ message: "Pedido no encontrado" });
    const order = orderResult[0];
    // paid_at se autogenera
    await pool.query(
      'INSERT INTO paid_orders (order_id, total) VALUES (?, ?)',
      [order.id, order.total]
    );
    await pool.query('DELETE FROM order_items WHERE order_id = ?', [orderId]);
    await pool.query('DELETE FROM orders WHERE id = ?', [orderId]);
    res.json({ message: "Pedido cobrado y registrado en paid_orders" });
  } catch (error) {
    console.error('Error cobrando pedido:', error);
    res.status(500).json({ message: "Error al cobrar pedido", error: error.message });
  }
};

// Finalizar el día: suma lo cobrado en paid_orders (por fecha), guarda en daily_revenue y elimina de paid_orders
const endDay = async (req, res) => {
  try {
    const date = new Date().toISOString().slice(0, 10);
    // Sumar total de paid_orders del día
    const [result] = await pool.query(
      'SELECT SUM(total) as total FROM paid_orders WHERE DATE(paid_at) = ?', [date]
    );
    const total = result[0].total || 0;
    if (total === 0) {
      return res.status(400).json({ message: 'No hay pedidos cobrados para finalizar hoy' });
    }
    // Insertar o actualizar en daily_revenue
    const [existing] = await pool.query('SELECT * FROM daily_revenue WHERE date = ?', [date]);
    if (existing.length > 0) {
      await pool.query('UPDATE daily_revenue SET total = ? WHERE date = ?', [total, date]);
    } else {
      await pool.query('INSERT INTO daily_revenue (date, total) VALUES (?, ?)', [date, total]);
    }
    // Borrar paid_orders de hoy
    await pool.query('DELETE FROM paid_orders WHERE DATE(paid_at) = ?', [date]);
    res.json({ message: 'Día finalizado, ingresos guardados y registros cobrados eliminados', total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener el historial de ingresos diarios cerrados
const getAllDailyRevenue = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM daily_revenue ORDER BY date DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// NUEVO: Obtener pagos agrupados por fecha
const getDailyPaidOrders = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT DATE(paid_at) as date, SUM(total) as total
      FROM paid_orders
      GROUP BY DATE(paid_at)
      ORDER BY date DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { endDay, getAllDailyRevenue, markOrderAsPaid, getDailyPaidOrders };
