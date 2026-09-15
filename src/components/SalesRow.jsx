import React from 'react'
import editIcon from '../assets/edit.png'
import removeIcon from '../assets/remove.png'
import { formatDate } from '../utils/dateUtils'

function SalesRow({
  sale,
  isHighlighted,
  onMouseEnter,
  onMouseLeave,
  onEdit,
  onRemove,
}) {
  return sale.items.map((item, itemIndex) => (
    <tr
      key={`${sale.invoiceNo}-${item.item}-${itemIndex}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`border-b border-white/10 transition-colors ${
        isHighlighted ? 'bg-white/10' : ''
      }`}
    >
      {itemIndex === 0 && (
        <>
          <td
            rowSpan={sale.items.length}
            className="whitespace-nowrap px-2 py-3 align-top"
          >
            {sale.date && formatDate(sale.date)}
          </td>
          <td
            rowSpan={sale.items.length}
            className="whitespace-nowrap px-2 py-3 align-top"
          >
            {sale.invoiceNo}
          </td>
          <td
            rowSpan={sale.items.length}
            className="whitespace-nowrap px-2 py-3 align-top"
          >
            {sale.cusName}
          </td>
          <td
            rowSpan={sale.items.length}
            className="whitespace-nowrap px-2 py-3 align-top"
          >
            {sale.truck}
          </td>
        </>
      )}

      <td className="truncate px-2 py-3 text-left">{item.item}</td>
      <td className="px-2 py-3 text-right">{item.qty}</td>
      <td className="px-2 py-3 text-center">{item.reject}</td>
      <td className="px-2 py-3 text-right">{item.netQty}</td>
      <td className="px-2 py-3 text-right">{item.rate}</td>
      <td className="px-2 py-3 text-right">{item.amount}</td>

      {itemIndex === 0 && (
        <>
          <td
            rowSpan={sale.items.length}
            className="whitespace-nowrap px-2 py-3 text-right align-top"
          >
            {sale.gstAmount ?? sale.gst ?? 0}
          </td>

          <td
            rowSpan={sale.items.length}
            className="whitespace-nowrap px-2 py-3 text-right font-semibold align-top"
          >
            {sale.totalAmount ?? 0}
          </td>

          <td
            rowSpan={sale.items.length}
            className="w-px whitespace-nowrap px-1 py-3 align-top"
          >
            <div className="flex items-center justify-end gap-1">
              <button
                type="button"
                title="Edit sale"
                onClick={() => onEdit(sale)}
                className="rounded p-1 hover:bg-white/20"
              >
                <img src={editIcon} alt="Edit" className="h-4 w-4" />
              </button>

              <button
                type="button"
                title="Remove sale"
                onClick={() => onRemove(sale)}
                className="rounded p-1 hover:bg-red-500/30"
              >
                <img src={removeIcon} alt="Remove" className="h-4 w-4" />
              </button>
            </div>
          </td>
        </>
      )}
    </tr>
  ))
}

export default SalesRow

