import { defineStore } from 'pinia'
import type { CellData, WorksheetData } from './excel'

export interface PivotConfig {
  id: string
  name: string
  dataRange: string
  rows: number[]
  columns: number[]
  values: number[]
  aggregation: 'sum' | 'average' | 'count' | 'max' | 'min'
}

export interface PivotTable {
  config: PivotConfig
  data: any[][]
  rowHeaders: string[]
  columnHeaders: string[]
  values: number[][]
}

export const usePivotStore = defineStore('pivot', {
  state: () => ({
    pivotTables: [] as PivotTable[],
    activePivot: null as PivotTable | null
  }),

  actions: {
    // 创建数据透视表
    createPivotTable(config: PivotConfig, sheetData: WorksheetData): PivotTable {
      const pivotTable = this.generatePivotTable(config, sheetData)
      this.pivotTables.push(pivotTable)
      this.activePivot = pivotTable
      return pivotTable
    },

    // 生成数据透视表
    generatePivotTable(config: PivotConfig, sheetData: WorksheetData): PivotTable {
      const rawData = this.extractDataFromRange(sheetData, config.dataRange)
      
      // 分组数据
      const groupedData = this.groupData(rawData, config)
      
      // 计算聚合值
      const aggregatedData = this.aggregateData(groupedData, config)
      
      // 格式化输出
      return this.formatPivotTable(aggregatedData, config)
    },

    // 从范围提取数据
    extractDataFromRange(sheetData: WorksheetData, range: string): any[][] {
      const [start, end] = range.split(':') as [string, string]
      const startCoords = this.parseCellAddress(start)
      const endCoords = this.parseCellAddress(end)
      
      const data: any[][] = []
      
      for (let row = startCoords.row; row <= endCoords.row; row++) {
        const rowData: any[] = []
        for (let col = startCoords.col; col <= endCoords.col; col++) {
          const cell = sheetData.data[row]?.[col]
          rowData.push(cell?.value || null)
        }
        data.push(rowData)
      }
      
      return data
    },

    // 分组数据
    groupData(data: any[][], config: PivotConfig): Map<string, any[]> {
      const grouped = new Map<string, any[]>()
      
      for (const row of data) {
        const rowKey = this.getRowKey(row, config.rows)
        const columnKey = this.getColumnKey(row, config.columns)
        const compositeKey = `${rowKey}|${columnKey}`
        
        if (!grouped.has(compositeKey)) {
          grouped.set(compositeKey, [])
        }
        
        const group = grouped.get(compositeKey)
        if (group) {
          group.push(row)
        }
      }
      
      return grouped
    },

    // 获取行键
    getRowKey(row: any[], rowColumns: number[]): string {
      return rowColumns.map(col => row[col] ?? '').join('|')
    },

    // 获取列键
    getColumnKey(row: any[], columnColumns: number[]): string {
      return columnColumns.map(col => row[col] ?? '').join('|')
    },

    // 聚合数据
    aggregateData(groupedData: Map<string, any[]>, config: PivotConfig): any {
      const result: any = {}
      
      for (const [key, rows] of groupedData.entries()) {
        const [rowKey, columnKey] = key.split('|')
        
        // 安全地创建嵌套对象
        if (rowKey && !result[rowKey]) {
          result[rowKey] = {}
        }
        
        for (const valueCol of config.values) {
          const values = rows.map(row => {
            const val = row[valueCol]
            return val !== null && val !== undefined ? parseFloat(String(val)) || 0 : 0
          })
          const aggregatedValue = this.calculateAggregation(values, config.aggregation)
          
          // 安全地设置嵌套属性
          if (rowKey && columnKey) {
            if (!result[rowKey][columnKey]) {
              result[rowKey][columnKey] = {}
            }
            result[rowKey][columnKey][valueCol] = aggregatedValue
          }
        }
      }
      
      return result
    },

    // 计算聚合值
    calculateAggregation(values: number[], aggregation: string): number {
      switch (aggregation) {
        case 'sum':
          return values.reduce((sum, val) => sum + val, 0)
        case 'average':
          return values.reduce((sum, val) => sum + val, 0) / values.length
        case 'count':
          return values.length
        case 'max':
          return Math.max(...values)
        case 'min':
          return Math.min(...values)
        default:
          return 0
      }
    },

    // 格式化数据透视表
    formatPivotTable(aggregatedData: any, config: PivotConfig): PivotTable {
      const rowHeaders = Object.keys(aggregatedData)
      const columnHeaders = this.getUniqueColumnHeaders(aggregatedData)
      
      const values: number[][] = []
      const data: any[][] = []
      
      // 创建表头行
      const headerRow = ['', ...columnHeaders]
      data.push(headerRow)
      
      // 填充数据行
      for (const rowHeader of rowHeaders) {
        const rowData = [rowHeader]
        const rowValues: number[] = []
        
        for (const columnHeader of columnHeaders) {
          const rowDataObj = aggregatedData[rowHeader]
          const columnDataObj = rowDataObj?.[columnHeader]
          const valueIndex = config.values[0]
          const value = valueIndex !== undefined ? (columnDataObj?.[valueIndex] as number) || 0 : 0
          rowData.push(this.formatValue(value, config.aggregation))
          rowValues.push(value)
        }
        
        data.push(rowData)
        values.push(rowValues)
      }
      
      // 添加总计行
      if (rowHeaders.length > 0) {
        const totalRow = ['总计']
        const totalValues: number[] = []
        
        for (let i = 0; i < columnHeaders.length; i++) {
          const columnTotal = values.reduce((sum, row) => sum + (row[i] || 0), 0)
          totalRow.push(this.formatValue(columnTotal, config.aggregation))
          totalValues.push(columnTotal)
        }
        
        data.push(totalRow)
        values.push(totalValues)
      }
      
      return {
        config,
        data,
        rowHeaders,
        columnHeaders,
        values
      }
    },

    // 获取唯一的列标题
    getUniqueColumnHeaders(aggregatedData: any): string[] {
      const headers = new Set<string>()
      
      for (const rowKey in aggregatedData) {
        const rowData = aggregatedData[rowKey]
        if (rowData && typeof rowData === 'object') {
          for (const columnKey in rowData) {
            headers.add(columnKey)
          }
        }
      }
      
      return Array.from(headers)
    },

    // 格式化值
    formatValue(value: number, aggregation: string): string {
      switch (aggregation) {
        case 'average':
          return value.toFixed(2)
        case 'sum':
        case 'max':
        case 'min':
          return Number.isInteger(value) ? value.toString() : value.toFixed(2)
        case 'count':
          return value.toString()
        default:
          return value.toString()
      }
    },

    // 解析单元格地址
    parseCellAddress(address: string): { row: number; col: number } {
      const colMatch = address.match(/[A-Z]+/)?.[0] || ''
      const rowMatch = address.match(/\d+/)?.[0] || '1'
      
      const col = this.columnNameToNumber(colMatch)
      const row = parseInt(rowMatch) - 1
      
      return { row, col }
    },

    // 列名转数字
    columnNameToNumber(name: string): number {
      let result = 0
      for (let i = 0; i < name.length; i++) {
        result = result * 26 + (name.charCodeAt(i) - 64)
      }
      return result - 1
    },

    // 删除数据透视表
    deletePivotTable(pivotId: string) {
      this.pivotTables = this.pivotTables.filter(p => p.config.id !== pivotId)
      if (this.activePivot?.config.id === pivotId) {
        this.activePivot = null
      }
    },

    // 更新数据透视表
    updatePivotTable(pivotId: string, config: PivotConfig, sheetData: WorksheetData) {
      const index = this.pivotTables.findIndex(p => p.config.id === pivotId)
      if (index !== -1) {
        this.pivotTables[index] = this.generatePivotTable(config, sheetData)
        if (this.activePivot?.config.id === pivotId) {
          this.activePivot = this.pivotTables[index]
        }
      }
    }
  }
})