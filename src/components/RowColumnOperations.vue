<template>
  <div class="row-column-operations">
    <!-- 行操作 -->
    <div class="operation-section">
      <h4>行操作</h4>
      <div class="operation-buttons">
        <button @click="insertRowAbove" class="operation-button" :disabled="!hasSelection">
          <span class="icon">↑</span>
          在上方插入行
        </button>
        <button @click="insertRowBelow" class="operation-button" :disabled="!hasSelection">
          <span class="icon">↓</span>
          在下方插入行
        </button>
        <button @click="deleteSelectedRows" class="operation-button danger" :disabled="!hasSelection">
          <span class="icon">🗑️</span>
          删除选中行
        </button>
        <button @click="clearRowContent" class="operation-button" :disabled="!hasSelection">
          <span class="icon">⌫</span>
          清空行内容
        </button>
      </div>
    </div>

    <!-- 列操作 -->
    <div class="operation-section">
      <h4>列操作</h4>
      <div class="operation-buttons">
        <button @click="insertColumnLeft" class="operation-button" :disabled="!hasSelection">
          <span class="icon">←</span>
          在左侧插入列
        </button>
        <button @click="insertColumnRight" class="operation-button" :disabled="!hasSelection">
          <span class="icon">→</span>
          在右侧插入列
        </button>
        <button @click="deleteSelectedColumns" class="operation-button danger" :disabled="!hasSelection">
          <span class="icon">🗑️</span>
          删除选中列
        </button>
        <button @click="clearColumnContent" class="operation-button" :disabled="!hasSelection">
          <span class="icon">⌫</span>
          清空列内容
        </button>
      </div>
    </div>

    <!-- 合并单元格 -->
    <div class="operation-section">
      <h4>合并单元格</h4>
      <div class="operation-buttons">
        <button @click="mergeCells" class="operation-button" :disabled="!canMerge">
          <span class="icon">⧉</span>
          合并单元格
        </button>
        <button @click="unmergeCells" class="operation-button" :disabled="!canUnmerge">
          <span class="icon">⧈</span>
          取消合并
        </button>
        <div class="merge-info" v-if="selectionInfo">
          选中范围: {{ selectionInfo.rows }}行 × {{ selectionInfo.cols }}列
        </div>
      </div>
    </div>

    <!-- 行列调整 -->
    <div class="operation-section">
      <h4>行列调整</h4>
      <div class="adjustment-controls">
        <div class="adjustment-item">
          <label>行高:</label>
          <input 
            type="number" 
            v-model="rowHeight" 
            min="20" 
            max="200" 
            class="adjustment-input"
          />
          <span>px</span>
        </div>
        <div class="adjustment-item">
          <label>列宽:</label>
          <input 
            type="number" 
            v-model="columnWidth" 
            min="50" 
            max="300" 
            class="adjustment-input"
          />
          <span>px</span>
        </div>
        <button @click="applyDimensions" class="operation-button">
          <span class="icon">✓</span>
          应用尺寸
        </button>
      </div>
    </div>

    <!-- 批量操作 -->
    <div class="operation-section">
      <h4>批量操作</h4>
      <div class="batch-controls">
        <button @click="selectAll" class="operation-button">
          <span class="icon">☑️</span>
          全选
        </button>
        <button @click="clearAll" class="operation-button">
          <span class="icon">🗑️</span>
          清空所有
        </button>
        <button @click="fillSeries" class="operation-button">
          <span class="icon">🔢</span>
          填充序列
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useExcelStore } from '@/stores/excel'

const excelStore = useExcelStore()

// 响应式数据
const rowHeight = ref(24)
const columnWidth = ref(80)
const selectionInfo = ref<{ rows: number; cols: number } | null>(null)

// 计算属性
const hasSelection = computed(() => {
  // 简化实现，实际应该根据选择状态计算
  return excelStore.hasFile
})

const canMerge = computed(() => {
  return hasSelection.value && selectionInfo.value && 
         (selectionInfo.value.rows > 1 || selectionInfo.value.cols > 1)
})

const canUnmerge = computed(() => {
  // 简化实现，实际应该检查是否有合并的单元格
  return false
})

// 行操作
const insertRowAbove = () => {
  console.log('在上方插入行')
  // 实现插入行逻辑
}

const insertRowBelow = () => {
  console.log('在下方插入行')
  // 实现插入行逻辑
}

const deleteSelectedRows = () => {
  console.log('删除选中行')
  // 实现删除行逻辑
}

const clearRowContent = () => {
  console.log('清空行内容')
  // 实现清空行逻辑
}

// 列操作
const insertColumnLeft = () => {
  console.log('在左侧插入列')
  // 实现插入列逻辑
}

const insertColumnRight = () => {
  console.log('在右侧插入列')
  // 实现插入列逻辑
}

const deleteSelectedColumns = () => {
  console.log('删除选中列')
  // 实现删除列逻辑
}

const clearColumnContent = () => {
  console.log('清空列内容')
  // 实现清空列逻辑
}

// 合并操作
const mergeCells = () => {
  console.log('合并单元格')
  // 实现合并单元格逻辑
}

const unmergeCells = () => {
  console.log('取消合并')
  // 实现取消合并逻辑
}

// 调整操作
const applyDimensions = () => {
  console.log('应用尺寸:', { rowHeight: rowHeight.value, columnWidth: columnWidth.value })
  // 实现尺寸调整逻辑
}

// 批量操作
const selectAll = () => {
  console.log('全选')
  // 实现全选逻辑
}

const clearAll = () => {
  console.log('清空所有')
  // 实现清空所有逻辑
}

const fillSeries = () => {
  console.log('填充序列')
  // 实现填充序列逻辑
}

// 事件
const emit = defineEmits<{
  operationComplete: [operation: string]
}>()

// 模拟选择信息更新
const updateSelectionInfo = (info: { rows: number; cols: number }) => {
  selectionInfo.value = info
}
</script>

<style scoped>
.row-column-operations {
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.operation-section {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.operation-section:last-child {
  margin-bottom: 0;
  border-bottom: none;
}

.operation-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.operation-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
}

.operation-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
  white-space: nowrap;
}

.operation-button:hover:not(:disabled) {
  background: #f5f5f5;
  border-color: #ccc;
}

.operation-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.operation-button.danger {
  color: #d32f2f;
  border-color: #ffcdd2;
}

.operation-button.danger:hover:not(:disabled) {
  background: #ffebee;
  border-color: #ef5350;
}

.icon {
  font-size: 14px;
}

.merge-info {
  grid-column: 1 / -1;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
  text-align: center;
}

.adjustment-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.adjustment-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.adjustment-item label {
  font-size: 12px;
  color: #666;
  min-width: 40px;
}

.adjustment-input {
  width: 60px;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
}

.batch-controls {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

@media (max-width: 768px) {
  .operation-buttons {
    grid-template-columns: 1fr;
  }
  
  .batch-controls {
    grid-template-columns: 1fr;
  }
  
  .adjustment-item {
    flex-wrap: wrap;
  }
}
</style>