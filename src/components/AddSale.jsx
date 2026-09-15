import React, { useEffect, useState } from 'react'
import {
  getInvoicePrefix,
  getCustomerList,
  addCustomer,
  isCustomerExists,
} from '../db/setting'

const today = new Date().toISOString().split('T')[0]

const createEmptyItem = () => ({
  item: '',
  qty: '',
  reject: '0',
  netQty: '',
  rate: '',
  amount: '',
})

function AddSale({
  initialSale = null,
  isEditing = false,
  onSave,
  onCancel,
}) {
  const [customerList, setCustomerList] = useState([])
  const [formData, setFormData] = useState(
    initialSale || {
      invoiceNo: '',
      date: today,
      truck: '',
      cusName: '',
      gstAmount: '',
      items: [createEmptyItem()],
    },
  )

  useEffect(() => {
    const loadSettings = async () => {
      const [prefix, customers] = await Promise.all([
        getInvoicePrefix(),
        getCustomerList(),
      ])

      setCustomerList(customers)

      if (!initialSale) {
        setFormData((current) => ({
          ...current,
          invoiceNo: current.invoiceNo || prefix,
        }))
      }
    }

    loadSettings().catch(console.error)
  }, [initialSale])

  const inputClass =
    'mt-1 w-full rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-cyan-300 focus:bg-white/15 focus:ring-2 focus:ring-cyan-300/30'

  const updateSale = (field, value) => {
    setFormData((previous) => ({ ...previous, [field]: value }))
  }

  const updateItem = (index, field, value) => {
    setFormData((current) => {
      const items = [...current.items]
      const item = { ...items[index], [field]: value }

      const qty = Number(item.qty) || 0
      const reject = Number(item.reject) || 0
      const rate = Number(item.rate) || 0

      const netQty = qty - (qty * reject) / 100
      const amount = netQty * rate

      items[index] = {
        ...item,
        netQty: netQty.toFixed(2),
        amount: amount.toFixed(2),
      }

      return {
        ...current,
        items,
      }
    })
  }

  const addNewItem = () => {
    setFormData((previous) => ({
      ...previous,
      items: [...previous.items, createEmptyItem()],
    }))
  }

  const removeItem = (index) => {
    setFormData((previous) => ({
      ...previous,
      items:
        previous.items.length > 1
          ? previous.items.filter((_, itemIndex) => itemIndex !== index)
          : previous.items,
    }))
  }

  const subtotal = formData.items.reduce(
    (total, item) => total + (Number(item.amount) || 0),
    0,
  )

  const gst = Number(formData.gstAmount) || 0
  const totalAmount = subtotal + gst

  const handleSubmit = async (event) => {
    event.preventDefault()

    const name = formData.cusName.trim()

    if (!name) return

    try {
      const exists = await isCustomerExists(name)

      if (!exists) {
        const newCustomer = await addCustomer({ name })

        setCustomerList((current) => [
          ...current,
          newCustomer,
        ])
      }

      onSave({
        ...formData,
        cusName: name,
        gstAmount: Number(formData.gstAmount) || 0,
        gst: Number(formData.gstAmount) || 0,
        totalAmount,
      })
    } catch (error) {
      alert(error.message || 'Unable to save customer.')
    }
  }

  const customerQuery = formData.cusName?.trim().toLowerCase() || ''

  const customerSuggestions = customerQuery
    ? customerList.filter((customer) =>
        customer.name?.toLowerCase().includes(customerQuery),
      )
    : []

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4 flex items-start justify-between border-b border-white/15 pb-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-300">
            Sales Management
          </p>
          <h2 className="text-2xl font-semibold">Add New Sale</h2>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-white/20 px-2.5 py-0.5 text-lg text-white/70 hover:bg-white/15"
          >
            ×
          </button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-xs font-medium">
          Invoice No.
          <input
            required
            className={inputClass}
            value={formData.invoiceNo}
            onChange={(event) => updateSale('invoiceNo', event.target.value)}
            placeholder="Enter invoice number"
          />
        </label>

        <label className="relative text-xs font-medium">
          Customer Name
          <input
            required
            className={inputClass}
            value={formData.cusName || ''}
            onChange={(event) => updateSale('cusName', event.target.value)}
            placeholder="Search or enter customer name"
          />

          {customerSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-40 overflow-y-auto rounded-lg border border-white/20 bg-slate-900 shadow-xl">
              {customerSuggestions.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-cyan-500/30"
                  onClick={() => updateSale('cusName', customer.name)}
                >
                  {customer.name}
                </button>
              ))}
            </div>
          )}
        </label>

        <label className="text-xs font-medium">
          Date
          <input
            required
            type="date"
            className={inputClass}
            value={formData.date}
            onChange={(event) => updateSale('date', event.target.value)}
          />
        </label>

        <label className="text-xs font-medium">
          Truck No.
          <input
            required
            className={inputClass}
            value={formData.truck}
            onChange={(event) => updateSale('truck', event.target.value)}
            placeholder="Enter truck number"
          />
        </label>
      </div>

      <div className="mt-4 rounded-2xl border border-white/15 bg-white/[0.06] p-3">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">Items</h3>

          <button
            type="button"
            onClick={addNewItem}
            className="rounded-lg border border-cyan-300/40 bg-cyan-400/15 px-3 py-1.5 text-xs text-cyan-100 hover:bg-cyan-400/30"
          >
            + Add Item
          </button>
        </div>

        <div className="space-y-3">
          {formData.items.map((item, index) => (
            <div
              key={index}
              className="grid gap-3 rounded-xl border border-white/15 bg-black/20 p-3 sm:grid-cols-2 lg:grid-cols-7"
            >
              <label className="text-xs font-medium lg:col-span-2">
                Item Name
                <input
                  required
                  className={inputClass}
                  value={item.item}
                  onChange={(event) =>
                    updateItem(index, 'item', event.target.value)
                  }
                  placeholder="Enter item name"
                />
              </label>

              <label className="text-xs font-medium">
                Qty.
                <input
                  required
                  min="0"
                  type="number"
                  className={inputClass}
                  value={item.qty}
                  onChange={(event) =>
                    updateItem(index, 'qty', event.target.value)
                  }
                  placeholder="0"
                />
              </label>

              <label className="text-xs font-medium">
                Reject (%)
                <input
                  min="0"
                  max="100"
                  type="number"
                  className={inputClass}
                  value={item.reject}
                  onChange={(event) =>
                    updateItem(index, 'reject', event.target.value)
                  }
                  placeholder="0"
                />
              </label>

              <label className="text-xs font-medium">
                Net Qty.
                <input
                  min="0"
                  type="number"
                  className={inputClass}
                  value={item.netQty}
                  onChange={(event) =>
                    updateItem(index, 'netQty', event.target.value)
                  }
                  placeholder="0"
                />
              </label>

              <label className="text-xs font-medium">
                Rate
                <input
                  min="0"
                  type="number"
                  className={inputClass}
                  value={item.rate}
                  onChange={(event) =>
                    updateItem(index, 'rate', event.target.value)
                  }
                  placeholder="0.00"
                />
              </label>

              <label className="text-xs font-medium">
                Amount
                <input
                  min="0"
                  type="number"
                  className={inputClass}
                  value={item.amount}
                  onChange={(event) =>
                    updateItem(index, 'amount', event.target.value)
                  }
                  placeholder="0.00"
                />
              </label>

              <button
                type="button"
                disabled={formData.items.length === 1}
                onClick={() => removeItem(index)}
                className="self-end rounded-lg border border-red-300/30 bg-red-400/15 px-3 py-2 text-xs text-red-100 hover:bg-red-400/30 disabled:opacity-30"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_280px]">
        <label className="max-w-xs text-xs font-medium">
          GST Amount
          <input
            min="0"
            type="number"
            className={inputClass}
            value={formData.gstAmount}
            onChange={(event) =>
              updateSale('gstAmount', event.target.value)
            }
            placeholder="Enter GST amount"
          />
        </label>

        <div className="rounded-xl border border-white/15 bg-black/25 p-3 text-sm">
          <div className="flex justify-between text-white/65">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="mt-2 flex justify-between text-white/65">
            <span>GST</span>
            <span>₹{gst.toFixed(2)}</span>
          </div>
          <div className="mt-3 flex justify-between border-t border-white/15 pt-3 font-bold">
            <span>Total Amount</span>
            <span className="text-cyan-200">₹{totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2 border-t border-white/15 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          className="rounded-lg border border-cyan-300/40 bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-sm font-semibold shadow-lg hover:from-cyan-400 hover:to-blue-500"
        >
          Save Sale
        </button>
      </div>
    </form>
  )
}

export default AddSale