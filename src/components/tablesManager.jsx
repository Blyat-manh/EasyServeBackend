import { useState, useEffect } from "react";
import axios from "axios";
import '../styles/tablesManager.scss';
import { apiUrl } from "../App";
import { useNavigate } from "react-router-dom";
import TablesMap from "./TablesMap"; // ajusta la ruta según tu estructura
import { FiHome } from "react-icons/fi";


const TablesManager = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [newTableNumber, setNewTableNumber] = useState("");
  const [editTableId, setEditTableId] = useState(null);
  const [editTableNumber, setEditTableNumber] = useState("");

  const fetchTables = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/api/tables`);
      setTables(res.data);
      setError(null);
    } catch (err) {
      setError("Error al cargar las mesas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleCreate = async () => {
    if (!newTableNumber) {
      alert("Ingrese un número de mesa");
      return;
    }
    try {
      await axios.post(`${apiUrl}/api/tables`, { table_number: Number(newTableNumber) });
      setNewTableNumber("");
      fetchTables();
    } catch (err) {
      alert(err.response?.data?.error || "Error creando mesa");
    }
  };

  const startEdit = (table) => {
    setEditTableId(table.id);
    setEditTableNumber(table.table_number);
  };

  const cancelEdit = () => {
    setEditTableId(null);
    setEditTableNumber("");
  };

  const saveEdit = async () => {
    if (!editTableNumber) {
      alert("Ingrese un número de mesa");
      return;
    }
    try {
      await axios.put(`${apiUrl}/api/tables/${editTableId}`, { table_number: Number(editTableNumber) });
      cancelEdit();
      fetchTables();
    } catch (err) {
      alert(err.response?.data?.error || "Error actualizando mesa");
    }
  };

  const deleteTable = async (id) => {
    if (!window.confirm("¿Eliminar mesa? Esta acción no se puede deshacer.")) return;
    try {
      await axios.delete(`${apiUrl}/api/tables/${id}`);
      fetchTables();
    } catch {
      alert("Error eliminando mesa");
    }
  };

  return (
    <div className="tables-manager">
      <h2>Gestión de Mesas</h2>
      <button className="home-btn" onClick={() => navigate('/dashboard')}>
          <FiHome />
        </button>
      <div className="create-table">
        <input
          type="number"
          min="1"
          placeholder="Nuevo número de mesa"
          value={newTableNumber}
          onChange={(e) => setNewTableNumber(e.target.value)}
        />
        <button onClick={handleCreate}>Crear Mesa</button>
      </div>

      {loading && <p>Cargando mesas...</p>}
      {error && <p className="error">{error}</p>}

      <table>
        <thead>
          <tr>
            <th>Número de Mesa</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tables.length === 0 && !loading && (
            <tr>
              <td colSpan="2">No hay mesas</td>
            </tr>
          )}
          {tables.map((table) => (
            <tr key={table.id}>
              <td>
                {editTableId === table.id ? (
                  <input
                    type="number"
                    min="1"
                    value={editTableNumber}
                    onChange={(e) => setEditTableNumber(e.target.value)}
                  />
                ) : (
                  table.table_number
                )}
              </td>
              <td>
                <div className="action-buttons">
                  {editTableId === table.id ? (
                    <>
                      <button className="btn-save" onClick={saveEdit}>Guardar</button>
                      <button className="btn-cancel" onClick={cancelEdit}>Cancelar</button>
                    </>
                  ) : (
                    <>
                      <button className="btn-edit" onClick={() => startEdit(table)}>Editar</button>
                      <button className="btn-delete" onClick={() => deleteTable(table.id)}>Eliminar</button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <TablesMap />
    </div>
  );
};

export default TablesManager;
