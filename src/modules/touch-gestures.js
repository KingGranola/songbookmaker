/**
 * タッチジェスチャー管理クラス
 */
export class TouchGestureManager {
  constructor(ctx) {
    this.ctx = ctx;
    this.startX = 0;
    this.startY = 0;
    this.startTime = 0;
    this.isActive = false;
    this.threshold = 50; // スワイプ検出の最小距離
    this.timeThreshold = 300; // 最大時間（ミリ秒）
    this.setupGestureListeners();
  }

  /**
   * ジェスチャーリスナーをセットアップ
   */
  setupGestureListeners() {
    const pageContent = this.ctx.el.pageContent;
    if (!pageContent) return;

    pageContent.addEventListener(
      'touchstart',
      this.handleTouchStart.bind(this),
      { passive: true }
    );
    pageContent.addEventListener('touchend', this.handleTouchEnd.bind(this), {
      passive: true,
    });
    pageContent.addEventListener('touchmove', this.handleTouchMove.bind(this), {
      passive: false,
    });
  }

  /**
   * タッチ開始ハンドラー
   */
  handleTouchStart(event) {
    if (event.touches.length !== 1) return;

    const touch = event.touches[0];
    this.startX = touch.clientX;
    this.startY = touch.clientY;
    this.startTime = Date.now();
    this.isActive = true;
  }

  /**
   * タッチ終了ハンドラー
   */
  handleTouchEnd(event) {
    if (!this.isActive || event.changedTouches.length !== 1) return;

    const touch = event.changedTouches[0];
    const endX = touch.clientX;
    const endY = touch.clientY;
    const endTime = Date.now();

    const deltaX = endX - this.startX;
    const deltaY = endY - this.startY;
    const deltaTime = endTime - this.startTime;

    this.isActive = false;

    // スワイプ検出
    if (deltaTime < this.timeThreshold) {
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance > this.threshold) {
        const angle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;
        this.handleSwipe(angle, distance, touch.target);
      } else {
        // タップ検出
        this.handleTap(touch.target, touch.clientX, touch.clientY);
      }
    }
  }

  /**
   * タッチ移動ハンドラー
   */
  handleTouchMove(event) {
    if (!this.isActive || event.touches.length !== 1) return;

    const touch = event.touches[0];
    const deltaX = touch.clientX - this.startX;
    const deltaY = touch.clientY - this.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // ドラッグ開始の判定
    if (distance > 10) {
      const target = touch.target;
      if (target.closest('.chord')) {
        return;
      }

      // スクロール防止（特定の場合のみ）
      if (this.shouldPreventScroll(target)) {
        event.preventDefault();
      }
    }
  }

  /**
   * スワイプハンドラー
   */
  handleSwipe(angle, distance, target) {
    const direction = this.getSwipeDirection(angle);

    switch (direction) {
      case 'left':
        this.handleSwipeLeft(target);
        break;
      case 'right':
        this.handleSwipeRight(target);
        break;
      case 'up':
        this.handleSwipeUp(target);
        break;
      case 'down':
        this.handleSwipeDown(target);
        break;
    }
  }

  /**
   * スワイプ方向を取得
   */
  getSwipeDirection(angle) {
    if (angle >= -45 && angle <= 45) return 'right';
    if (angle >= 45 && angle <= 135) return 'down';
    if (angle >= 135 || angle <= -135) return 'left';
    return 'up';
  }

  /**
   * 左スワイプハンドラー
   */
  handleSwipeLeft(target) {
    const presetList = this.ctx.el.presetList;
    if (presetList?.contains(target)) {
      this.scrollPresetList('next');
    }
  }

  /**
   * 右スワイプハンドラー
   */
  handleSwipeRight(target) {
    const presetList = this.ctx.el.presetList;
    if (presetList?.contains(target)) {
      this.scrollPresetList('prev');
    }
  }

  /**
   * 上スワイプハンドラー
   */
  handleSwipeUp(target) {
    if (target.closest('.page-content')) {
      this.adjustFontSize(1);
    }
  }

  /**
   * 下スワイプハンドラー
   */
  handleSwipeDown(target) {
    if (target.closest('.page-content')) {
      this.adjustFontSize(-1);
    }
  }

  /**
   * タップハンドラー
   */
  handleTap(_target, _x, _y) {
    // 通常のタップ処理は既存のクリックイベントに委ねる
  }

  /**
   * フォントサイズ調整
   */
  adjustFontSize(delta) {
    const lyricsFont = this.ctx.el.lyricsFont;
    if (!lyricsFont) return;

    const currentSize = parseInt(lyricsFont.value);
    const newSize = Math.max(10, Math.min(28, currentSize + delta));

    lyricsFont.value = newSize.toString();
    lyricsFont.dispatchEvent(new Event('input'));
  }

  /**
   * プリセットリストのスクロール
   */
  scrollPresetList(direction) {
    const presetList = this.ctx.el.presetList;
    if (!presetList) return;

    const scrollAmount = 200;
    const currentScroll = presetList.scrollLeft;
    const newScroll =
      direction === 'next'
        ? currentScroll + scrollAmount
        : currentScroll - scrollAmount;

    presetList.scrollTo({
      left: newScroll,
      behavior: 'smooth',
    });
  }

  /**
   * スクロール防止の判定
   */
  shouldPreventScroll(target) {
    return (
      target.closest('.chords-row') !== null ||
      target.closest('.chord') !== null ||
      target.closest('.section-inline') !== null
    );
  }

  /**
   * ジェスチャーの有効/無効を切り替え
   */
  setEnabled(enabled) {
    this.isActive = enabled;
  }
}
