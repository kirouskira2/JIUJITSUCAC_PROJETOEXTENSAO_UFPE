import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface PendingCheckin {
  id: string;
  profileId?: string;
  workoutId: string;
  hygieneConfirmed: true;
  qrCodeToken?: string;
  timestamp: string;
  synced: boolean;
  error?: string;
}

interface CheckinDB extends DBSchema {
  'pending-checkins': {
    key: string;
    value: PendingCheckin;
  };
}

const DB_NAME = 'jjcac-offline-db';
const STORE_NAME = 'pending-checkins';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<CheckinDB>> | null = null;

function getDB() {
  if (typeof window === 'undefined') return null;
  
  if (!dbPromise) {
    dbPromise = openDB<CheckinDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export const OfflineCheckinStore = {
  /**
   * Salva um check-in pendente no IndexedDB
   */
  async savePending(checkin: Omit<PendingCheckin, 'id' | 'timestamp' | 'synced'>): Promise<PendingCheckin | null> {
    const db = getDB();
    if (!db) return null;

    const fullCheckin: PendingCheckin = {
      ...checkin,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      synced: false,
    };

    const activeDb = await db;
    await activeDb.put(STORE_NAME, fullCheckin);
    return fullCheckin;
  },

  /**
   * Obtém todos os check-ins pendentes que ainda não foram sincronizados
   */
  async getPending(): Promise<PendingCheckin[]> {
    const db = getDB();
    if (!db) return [];

    const activeDb = await db;
    const all = await activeDb.getAll(STORE_NAME);
    return all.filter((item) => !item.synced);
  },

  /**
   * Remove um check-in pendente do banco de dados local
   */
  async removePending(id: string): Promise<void> {
    const db = getDB();
    if (!db) return;

    const activeDb = await db;
    await activeDb.delete(STORE_NAME, id);
  },

  /**
   * Conta quantos check-ins pendentes estão armazenados localmente
   */
  async countPending(): Promise<number> {
    const db = getDB();
    if (!db) return 0;

    const activeDb = await db;
    const all = await activeDb.getAll(STORE_NAME);
    return all.filter((item) => !item.synced).length;
  },

  /**
   * Atualiza ou marca um check-in com erro para depuração
   */
  async markFailed(id: string, errorMessage: string): Promise<void> {
    const db = getDB();
    if (!db) return;

    const activeDb = await db;
    const item = await activeDb.get(STORE_NAME, id);
    if (item) {
      item.error = errorMessage;
      await activeDb.put(STORE_NAME, item);
    }
  }
};
