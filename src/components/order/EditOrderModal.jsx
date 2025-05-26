import '../../styles/editOrderModal.scss'

const EditOrderModal = ({ order, table, onChange, onSave, onCancel }) => {
  return (
    <div style={{ border: "1px solid gray", padding: "10px", marginTop: "20px" }}>
      <h3>Editando Pedido (Mesa {table})</h3>
      <ul>
        {order.items.map((item, idx) => (
          <li key={idx}>
            {item.name}
            <button onClick={() => onChange(idx, "increase")}>+</button>
            <button onClick={() => onChange(idx, "decrease")}>-</button>
          </li>
        ))}
      </ul>
      <button onClick={onSave}>Guardar Cambios</button>
      <button onClick={onCancel}>Cancelar</button>
    </div>
  );
};

export default EditOrderModal;
