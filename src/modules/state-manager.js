/**
 * 中央集権状態管理システム
 * 状態の変更を監視し、サブスクライバーに通知する
 */
export class StateManager {
  constructor(initialState) {
    this.listeners = new Set();
    this.pathListeners = new Map();
    this.persistCallback = null;
    this.state = this.createReactiveState(initialState);
  }

  /**
   * リアクティブな状態オブジェクトを作成
   */
  createReactiveState(initialState) {
    return new Proxy(initialState, {
      set: (target, property, value) => {
        const prevState = { ...target };
        const oldValue = target[property];
        
        // 値が変更された場合のみ処理
        if (oldValue !== value) {
          target[property] = value;
          
          // パス固有のリスナーに通知
          this.notifyPathListeners(property, value);
          
          // 全体リスナーに通知
          this.notifyListeners(target, prevState);
          
          // 永続化
          if (this.persistCallback) {
            this.persistCallback();
          }
        }
        
        return true;
      }
    });
  }

  /**
   * 状態全体の変更を監視
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * 特定のパスの変更を監視
   */
  subscribePath(path, listener) {
    if (!this.pathListeners.has(path)) {
      this.pathListeners.set(path, new Set());
    }
    this.pathListeners.get(path).add(listener);
    
    return () => {
      const listeners = this.pathListeners.get(path);
      if (listeners) {
        listeners.delete(listener);
        if (listeners.size === 0) {
          this.pathListeners.delete(path);
        }
      }
    };
  }

  /**
   * 永続化コールバックを設定
   */
  setPersistCallback(callback) {
    this.persistCallback = callback;
  }

  /**
   * 状態を取得
   */
  getState() {
    return this.state;
  }

  /**
   * 状態を更新（部分更新対応）
   */
  setState(updates) {
    Object.assign(this.state, updates);
  }

  /**
   * 状態をリセット
   */
  resetState(newState) {
    Object.assign(this.state, newState);
  }

  /**
   * 全体リスナーに通知
   */
  notifyListeners(newState, prevState) {
    this.listeners.forEach(listener => {
      try {
        listener(newState, prevState);
      } catch (error) {
        console.error('State listener error:', error);
      }
    });
  }

  /**
   * パス固有リスナーに通知
   */
  notifyPathListeners(path, value) {
    const listeners = this.pathListeners.get(path);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(value, path);
        } catch (error) {
          console.error(`Path listener error for ${path}:`, error);
        }
      });
    }
  }

  /**
   * キャッシュクリア
   */
  clearCache() {
    this.listeners.clear();
    this.pathListeners.clear();
  }
}

/**
 * カスタムイベントシステム
 */
export class EventBus {
  constructor() {
    this.events = new Map();
  }

  /**
   * イベントを発行
   */
  emit(event, ...args) {
    const listeners = this.events.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(...args);
        } catch (error) {
          console.error(`Event listener error for ${event}:`, error);
        }
      });
    }
  }

  /**
   * イベントを監視
   */
  on(event, listener) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event).add(listener);
    
    return () => {
      const listeners = this.events.get(event);
      if (listeners) {
        listeners.delete(listener);
        if (listeners.size === 0) {
          this.events.delete(event);
        }
      }
    };
  }

  /**
   * すべてのリスナーを削除
   */
  clear() {
    this.events.clear();
  }
}

// グローバルインスタンス
export const globalEventBus = new EventBus();
