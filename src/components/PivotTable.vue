<template>
  <div class="pivot-table">
    <div class="panel-header">
      <h3>数据透视表</h3>
      <el-button type="primary" size="small" @click="showCreateDialog = true">
        <el-icon><Plus /></el-icon> 新建透视表
      </el-button>
    </div>

    <div class="pivot-list">
      <div 
        v-for="pivot in pivotStore.pivotTables" 
        :key="pivot.config.id" 
        class="pivot-item"
        @click="selectPivot(pivot)"
      >
        <div class="pivot-info">
          <h4>{{ pivot.config.name }}</h4>
          <div class="pivot-details">
            <span>行: {{ pivot.config.rows.length }}</span>
            <span>列: {{ pivot.config.columns.length }}</span>
            <span>值: {{ pivot.config.values.length }}</span>
          </div>
          <div class="pivot-range">{{ pivot.config.dataRange }}</div>
        </div>
        <div class="pivot-actions">
          <el-button link type="primary" @click.stop="editPivot(pivot)">编辑</el-button>
          <el-button link type="danger" @click.stop="deletePivot(pivot.config.id)">删除</el-button>
        </div>
      </div>
    </div>

    <!-- 数据透视表预览 -->
    <div v-if="pivotStore.activePivot" class="pivot-preview">
      <h4>{{ pivotStore.activePivot.config.name }}</h4>
      <div class="table-container">
        <table class="pivot-data">
          <thead>
            <tr>
              <th v-for="(header, index) in pivotStore.activePivot.data[0]" :key="index">
                {{ header }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, rowIndex) in pivotStore.activePivot.data.slice(1)" :key="rowIndex">
              <td v-for="(cell, cellIndex) in row" :key="cellIndex">
                {{ cell }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 创建/编辑数据透视表对话框 -->
    <el-dialog 
      v-model="showCreateDialog" 
      :title="editingPivot ? '编辑数据透视表' : '新建数据透视表'"
      width="700px"
    >
      <el-form :model="pivotForm" label-width="100px">
        <el-form-item label="透视表名称">
          <el-input v-model="pivotForm.name" placeholder="输入透视表名称" />
        </el-form-item>

        <el-form-item label="数据范围">
          <el-input v-model="pivotForm.dataRange" placeholder="例如: A1:D100" />
        </el-form-item>

        <el-form-item label="行字段">
          <el-select v-model="pivotForm.rows" multiple placeholder="选择行字段">
            <el-option 
              v-for="col in availableColumns" 
              :key="col.index" 
              :label="`列 ${col.index + 1}`" 
              :value="col.index"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="列字段">
          <el-select v-model="pivotForm.columns" multiple placeholder="选择列字段">
            <el-option 
              v-for="col in availableColumns" 
              :key="col.index" 
              :label="`列 ${col.index + 1}`" 
              :value="col.index"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="值字段">
          <el-select v-model="pivotForm.values" multiple placeholder="选择值字段">
            <el-option 
              v-for="col in availableColumns" 
              :key="col.index" 
              :label="`列 ${col.index + 1}`" 
              :value="col.index"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="聚合方式">
          <el-select v-model="pivotForm.aggregation" placeholder="选择聚合方式">
            <el-option label="求和" value="sum" />
            <el-option label="平均值" value="average" />
            <el-option label="计数" value="count" />
            <el-option label="最大值" value="max" />
            <el-option label="最小值" value="min" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="savePivot">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import { usePivotStore } from '@/stores/pivot'
import { useExcelStore } from '@/stores/excel'
import { ref, reactive, computed } from 'vue'

const pivotStore = usePivotStore()
const excelStore = useExcelStore()

const showCreateDialog = ref(false)
const editingPivot = ref(null)

const pivotForm = reactive({
  id: '',
  name: '',
  dataRange: '',
  rows: [],
  columns: [],
  values: [],
  aggregation: 'sum'
})

const availableColumns = computed(() => {
  if (!excelStore.activeWorksheet) return []
  const cols = excelStore.activeWorksheet.dimensions.cols
  return Array.from({ length: cols }, (_, i) => ({ index: i }))
})

const selectPivot = (pivot: any) => {
  pivotStore.activePivot = pivot
}

const editPivot = (pivot: any) => {
  editingPivot.value = pivot
  Object.assign(pivotForm, pivot.config)
  showCreateDialog.value = true
}

const deletePivot = (pivotId: string) => {
  pivotStore.deletePivotTable(pivotId)
}

const savePivot = () => {
  const pivotData = { ...pivotForm }

  if (editingPivot.value) {
    pivotStore.updatePivotTable(pivotData.id, pivotData as any, excelStore.activeWorksheet!)
  } else {
    pivotData.id = Date.now().toString()
    pivotStore.createPivotTable(pivotData as any, excelStore.activeWorksheet!)
  }

  showCreateDialog.value = false
  resetForm()
}

const resetForm = () => {
  Object.assign(pivotForm, {
    id: '',
    name: '',
    dataRange: '',
    rows: [],
    columns: [],
    values: [],
    aggregation: 'sum'
  })
  editingPivot.value = null
}
</script>

<style scoped>
.pivot-table {
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

.pivot-list {
  margin-bottom: 20px;
}

.pivot-item {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pivot-item:hover {
  border-color: #409EFF;
  background: #f5f7fa;
}

.pivot-info h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #303133;
}

.pivot-details {
  display: flex;
  gap: 12px;
  margin-bottom: 4px;
}

.pivot-details span {
  font-size: 12px;
  color: #909399;
  background: #ecf5ff;
  padding: 2px 6px;
  border-radius: 3px;
}

.pivot-range {
  font-size: 12px;
  color: #c0c4cc;
}

.pivot-actions {
  display: flex;
  gap: 8px;
}

.pivot-preview {
  border-top: 1px solid #e4e7ed;
  padding-top: 16px;
}

.pivot-preview h4 {
  margin: 0 0 12px 0;
  color: #606266;
}

.table-container {
  max-height: 300px;
  overflow: auto;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.pivot-data {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.pivot-data th,
.pivot-data td {
  border: 1px solid #e4e7ed;
  padding: 6px 8px;
  text-align: center;
}

.pivot-data th {
  background: #f5f7fa;
  font-weight: 600;
}

.pivot-data tr:nth-child(even) {
  background: #fafafa;
}
</style>