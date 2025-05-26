import '../../styles/tablesOrders.scss'

const TablesOrders = ({ tables, onDelete, onEdit, onCharge }) => (
  <div>
    <h2>Pedidos por Mesa</h2>
    {Object.keys(tables).map((table) => (
      <div key={table}>
        <h3>Mesa {table}</h3>
        <ul>
          {tables[table].map((order, orderIdx) => (
            <li key={order.order_id || `order-${table}-${orderIdx}`}>
              {order.items.map((item, idx) => (
                <div
                  key={item.id || item.inventory_id || `${item.name}-${idx}`}
                >
                  {item.name} - {item.quantity}
                </div>
              ))}

              <p>Total: ${order.total}</p>
              <button onClick={() => onDelete(order.order_id, table)}>Eliminar</button>
              <button onClick={() => onEdit(order, table)}>Editar</button>
            </li>
          ))}
        </ul>
        <button onClick={() => onCharge(table)}>Cobrar</button>
      </div>
    ))}

  </div>
);

export default TablesOrders;
