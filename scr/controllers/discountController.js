const pool = require('../utils/db');

const getDiscountRates = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM DiscountRates ORDER BY min_order_amount DESC'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getDiscountRates };
