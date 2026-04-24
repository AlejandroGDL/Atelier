"use client";

const DB_NAME = "atelier-db";
const DB_VERSION = 1;
const STORE_IDEAS = "ideas";
const STORE_TASKS = "tasks";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_IDEAS)) {
        db.createObjectStore(STORE_IDEAS, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_TASKS)) {
        db.createObjectStore(STORE_TASKS, { keyPath: "id" });
      }
    };
  });
}

// Dates come back as strings from IndexedDB, so we revive them
const dateReviver = (_key: string, value: unknown): unknown => {
  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/.test(value)
  ) {
    return new Date(value);
  }
  return value;
};

function reviveDates<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj), dateReviver);
}

export async function loadIdeas(): Promise<any[] | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_IDEAS, "readonly");
    const store = tx.objectStore(STORE_IDEAS);
    const request = store.getAll();
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const raw = request.result;
        if (!raw || raw.length === 0) {
          resolve(null);
        } else {
          resolve(reviveDates(raw));
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}

export async function saveIdeas(ideas: any[]): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_IDEAS, "readwrite");
    const store = tx.objectStore(STORE_IDEAS);
    // Clear and re-save all
    await new Promise<void>((resolve, reject) => {
      const clearReq = store.clear();
      clearReq.onsuccess = () => resolve();
      clearReq.onerror = () => reject(clearReq.error);
    });
    for (const idea of ideas) {
      store.put(idea);
    }
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Silently fail — app should still work without persistence
  }
}

export async function loadTasks(): Promise<any[] | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_TASKS, "readonly");
    const store = tx.objectStore(STORE_TASKS);
    const request = store.getAll();
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const raw = request.result;
        if (!raw || raw.length === 0) {
          resolve(null);
        } else {
          resolve(reviveDates(raw));
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}

export async function saveTasks(tasks: any[]): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_TASKS, "readwrite");
    const store = tx.objectStore(STORE_TASKS);
    await new Promise<void>((resolve, reject) => {
      const clearReq = store.clear();
      clearReq.onsuccess = () => resolve();
      clearReq.onerror = () => reject(clearReq.error);
    });
    for (const task of tasks) {
      store.put(task);
    }
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Silently fail
  }
}

export async function resetData(): Promise<void> {
  try {
    const db = await openDB();
    let tx = db.transaction(STORE_IDEAS, "readwrite");
    tx.objectStore(STORE_IDEAS).clear();
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    tx = db.transaction(STORE_TASKS, "readwrite");
    tx.objectStore(STORE_TASKS).clear();
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Silently fail
  }
}
