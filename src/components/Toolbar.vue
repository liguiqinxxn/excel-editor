<template>
  <div class="toolbar">
    <!-- 文件操作 -->
    <div class="toolbar-section">
      <button @click="triggerFileInput" :disabled="isLoading" class="toolbar-button">
        <span class="icon">📁</span>
        {{ isLoading ? '加载中...' : '打开' }}
      </button>
      <button @click="exportExcel" :disabled="!hasFile" class="toolbar-button">
        <span class="icon">💾</span>
        保存
      </button>
      <button @click="newFile" class="toolbar-button">
        <span class="icon">📄</span>
        新建
      </button>
    </div>

    <!-- 编辑操作 -->
    <div class="toolbar-section" v-if="hasFile">
      <button @click="undo" :disabled="!canUndo" class="toolbar-button">
        <span class="icon">↶</span>
        撤销
      </button>
      <button @click="redo" :disabled="!canRedo" class="toolbar-button">
        <span class="icon">↷</span>
        重做
      </button>
      <button @click="copy" :disabled="!hasSelection" class="toolbar-button">
        <span class="icon">📋</span>
        复制
      </button>
      <button @click="paste" class="toolbar-button">
        <span class="icon">📝</span>
        粘贴
      </button>
    </div>

    <!-- 格式设置 -->
    <div class="toolbar-section" v-if="hasFile">
      <div class="toolbar-group">
        <label>字体:</label>
        <select v-model="fontFamily" class="toolbar-select">
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
          <option value="Microsoft YaHei">微软雅黑</option>
        </select>
      </div>
      
      <div class="toolbar-group">
        <label>字号:</label>
        <select v-model="fontSize" class="toolbar-select">
          <option value="12">12</option>
          <option value="14">14</option>
          <option value="16">16</option>
          <option value="18">18</option>
        </select>
      </div>

      <div class="toolbar-group">
        <button 
          @click="toggleBold" 
          :class="{ active: isBold }" 
          class="toolbar-button icon-only"
          title="加粗"
        >
          <span class="icon">𝐁</span>
        </button>
        <button 
          @click="toggleItalic" 
          :class="{ active: isItalic }" 
          class="toolbar-button icon-only"
          title="斜体"
        >
          <span class="icon">𝐼</span>
        </button>
        <button 
          @click="toggleUnderline" 
          :class="{ active: isUnderline }" 
          class="toolbar-button icon-only"
          title="下划线"
        >
          <span class="icon">𝐔</span>
        </button>
      </div>

      <div class="toolbar-group">
        <button 
          @click="alignLeft" 
          :class="{ active: alignment === 'left' }" 
          class="toolbar-button icon-only"
          title="左对齐"
        >
          <span class="icon">⎸</span>
        </button>
        <button 
          @click="alignCenter" 
          :class="{ active: alignment === 'center' }" 
          class="toolbar-button icon-only"
          title="居中对齐"
        >
          <span class="icon">⎹</span>
        </button>
        <button 
          @click="alignRight" 
          :class="{ active: alignment === 'right' }" 
          class="toolbar-button icon-only"
          title="右对齐"
        >
          <span class="icon">⎺</span>
        </button>
      </div>

      <div class="toolbar-group">
        <input 
          type="color" 
          v-model="fontColor" 
          class="color-picker"
          title="字体颜色"
        />
        <input 
          type="color" 
          v-model="backgroundColor" 
          class="color-picker"
          title="背景颜色"
        />
      </div>
    </div>

    <!-- 插入操作 -->
    <div class="toolbar-section" v-if="hasFile">
      <button @click="insertRow" class="toolbar-button">
        <span class="icon">⤵️</span>
        插入行
      </button>
      <button @click="insertColumn" class="toolbar-button">
        <span class="icon">⤴️</span>
        插入列
      </button>
      <button @click="deleteRow" :disabled="!hasSelection" class="toolbar-button">
        <span class="icon">🗑️</span>
        删除行
      </button>
      <button @click="deleteColumn" :disabled="!hasSelection" class="toolbar-button">
        <span class="icon">🗑️</span>
        删除列
      </button>
    </div>

    <!-- 文件信息 -->
    <div class="toolbar-section file-info" v-if="hasFile">
      <span class="file-name">{{ currentFile?.name }}</span>
      <span class="sheet-info">工作表: {{ activeWorksheet?.name }}</span>
      <span class="dimensions-info">
        {{ activeWorksheet?.dimensions.rows }}行 × {{ activeWorksheet?.dimensions.cols }}列
      </span>
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
import { ref, computed } from 'vue'
import { useExcelStore } from '@/stores/excel'

const fileInput = ref<HTMLInputElement>()
const excelStore = useExcelStore()

// 响应式数据
const fontFamily = ref('Arial')
const fontSize = ref('14')
const isBold = ref(false)
const isItalic = ref(false)
const isUnderline = ref(false)
const alignment = ref('left')
const fontColor = ref('#000000')
const backgroundColor = ref('#ffffff')

// 计算属性
const isLoading = computed(() => excelStore.isLoading)
const hasFile = computed(() => excelStore.hasFile)
const currentFile = computed(() => excelStore.currentFile)
const activeWorksheet = computed(() => excelStore.activeWorksheet)
const hasSelection = computed(() => false) // 暂时简化，实际应该根据选择状态计算
const canUndo = computed(() => false)
const canRedo = computed(() => false)

// 文件操作
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    excelStore.loadExcelFile(file)
    target.value = ''
  }
}

const exportExcel = () => {
  const blob = excelStore.exportExcelFile()
  if (blob) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = currentFile.value?.name || 'exported.xlsx'
    a.click()
    URL.revokeObjectURL(url)
  }
}

const newFile = () => {
  // 创建新的空白Excel文件
  console.log('创建新文件')
}

// 编辑操作
const undo = () => {
  console.log('撤销')
}

const redo = () => {
  console.log('重做')
}

const copy = () => {
  console.log('复制')
}

const paste = () => {
  console.log('粘贴')
}

// 格式设置
const toggleBold = () => {
  isBold.value = !isBold.value
}

const toggleItalic = () => {
  isItalic.value = !isItalic.value
}

const toggleUnderline = () => {
  isUnderline.value = !isUnderline.value
}

const alignLeft = () => {
  alignment.value = 'left'
}

const alignCenter = () => {
  alignment.value = 'center'
}

const alignRight = () => {
  alignment.value = 'right'
}

// 插入/删除操作
const insertRow = () => {
  console.log('插入行')
}

const insertColumn = () => {
  console.log('插入列')
}

const deleteRow = () => {
  console.log('删除行')
}

const deleteColumn = () => {
  console.log('删除列')
}
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  flex-wrap: wrap;
}

.toolbar-section {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 8px;
  border-right: 1px solid #e0e0e0;
}

.toolbar-group:last-child {
  border-right: none;
}

.toolbar-group label {
  font-size: 12px;
  color: #666;
  white-space: nowrap;
}

.toolbar-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
  white-space: nowrap;
}

.toolbar-button:hover:not(:disabled) {
  background: #e9ecef;
  border-color: #adb5bd;
}

.toolbar-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toolbar-button.active {
  background: #1976d2;
  color: white;
  border-color: #1976d2;
}

.toolbar-button.icon-only {
  padding: 6px;
  min-width: 32px;
  justify-content: center;
}

.icon {
  font-size: 14px;
  line-height: 1;
}

.toolbar-select {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  background: white;
  min-width: 80px;
}

.color-picker {
  width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  padding: 0;
}

.color-picker::-webkit-color-swatch {
  border: none;
  border-radius: 2px;
}

.color-picker::-webkit-color-swatch-wrapper {
  padding: 0;
}

.file-info {
  margin-left: auto;
  border-right: none;
  gap: 12px;
}

.file-name {
  font-weight: 600;
  color: #333;
}

.sheet-info,
.dimensions-info {
  font-size: 12px;
  color: #666;
}

@media (max-width: 1200px) {
  .toolbar {
    gap: 8px;
  }
  
  .toolbar-section {
    gap: 4px;
  }
  
  .file-info {
    display: none;
  }
}
</style>