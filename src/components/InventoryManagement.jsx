import { useState, useEffect } from 'react';
import axios from 'axios';
import { apiUrl } from '../App';
import { useNavigate } from 'react-router-dom';
import '../styles/inventoryManagement.scss';
import { FiHome } from 'react-icons/fi';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', price: '', type: '', description: '', image: '' });
  const [selectedItem, setSelectedItem] = useState(null);
  const [updateItem, setUpdateItem] = useState({ name: '', price: '', type: '', description: '', image: '' });

  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${apiUrl}/api/inventory`)
      .then(response => setInventory(response.data))
      .catch(error => console.error('Error fetching inventory:', error));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: value }));
  };

  const handleAddItem = () => {
    if (isNaN(newItem.price) || newItem.price <= 0) return console.error('El precio debe ser válido');
    if (!newItem.type) return console.error('El tipo es obligatorio');

    axios.post(`${apiUrl}/api/inventory`, newItem)
      .then(response => {
        setInventory(prev => [...prev, response.data]);
        setNewItem({ name: '', price: '', type: '', description: '', image: '' });
      })
      .catch(error => console.error('Error adding item:', error));
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setUpdateItem({
      name: item.name,
      price: item.price,
      type: item.type,
      description: item.description || '',
      image: item.image || ''
    });
  };

  const handleUpdateInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateItem(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateItem = () => {
    if (isNaN(updateItem.price) || updateItem.price <= 0) return console.error('El precio debe ser válido');
    if (!updateItem.type) return console.error('El tipo es obligatorio');

    axios.put(`${apiUrl}/api/inventory/${selectedItem.id}`, updateItem)
      .then(response => {
        setInventory(prev =>
          prev.map(item => (item.id === selectedItem.id ? response.data : item))
        );
        setUpdateItem({ name: '', price: '', type: '', description: '', image: '' });
        setSelectedItem(null);
      })
      .catch(error => console.error('Error updating item:', error));
  };

  const handleDeleteItem = (id) => {
    axios.delete(`${apiUrl}/api/inventory/${id}`)
      .then(() => {
        setInventory(prev => prev.filter(item => item.id !== id));
      })
      .catch(error => console.error('Error deleting item:', error));
  };

  const handleCancelUpdate = () => {
    setSelectedItem(null);
    setUpdateItem({ name: '', price: '', type: '', description: '', image: '' });
  };

  return (
    <div className="inventory-management-container">
      <h1>Gestión de Inventario</h1>
      <button onClick={() => navigate('/dashboard')}>
        <FiHome />
      </button>

      {/* Formulario para agregar artículo */}
      <div className="form-section">
        <input
          type="text"
          name="name"
          placeholder="Nombre del Artículo"
          value={newItem.name}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="price"
          placeholder="Precio"
          value={newItem.price}
          onChange={handleInputChange}
        />
        <select name="type" value={newItem.type} onChange={handleInputChange}>
          <option value="">Escoge el tipo</option>
          <option value="tapa">Tapa</option>
          <option value="bebida">Bebida</option>
        </select>
        <textarea
          name="description"
          placeholder="Descripción"
          value={newItem.description}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="image"
          placeholder="Enlace a la imagen (opcional)"
          value={newItem.image}
          onChange={handleInputChange}
        />
        <button onClick={handleAddItem}>Agregar Artículo</button>
      </div>

      {/* Formulario para actualizar artículo */}
      {selectedItem && (
        <div className="form-section">
          <h2>Actualizar Artículo: {selectedItem.name}</h2>
          <input
            type="text"
            name="name"
            placeholder="Nombre del Artículo"
            value={updateItem.name}
            onChange={handleUpdateInputChange}
          />
          <input
            type="number"
            name="price"
            placeholder="Precio"
            value={updateItem.price}
            onChange={handleUpdateInputChange}
          />
          <select name="type" value={updateItem.type} onChange={handleUpdateInputChange}>
            <option value="">Escoge el tipo</option>
            <option value="tapa">Tapa</option>
            <option value="bebida">Bebida</option>
          </select>
          <textarea
            name="description"
            placeholder="Descripción"
            value={updateItem.description}
            onChange={handleUpdateInputChange}
          />
          <input
            type="text"
            name="image"
            placeholder="Enlace a la imagen (opcional)"
            value={updateItem.image}
            onChange={handleUpdateInputChange}
          />
          <button onClick={handleUpdateItem}>Actualizar Artículo</button>
          <button onClick={handleCancelUpdate}>Cancelar</button>
        </div>
      )}

      {/* Listado de Bebidas */}
      <h3>Bebidas</h3>
      <ul>
        {inventory
          .filter(item => item.type === 'bebida')
          .sort((a, b) => a.price - b.price)
          .map(item => (
            <li key={item.id}>
              <div>
                <strong>{item.name}</strong> - ${item.price}
                {item.description && <p>{item.description}</p>}
                {item.image &&
                  <div>
                    <img src={item.image} alt={item.name} style={{ maxWidth: "120px", maxHeight: "80px" }} />
                  </div>
                }
              </div>
              <div>
                <button onClick={() => handleSelectItem(item)}>Editar</button>
                <button onClick={() => handleDeleteItem(item.id)}>Eliminar</button>
              </div>
            </li>
          ))}
      </ul>

      {/* Listado de Tapas */}
      <h3>Tapas</h3>
      <ul>
        {inventory
          .filter(item => item.type === 'tapa')
          .sort((a, b) => a.price - b.price)
          .map(item => (
            <li key={item.id}>
              <div>
                <strong>{item.name}</strong> - ${item.price}
                {item.description && <p>{item.description}</p>}
                {item.image &&
                  <div>
                    <img src={item.image} alt={item.name} style={{ maxWidth: "120px", maxHeight: "80px" }} />
                  </div>
                }
              </div>
              <div>
                <button onClick={() => handleSelectItem(item)}>Editar</button>
                <button onClick={() => handleDeleteItem(item.id)}>Eliminar</button>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default InventoryManagement;