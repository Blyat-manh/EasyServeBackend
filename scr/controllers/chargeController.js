const pool = require('../utils/db');

class chargeController {
  // Método para cobrar un pedido: agrega registro en paid_orders para el order_id dado
  static async chargeOrder(req, res) {
    const { id } = req.params;

    try {
      // Verificar si el pedido existe
      const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
      if (orders.length === 0) {
        return res.status(404).json({ message: 'Pedido no encontrado' });
      }

      // Insertar registro en tabla paid_orders para marcarlo como cobrado
      await pool.query('INSERT INTO paid_orders (order_id) VALUES (?)', [id]);

      // Opcional: eliminar pedido de tabla orders para que no aparezca más
      // await pool.query('DELETE FROM orders WHERE id = ?', [id]);

      res.json({ message: 'Pedido cobrado correctamente' });
    } catch (error) {
      console.error("Error cobrando pedido:", error);
      res.status(500).json({ error: 'Error interno al cobrar pedido' });
    }
  }
}

module.exports = chargeController;
