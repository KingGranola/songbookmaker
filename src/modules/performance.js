/**
 * パフォーマンス最適化ユーティリティ
 */
export class PerformanceOptimizer {
  constructor(ctx) {
    this.ctx = ctx;
    this.rafId = null;
    this.pendingUpdates = new Set();
    this.memoCache = new Map();
    this.debouncedFunctions = new Map();
  }

  /**
   * デバウンス関数
   */
  debounce(func, delay, key) {
    const debounceKey = key || func.toString();
    
    if (this.debouncedFunctions.has(debounceKey)) {
      return this.debouncedFunctions.get(debounceKey);
    }

    let timeoutId;
    const debouncedFn = (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };

    this.debouncedFunctions.set(debounceKey, debouncedFn);
    return debouncedFn;
  }

  /**
   * スロットル関数
   */
  throttle(func, delay) {
    let lastCall = 0;
    let timeoutId;

    return (...args) => {
      const now = Date.now();
      
      if (now - lastCall >= delay) {
        lastCall = now;
        func(...args);
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          lastCall = Date.now();
          func(...args);
        }, delay - (now - lastCall));
      }
    };
  }

  /**
   * RequestAnimationFrame を使用したバッチ更新
   */
  batchUpdate(updateFn) {
    this.pendingUpdates.add(updateFn);

    if (this.rafId === null) {
      this.rafId = requestAnimationFrame(() => {
        this.rafId = null;
        const updates = Array.from(this.pendingUpdates);
        this.pendingUpdates.clear();
        
        updates.forEach(update => {
          try {
            update();
          } catch (error) {
            console.error('Batch update error:', error);
          }
        });
      });
    }
  }

  /**
   * メモ化機能
   */
  memoize(fn, keyFn) {
    return (...args) => {
      const key = keyFn ? keyFn(...args) : JSON.stringify(args);
      
      if (this.memoCache.has(key)) {
        return this.memoCache.get(key);
      }
      
      const result = fn(...args);
      this.memoCache.set(key, result);
      
      // キャッシュサイズ制限
      if (this.memoCache.size > 100) {
        const firstKey = this.memoCache.keys().next().value;
        this.memoCache.delete(firstKey);
      }
      
      return result;
    };
  }

  /**
   * DOM操作の最適化
   */
  optimizedDOMUpdate(elements, updateFn) {
    const fragment = document.createDocumentFragment();
    const elementsWithParents = [];

    // 要素を一時的にフラグメントに移動
    elements.forEach(element => {
      if (element.parentNode) {
        elementsWithParents.push({
          element,
          parent: element.parentNode,
          nextSibling: element.nextSibling
        });
        fragment.appendChild(element);
      }
    });

    // フラグメント内で更新を実行
    elements.forEach(updateFn);

    // 要素を元の位置に戻す
    elementsWithParents.forEach(({ element, parent, nextSibling }) => {
      parent.insertBefore(element, nextSibling);
    });
  }

  /**
   * イメージの遅延読み込み
   */
  setupLazyLoading() {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              observer.unobserve(img);
            }
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        observer.observe(img);
      });
    }
  }

  /**
   * メモリ使用量の監視
   */
  monitorMemoryUsage() {
    if ('memory' in performance) {
      const memory = performance.memory;
      console.log('Memory usage:', {
        used: `${Math.round(memory.usedJSHeapSize / 1048576)}MB`,
        total: `${Math.round(memory.totalJSHeapSize / 1048576)}MB`,
        limit: `${Math.round(memory.jsHeapSizeLimit / 1048576)}MB`
      });
    }
  }

  /**
   * キャッシュクリア
   */
  clearCache() {
    this.memoCache.clear();
    this.debouncedFunctions.clear();
    
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    
    this.pendingUpdates.clear();
  }

  /**
   * パフォーマンス統計の取得
   */
  getPerformanceStats() {
    const stats = {
      cacheSize: this.memoCache.size,
      debouncedFunctionsCount: this.debouncedFunctions.size,
      pendingUpdatesCount: this.pendingUpdates.size,
    };

    if ('memory' in performance) {
      const memory = performance.memory;
      stats.memoryUsage = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      };
    }

    return stats;
  }
}
