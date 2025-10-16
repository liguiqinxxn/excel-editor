import { defineStore } from 'pinia'
import type { CellData } from './excel'

export interface ValidationRule {
  id: string
  type: 'number' | 'text' | 'date' | 'list' | 'custom'
  range: string // A1:B10 格式
  condition?: string
  errorMessage?: string
  listValues?: string[]
  minValue?: number
  maxValue?: number
}

export const useValidationStore = defineStore('validation', {
  state: () => ({
    rules: [] as ValidationRule[],
    activeRule: null as ValidationRule | null
  }),

  actions: {
    // 添加验证规则
    addRule(rule: ValidationRule) {
      this.rules.push(rule)
    },

    // 删除验证规则
    removeRule(ruleId: string) {
      this.rules = this.rules.filter(rule => rule.id !== ruleId)
    },

    // 验证单元格数据
    validateCell(cellData: CellData, row: number, col: number): string | null {
      const cellAddress = this.getCellAddress(row, col)
      
      for (const rule of this.rules) {
        if (this.isCellInRange(cellAddress, rule.range)) {
          const isValid = this.validateByRule(cellData, rule)
          if (!isValid) {
            return rule.errorMessage || '数据验证失败'
          }
        }
      }
      
      return null
    },

    // 根据规则验证数据
    validateByRule(cellData: CellData, rule: ValidationRule): boolean {
      const value = cellData.value
      
      switch (rule.type) {
        case 'number':
          return this.validateNumber(value, rule)
        case 'text':
          return this.validateText(value, rule)
        case 'date':
          return this.validateDate(value, rule)
        case 'list':
          return this.validateList(value, rule)
        default:
          return true
      }
    },

    // 数字验证
    validateNumber(value: any, rule: ValidationRule): boolean {
      const numValue = parseFloat(value)
      if (isNaN(numValue)) return false
      
      if (rule.minValue !== undefined && numValue < rule.minValue) return false
      if (rule.maxValue !== undefined && numValue > rule.maxValue) return false
      
      return true
    },

    // 文本验证
    validateText(value: any, rule: ValidationRule): boolean {
      if (typeof value !== 'string') return false
      
      if (rule.condition === 'notEmpty' && value.trim() === '') return false
      if (rule.condition === 'length' && rule.minValue && value.length < rule.minValue) return false
      
      return true
    },

    // 日期验证
    validateDate(value: any, rule: ValidationRule): boolean {
      const dateValue = new Date(value)
      if (isNaN(dateValue.getTime())) return false
      
      if (rule.minValue) {
        const minDate = new Date(rule.minValue)
        if (dateValue < minDate) return false
      }
      
      if (rule.maxValue) {
        const maxDate = new Date(rule.maxValue)
        if (dateValue > maxDate) return false
      }
      
      return true
    },

    // 列表验证
    validateList(value: any, rule: ValidationRule): boolean {
      return rule.listValues?.includes(value.toString()) || false
    },

    // 检查单元格是否在范围内
    isCellInRange(cellAddress: string, range: string): boolean {
      const [start, end] = range.split(':')
      return this.compareCellAddress(cellAddress, start!) >= 0 && 
             this.compareCellAddress(cellAddress, end!) <= 0
    },

    // 比较单元格地址
    compareCellAddress(a: string, b: string): number {
      const aCol = a.match(/[A-Z]+/)?.[0] || ''
      const aRow = parseInt(a.match(/\d+/)?.[0] || '0')
      const bCol = b.match(/[A-Z]+/)?.[0] || ''
      const bRow = parseInt(b.match(/\d+/)?.[0] || '0')
      
      if (aCol !== bCol) {
        return aCol.localeCompare(bCol)
      }
      
      return aRow - bRow
    },

    // 获取单元格地址
    getCellAddress(row: number, col: number): string {
      const colName = this.numberToColumnName(col)
      return `${colName}${row + 1}`
    },

    // 数字转列名
    numberToColumnName(num: number): string {
      let result = ''
      while (num >= 0) {
        result = String.fromCharCode(65 + (num % 26)) + result
        num = Math.floor(num / 26) - 1
      }
      return result
    }
  }
})