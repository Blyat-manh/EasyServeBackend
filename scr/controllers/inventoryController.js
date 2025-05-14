const pool = require("../utils/db");

// Obtener todo el inventario
const getAllInventory = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM inventory");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear un nuevo artículo en el inventario
const createInventoryItem = async (req, res) => {
  const { name, price, type } = req.body; // Ahora 'type' es requerido
  try {
    if (isNaN(price)) {
      return res
        .status(400)
        .json({ error: "El precio debe ser un número válido" });
    }

    // Verificar que el tipo no esté vacío
    if (!type) {
      return res.status(400).json({ error: "El tipo es obligatorio" });
    }

    const [result] = await pool.query(
      "INSERT INTO inventory (name, price, type) VALUES (?, ?, ?)",
      [name, price, type]
    );
    res.json({ id: result.insertId, name, price, type });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar un artículo del inventario
const updateInventoryItem = async (req, res) => {
  const { id } = req.params;
  const { name, price, type } = req.body; // Ahora 'type' también puede ser actualizado
  try {
    if (isNaN(price)) {
      return res
        .status(400)
        .json({ error: "El precio debe ser un número válido" });
    }

    // Verificar que el tipo no esté vacío
    if (!type) {
      return res.status(400).json({ error: "El tipo es obligatorio" });
    }

    await pool.query(
      "UPDATE inventory SET name = ?, price = ?, type = ? WHERE id = ?",
      [name, price, type, id]
    );
    res.json({ id, name, price, type });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un artículo del inventario
const deleteInventoryItem = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM inventory WHERE id = ?", [id]);
    res.json({ message: "Item deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
};
