import React, { useEffect, useMemo, useState } from 'react'
import SalesRow from '../components/SalesRow'
import AddSale from '../components/AddSale'
import EditSale from '../components/EditSale'
import { getCustomerList } from '../db/setting'
import {
  getSales,
  addSale,
  updateSale,
  removeSale,
} from '../db/sales'

function formatDate(date) {
  const [year, month, day] = date.split('-')
  return `${day}-${month}-${year}`
}

function SalesScreen() {
  const [sales, setSales] = useState([])
  const [customerList, setCustomerList] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [hoveredSale, setHoveredSale] = useState(null)
  const [showAddSale, setShowAddSale] = useState(false)
  const [editingSale, setEditingSale] = useState(null)

  useEffect(() => {
    const loadSales = async () => {
      const savedSales = await getSales()

      setSales(savedSales.sort((a, b) => b.id - a.id))
    }

    const loadFilters = async () => {
      const customers = await getCustomerList()
      setCustomerList(customers)
    }

    loadSales().catch(console.error)
    loadFilters().catch(console.error)
  }, [])

  const prepareSale = (sale, id) => ({
    ...sale,
    ...(id ? { id } : {}),
    gstAmount: Number(sale.gstAmount ?? sale.gst ?? 0),
    gst: Number(sale.gstAmount ?? sale.gst ?? 0),
    totalAmount: Number(sale.totalAmount ?? 0),
    items: sale.items ?? [],
  })

  const handleSaveSale = async (newSale) => {
    const saleToSave = prepareSale(newSale)

    try {
      const id = await addSale(saleToSave)

      setSales((currentSales) => [
        { ...saleToSave, id },
        ...currentSales,
      ])

      setShowAddSale(false)
    } catch (error) {
      if (error.name === 'ConstraintError') {
        alert('Invoice number already exists.')
      } else {
        console.error('Failed to save sale:', error)
      }
    }
  }

  const handleEditSale = (sale) => {
    setEditingSale(sale)
  }

  const handleUpdateSale = async (updatedSale) => {
    try {
      const saleToSave = prepareSale(updatedSale, editingSale.id)

      await updateSale(saleToSave)

      setSales((currentSales) =>
        currentSales.map((sale) =>
          sale.id === saleToSave.id ? saleToSave : sale
        )
      )

      setEditingSale(null)
    } catch (error) {
      if (error.name === 'ConstraintError') {
        alert('Invoice number already exists.')
      } else {
        console.error('Failed to update sale:', error)
      }
    }
  }

  const handleRemoveSale = async (sale) => {
    if (!window.confirm(`Remove invoice ${sale.invoiceNo}?`)) return

    try {
      await removeSale(sale.id)

      setSales((currentSales) =>
        currentSales.filter((currentSale) => currentSale.id !== sale.id)
      )
    } catch (error) {
      console.error('Failed to remove sale:', error)
      alert('Failed to remove sale.')
    }
  }

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const matchesCustomer =
        !selectedCustomer || sale.cusName === selectedCustomer

      const matchesFromDate =
        !fromDate || sale.date >= fromDate

      const matchesToDate =
        !toDate || sale.date <= toDate

      return matchesCustomer && matchesFromDate && matchesToDate
    })
  }, [sales, selectedCustomer, fromDate, toDate])

  return (
    <div className="min-h-screen p-4 text-white">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sales</h1>

        <button
          type="button"
          onClick={() => setShowAddSale(true)}
          className="rounded-xl border border-white/20 bg-white/20 px-4 py-2 font-medium shadow-lg backdrop-blur-md transition hover:bg-white/30"
        >
          + Add New Sale
        </button>
      </div>

      {showAddSale && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 backdrop-blur-md sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowAddSale(false)
            }
          }}
        >
          <div className="max-h-[95vh] w-full max-w-6xl overflow-hidden">
            <div className="mx-auto max-w-6xl">
              <div className="mb-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddSale(false)}
                >
                  Close
                </button>
              </div>

              <AddSale onSave={handleSaveSale} />
            </div>
          </div>
        </div>
      )}

      {editingSale && (
        <EditSale
          sale={editingSale}
          onSave={handleUpdateSale}
          onCancel={() => setEditingSale(null)}
        />
      )}

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <label className="text-sm">
          Customer
          <select
            value={selectedCustomer}
            onChange={(event) => setSelectedCustomer(event.target.value)}
            className="mt-1 bg-transparent block rounded-lg border border-white/20 px-3 py-2 text-white"
          >
            <option className="bg-black" value="">
              All Customers
            </option>

            {customerList.map((customer) => {
              const name = typeof customer === 'string'
                ? customer
                : customer.name

              return (
                <option className="bg-black" key={customer.id ?? name} value={name}>
                  {name}
                </option>
              )
            })}
          </select>
        </label>

        <label className="text-sm">
          From
          <input
            type="date"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
            className="mt-1 block date-icon-white rounded-lg border border-white/20 px-3 py-2 text-white"
          />
        </label>

        <label className="text-sm">
          To
          <input
            type="date"
            value={toDate}
            min={fromDate || undefined}
            onChange={(event) => setToDate(event.target.value)}
            className="mt-1 block date-icon-white rounded-lg border border-white/20 px-3 py-2 text-white"
          />
        </label>

        <button
          type="button"
          onClick={() => {
            setSelectedCustomer('')
            setFromDate('')
            setToDate('')
          }}
          className="rounded-lg border border-white/20 px-3 py-2 hover:bg-white/10"
        >
          Clear
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-xl backdrop-blur-lg">
        <div className="overflow-x-auto">
          <table className="min-w-300 w-full table-fixed text-xs">
            <colgroup>
              <col className="w-23.75" />
              <col className="w-21.25" />
              <col className="w-31.25" />
              <col className="w-20" />
              <col className="w-18.5" />
              <col className="w-13.75" />
              <col className="w-18.75" />
              <col className="w-18.75" />
              <col className="w-18.75" />
              <col className="w-22.5" />
              <col className="w-18.75" />
              <col className="w-25" />
              <col className="w-25" />
            </colgroup>

            <thead className="border-b border-white/20 bg-white/10">
              <tr>
                <th className="px-2 py-3 text-left">Date</th>
                <th className="px-2 py-3 text-left">Invoice No.</th>
                <th className="px-2 py-3 text-left">Cus Name</th>
                <th className="px-2 py-3 text-left">Truck</th>
                <th className="px-2 py-3 text-left">Item</th>
                <th className="px-2 py-3 text-right">QTY.</th>
                <th className="px-2 py-3 text-right">Reject (%)</th>
                <th className="px-2 py-3 text-right">Net Qty.</th>
                <th className="px-2 py-3 text-right">Rate</th>
                <th className="px-2 py-3 text-right">Amount</th>
                <th className="px-2 py-3 text-right">GST</th>
                <th className="px-2 py-3 text-right">Total Amt</th>
                <th className="px-2 py-3 text-right">action</th>
              </tr>
            </thead>

            <tbody>
              {filteredSales.map((sale) => (
                <SalesRow
                  key={sale.id}
                  sale={sale}
                  isHighlighted={hoveredSale === sale.invoiceNo}
                  onMouseEnter={() => setHoveredSale(sale.invoiceNo)}
                  onMouseLeave={() => setHoveredSale(null)}
                  onEdit={handleEditSale}
                  onRemove={handleRemoveSale}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default SalesScreen