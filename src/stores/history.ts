import { defineStore } from 'pinia'
import type { CellData, WorksheetData } from './excel'

interface HistoryState {
  undoStack: WorksheetData[]
  redoStack: WorksheetData[]
  maxStackSize: number
}

export const useHistoryStore = defineStore('history', {
  state: (): HistoryState => ({
    undoStack: [],
    redoStack: [],
    maxStackSize: 50
  }),

  actions: {
    // 保存当前状态到撤销栈
    saveState(sheetData: WorksheetData) {
      // 深拷贝当前状态
      const stateCopy = JSON.parse(JSON.stringify(sheetData))
      
      this.undoStack.push(stateCopy)
      
      // 限制栈大小
      if (this.undoStack.length > this.maxStackSize) {
        this.undoStack.shift()
      }
      
      // 清空重做栈
      this.redoStack = []
    },

    // 撤销操作
    undo(currentState: WorksheetData): WorksheetData | null {
      if (this.undoStack.length === 0) return null
      
      // 保存当前状态到重做栈
      this.redoStack.push(JSON.parse(JSON.stringify(currentState)))
      
      // 弹出撤销栈的最后一个状态
      return this.undoStack.pop() || null
    },

    // 重做操作
    redo(currentState: WorksheetData): WorksheetData | null {
      if (this.redoStack.length === 0) return null
      
      // 保存当前状态到撤销栈
      this.undoStack.push(JSON.parse(JSON.stringify(currentState)))
      
      // 弹出重做栈的最后一个状态
      return this.redoStack.pop() || null
    },

    // 清空历史记录
    clear() {
      this.undoStack = []
      this.redoStack = []
    },

    // 检查是否可以撤销
    canUndo(): boolean {
      return this.undoStack.length > 0
    },

    // 检查是否可以重做
    canRedo(): boolean {
      return this.redoStack.length > 0
    }
  }
})