const pool = require('../utils/db');

class chargeController {
    // Método para cobrar un pedido: agrega registro en paid_orders para el order_id dado
    static async chargeOrdersByTable(req, res) {
        const { tableId } = req.params;


        try {
            // Buscar todos los pedidos de esa mesa que no estén pagados
            const [orders] = await pool.query(`
  SELECT o.id FROM orders o
  LEFT JOIN paid_orders p ON o.id = p.order_id
  WHERE o.table_id = ? AND p.order_id IS NULL
`, [tableId]);


            if (orders.length === 0) {
                return res.status(404).json({ message: 'No hay pedidos pendientes de cobro para esta mesa' });
            }

            // Insertar cada pedido en paid_orders
            for (const order of orders) {
                await pool.query('INSERT INTO paid_orders (order_id) VALUES (?)', [order.id]);
            }

            res.json({ message: 'Pedidos cobrados correctamente' });
        } catch (error) {
            console.error('Error cobrando pedidos por mesa:', error);
            res.status(500).json({ error: error.message });
        }
    }



}

module.exports = chargeController;
