<template>
  <div class="excel-editor">
    <!-- PC端顶部导航栏 -->
    <div class="editor-header">
      <div class="header-left">
        <button @click="goBack" class="back-button">
          <span class="icon">←</span>
          返回
        </button>
        <h1 class="editor-title">Excel编辑器</h1>
        <div class="file-info" v-if="currentFile">
          <span class="file-name">{{ currentFile.name }}</span>
          <span class="file-status" :class="{ modified: hasUnsavedChanges }">
            {{ hasUnsavedChanges ? '已修改' : '已保存' }}
          </span>
        </div>
      </div>
      <div class="header-right">
        <div class="header-actions">
          <button @click="saveFile" class="action-button primary" :disabled="!hasUnsavedChanges">
            <span class="icon">💾</span>
            保存
          </button>
          <button @click="saveAs" class="action-button">
            <span class="icon">📋</span>
            另存为
          </button>
          <button @click="printFile" class="action-button">
            <span class="icon">🖨️</span>
            打印
          </button>
          <div class="user-menu">
            <button class="user-button">
              <span class="user-avatar">👤</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 历史工具栏 -->
    <HistoryToolbar />
    
    <!-- 使用新的工具栏组件 -->
    <Toolbar />

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="!hasFile" class="empty-state">
      <div class="empty-content">
        <h3>Excel在线编辑器</h3>
        <p>支持Excel文件的导入、编辑和导出功能</p>
        <div class="empty-actions">
          <button @click="triggerFileInput" class="primary-button">
            <span class="icon">📁</span>
            打开Excel文件
          </button>
          <button @click="createNewFile" class="secondary-button">
            <span class="icon">📄</span>
            创建新文件
          </button>
        </div>
        <div class="supported-formats">
          <p>支持格式: .xlsx, .xls</p>
        </div>
      </div>
    </div>

    <div v-else class="editor-content">
      <!-- 工作表标签 -->
      <div class="sheet-tabs">
        <button 
          v-for="(worksheet, index) in currentFile?.worksheets" 
          :key="index"
          :class="{ 
            active: currentFile?.activeSheetIndex === index,
            modified: hasWorksheetChanges(index)
          }"
          @click="switchWorksheet(index)"
          class="sheet-tab"
        >
          <span class="sheet-name">{{ worksheet.name }}</span>
          <span v-if="hasWorksheetChanges(index)" class="modified-indicator">●</span>
          <button 
            v-if="currentFile!.worksheets.length > 1"
            @click.stop="deleteWorksheet(index)"
            class="delete-sheet"
            title="删除工作表"
          >
            ×
          </button>
        </button>
        <button @click="addWorksheet" class="add-sheet" title="添加工作表">
          +
        </button>
      </div>

      <!-- 主内容区域 -->
      <div class="main-content">
        <!-- 使用新的表格组件 -->
        <div class="table-area">
          <ExcelTable 
            v-if="activeWorksheet"
            :data="activeWorksheet.data"
            :dimensions="activeWorksheet.dimensions"
            @cell-update="handleCellUpdate"
          />
        </div>
        
        <!-- 侧边面板 -->
        <div class="side-panels">
          <el-tabs type="border-card" class="panel-tabs">
            <el-tab-pane label="属性">
              <PropertyPanel />
            </el-tab-pane>
            <el-tab-pane label="验证">
              <ValidationPanel />
            </el-tab-pane>
            <el-tab-pane label="筛选">
              <FilterPanel />
            </el-tab-pane>
            <el-tab-pane label="图表">
              <ChartGenerator />
            </el-tab-pane>
            <el-tab-pane label="透视表">
              <PivotTable />
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>

      <!-- 状态栏 -->
      <div class="status-bar">
        <div class="status-left">
          <span class="cell-count">
            单元格: {{ getSelectedCellCount() }}
          </span>
          <span class="formula-display" v-if="currentFormula">
            公式: {{ currentFormula }}
          </span>
        </div>
        <div class="status-right">
          <span class="zoom-level">100%</span>
          <span class="edit-mode" :class="{ modified: hasUnsavedChanges }">
            {{ hasUnsavedChanges ? '已修改' : '已保存' }}
          </span>
        </div>
      </div>
    </div>

    <!-- 隐藏的文件输入 -->
    <input 
      type="file" 
      ref="fileInput"
      accept=".xlsx,.xls" 
      @change="handleFileUpload"
      style="display: none"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useExcelStore } from '@/stores/excel'
import { useHistoryStore } from '@/stores/history'
import Toolbar from '@/components/Toolbar.vue'
import ExcelTable from '@/components/ExcelTable.vue'
import HistoryToolbar from '@/components/HistoryToolbar.vue'
import PropertyPanel from '@/components/PropertyPanel.vue'
import ValidationPanel from '@/components/ValidationPanel.vue'
import FilterPanel from '@/components/FilterPanel.vue'
import ChartGenerator from '@/components/ChartGenerator.vue'
import PivotTable from '@/components/PivotTable.vue'

const router = useRouter()
const fileInput = ref<HTMLInputElement>()
const excelStore = useExcelStore()
const historyStore = useHistoryStore()

// 响应式数据
const hasUnsavedChanges = ref(false)
const currentFormula = ref('')
const worksheetChanges = ref<Set<number>>(new Set())

// 计算属性
const isLoading = computed(() => excelStore.isLoading)
const error = computed(() => excelStore.error)
const hasFile = computed(() => excelStore.hasFile)
const currentFile = computed(() => excelStore.currentFile)
const activeWorksheet = computed(() => excelStore.activeWorksheet)

// 方法
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    excelStore.loadExcelFile(file).then(() => {
      hasUnsavedChanges.value = false
      worksheetChanges.value.clear()
    })
    target.value = ''
  }
}

const createNewFile = () => {
  // 创建新的空白Excel文件
  const blankWorksheet = {
    name: 'Sheet1',
    data: [[]],
    dimensions: { rows: 1, cols: 1 }
  }
  
  excelStore.currentFile = {
    name: '新文件.xlsx',
    worksheets: [blankWorksheet],
    activeSheetIndex: 0
  }
  
  hasUnsavedChanges.value = true
}

const switchWorksheet = (index: number) => {
  excelStore.switchWorksheet(index)
}

const addWorksheet = () => {
  if (!currentFile.value) return
  
  const newSheetName = `Sheet${currentFile.value.worksheets.length + 1}`
  const newWorksheet = {
    name: newSheetName,
    data: [[]],
    dimensions: { rows: 1, cols: 1 }
  }
  
  currentFile.value.worksheets.push(newWorksheet)
  currentFile.value.activeSheetIndex = currentFile.value.worksheets.length - 1
  hasUnsavedChanges.value = true
}

const deleteWorksheet = (index: number) => {
  if (!currentFile.value || currentFile.value.worksheets.length <= 1) return
  
  currentFile.value.worksheets.splice(index, 1)
  if (currentFile.value.activeSheetIndex >= index) {
    currentFile.value.activeSheetIndex = Math.max(0, currentFile.value.activeSheetIndex - 1)
  }
  hasUnsavedChanges.value = true
  worksheetChanges.value.delete(index)
}

const hasWorksheetChanges = (index: number): boolean => {
  return worksheetChanges.value.has(index)
}

const handleCellUpdate = (row: number, col: number, value: string) => {
  if (!activeWorksheet.value) return
  
  // 保存当前状态到历史记录
  historyStore.saveState(activeWorksheet.value)
  
  excelStore.updateCellValue(row, col, value)
  hasUnsavedChanges.value = true
  
  // 标记工作表有修改
  if (currentFile.value) {
    worksheetChanges.value.add(currentFile.value.activeSheetIndex)
  }
}

const getSelectedCellCount = (): string => {
  // 简化实现，实际应该根据选择状态计算
  return activeWorksheet.value ? 
    `${activeWorksheet.value.dimensions.rows} × ${activeWorksheet.value.dimensions.cols}` : 
    '0 × 0'
}

// 新增方法
const goBack = () => {
  router.push('/')
}

const saveFile = () => {
  console.log('保存文件')
  hasUnsavedChanges.value = false
  worksheetChanges.value.clear()
}

const saveAs = () => {
  console.log('另存为文件')
}

const printFile = () => {
  console.log('打印文件')
}

// 键盘快捷键
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.ctrlKey || event.metaKey) {
    switch (event.key) {
      case 's':
        event.preventDefault()
        saveFile()
        break
      case 'o':
        event.preventDefault()
        triggerFileInput()
        break
      case 'n':
        event.preventDefault()
        createNewFile()
        break
    }
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.excel-editor {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
}

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 12px 16px;
  border-radius: 4px;
  margin: 8px 16px;
  border-left: 4px solid #c62828;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  margin: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-content {
  text-align: center;
  max-width: 400px;
  padding: 40px;
}

.empty-content h3 {
  font-size: 24px;
  color: #333;
  margin-bottom: 12px;
  font-weight: 600;
}

.empty-content p {
  color: #666;
  margin-bottom: 24px;
  line-height: 1.5;
}

.empty-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 24px;
}

.primary-button {
  padding: 12px 24px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.primary-button:hover {
  background: #1565c0;
}

.secondary-button {
  padding: 12px 24px;
  background: white;
  color: #1976d2;
  border: 1px solid #1976d2;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.secondary-button:hover {
  background: #f5f5f5;
}

.supported-formats {
  color: #999;
  font-size: 12px;
}

.editor-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  margin: 0 16px 16px 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  height: calc(100vh - 200px);
}

.table-area {
  flex: 1;
  overflow: auto;
}

.side-panels {
  width: 400px;
  border-left: 1px solid #e0e0e0;
  background: #fafafa;
}

.panel-tabs {
  height: 100%;
}

.panel-tabs .el-tabs__content {
  padding: 0;
  height: calc(100% - 40px);
  overflow: auto;
}

.sheet-tabs {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  padding: 0 16px;
  min-height: 48px;
  flex-shrink: 0;
}

.sheet-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  background: transparent;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: all 0.2s;
  position: relative;
}

.sheet-tab:hover {
  background: #e9ecef;
}

.sheet-tab.active {
  color: #1976d2;
  border-bottom-color: #1976d2;
  background: white;
}

.sheet-tab.modified .sheet-name {
  font-style: italic;
}

.modified-indicator {
  color: #ff6b6b;
  font-size: 16px;
}

.delete-sheet {
  padding: 2px 6px;
  border: none;
  background: transparent;
  color: #999;
  cursor: pointer;
  border-radius: 3px;
  font-size: 14px;
  line-height: 1;
}

.delete-sheet:hover {
  background: #ff6b6b;
  color: white;
}

.add-sheet {
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: #666;
  cursor: pointer;
  border-radius: 4px;
  font-size: 18px;
  font-weight: bold;
  margin-left: 8px;
}

.add-sheet:hover {
  background: #e9ecef;
  color: #1976d2;
}

.table-area {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: #f8f9fa;
  border-top: 1px solid #e0e0e0;
  font-size: 12px;
  color: #666;
  min-height: 32px;
  flex-shrink: 0;
}

.status-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.cell-count {
  font-weight: 500;
}

.formula-display {
  background: white;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  font-family: 'Courier New', monospace;
}

.status-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.zoom-level {
  padding: 4px 8px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.edit-mode {
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.edit-mode.modified {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .empty-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .sheet-tabs {
    padding: 0 8px;
    overflow-x: auto;
  }
  
  .status-bar {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
  
  .status-right {
    align-self: flex-end;
  }
}
</style>