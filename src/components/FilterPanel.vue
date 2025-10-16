<template>
  <div class="filter-panel">
    <div class="panel-header">
      <h3>筛选与排序</h3>
      <div class="actions">
        <el-button size="small" @click="addFilter">添加筛选</el-button>
        <el-button size="small" @click="addSort">添加排序</el-button>
        <el-button size="small" @click="clearAll">清空</el-button>
      </div>
    </div>

    <div class="filters-section">
      <h4>筛选条件</h4>
      <div v-for="(filter, index) in filterStore.filters" :key="index" class="filter-item">
        <el-select v-model="filter.column" placeholder="选择列" size="small">
          <el-option 
            v-for="col in availableColumns" 
            :key="col.index" 
            :label="`列 ${col.index + 1}`" 
            :value="col.index"
          />
        </el-select>
        <el-select v-model="filter.operator" placeholder="操作符" size="small">
          <el-option label="等于" value="equals" />
          <el-option label="包含" value="contains" />
          <el-option label="大于" value="greaterThan" />
          <el-option label="小于" value="lessThan" />
          <el-option label="介于" value="between" />
        </el-select>
        <el-input v-model="filter.value1" placeholder="值1" size="small" />
        <el-input 
          v-if="filter.operator === 'between'" 
          v-model="filter.value2" 
          placeholder="值2" 
          size="small" 
        />
        <el-button type="danger" size="small" @click="removeFilter(index)">
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
    </div>

    <div class="sort-section">
      <h4>排序条件</h4>
      <div v-for="(sort, index) in filterStore.sortConditions" :key="index" class="sort-item">
        <el-select v-model="sort.column" placeholder="选择列" size="small">
          <el-option 
            v-for="col in availableColumns" 
            :key="col.index" 
            :label="`列 ${col.index + 1}`" 
            :value="col.index"
          />
        </el-select>
        <el-select v-model="sort.direction" placeholder="排序方式" size="small">
          <el-option label="升序" value="asc" />
          <el-option label="降序" value="desc" />
        </el-select>
        <el-button type="danger" size="small" @click="removeSort(index)">
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
    </div>

    <div class="stats">
      <span>隐藏行数: {{ filterStore.hiddenRows.size }}</span>
      <span>筛选条件: {{ filterStore.filters.length }}</span>
      <span>排序条件: {{ filterStore.sortConditions.length }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Delete } from '@element-plus/icons-vue'
import { useFilterStore } from '@/stores/filter'
import { useExcelStore } from '@/stores/excel'
import { computed } from 'vue'

const filterStore = useFilterStore()
const excelStore = useExcelStore()

const availableColumns = computed(() => {
  if (!excelStore.activeWorksheet) return []
  const cols = excelStore.activeWorksheet.dimensions.cols
  return Array.from({ length: cols }, (_, i) => ({ index: i }))
})

const addFilter = () => {
  filterStore.addFilter({
    column: 0,
    operator: 'equals',
    value1: '',
    value2: ''
  })
}

const addSort = () => {
  filterStore.addSort({
    column: 0,
    direction: 'asc'
  })
}

const removeFilter = (index: number) => {
  filterStore.filters.splice(index, 1)
}

const removeSort = (index: number) => {
  filterStore.sortConditions.splice(index, 1)
}

const clearAll = () => {
  filterStore.clearAll()
}
</script>

<style scoped>
.filter-panel {
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

.actions {
  display: flex;
  gap: 8px;
}

.filters-section, .sort-section {
  margin-bottom: 20px;
}

.filters-section h4, .sort-section h4 {
  margin: 0 0 12px 0;
  color: #606266;
  font-size: 14px;
}

.filter-item, .sort-item {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
}

.filter-item > *:not(:last-child),
.sort-item > *:not(:last-child) {
  flex: 1;
}

.stats {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #909399;
  padding-top: 12px;
  border-top: 1px solid #e4e7ed;
}

.stats span {
  padding: 2px 6px;
  background: #f5f7fa;
  border-radius: 3px;
}
</style>