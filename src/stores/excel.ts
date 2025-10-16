import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as XLSX from 'xlsx'

export interface CellData {
  value: string | number
  formula?: string
  style?: {
    font?: {
      bold?: boolean
      italic?: boolean
      color?: string
      size?: number
    }
    alignment?: {
      horizontal?: 'left' | 'center' | 'right'
      vertical?: 'top' | 'middle' | 'bottom'
    }
    backgroundColor?: string
  }
}

export interface WorksheetData {
  name: string
  data: CellData[][]
  dimensions: {
    rows: number
    cols: number
  }
}

export interface ExcelFile {
  name: string
  worksheets: WorksheetData[]
  activeSheetIndex: number
}

export const useExcelStore = defineStore('excel', () => {
  // 状态
  const currentFile = ref<ExcelFile | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const activeWorksheet = computed(() => {
    if (!currentFile.value) return null
    return currentFile.value.worksheets[currentFile.value.activeSheetIndex]
  })

  const hasFile = computed(() => currentFile.value !== null)

  // 方法
  const loadExcelFile = async (file: File) => {
    isLoading.value = true
    error.value = null

    try {
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      
      const worksheets: WorksheetData[] = workbook.SheetNames.map((sheetName, index) => {
        const worksheet = workbook.Sheets[sheetName]
        if (!worksheet) {
          return {
            name: sheetName,
            data: [],
            dimensions: { rows: 0, cols: 0 }
          }
        }
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        
        const data: CellData[][] = jsonData.map((row: any) => 
          Array.isArray(row) ? row.map(cell => ({ value: cell || '' })) : []
        )

        return {
          name: sheetName,
          data,
          dimensions: {
            rows: data.length,
            cols: data.length > 0 ? Math.max(...data.map(row => row.length)) : 0
          }
        }
      })

      currentFile.value = {
        name: file.name,
        worksheets,
        activeSheetIndex: 0
      }
    } catch (err) {
      error.value = `加载Excel文件失败: ${err}`
      console.error('Excel加载错误:', err)
    } finally {
      isLoading.value = false
    }
  }

  const exportExcelFile = () => {
    if (!currentFile.value) return null

    try {
      const workbook = XLSX.utils.book_new()
      
      currentFile.value.worksheets.forEach(worksheet => {
        const sheetData = worksheet.data.map(row => 
          row.map(cell => cell.value)
        )
        const xlsxWorksheet = XLSX.utils.aoa_to_sheet(sheetData)
        XLSX.utils.book_append_sheet(workbook, xlsxWorksheet, worksheet.name)
      })

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    } catch (err) {
      error.value = `导出Excel文件失败: ${err}`
      console.error('Excel导出错误:', err)
      return null
    }
  }

  const updateCellValue = (rowIndex: number, colIndex: number, value: string | number) => {
    if (!activeWorksheet.value) return

    // 确保行存在
    while (activeWorksheet.value.data.length <= rowIndex) {
      activeWorksheet.value.data.push([])
    }

    // 确保列存在
    while (activeWorksheet.value.data[rowIndex]!.length <= colIndex) {
      activeWorksheet.value.data[rowIndex]!.push({ value: '' })
    }

    activeWorksheet.value.data[rowIndex]![colIndex]!.value = value
    
    // 更新维度
    activeWorksheet.value.dimensions.rows = Math.max(activeWorksheet.value.dimensions.rows, rowIndex + 1)
    activeWorksheet.value.dimensions.cols = Math.max(activeWorksheet.value.dimensions.cols, colIndex + 1)
  }

  const switchWorksheet = (index: number) => {
    if (currentFile.value && index >= 0 && index < currentFile.value.worksheets.length) {
      currentFile.value.activeSheetIndex = index
    }
  }

  const clearFile = () => {
    currentFile.value = null
    error.value = null
  }

  return {
    // 状态
    currentFile,
    isLoading,
    error,
    
    // 计算属性
    activeWorksheet,
    hasFile,
    
    // 方法
    loadExcelFile,
    exportExcelFile,
    updateCellValue,
    switchWorksheet,
    clearFile
  }
})

// 导出类型定义
export type SheetData = WorksheetData
export type ChartType = 'area' | 'line' | 'bar' | 'pie' | 'scatter'
export type AggregationType = 'sum' | 'average' | 'count' | 'max' | 'min'
export type ValidationType = 'number' | 'text' | 'date' | 'list' | 'custom'