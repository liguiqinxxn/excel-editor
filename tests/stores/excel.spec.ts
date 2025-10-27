import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useExcelStore } from '@/stores/excel'
import type { WorksheetData } from '@/stores/excel'

describe('Excel Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with default values', () => {
    const store = useExcelStore()
    
    expect(store.isLoading).toBe(false)
    expect(store.error).toBe('')
    expect(store.hasFile).toBe(false)
    expect(store.currentFile).toBeNull()
    expect(store.activeWorksheet).toBeUndefined()
  })

  it('should create a new file', () => {
    const store = useExcelStore()
    
    store.createNewFile()
    
    expect(store.hasFile).toBe(true)
    expect(store.currentFile).toBeDefined()
    expect(store.currentFile?.name).toBe('新文件.xlsx')
    expect(store.currentFile?.worksheets).toHaveLength(1)
    expect(store.activeWorksheet).toBeDefined()
  })

  it('should switch worksheets', () => {
    const store = useExcelStore()
    
    // 创建包含多个工作表的新文件
    store.currentFile = {
      name: 'test.xlsx',
      worksheets: [
        { name: 'Sheet1', data: [[1]], dimensions: { rows: 1, cols: 1 } },
        { name: 'Sheet2', data: [[2]], dimensions: { rows: 1, cols: 1 } }
      ],
      activeSheetIndex: 0
    }
    
    store.switchWorksheet(1)
    
    expect(store.currentFile?.activeSheetIndex).toBe(1)
    expect(store.activeWorksheet?.data[0][0]).toBe(2)
  })

  it('should update cell value', () => {
    const store = useExcelStore()
    
    store.currentFile = {
      name: 'test.xlsx',
      worksheets: [
        { 
          name: 'Sheet1', 
          data: [['A1', 'B1'], ['A2', 'B2']], 
          dimensions: { rows: 2, cols: 2 } 
        }
      ],
      activeSheetIndex: 0
    }
    
    store.updateCellValue(0, 1, 'Updated')
    
    expect(store.activeWorksheet?.data[0][1]).toBe('Updated')
  })

  it('should add worksheet', () => {
    const store = useExcelStore()
    
    store.currentFile = {
      name: 'test.xlsx',
      worksheets: [
        { name: 'Sheet1', data: [[]], dimensions: { rows: 1, cols: 1 } }
      ],
      activeSheetIndex: 0
    }
    
    store.addWorksheet()
    
    expect(store.currentFile?.worksheets).toHaveLength(2)
    expect(store.currentFile?.activeSheetIndex).toBe(1)
    expect(store.currentFile?.worksheets[1].name).toBe('Sheet2')
  })

  it('should delete worksheet', () => {
    const store = useExcelStore()
    
    store.currentFile = {
      name: 'test.xlsx',
      worksheets: [
        { name: 'Sheet1', data: [[]], dimensions: { rows: 1, cols: 1 } },
        { name: 'Sheet2', data: [[]], dimensions: { rows: 1, cols: 1 } }
      ],
      activeSheetIndex: 1
    }
    
    store.deleteWorksheet(0)
    
    expect(store.currentFile?.worksheets).toHaveLength(1)
    expect(store.currentFile?.activeSheetIndex).toBe(0)
    expect(store.currentFile?.worksheets[0].name).toBe('Sheet2')
  })

  it('should not delete the only worksheet', () => {
    const store = useExcelStore()
    
    store.currentFile = {
      name: 'test.xlsx',
      worksheets: [
        { name: 'Sheet1', data: [[]], dimensions: { rows: 1, cols: 1 } }
      ],
      activeSheetIndex: 0
    }
    
    const initialLength = store.currentFile.worksheets.length
    store.deleteWorksheet(0)
    
    expect(store.currentFile?.worksheets).toHaveLength(initialLength)
  })
})