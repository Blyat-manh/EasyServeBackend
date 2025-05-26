import '../../styles/orderSummary.scss';

const OrderSummary = ({ order, applyDiscount, onRemove, onConfirm }) => {
  if (order.length === 0) return null;

  const subtotal = order.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const { discountRate, discountAmount, total } = applyDiscount(subtotal);

  return (
    <div>
      <h2>Pedido Actual</h2>
      <ul>
        {order.map((item, index) => (
          <li key={index}>
            {item.name} - {item.quantity} x ${item.price} = ${(item.price * item.quantity).toFixed(2)}
            <button onClick={() => onRemove(item)}>Quitar</button>
          </li>
        ))}
      </ul>
      <p><strong>Subtotal:</strong> ${subtotal.toFixed(2)}</p>
      {discountRate > 0 && (
        <p><strong>Descuento ({discountRate}%):</strong> -${discountAmount.toFixed(2)}</p>
      )}
      <p><strong>Total con descuento:</strong> ${total.toFixed(2)}</p>
      <button onClick={onConfirm}>Confirmar Pedido</button>
    </div>
  );
};

export default OrderSummary;
