import '../../styles/orderForm.scss';


const OrderForm = ({ inventory, onAddToOrder, selectedTable, setSelectedTable, availableTables }) => {
  return (
    <div className='oreder-form'>
      <h2>Mesa:</h2>
      <select
        id="table-select"
        value={selectedTable}
        onChange={(e) => setSelectedTable(e.target.value)}
      >
        <option value="">Selecciona una mesa</option>
        {availableTables.map((table) => (
          <option key={table.id} value={table.id}>
            Mesa {table.table_number}
          </option>
        ))}
      </select>

        <h2>Menu: </h2>
      <h3>Bebidas</h3>
      <ul>
        {inventory.filter(i => i.type === "bebida").sort((a, b) => a.price - b.price).map(item => (
          <li key={item.id}>
            {item.name} - ${item.price}
            <button onClick={() => onAddToOrder(item)}>Agregar</button>
          </li>
        ))}
      </ul>

      <h3>Tapas</h3>
      <ul>
        {inventory.filter(i => i.type === "tapa").sort((a, b) => a.price - b.price).map(item => (
          <li key={item.id}>
            {item.name} - ${item.price}
            <button onClick={() => onAddToOrder(item)}>Agregar</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrderForm;
