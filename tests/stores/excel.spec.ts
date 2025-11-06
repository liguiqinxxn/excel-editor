import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useExcelStore } from '@/stores/excel'
import type { WorksheetData, CellData } from '@/stores/excel'

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
    expect(store.activeWorksheet).toBeNull()
  })

  it('should create a new file', () => {
    const store = useExcelStore()
    
    store.createNewFile()
    
    expect(store.hasFile).toBe(true)
    expect(store.currentFile).toBeDefined()
    expect(store.currentFile?.name).toBe('新建文件.xlsx')
    expect(store.currentFile?.worksheets).toHaveLength(1)
    expect(store.activeWorksheet).toBeDefined()
  })

  it('should switch worksheets', () => {
    const store = useExcelStore()
    
    // 创建包含多个工作表的新文件
    store.createNewFile()
    
    // 添加第二个工作表
    store.addWorksheet()
    
    // 修改工作表数据以进行测试
    const sheet1Data: CellData[][] = [[{ value: 1 } as CellData]]
    const sheet2Data: CellData[][] = [[{ value: 2 } as CellData]]
    
    if (store.currentFile) {
      store.currentFile.worksheets[0].data = sheet1Data
      store.currentFile.worksheets[1].data = sheet2Data
    }
    
    store.switchWorksheet(1)
    
    expect(store.currentFile?.activeSheetIndex).toBe(1)
    expect(store.activeWorksheet?.data[0][0].value).toBe(2)
  })

  it('should update cell value', () => {
    const store = useExcelStore()
    
    store.createNewFile()
    
    if (store.currentFile && store.activeWorksheet) {
      // 初始化一些数据
      store.activeWorksheet.data = [
        [{ value: 'A1' }, { value: 'B1' }],
        [{ value: 'A2' }, { value: 'B2' }]
      ] as CellData[][]
    }
    
    store.updateCellValue(0, 1, 'Updated')
    
    expect(store.activeWorksheet?.data[0][1].value).toBe('Updated')
  })

  it('should add worksheet', () => {
    const store = useExcelStore()
    
    store.createNewFile()
    
    const initialLength = store.currentFile?.worksheets.length || 0
    store.addWorksheet()
    
    expect(store.currentFile?.worksheets).toHaveLength(initialLength + 1)
    // 注意：activeSheetIndex 不会自动变为新添加的工作表索引
    expect(store.currentFile?.worksheets[1].name).toBe('Sheet2')
  })

  it('should delete worksheet', () => {
    const store = useExcelStore()
    
    store.createNewFile()
    store.addWorksheet() // 添加第二个工作表
    
    if (store.currentFile) {
      // 修改工作表名称以进行测试
      store.currentFile.worksheets[0].name = 'Sheet1'
      store.currentFile.worksheets[1].name = 'Sheet2'
      
      // 切换到第二个工作表
      store.switchWorksheet(1)
      
      // 删除第一个工作表
      store.deleteWorksheet(0)
      
      expect(store.currentFile.worksheets).toHaveLength(1)
      expect(store.currentFile.activeSheetIndex).toBe(0)
      expect(store.currentFile.worksheets[0].name).toBe('Sheet2')
    }
  })

  it('should not delete the only worksheet', () => {
    const store = useExcelStore()
    
    store.createNewFile()
    
    if (store.currentFile) {
      const initialLength = store.currentFile.worksheets.length
      store.deleteWorksheet(0)
      
      expect(store.currentFile.worksheets).toHaveLength(initialLength)
    }
  })
})