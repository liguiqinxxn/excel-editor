<template>
  <div class="history-toolbar">
    <el-button-group>
      <el-button 
        :disabled="!canUndo" 
        @click="handleUndo"
        title="撤销 (Ctrl+Z)"
      >
        <el-icon class="toolbar-icon"><RefreshLeft /></el-icon> 撤销
      </el-button>
      <el-button 
        :disabled="!canRedo" 
        @click="handleRedo"
        title="重做 (Ctrl+Y)"
      >
        <el-icon class="toolbar-icon"><RefreshRight /></el-icon> 重做
      </el-button>
    </el-button-group>
    
    <div class="history-info">
      <span>撤销栈: {{ undoCount }}</span>
      <span>重做栈: {{ redoCount }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RefreshLeft, RefreshRight } from '@element-plus/icons-vue'
import { useHistoryStore } from '@/stores/history'
import { useExcelStore } from '@/stores/excel'
import { computed, watch } from 'vue'

const historyStore = useHistoryStore()
const excelStore = useExcelStore()

const canUndo = computed(() => historyStore.canUndo())
const canRedo = computed(() => historyStore.canRedo())
const undoCount = computed(() => historyStore.undoStack.length)
const redoCount = computed(() => historyStore.redoStack.length)

const handleUndo = () => {
  if (!excelStore.activeWorksheet) return
  
  const previousState = historyStore.undo(excelStore.activeWorksheet)
  if (previousState) {
    // 更新Excel状态
    excelStore.activeWorksheet.data = previousState.data
    excelStore.activeWorksheet.dimensions = previousState.dimensions
  }
}

const handleRedo = () => {
  if (!excelStore.activeWorksheet) return
  
  const nextState = historyStore.redo(excelStore.activeWorksheet)
  if (nextState) {
    // 更新Excel状态
    excelStore.activeWorksheet.data = nextState.data
    excelStore.activeWorksheet.dimensions = nextState.dimensions
  }
}

// 监听Excel数据变化，自动保存历史状态
watch(() => excelStore.activeWorksheet?.data, (newData, oldData) => {
  if (newData && oldData && JSON.stringify(newData) !== JSON.stringify(oldData)) {
    historyStore.saveState(excelStore.activeWorksheet!)
  }
}, { deep: true })
</script>

<style scoped>
.history-toolbar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  min-height: 32px;
  flex-wrap: nowrap;
  overflow-x: auto;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.history-toolbar::-webkit-scrollbar {
  height: 2px;
}

.history-toolbar::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 1px;
}

.toolbar-icon {
  width: 12px;
  height: 12px;
  font-size: 12px;
}

.history-info {
  display: flex;
  gap: 6px;
  font-size: 11px;
  color: #666666;
  white-space: nowrap;
  margin-left: auto;
}

.history-info span {
  padding: 2px 6px;
  background: #ffffff;
  border-radius: 3px;
  border: 1px solid #d0d0d0;
  font-weight: 500;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
}

.el-button-group {
  display: flex;
  gap: 2px;
}

.el-button {
  padding: 2px 6px;
  font-size: 10px;
  border-radius: 2px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
  transition: all 0.15s;
}

.el-button:hover:not(.is-disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.1);
}
</style>