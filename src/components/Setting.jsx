import React, { useEffect, useState } from 'react'
import {
  getInvoicePrefix,
  updateInvoicePrefix,
  getGstNumber,
  updateGstNumber,
  getCustomerList,
  addCustomer as addCustomerToDb,
  replaceCustomerList,
} from '../db/setting'
import { exportDatabase, importDatabase, removeDatabaseData } from '../db/backup'
import importIcon from '../assets/import.png'
import exportIcon from '../assets/export.png'
import removeIcon from '../assets/remove.png'

function Setting({ onClose }) {
  const [invoicePrefix, setInvoicePrefix] = useState('')
  const [gstNumber, setGstNumber] = useState('')
  const [customerNames, setCustomerNames] = useState([])
  const [customerName, setCustomerName] = useState('')

  useEffect(() => {
    const loadSettings = async () => {
      const [prefix, gst, customers] = await Promise.all([
        getInvoicePrefix(),
        getGstNumber(),
        getCustomerList(),
      ])

      setInvoicePrefix(prefix)
      setGstNumber(gst)
      setCustomerNames(customers)
    }

    loadSettings().catch(console.error)
  }, [])

  const saveInvoicePrefix = async (event) => {
    const value = event.target.value
    setInvoicePrefix(value)
    await updateInvoicePrefix(value)
  }

  const saveGstNumber = async (event) => {
    const value = event.target.value
    setGstNumber(value)
    await updateGstNumber(value)
  }

  const addCustomer = async (event) => {
    event.preventDefault()

    const name = customerName.trim()
    if (!name) return

    try {
      const newCustomer = await addCustomerToDb({ name })
      setCustomerNames((current) => [...current, newCustomer])
      setCustomerName('')
    } catch (error) {
      alert(error.message)
    }
  }

  const removeCustomer = async (customer) => {
    const remainingCustomers = customerNames.filter(
      (item) => item.id !== customer.id,
    )

    await replaceCustomerList(remainingCustomers)
    setCustomerNames(remainingCustomers)
  }

  const inputClass =
    'mt-2 w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-cyan-300 focus:bg-white/15 focus:ring-2 focus:ring-cyan-300/30'

  const exportAllDatabase = async () => {
    try {
      const database = await exportDatabase()

      const file = new Blob(
        [JSON.stringify(database, null, 2)],
        { type: 'application/json' },
      )

      const url = URL.createObjectURL(file)
      const link = document.createElement('a')

      link.href = url
      link.download = 'MyBusinessApp-backup.json'
      document.body.appendChild(link)
      link.click()
      link.remove()

      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Database export failed:', error)
      alert('Unable to export database.')
    }
  }

  const importAllDatabase = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()

    reader.onload = async () => {
      try {
        const backup = JSON.parse(reader.result)

        if (!window.confirm('Replace all existing database data?')) return

        await importDatabase(backup)
        alert('Database imported successfully.')
        window.location.reload()
      } catch (error) {
        console.error('Database import failed:', error)
        alert(error.message || 'Unable to import database.')
      } finally {
        event.target.value = ''
      }
    }

    reader.readAsText(file)
  }

  const removeAllDatabaseData = async () => {
    if (
      !window.confirm(
        'Remove all Settings, Sales, and Purchases permanently?',
      )
    ) {
      return
    }

    try {
      await removeDatabaseData()
      alert('All database data was removed.')
      window.location.reload()
    } catch (error) {
      console.error('Database removal failed:', error)
      alert('Unable to remove database data.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
      <div className="w-full max-w-xl rounded-3xl border border-white/20 bg-black/40 p-6 text-white shadow-2xl backdrop-blur-2xl">
        <div className="mb-6 flex items-start justify-between border-b border-white/15 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
              Application Settings
            </p>
            <h2 className="mt-1 text-2xl font-semibold">Settings</h2>
          </div>

          <button type="button" onClick={onClose} className="text-xl">
            ×
          </button>
        </div>

        <label className="block text-sm font-medium">
          Invoice Prefix
          <input
            value={invoicePrefix}
            onChange={saveInvoicePrefix}
            className={inputClass}
            placeholder="INV-"
          />
        </label>

        <label className="mt-5 block text-sm font-medium">
          GST Number
          <input
            value={gstNumber}
            onChange={saveGstNumber}
            className={inputClass}
            placeholder="Enter GST number"
          />
        </label>

        <div className="mt-6">
          <h3 className="text-sm font-medium">Customer Names</h3>

          <form onSubmit={addCustomer} className="mt-2 flex gap-2">
            <input
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              className={inputClass.replace('mt-2 ', 'mt-0 ')}
              placeholder="Enter customer name"
            />

            <button type="submit" className="rounded-xl bg-cyan-500 px-4">
              Add
            </button>
          </form>

          <div className="mt-4 space-y-2">
            {customerNames.map((customer) => (
              <div
                key={customer.id}
                className="flex items-center justify-between rounded-xl border border-white/15 px-4 py-3"
              >
                <span>{customer.name}</span>

                <button
                  type="button"
                  onClick={() => removeCustomer(customer)}
                  className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end border-t border-white/15 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 px-5 py-2.5"
          >
            Done
          </button>
        </div>

        <div className="mt-3 flex justify-end gap-2">
          <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-blue-500 px-3 py-2 text-sm">
            <img
              src={importIcon}
              alt=""
              aria-hidden="true"
              className="h-4 w-4 object-contain"
            />
            Import Database
            <input
              type="file"
              accept=".json,application/json"
              onChange={importAllDatabase}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={removeAllDatabaseData}
            className="flex items-center gap-2 rounded-xl bg-red-500/80 px-3 py-2 text-sm"
          >
            <img
              src={removeIcon}
              alt=""
              aria-hidden="true"
              className="h-4 w-4 object-contain"
            />
            Remove Database
          </button>

          <button
            type="button"
            onClick={exportAllDatabase}
            className="flex items-center gap-2 rounded-xl bg-green-500/80 px-3 py-2 text-sm"
          >
            <img
              src={exportIcon}
              alt=""
              aria-hidden="true"
              className="h-4 w-4 object-contain"
            />
            Export Database
          </button>
        </div>
      </div>
    </div>
  )
}

export default Setting