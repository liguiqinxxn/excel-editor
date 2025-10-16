<template>
  <div class="property-panel">
    <div class="panel-header">
      <h3>单元格属性</h3>
    </div>
    
    <div class="property-content">
      <div class="property-section">
        <h4>字体</h4>
        <div class="property-group">
          <el-checkbox v-model="fontProps.bold">粗体</el-checkbox>
          <el-checkbox v-model="fontProps.italic">斜体</el-checkbox>
          <el-input v-model="fontProps.size" placeholder="字号" size="small" />
          <el-color-picker v-model="fontProps.color" show-alpha />
        </div>
      </div>
      
      <div class="property-section">
        <h4>对齐</h4>
        <div class="property-group">
          <el-radio-group v-model="alignmentProps.horizontal" size="small">
            <el-radio-button label="left">左对齐</el-radio-button>
            <el-radio-button label="center">居中</el-radio-button>
            <el-radio-button label="right">右对齐</el-radio-button>
          </el-radio-group>
        </div>
      </div>
      
      <div class="property-section">
        <h4>背景色</h4>
        <el-color-picker v-model="backgroundColor" show-alpha />
      </div>
      
      <div class="property-section">
        <h4>边框</h4>
        <div class="property-group">
          <el-select v-model="borderStyle" placeholder="边框样式" size="small">
            <el-option label="无边框" value="none" />
            <el-option label="实线" value="solid" />
            <el-option label="虚线" value="dashed" />
          </el-select>
          <el-color-picker v-model="borderColor" show-alpha />
        </div>
      </div>
    </div>
    
    <div class="property-actions">
      <el-button type="primary" size="small" @click="applyProperties">应用</el-button>
      <el-button size="small" @click="resetProperties">重置</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const fontProps = reactive({
  bold: false,
  italic: false,
  size: '12',
  color: '#000000'
})

const alignmentProps = reactive({
  horizontal: 'left',
  vertical: 'middle'
})

const backgroundColor = ref('#ffffff')
const borderStyle = ref('none')
const borderColor = ref('#000000')

const applyProperties = () => {
  console.log('应用属性:', {
    font: fontProps,
    alignment: alignmentProps,
    backgroundColor: backgroundColor.value,
    border: {
      style: borderStyle.value,
      color: borderColor.value
    }
  })
}

const resetProperties = () => {
  Object.assign(fontProps, {
    bold: false,
    italic: false,
    size: '12',
    color: '#000000'
  })
  Object.assign(alignmentProps, {
    horizontal: 'left',
    vertical: 'middle'
  })
  backgroundColor.value = '#ffffff'
  borderStyle.value = 'none'
  borderColor.value = '#000000'
}
</script>

<style scoped>
.property-panel {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-header {
  margin-bottom: 16px;
}

.panel-header h3 {
  margin: 0;
  color: #303133;
  font-size: 16px;
}

.property-content {
  flex: 1;
  overflow-y: auto;
}

.property-section {
  margin-bottom: 20px;
}

.property-section h4 {
  margin: 0 0 8px 0;
  color: #606266;
  font-size: 14px;
  font-weight: 500;
}

.property-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.property-group > * {
  width: 100%;
}

.property-actions {
  display: flex;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
}

.property-actions .el-button {
  flex: 1;
}
</style>