import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useHistoryStore } from '@/stores/history'
import type { WorksheetData } from '@/stores/excel'

describe('History Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const createWorksheet = (data: any[][] = [['test']]): WorksheetData => ({
    name: 'Sheet1',
    data,
    dimensions: { rows: data.length, cols: data[0]?.length || 0 }
  })

  it('should initialize with empty stacks', () => {
    const store = useHistoryStore()
    
    expect(store.undoStack).toHaveLength(0)
    expect(store.redoStack).toHaveLength(0)
  })

  it('should save state to undo stack', () => {
    const store = useHistoryStore()
    const worksheet = createWorksheet()
    
    store.saveState(worksheet)
    
    expect(store.undoStack).toHaveLength(1)
    expect(store.redoStack).toHaveLength(0)
  })

  it('should undo operation', () => {
    const store = useHistoryStore()
    const worksheet1 = createWorksheet([['A']])
    const worksheet2 = createWorksheet([['B']])
    
    store.saveState(worksheet1)
    store.saveState(worksheet2)
    
    const result = store.undo(worksheet2)
    
    expect(result).toEqual(worksheet1)
    expect(store.undoStack).toHaveLength(1)
    expect(store.redoStack).toHaveLength(1)
  })

  it('should redo operation', () => {
    const store = useHistoryStore()
    const worksheet1 = createWorksheet([['A']])
    const worksheet2 = createWorksheet([['B']])
    
    store.saveState(worksheet1)
    store.saveState(worksheet2)
    store.undo(worksheet2)
    
    const result = store.redo(worksheet1)
    
    expect(result).toEqual(worksheet2)
    expect(store.undoStack).toHaveLength(2)
    expect(store.redoStack).toHaveLength(0)
  })

  it('should return null when undo stack is empty', () => {
    const store = useHistoryStore()
    const worksheet = createWorksheet()
    
    const result = store.undo(worksheet)
    
    expect(result).toBeNull()
  })

  it('should return null when redo stack is empty', () => {
    const store = useHistoryStore()
    const worksheet = createWorksheet()
    
    const result = store.redo(worksheet)
    
    expect(result).toBeNull()
  })

  it('should check if undo is possible', () => {
    const store = useHistoryStore()
    const worksheet = createWorksheet()
    
    expect(store.canUndo()).toBe(false)
    
    store.saveState(worksheet)
    expect(store.canUndo()).toBe(true)
  })

  it('should check if redo is possible', () => {
    const store = useHistoryStore()
    const worksheet = createWorksheet()
    
    expect(store.canRedo()).toBe(false)
    
    store.saveState(worksheet)
    store.undo(worksheet)
    expect(store.canRedo()).toBe(true)
  })

  it('should clear redo stack when saving new state', () => {
    const store = useHistoryStore()
    const worksheet1 = createWorksheet([['A']])
    const worksheet2 = createWorksheet([['B']])
    const worksheet3 = createWorksheet([['C']])
    
    store.saveState(worksheet1)
    store.saveState(worksheet2)
    store.undo(worksheet2) // redo stack now has worksheet2
    
    store.saveState(worksheet3) // should clear redo stack
    
    expect(store.redoStack).toHaveLength(0)
    expect(store.undoStack).toHaveLength(2) // worksheet1 and worksheet3
  })
})