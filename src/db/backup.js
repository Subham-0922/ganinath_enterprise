import { dbPromise } from './database'

export const exportDatabase = async () => {
  const db = await dbPromise
  const settingsKeys = await db.getAllKeys('settings')
  const settingsValues = await db.getAll('settings')

  const settings = {}
  settingsKeys.forEach((key, index) => {
    settings[key] = settingsValues[index]
  })

  return {
    Settings: settings,
    Sales: await db.getAll('sales'),
    Purchase: await db.getAll('purchases'),
  }
}

export const importDatabase = async (backup) => {
  if (
    !backup ||
    typeof backup !== 'object' ||
    !backup.Settings ||
    !Array.isArray(backup.Sales) ||
    !Array.isArray(backup.Purchase)
  ) {
    throw new Error('Invalid database backup file.')
  }

  const db = await dbPromise
  const transaction = db.transaction(
    ['settings', 'sales', 'purchases'],
    'readwrite',
  )

  const settingsStore = transaction.objectStore('settings')
  const salesStore = transaction.objectStore('sales')
  const purchasesStore = transaction.objectStore('purchases')

  await settingsStore.clear()
  await salesStore.clear()
  await purchasesStore.clear()

  for (const [key, value] of Object.entries(backup.Settings)) {
    await settingsStore.put(value, key)
  }

  for (const sale of backup.Sales) {
    await salesStore.put(sale)
  }

  for (const purchase of backup.Purchase) {
    await purchasesStore.put(purchase)
  }

  await transaction.done
}

export const removeDatabaseData = async () => {
  const db = await dbPromise
  const transaction = db.transaction(
    ['settings', 'sales', 'purchases'],
    'readwrite',
  )

  await Promise.all([
    transaction.objectStore('settings').clear(),
    transaction.objectStore('sales').clear(),
    transaction.objectStore('purchases').clear(),
  ])

  await transaction.done
}