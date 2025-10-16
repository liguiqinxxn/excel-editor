<template>
  <div class="cell-formatting">
    <!-- 字体设置 -->
    <div class="format-section">
      <h4>字体设置</h4>
      <div class="format-controls">
        <div class="control-group">
          <label>字体:</label>
          <select v-model="fontFamily" class="format-select">
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Calibri">Calibri</option>
            <option value="Verdana">Verdana</option>
            <option value="Microsoft YaHei">微软雅黑</option>
            <option value="SimSun">宋体</option>
          </select>
        </div>
        <div class="control-group">
          <label>字号:</label>
          <select v-model="fontSize" class="format-select">
            <option v-for="size in [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72]" 
                    :key="size" :value="size">{{ size }}</option>
          </select>
        </div>
        <div class="control-group">
          <label>颜色:</label>
          <input type="color" v-model="fontColor" class="color-picker">
          <span class="color-preview" :style="{ backgroundColor: fontColor }"></span>
        </div>
      </div>
      <div class="font-style-buttons">
        <button @click="toggleBold" :class="{ active: isBold }" class="style-button">
          <strong>B</strong>
        </button>
        <button @click="toggleItalic" :class="{ active: isItalic }" class="style-button">
          <em>I</em>
        </button>
        <button @click="toggleUnderline" :class="{ active: isUnderline }" class="style-button">
          <u>U</u>
        </button>
        <button @click="toggleStrikethrough" :class="{ active: isStrikethrough }" class="style-button">
          <s>S</s>
        </button>
      </div>
    </div>

    <!-- 对齐方式 -->
    <div class="format-section">
      <h4>对齐方式</h4>
      <div class="alignment-controls">
        <div class="alignment-group">
          <label>水平对齐:</label>
          <div class="alignment-buttons">
            <button @click="setHorizontalAlign('left')" :class="{ active: horizontalAlign === 'left' }" 
                    class="alignment-button" title="左对齐">
              <span class="icon">◀</span>
            </button>
            <button @click="setHorizontalAlign('center')" :class="{ active: horizontalAlign === 'center' }" 
                    class="alignment-button" title="居中">
              <span class="icon">●</span>
            </button>
            <button @click="setHorizontalAlign('right')" :class="{ active: horizontalAlign === 'right' }" 
                    class="alignment-button" title="右对齐">
              <span class="icon">▶</span>
            </button>
            <button @click="setHorizontalAlign('justify')" :class="{ active: horizontalAlign === 'justify' }" 
                    class="alignment-button" title="两端对齐">
              <span class="icon">↔</span>
            </button>
          </div>
        </div>
        <div class="alignment-group">
          <label>垂直对齐:</label>
          <div class="alignment-buttons">
            <button @click="setVerticalAlign('top')" :class="{ active: verticalAlign === 'top' }" 
                    class="alignment-button" title="顶端对齐">
              <span class="icon">↑</span>
            </button>
            <button @click="setVerticalAlign('middle')" :class="{ active: verticalAlign === 'middle' }" 
                    class="alignment-button" title="垂直居中">
              <span class="icon">●</span>
            </button>
            <button @click="setVerticalAlign('bottom')" :class="{ active: verticalAlign === 'bottom' }" 
                    class="alignment-button" title="底端对齐">
              <span class="icon">↓</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 边框设置 -->
    <div class="format-section">
      <h4>边框设置</h4>
      <div class="border-controls">
        <div class="border-style">
          <label>边框样式:</label>
          <select v-model="borderStyle" class="format-select">
            <option value="none">无边框</option>
            <option value="solid">实线</option>
            <option value="dashed">虚线</option>
            <option value="dotted">点线</option>
            <option value="double">双线</option>
          </select>
        </div>
        <div class="border-color">
          <label>边框颜色:</label>
          <input type="color" v-model="borderColor" class="color-picker">
        </div>
        <div class="border-width">
          <label>边框宽度:</label>
          <select v-model="borderWidth" class="format-select">
            <option value="1px">细线</option>
            <option value="2px">中等</option>
            <option value="3px">粗线</option>
          </select>
        </div>
        <div class="border-preview">
          <div class="preview-box" :style="borderPreviewStyle"></div>
        </div>
      </div>
    </div>

    <!-- 背景色 -->
    <div class="format-section">
      <h4>背景色</h4>
      <div class="background-controls">
        <input type="color" v-model="backgroundColor" class="color-picker large">
        <div class="color-options">
          <div v-for="color in presetColors" :key="color" 
               class="color-option" :style="{ backgroundColor: color }"
               @click="backgroundColor = color">
          </div>
        </div>
        <button @click="clearBackground" class="clear-button">
          清除背景
        </button>
      </div>
    </div>

    <!-- 数字格式 -->
    <div class="format-section">
      <h4>数字格式</h4>
      <div class="number-format-controls">
        <select v-model="numberFormat" class="format-select">
          <option value="general">常规</option>
          <option value="number">数字</option>
          <option value="currency">货币</option>
          <option value="percentage">百分比</option>
          <option value="date">日期</option>
          <option value="time">时间</option>
          <option value="scientific">科学计数</option>
          <option value="text">文本</option>
        </select>
        <div v-if="numberFormat === 'currency'" class="currency-settings">
          <label>货币符号:</label>
          <select v-model="currencySymbol" class="format-select">
            <option value="¥">¥ 人民币</option>
            <option value="$">$ 美元</option>
            <option value="€">€ 欧元</option>
            <option value="£">£ 英镑</option>
          </select>
        </div>
        <div v-if="numberFormat === 'number' || numberFormat === 'currency'" class="decimal-settings">
          <label>小数位数:</label>
          <input type="number" v-model.number="decimalPlaces" min="0" max="6" class="decimal-input">
        </div>
      </div>
    </div>

    <!-- 应用按钮 -->
    <div class="format-actions">
      <button @click="applyFormatting" class="apply-button">
        应用格式
      </button>
      <button @click="clearFormatting" class="clear-button">
        清除格式
      </button>
      <button @click="copyFormatting" class="copy-button">
        复制格式
      </button>
      <button @click="pasteFormatting" class="paste-button" :disabled="!copiedFormat">
        粘贴格式
      </button>
    </div>

    <!-- 格式预览 -->
    <div class="format-preview" v-if="previewText">
      <h4>格式预览</h4>
      <div class="preview-content" :style="previewStyle">
        {{ previewText }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useExcelStore } from '@/stores/excel'

const excelStore = useExcelStore()

// 字体设置
const fontFamily = ref('Arial')
const fontSize = ref(11)
const fontColor = ref('#000000')
const isBold = ref(false)
const isItalic = ref(false)
const isUnderline = ref(false)
const isStrikethrough = ref(false)

// 对齐方式
const horizontalAlign = ref('left')
const verticalAlign = ref('middle')

// 边框设置
const borderStyle = ref('none')
const borderColor = ref('#000000')
const borderWidth = ref('1px')

// 背景色
const backgroundColor = ref('#ffffff')
const presetColors = ref([
  '#ffffff', '#ffebee', '#f3e5f5', '#e8eaf6', '#e3f2fd',
  '#e0f2f1', '#f1f8e9', '#fffde7', '#fff3e0', '#fafafa'
])

// 数字格式
const numberFormat = ref('general')
const currencySymbol = ref('¥')
const decimalPlaces = ref(2)

// 格式复制
const copiedFormat = ref<any>(null)

// 预览文本
const previewText = ref('格式预览文本')

// 计算属性
const borderPreviewStyle = computed(() => ({
  borderStyle: borderStyle.value,
  borderColor: borderColor.value,
  borderWidth: borderWidth.value
}))

const previewStyle = computed(() => ({
  fontFamily: fontFamily.value,
  fontSize: `${fontSize.value}px`,
  color: fontColor.value,
  fontWeight: isBold.value ? 'bold' : 'normal',
  fontStyle: isItalic.value ? 'italic' : 'normal',
  textDecoration: [
    isUnderline.value ? 'underline' : '',
    isStrikethrough.value ? 'line-through' : ''
  ].filter(Boolean).join(' ') || 'none',
  textAlign: horizontalAlign.value as any,
  verticalAlign: verticalAlign.value as any,
  backgroundColor: backgroundColor.value,
  border: borderStyle.value !== 'none' ? 
    `${borderWidth.value} ${borderStyle.value} ${borderColor.value}` : 'none',
  padding: '8px',
  borderRadius: '4px'
}))

// 方法
const toggleBold = () => {
  isBold.value = !isBold.value
}

const toggleItalic = () => {
  isItalic.value = !isItalic.value
}

const toggleUnderline = () => {
  isUnderline.value = !isUnderline.value
}

const toggleStrikethrough = () => {
  isStrikethrough.value = !isStrikethrough.value
}

const setHorizontalAlign = (align: string) => {
  horizontalAlign.value = align
}

const setVerticalAlign = (align: string) => {
  verticalAlign.value = align
}

const clearBackground = () => {
  backgroundColor.value = '#ffffff'
}

const applyFormatting = () => {
  const formatting = {
    fontFamily: fontFamily.value,
    fontSize: fontSize.value,
    fontColor: fontColor.value,
    isBold: isBold.value,
    isItalic: isItalic.value,
    isUnderline: isUnderline.value,
    isStrikethrough: isStrikethrough.value,
    horizontalAlign: horizontalAlign.value,
    verticalAlign: verticalAlign.value,
    borderStyle: borderStyle.value,
    borderColor: borderColor.value,
    borderWidth: borderWidth.value,
    backgroundColor: backgroundColor.value,
    numberFormat: numberFormat.value,
    currencySymbol: currencySymbol.value,
    decimalPlaces: decimalPlaces.value
  }
  
  console.log('应用格式:', formatting)
  // 实现应用格式逻辑
}

const clearFormatting = () => {
  // 重置所有格式
  fontFamily.value = 'Arial'
  fontSize.value = 11
  fontColor.value = '#000000'
  isBold.value = false
  isItalic.value = false
  isUnderline.value = false
  isStrikethrough.value = false
  horizontalAlign.value = 'left'
  verticalAlign.value = 'middle'
  borderStyle.value = 'none'
  borderColor.value = '#000000'
  borderWidth.value = '1px'
  backgroundColor.value = '#ffffff'
  numberFormat.value = 'general'
  currencySymbol.value = '¥'
  decimalPlaces.value = 2
}

const copyFormatting = () => {
  copiedFormat.value = {
    fontFamily: fontFamily.value,
    fontSize: fontSize.value,
    fontColor: fontColor.value,
    isBold: isBold.value,
    isItalic: isItalic.value,
    isUnderline: isUnderline.value,
    isStrikethrough: isStrikethrough.value,
    horizontalAlign: horizontalAlign.value,
    verticalAlign: verticalAlign.value,
    borderStyle: borderStyle.value,
    borderColor: borderColor.value,
    borderWidth: borderWidth.value,
    backgroundColor: backgroundColor.value,
    numberFormat: numberFormat.value,
    currencySymbol: currencySymbol.value,
    decimalPlaces: decimalPlaces.value
  }
  console.log('格式已复制')
}

const pasteFormatting = () => {
  if (copiedFormat.value) {
    fontFamily.value = copiedFormat.value.fontFamily
    fontSize.value = copiedFormat.value.fontSize
    fontColor.value = copiedFormat.value.fontColor
    isBold.value = copiedFormat.value.isBold
    isItalic.value = copiedFormat.value.isItalic
    isUnderline.value = copiedFormat.value.isUnderline
    isStrikethrough.value = copiedFormat.value.isStrikethrough
    horizontalAlign.value = copiedFormat.value.horizontalAlign
    verticalAlign.value = copiedFormat.value.verticalAlign
    borderStyle.value = copiedFormat.value.borderStyle
    borderColor.value = copiedFormat.value.borderColor
    borderWidth.value = copiedFormat.value.borderWidth
    backgroundColor.value = copiedFormat.value.backgroundColor
    numberFormat.value = copiedFormat.value.numberFormat
    currencySymbol.value = copiedFormat.value.currencySymbol
    decimalPlaces.value = copiedFormat.value.decimalPlaces
    console.log('格式已粘贴')
  }
}

// 监听变化更新预览
watch([fontFamily, fontSize, fontColor, isBold, isItalic, isUnderline, isStrikethrough,
       horizontalAlign, verticalAlign, borderStyle, borderColor, borderWidth, backgroundColor], 
() => {
  // 预览自动更新
})
</script>

<style scoped>
.cell-formatting {
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-height: 500px;
  overflow-y: auto;
}

.format-section {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.format-section:last-child {
  margin-bottom: 0;
  border-bottom: none;
}

.format-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.format-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.control-group label {
  font-size: 12px;
  color: #666;
}

.format-select {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
}

.color-picker {
  width: 100%;
  height: 30px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.color-picker.large {
  height: 40px;
}

.color-preview {
  width: 20px;
  height: 20px;
  border: 1px solid #ddd;
  border-radius: 2px;
}

.font-style-buttons {
  display: flex;
  gap: 4px;
}

.style-button {
  padding: 6px 10px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.style-button:hover {
  background: #f5f5f5;
}

.style-button.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.alignment-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alignment-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.alignment-group label {
  font-size: 12px;
  color: #666;
  min-width: 60px;
}

.alignment-buttons {
  display: flex;
  gap: 4px;
}

.alignment-button {
  padding: 6px 10px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.alignment-button:hover {
  background: #f5f5f5;
}

.alignment-button.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.border-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.border-preview {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60px;
}

.preview-box {
  width: 80px;
  height: 40px;
  background: #f8f9fa;
}

.background-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.color-options {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 4px;
}

.color-option {
  width: 20px;
  height: 20px;
  border: 1px solid #ddd;
  border-radius: 2px;
  cursor: pointer;
  transition: transform 0.2s;
}

.color-option:hover {
  transform: scale(1.1);
}

.number-format-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.currency-settings,
.decimal-settings {
  display: flex;
  align-items: center;
  gap: 8px;
}

.decimal-input {
  width: 60px;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.format-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-top: 16px;
}

.apply-button,
.clear-button,
.copy-button,
.paste-button {
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.apply-button {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.apply-button:hover {
  background: #0056b3;
}

.clear-button:hover,
.copy-button:hover,
.paste-button:hover:not(:disabled) {
  background: #f5f5f5;
}

.paste-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.format-preview {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.format-preview h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.preview-content {
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ddd;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .format-controls {
    grid-template-columns: 1fr;
  }
  
  .border-controls {
    grid-template-columns: 1fr;
  }
  
  .format-actions {
    grid-template-columns: 1fr;
  }
}
</style>