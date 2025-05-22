const pool = require('../utils/db');

class chargeController {
    // Método para cobrar un pedido: agrega registro en paid_orders para el order_id dado
   static async chargeOrder(req, res) {
    const { id } = req.params;

    try {
        const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
        if (orders.length === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        const order = orders[0];

        const [paid] = await pool.query('SELECT * FROM paid_orders WHERE order_id = ?', [id]);
        if (paid.length > 0) {
            return res.status(400).json({ message: 'Pedido ya cobrado' });
        }

        // Suponiendo que paid_orders tiene columnas: order_id, total, paid_at
        await pool.query(
            'INSERT INTO paid_orders (order_id, total, paid_at) VALUES (?, ?, NOW())',
            [id, order.total]
        );

        // Eliminar el pedido original
        await pool.query('DELETE FROM orders WHERE id = ?', [id]);

        res.json({ message: 'Pedido cobrado correctamente' });

    } catch (error) {
        console.error("Error cobrando pedido:", error);
        res.status(500).json({ error: error.message || 'Error interno al cobrar pedido' });
    }
}

}

module.exports = chargeController;
