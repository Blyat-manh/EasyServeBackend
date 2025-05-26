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
  const { name, price, type, description, image } = req.body;

  try {
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: "El nombre es obligatorio y debe ser una cadena" });
    }

    if (price === undefined || isNaN(price) || price < 0) {
      return res.status(400).json({ error: "El precio debe ser un número válido y positivo" });
    }

    if (!type || typeof type !== 'string') {
      return res.status(400).json({ error: "El tipo es obligatorio y debe ser una cadena" });
    }

    if (!description || typeof description !== 'string') {
      return res.status(400).json({ error: "La descripción es obligatoria y debe ser una cadena" });
    }

    // image es opcional, pero si viene debe ser string o null
    if (image && typeof image !== 'string') {
      return res.status(400).json({ error: "El enlace de la imagen debe ser una cadena o estar vacío" });
    }

    const [result] = await pool.query(
      "INSERT INTO inventory (name, price, type, description, image) VALUES (?, ?, ?, ?, ?)",
      [name, price, type, description, image || null]
    );

    res.status(201).json({ id: result.insertId, name, price, type, description, image: image || null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar un artículo del inventario
const updateInventoryItem = async (req, res) => {
  const { id } = req.params;
  const { name, price, type, description, image } = req.body;

  try {
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: "El nombre es obligatorio y debe ser una cadena" });
    }

    if (price === undefined || isNaN(price) || price < 0) {
      return res.status(400).json({ error: "El precio debe ser un número válido y positivo" });
    }

    if (!type || typeof type !== 'string') {
      return res.status(400).json({ error: "El tipo es obligatorio y debe ser una cadena" });
    }

    if (!description || typeof description !== 'string') {
      return res.status(400).json({ error: "La descripción es obligatoria y debe ser una cadena" });
    }

    // image es opcional, pero si viene debe ser string o null
    if (image && typeof image !== 'string') {
      return res.status(400).json({ error: "El enlace de la imagen debe ser una cadena o estar vacío" });
    }

    const [result] = await pool.query(
      "UPDATE inventory SET name = ?, price = ?, type = ?, description = ?, image = ? WHERE id = ?",
      [name, price, type, description, image || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Artículo no encontrado" });
    }

    res.json({ id, name, price, type, description, image: image || null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un artículo del inventario
const deleteInventoryItem = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query("DELETE FROM inventory WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Artículo no encontrado" });
    }

    res.json({ message: "Artículo eliminado correctamente" });
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