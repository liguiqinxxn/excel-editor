<template>
  <div class="chart-generator">
    <div class="panel-header">
      <h3>图表生成器</h3>
      <el-button type="primary" size="small" @click="showCreateDialog = true">
        <el-icon><Plus /></el-icon> 新建图表
      </el-button>
    </div>

    <div class="charts-grid">
      <div 
        v-for="chart in chartStore.charts" 
        :key="chart.id" 
        class="chart-item"
        @click="selectChart(chart)"
      >
        <div class="chart-preview">
          <div class="chart-placeholder">
            {{ getChartIcon(chart.type) }}
          </div>
        </div>
        <div class="chart-info">
          <h4>{{ chart.title }}</h4>
          <span class="chart-type">{{ getChartTypeText(chart.type) }}</span>
          <span class="chart-range">{{ chart.dataRange }}</span>
        </div>
        <div class="chart-actions">
          <el-button link type="primary" @click.stop="editChart(chart)">编辑</el-button>
          <el-button link type="danger" @click.stop="deleteChart(chart.id)">删除</el-button>
        </div>
      </div>
    </div>

    <!-- 创建/编辑图表对话框 -->
    <el-dialog 
      v-model="showCreateDialog" 
      :title="editingChart ? '编辑图表' : '新建图表'"
      width="600px"
    >
      <el-form :model="chartForm" label-width="100px">
        <el-form-item label="图表标题">
          <el-input v-model="chartForm.title" placeholder="输入图表标题" />
        </el-form-item>

        <el-form-item label="图表类型">
          <el-select v-model="chartForm.type" placeholder="选择图表类型">
            <el-option label="柱状图" value="bar" />
            <el-option label="折线图" value="line" />
            <el-option label="饼图" value="pie" />
            <el-option label="散点图" value="scatter" />
            <el-option label="面积图" value="area" />
          </el-select>
        </el-form-item>

        <el-form-item label="数据范围">
          <el-input v-model="chartForm.dataRange" placeholder="例如: A1:B10" />
        </el-form-item>

        <el-form-item label="X轴列" v-if="chartForm.type === 'scatter'">
          <el-select v-model="chartForm.xAxisColumn" placeholder="选择X轴列">
            <el-option 
              v-for="col in availableColumns" 
              :key="col.index" 
              :label="`列 ${col.index + 1}`" 
              :value="col.index"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Y轴列">
          <el-select 
            v-model="chartForm.yAxisColumns" 
            multiple 
            placeholder="选择Y轴列"
          >
            <el-option 
              v-for="col in availableColumns" 
              :key="col.index" 
              :label="`列 ${col.index + 1}`" 
              :value="col.index"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="图表尺寸">
          <el-input-number v-model="chartForm.width" :min="300" :max="1200" /> ×
          <el-input-number v-model="chartForm.height" :min="200" :max="800" />
        </el-form-item>

        <el-form-item label="颜色方案">
          <div class="color-picker">
            <el-color-picker 
              v-for="(color, index) in chartForm.colors" 
              :key="index"
              v-model="chartForm.colors[index]"
              show-alpha
            />
            <el-button @click="addColor">添加颜色</el-button>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="saveChart">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import { useChartStore } from '@/stores/chart'
import { useExcelStore } from '@/stores/excel'
import { ref, reactive, computed } from 'vue'

const chartStore = useChartStore()
const excelStore = useExcelStore()

const showCreateDialog = ref(false)
const editingChart = ref(null)

const chartForm = reactive({
  id: '',
  type: 'bar',
  title: '',
  dataRange: '',
  xAxisColumn: 0,
  yAxisColumns: [],
  width: 600,
  height: 400,
  colors: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']
})

const availableColumns = computed(() => {
  if (!excelStore.activeWorksheet) return []
  const cols = excelStore.activeWorksheet.dimensions.cols
  return Array.from({ length: cols }, (_, i) => ({ index: i }))
})

const getChartIcon = (type: string) => {
  const icons = {
    bar: '📊',
    line: '📈',
    pie: '🥧',
    scatter: '🔍',
    area: '📉'
  }
  return icons[type as keyof typeof icons] || '📋'
}

const getChartTypeText = (type: string) => {
  const texts = {
    bar: '柱状图',
    line: '折线图',
    pie: '饼图',
    scatter: '散点图',
    area: '面积图'
  }
  return texts[type as keyof typeof texts] || type
}

const selectChart = (chart: any) => {
  chartStore.activeChart = chart
}

const editChart = (chart: any) => {
  editingChart.value = chart
  Object.assign(chartForm, chart)
  showCreateDialog.value = true
}

const deleteChart = (chartId: string) => {
  chartStore.deleteChart(chartId)
}

const addColor = () => {
  const defaultColors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']
  const randomColor = defaultColors[Math.floor(Math.random() * defaultColors.length)]
  chartForm.colors.push(randomColor!)
}

const saveChart = () => {
  const chartData = { ...chartForm }

  if (editingChart.value) {
    chartStore.updateChart(chartData.id, chartData as any)
  } else {
    chartData.id = Date.now().toString()
    chartStore.createChart(chartData as any)
  }

  showCreateDialog.value = false
  resetForm()
}

const resetForm = () => {
  Object.assign(chartForm, {
    id: '',
    type: 'bar',
    title: '',
    dataRange: '',
    xAxisColumn: 0,
    yAxisColumns: [],
    width: 600,
    height: 400,
    colors: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']
  })
  editingChart.value = null
}
</script>

<style scoped>
.chart-generator {
  padding: 16px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.panel-header h3 {
  margin: 0;
  color: #303133;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.chart-item {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.chart-item:hover {
  border-color: #409EFF;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.chart-preview {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 8px;
}

.chart-placeholder {
  font-size: 32px;
}

.chart-info h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #303133;
}

.chart-type, .chart-range {
  display: block;
  font-size: 12px;
  color: #909399;
  margin-bottom: 2px;
}

.chart-actions {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
  gap: 4px;
}

.color-picker {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}
</style>