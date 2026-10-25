// Offline sync utility for low-end phones
// Queues data when offline and syncs when connection returns

export interface SyncData {
  id: string;
  type: 'visitor' | 'parcel' | 'emergency' | 'incident';
  data: any;
  timestamp: number;
  synced: boolean;
}

export interface SyncStatus {
  online: boolean;
  pendingCount: number;
  lastSyncTime: number | null;
}

const STORAGE_KEY = 'watchman_sync_queue';
const SYNC_STATUS_KEY = 'watchman_sync_status';

export class OfflineSync {
  private static listeners: ((status: SyncStatus) => void)[] = [];

  // Add data to sync queue
  static queueData(type: SyncData['type'], data: any) {
    try {
      const queue = this.getQueue();
      const newItem: SyncData = {
        id: `${type}_${Date.now()}_${Math.random()}`,
        type,
        data,
        timestamp: Date.now(),
        synced: false,
      };
      queue.push(newItem);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
      this.notifyListeners();
      return newItem.id;
    } catch (error) {
      console.error('[v0] Failed to queue data:', error);
      return null;
    }
  }

  // Get all queued data
  static getQueue(): SyncData[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // Get pending (unsynced) data
  static getPendingData(): SyncData[] {
    return this.getQueue().filter(item => !item.synced);
  }

  // Mark items as synced
  static markSynced(ids: string[]) {
    try {
      const queue = this.getQueue();
      const updated = queue.map(item =>
        ids.includes(item.id) ? { ...item, synced: true } : item
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      
      // Update last sync time
      const status = this.getStatus();
      status.lastSyncTime = Date.now();
      localStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(status));
      
      this.notifyListeners();
    } catch (error) {
      console.error('[v0] Failed to mark synced:', error);
    }
  }

  // Clear old synced data (keep last 100)
  static clearOldSyncedData() {
    try {
      const queue = this.getQueue();
      const pending = queue.filter(item => !item.synced);
      const synced = queue.filter(item => item.synced).slice(-50);
      const updated = [...pending, ...synced];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('[v0] Failed to clear old data:', error);
    }
  }

  // Get sync status
  static getStatus(): SyncStatus {
    try {
      const status = localStorage.getItem(SYNC_STATUS_KEY);
      const parsed = status ? JSON.parse(status) : { online: navigator.onLine, pendingCount: 0, lastSyncTime: null };
      return {
        ...parsed,
        online: navigator.onLine,
        pendingCount: this.getPendingData().length,
      };
    } catch {
      return {
        online: navigator.onLine,
        pendingCount: 0,
        lastSyncTime: null,
      };
    }
  }

  // Subscribe to sync status changes
  static subscribe(callback: (status: SyncStatus) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private static notifyListeners() {
    const status = this.getStatus();
    this.listeners.forEach(listener => listener(status));
  }

  // Setup offline/online listeners
  static setupListeners() {
    window.addEventListener('online', () => {
      console.log('[v0] Online detected');
      this.notifyListeners();
    });
    window.addEventListener('offline', () => {
      console.log('[v0] Offline detected');
      this.notifyListeners();
    });
  }
}
