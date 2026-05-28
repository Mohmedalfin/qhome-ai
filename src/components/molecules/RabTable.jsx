import StatusBadge from '../atoms/StatusBadge'

export default function RabTable({ items }) {
  return (
    <div className="rab-table-wrap">
      <table className="rab-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Produk QHome</th>
            <th>Harga</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td data-label="Item">{item.item}</td>
              <td data-label="Qty">{item.qty}</td>
              <td data-label="Produk QHome">
                <span className="rab-table__product">{item.product}</span>
                {item.similarity && (
                  <small>{item.similarity.toFixed(2)}% match</small>
                )}
              </td>
              <td data-label="Harga">{item.price}</td>
              <td data-label="Status">
                <StatusBadge status={item.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
