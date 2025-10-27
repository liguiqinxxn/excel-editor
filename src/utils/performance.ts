// 性能监控工具
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private marks: Map<string, number> = new Map()
  private measures: Map<string, number> = new Map()

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // 标记开始时间
  mark(name: string): void {
    if (typeof performance !== 'undefined') {
      this.marks.set(name, performance.now())
    }
  }

  // 测量时间间隔
  measure(name: string, startMark: string, endMark: string): void {
    if (typeof performance !== 'undefined') {
      const start = this.marks.get(startMark)
      const end = this.marks.get(endMark)
      
      if (start && end) {
        const duration = end - start
        this.measures.set(name, duration)
        console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`)
      }
    }
  }

  // 获取测量结果
  getMeasure(name: string): number | undefined {
    return this.measures.get(name)
  }

  // 清除所有标记和测量
  clear(): void {
    this.marks.clear()
    this.measures.clear()
  }

  // 性能优化：防抖函数
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout>
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func.apply(null, args), delay)
    }
  }

  // 性能优化：节流函数
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(null, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }

  // 内存使用监控
  static getMemoryUsage(): string {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      return `内存使用: ${(memory.usedJSHeapSize / 1048576).toFixed(2)}MB / ${(memory.totalJSHeapSize / 1048576).toFixed(2)}MB`
    }
    return '内存信息不可用'
  }

  // 虚拟滚动优化
  static createVirtualScroll(
    container: HTMLElement,
    itemHeight: number,
    totalItems: number,
    renderItem: (index: number) => HTMLElement
  ): void {
    let visibleStart = 0
    let visibleEnd = 0
    
    const updateVisibleItems = () => {
      const scrollTop = container.scrollTop
      const containerHeight = container.clientHeight
      
      visibleStart = Math.floor(scrollTop / itemHeight)
      visibleEnd = Math.min(
        visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
        totalItems
      )
      
      // 清空容器
      container.innerHTML = ''
      
      // 只渲染可见项
      for (let i = visibleStart; i < visibleEnd; i++) {
        const item = renderItem(i)
        item.style.position = 'absolute'
        item.style.top = `${i * itemHeight}px`
        container.appendChild(item)
      }
      
      // 设置容器高度以支持滚动
      container.style.height = `${totalItems * itemHeight}px`
    }
    
    container.addEventListener('scroll', PerformanceMonitor.throttle(updateVisibleItems, 16))
    updateVisibleItems()
  }
}

// 导出单例实例
export const performanceMonitor = PerformanceMonitor.getInstance()