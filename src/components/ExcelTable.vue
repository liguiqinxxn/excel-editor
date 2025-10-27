<template>
  <div class="excel-table-container">
    <div class="table-wrapper">
      <table class="excel-table">
        <thead>
          <tr>
            <th class="corner-cell"></th>
            <th 
              v-for="col in visibleCols" 
              :key="col"
              :class="{ 'selected': isColSelected(col) }"
              @mousedown="startColSelection(col)"
            >
              {{ getColLabel(col) }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in visibleRows" :key="row">
            <td 
              class="row-header"
              :class="{ 'selected': isRowSelected(row) }"
              @mousedown="startRowSelection(row)"
            >
              {{ row + 1 }}
            </td>
            <td 
              v-for="col in visibleCols" 
              :key="col"
              :class="getCellClasses(row, col)"
              @mousedown="startCellSelection(row, col)"
              @dblclick="editCell(row, col)"
            >
              <div v-if="!isEditingCell(row, col)" class="cell-content">
                {{ getCellDisplayValue(row, col) }}
              </div>
              <input
                v-else
                ref="cellInput"
                type="text"
                :value="getCellValue(row, col)"
                @input="updateCellValue(row, col, $event)"
                @blur="stopEditing"
                @keydown.enter="stopEditing"
                @keydown.escape="cancelEditing"
                class="cell-editor"
                autofocus
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- 滚动条 -->
    <div class="scroll-bars">
      <div class="horizontal-scroll">
        <div class="scroll-track">
          <div class="scroll-thumb" :style="{ width: '50%', left: '0%' }"></div>
        </div>
      </div>
      <div class="vertical-scroll">
        <div class="scroll-track">
          <div class="scroll-thumb" :style="{ height: '50%', top: '0%' }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import type { CellData } from '@/stores/excel'

interface Props {
  data: CellData[][]
  dimensions: {
    rows: number
    cols: number
  }
}

const props = defineProps<Props>()

// 响应式数据
const selectedCells = ref<{ row: number; col: number }[]>([])
const editingCell = ref<{ row: number; col: number } | null>(null)
const cellInput = ref<HTMLInputElement>()

// 计算属性
const visibleRows = computed(() => {
  const rows = Math.max(props.dimensions.rows, 1)
  return Array.from({ length: Math.min(rows, 50) }, (_, i) => i)
})

const visibleCols = computed(() => {
  const cols = Math.max(props.dimensions.cols, 1)
  return Array.from({ length: Math.min(cols, 26) }, (_, i) => i)
})

// 方法
const getCellValue = (row: number, col: number): string => {
  if (row < props.data.length) {
    const rowData = props.data[row]
    if (rowData && col < rowData.length) {
      const cell = rowData[col]
      return cell ? String(cell.value) : ''
    }
  }
  return ''
}

const getCellDisplayValue = (row: number, col: number): string => {
  const value = getCellValue(row, col)
  return value.length > 20 ? value.substring(0, 20) + '...' : value
}

const getCellClasses = (row: number, col: number): string[] => {
  const classes = ['cell']
  if (isCellSelected(row, col)) {
    classes.push('selected')
  }
  if (isEditingCell(row, col)) {
    classes.push('editing')
  }
  return classes
}

const isCellSelected = (row: number, col: number): boolean => {
  return selectedCells.value.some(cell => cell.row === row && cell.col === col)
}

const isRowSelected = (row: number): boolean => {
  return selectedCells.value.some(cell => cell.row === row)
}

const isColSelected = (col: number): boolean => {
  return selectedCells.value.some(cell => cell.col === col)
}

const isEditingCell = (row: number, col: number): boolean => {
  return editingCell.value?.row === row && editingCell.value?.col === col
}

const getColLabel = (col: number): string => {
  return String.fromCharCode(65 + col)
}

// 选择操作
const startCellSelection = (row: number, col: number) => {
  selectedCells.value = [{ row, col }]
  editingCell.value = null
}

const startRowSelection = (row: number) => {
  const rowCells = visibleCols.value.map(col => ({ row, col }))
  selectedCells.value = rowCells
  editingCell.value = null
}

const startColSelection = (col: number) => {
  const colCells = visibleRows.value.map(row => ({ row, col }))
  selectedCells.value = colCells
  editingCell.value = null
}

// 编辑操作
const editCell = (row: number, col: number) => {
  editingCell.value = { row, col }
  selectedCells.value = [{ row, col }]
  
  nextTick(() => {
    cellInput.value?.focus()
    cellInput.value?.select()
  })
}

const updateCellValue = (row: number, col: number, event: Event) => {
  const target = event.target as HTMLInputElement
  emit('cellUpdate', row, col, target.value)
}

const stopEditing = () => {
  editingCell.value = null
}

const cancelEditing = () => {
  editingCell.value = null
}

// 事件
const emit = defineEmits<{
  cellUpdate: [row: number, col: number, value: string]
}>()

onMounted(() => {
  // 添加键盘事件监听
  document.addEventListener('keydown', handleKeyDown)
})

const handleKeyDown = (event: KeyboardEvent) => {
  if (editingCell.value) return
  
  const lastSelected = selectedCells.value[selectedCells.value.length - 1]
  if (!lastSelected) return
  
  let newRow = lastSelected.row
  let newCol = lastSelected.col
  
  switch (event.key) {
    case 'ArrowUp':
      newRow = Math.max(0, newRow - 1)
      break
    case 'ArrowDown':
      newRow = Math.min(props.dimensions.rows - 1, newRow + 1)
      break
    case 'ArrowLeft':
      newCol = Math.max(0, newCol - 1)
      break
    case 'ArrowRight':
      newCol = Math.min(props.dimensions.cols - 1, newCol + 1)
      break
    case 'Enter':
      editCell(newRow, newCol)
      event.preventDefault()
      return
    default:
      return
  }
  
  if (newRow !== lastSelected.row || newCol !== lastSelected.col) {
    selectedCells.value = [{ row: newRow, col: newCol }]
    event.preventDefault()
  }
}
</script>

<style scoped>
.excel-table-container {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.table-wrapper {
  flex: 1;
  overflow: auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.excel-table {
  border-collapse: collapse;
  width: 100%;
  min-width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  font-size: 14px;
  background: white;
}

.excel-table th,
.excel-table td {
  border: 1px solid #e0e0e0;
  padding: 6px 8px;
  min-width: 100px;
  max-width: 200px;
  height: 32px;
  box-sizing: border-box;
  text-align: left;
}

.corner-cell {
  background: #f8f9fa;
  border-right: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
  min-width: 40px;
  border-top-left-radius: 8px;
}

.row-header {
  background: #f8f9fa;
  font-weight: 500;
  text-align: center;
  border-right: 1px solid #e0e0e0;
  min-width: 40px;
}

.excel-table th:not(.corner-cell) {
  background: #f8f9fa;
  font-weight: 500;
  text-align: center;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
}

.excel-table th:not(.corner-cell):hover {
  background: #e0e0e0;
}

.cell {
  background: white;
  cursor: cell;
  position: relative;
  overflow: hidden;
  transition: background 0.2s;
}

.cell:hover {
  background: #f0f7ff;
}

.cell.selected {
  background: #e3f2fd;
  border: 2px solid #1976d2;
  border-radius: 2px;
}

.cell.editing {
  padding: 0;
}

.cell-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 2px 0;
}

.cell-editor {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  padding: 2px 4px;
  font: inherit;
  background: white;
  box-sizing: border-box;
}

.row-header.selected {
  background: #1976d2;
  color: white;
}

.excel-table th:not(.corner-cell).selected {
  background: #1976d2;
  color: white;
}

.scroll-bars {
  display: flex;
  height: 16px;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-top: none;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}

.horizontal-scroll {
  flex: 1;
  position: relative;
  margin-right: 16px;
}

.vertical-scroll {
  width: 16px;
  height: 100%;
  position: relative;
}

.scroll-track {
  position: absolute;
  top: 6px;
  left: 0;
  right: 0;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
}

.vertical-scroll .scroll-track {
  top: 0;
  left: 6px;
  bottom: 0;
  width: 6px;
  height: auto;
}

.scroll-thumb {
  position: absolute;
  height: 100%;
  background: #999;
  border-radius: 3px;
  cursor: pointer;
  transition: background 0.2s;
}

.scroll-thumb:hover {
  background: #666;
  opacity: 0.9;
}
</style>