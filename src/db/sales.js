import { dbPromise } from "./database";

export const getSales = async () => {
  const db = await dbPromise;
  return db.getAll("sales");
};

export const addSale = async (sale) => {
  const db = await dbPromise;
  return db.add("sales", sale);
};

export const updateSale = async (sale) => {
  const db = await dbPromise;
  return db.put("sales", sale);
};

export const removeSale = async (id) => {
  const db = await dbPromise;
  return db.delete("sales", id);
};