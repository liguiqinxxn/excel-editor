import { defineStore } from 'pinia'
import type { CellData, WorksheetData } from './excel'

export interface FilterCondition {
  column: number
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between'
  value1: any
  value2?: any
}

export interface SortCondition {
  column: number
  direction: 'asc' | 'desc'
}

export const useFilterStore = defineStore('filter', {
  state: () => ({
    filters: [] as FilterCondition[],
    sortConditions: [] as SortCondition[],
    hiddenRows: new Set<number>(),
    originalData: null as WorksheetData | null
  }),

  actions: {
    // 应用筛选和排序
    applyFiltersAndSort(sheetData: WorksheetData): WorksheetData {
      if (!this.originalData) {
        this.originalData = JSON.parse(JSON.stringify(sheetData))
      }

      let filteredData = this.applyFilters(sheetData)
      filteredData = this.applySort(filteredData)
      
      return filteredData
    },

    // 应用筛选条件
    applyFilters(sheetData: WorksheetData): WorksheetData {
      const filteredData = JSON.parse(JSON.stringify(sheetData))
      this.hiddenRows.clear()

      if (this.filters.length === 0) {
        return filteredData
      }

      for (let row = 0; row < filteredData.data.length; row++) {
        let shouldShow = true
        
        for (const filter of this.filters) {
          const cell = filteredData.data[row]?.[filter.column]
          if (!this.matchesFilter(cell, filter)) {
            shouldShow = false
            break
          }
        }
        
        if (!shouldShow) {
          this.hiddenRows.add(row)
        }
      }

      // 过滤掉隐藏的行
      filteredData.data = filteredData.data.filter((row: CellData[], index: number) => !this.hiddenRows.has(index))
      return filteredData
    },

    // 应用排序条件
    applySort(sheetData: WorksheetData): WorksheetData {
      const sortedData = JSON.parse(JSON.stringify(sheetData))

      if (this.sortConditions.length === 0) {
        return sortedData
      }

      sortedData.data.sort((rowA: CellData[], rowB: CellData[]) => {
        for (const sortCondition of this.sortConditions) {
          const col = sortCondition.column
          const valueA = rowA[col]?.value
          const valueB = rowB[col]?.value
          
          let comparison = 0
          
          // 处理不同类型的比较
          if (typeof valueA === 'number' && typeof valueB === 'number') {
            comparison = valueA - valueB
          } else {
            comparison = String(valueA || '').localeCompare(String(valueB || ''))
          }
          
          if (comparison !== 0) {
            return sortCondition.direction === 'asc' ? comparison : -comparison
          }
        }
        
        return 0
      })

      return sortedData
    },

    // 检查单元格是否匹配筛选条件
    matchesFilter(cell: CellData, filter: FilterCondition): boolean {
      const cellValue = cell?.value
      
      switch (filter.operator) {
        case 'equals':
          return cellValue === filter.value1
        case 'contains':
          return String(cellValue || '').includes(String(filter.value1))
        case 'greaterThan':
          return parseFloat(String(cellValue)) > parseFloat(String(filter.value1))
        case 'lessThan':
          return parseFloat(String(cellValue)) < parseFloat(String(filter.value1))
        case 'between':
          const numValue = parseFloat(String(cellValue))
          return numValue >= parseFloat(filter.value1) && 
                 numValue <= parseFloat(filter.value2 || filter.value1)
        default:
          return true
      }
    },

    // 添加筛选条件
    addFilter(filter: FilterCondition) {
      this.filters.push(filter)
    },

    // 移除筛选条件
    removeFilter(column: number) {
      this.filters = this.filters.filter(f => f.column !== column)
    },

    // 添加排序条件
    addSort(sortCondition: SortCondition) {
      // 移除同列的现有排序条件
      this.sortConditions = this.sortConditions.filter(s => s.column !== sortCondition.column)
      this.sortConditions.push(sortCondition)
    },

    // 移除排序条件
    removeSort(column: number) {
      this.sortConditions = this.sortConditions.filter(s => s.column !== column)
    },

    // 清空所有筛选和排序
    clearAll() {
      this.filters = []
      this.sortConditions = []
      this.hiddenRows.clear()
    },

    // 重置为原始数据
    resetToOriginal(): WorksheetData | null {
      return this.originalData ? JSON.parse(JSON.stringify(this.originalData)) : null
    }
  }
})