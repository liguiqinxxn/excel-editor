import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import HistoryToolbar from '@/components/HistoryToolbar.vue'
import { useHistoryStore } from '@/stores/history'
import { useExcelStore } from '@/stores/excel'

describe('HistoryToolbar', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should render toolbar with buttons', () => {
    const wrapper = mount(HistoryToolbar, {
      global: {
        plugins: [createTestingPinia()]
      }
    })

    expect(wrapper.find('.history-toolbar').exists()).toBe(true)
    expect(wrapper.find('button[title="撤销 (Ctrl+Z)"]').exists()).toBe(true)
    expect(wrapper.find('button[title="重做 (Ctrl+Y)"]').exists()).toBe(true)
    expect(wrapper.find('.history-info').exists()).toBe(true)
  })

  it('should display stack counts', () => {
    const wrapper = mount(HistoryToolbar, {
      global: {
        plugins: [createTestingPinia({
          initialState: {
            history: {
              undoStack: [{ data: [[]] }],
              redoStack: [{ data: [[]] }, { data: [[]] }]
            }
          }
        })]
      }
    })

    expect(wrapper.text()).toContain('撤销栈: 1')
    expect(wrapper.text()).toContain('重做栈: 2')
  })

  it('should disable buttons when no actions available', () => {
    const wrapper = mount(HistoryToolbar, {
      global: {
        plugins: [createTestingPinia({
          initialState: {
            history: {
              undoStack: [],
              redoStack: []
            }
          }
        })]
      }
    })

    const undoButton = wrapper.find('button[title="撤销 (Ctrl+Z)"]')
    const redoButton = wrapper.find('button[title="重做 (Ctrl+Y)"]')

    expect(undoButton.attributes('disabled')).toBeDefined()
    expect(redoButton.attributes('disabled')).toBeDefined()
  })

  it('should enable buttons when actions available', () => {
    const wrapper = mount(HistoryToolbar, {
      global: {
        plugins: [createTestingPinia({
          initialState: {
            history: {
              undoStack: [{ data: [[]] }],
              redoStack: [{ data: [[]] }]
            }
          }
        })]
      }
    })

    const undoButton = wrapper.find('button[title="撤销 (Ctrl+Z)"]')
    const redoButton = wrapper.find('button[title="重做 (Ctrl+Y)"]')

    expect(undoButton.attributes('disabled')).toBeUndefined()
    expect(redoButton.attributes('disabled')).toBeUndefined()
  })

  it('should call undo when undo button is clicked', async () => {
    const historyStore = useHistoryStore()
    const excelStore = useExcelStore()
    
    excelStore.activeWorksheet = { data: [[]], dimensions: { rows: 1, cols: 1 }, name: 'Sheet1' }
    historyStore.undoStack = [{ data: [[]] }]
    
    const wrapper = mount(HistoryToolbar, {
      global: {
        plugins: [createTestingPinia({
          stubActions: false,
          initialState: {
            history: {
              undoStack: [{ data: [[]] }],
              redoStack: []
            }
          }
        })]
      }
    })

    const undoButton = wrapper.find('button[title="撤销 (Ctrl+Z)"]')
    await undoButton.trigger('click')

    expect(historyStore.undo).toHaveBeenCalled()
  })

  it('should call redo when redo button is clicked', async () => {
    const historyStore = useHistoryStore()
    const excelStore = useExcelStore()
    
    excelStore.activeWorksheet = { data: [[]], dimensions: { rows: 1, cols: 1 }, name: 'Sheet1' }
    historyStore.redoStack = [{ data: [[]] }]
    
    const wrapper = mount(HistoryToolbar, {
      global: {
        plugins: [createTestingPinia({
          stubActions: false,
          initialState: {
            history: {
              undoStack: [],
              redoStack: [{ data: [[]] }]
            }
          }
        })]
      }
    })

    const redoButton = wrapper.find('button[title="重做 (Ctrl+Y)"]')
    await redoButton.trigger('click')

    expect(historyStore.redo).toHaveBeenCalled()
  })
})