import { openDB } from "idb";

export const dbPromise = openDB("MyBusinessApp", 1, {
  upgrade(db) {
    db.createObjectStore("settings");

    const salesStore = db.createObjectStore("sales", {
      keyPath: "id",
      autoIncrement: true,
    });

    salesStore.createIndex("invoiceNo", "invoiceNo", {
      unique: true,
    });

    const purchasesStore = db.createObjectStore("purchases", {
      keyPath: "id",
      autoIncrement: true,
    });

    purchasesStore.createIndex("invoiceNo", "invoiceNo", {
      unique: true,
    });
  },
});