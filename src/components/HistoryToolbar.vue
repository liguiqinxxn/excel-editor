<template>
  <div class="history-toolbar">
    <el-button-group>
      <el-button 
        :disabled="!canUndo" 
        @click="handleUndo"
        title="撤销 (Ctrl+Z)"
      >
        <el-icon><RefreshLeft /></el-icon> 撤销
      </el-button>
      <el-button 
        :disabled="!canRedo" 
        @click="handleRedo"
        title="重做 (Ctrl+Y)"
      >
        <el-icon><RefreshRight /></el-icon> 重做
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
  gap: 16px;
  padding: 8px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.history-info {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #909399;
}

.history-info span {
  padding: 2px 6px;
  background: #fff;
  border-radius: 3px;
}
</style>