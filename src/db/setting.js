import { dbPromise } from './database'

const SETTINGS_KEYS = {
  invoicePrefix: 'invoicePrefix',
  customerList: 'customerList',
  gstNumber: 'gstNumber',
}

// Invoice Prefix
export const addInvoicePrefix = async (invoicePrefix) => {
  const db = await dbPromise
  await db.put('settings', invoicePrefix.trim(), SETTINGS_KEYS.invoicePrefix)
}

export const getInvoicePrefix = async () => {
  const db = await dbPromise
  return (await db.get('settings', SETTINGS_KEYS.invoicePrefix)) ?? ''
}

export const updateInvoicePrefix = addInvoicePrefix

// GST Number
export const addGstNumber = async (gstNumber) => {
  const db = await dbPromise
  await db.put('settings', gstNumber.trim(), SETTINGS_KEYS.gstNumber)
}

export const getGstNumber = async () => {
  const db = await dbPromise
  return (await db.get('settings', SETTINGS_KEYS.gstNumber)) ?? ''
}

export const updateGstNumber = addGstNumber

// Customer List
export const getCustomerList = async () => {
  const db = await dbPromise
  return (await db.get('settings', SETTINGS_KEYS.customerList)) ?? []
}

const normalizeCustomerName = (name) => name.trim().toLowerCase()

export const addCustomer = async (customer) => {
  const db = await dbPromise
  const customers = await getCustomerList()

  const name = customer.name?.trim()

  if (!name) {
    throw new Error('Customer name is required.')
  }

  const alreadyExists = customers.some(
    (existingCustomer) =>
      normalizeCustomerName(existingCustomer.name) ===
      normalizeCustomerName(name),
  )

  if (alreadyExists) {
    throw new Error('Customer name already exists.')
  }

  const newCustomer = {
    ...customer,
    name,
    id: customer.id ?? crypto.randomUUID(),
  }

  await db.put(
    'settings',
    [...customers, newCustomer],
    SETTINGS_KEYS.customerList,
  )

  return newCustomer
}

export const updateCustomer = async (updatedCustomer) => {
  const db = await dbPromise
  const customers = await getCustomerList()

  const name = updatedCustomer.name?.trim()

  if (!name) {
    throw new Error('Customer name is required.')
  }

  const alreadyExists = customers.some(
    (customer) =>
      customer.id !== updatedCustomer.id &&
      normalizeCustomerName(customer.name) === normalizeCustomerName(name),
  )

  if (alreadyExists) {
    throw new Error('Customer name already exists.')
  }

  const updatedCustomers = customers.map((customer) =>
    customer.id === updatedCustomer.id
      ? { ...customer, ...updatedCustomer, name }
      : customer,
  )

  await db.put(
    'settings',
    updatedCustomers,
    SETTINGS_KEYS.customerList,
  )

  return { ...updatedCustomer, name }
}

export const replaceCustomerList = async (customers) => {
  const db = await dbPromise

  await db.put(
    'settings',
    customers,
    SETTINGS_KEYS.customerList,
  )

  return customers
}

export const isCustomerExists = async (customerName) => {
  const db = await dbPromise
  const customers = await getCustomerList()

  const name = customerName?.trim()

  if (!name) {
    throw new Error('Customer name is required.')
  }
  const alreadyExists = customers.some(
    (customer) =>
      normalizeCustomerName(customer.name) === normalizeCustomerName(name),
  )
  return alreadyExists;
}