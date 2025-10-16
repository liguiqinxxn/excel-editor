<template>
  <div class="validation-panel">
    <div class="panel-header">
      <h3>数据验证</h3>
      <el-button type="primary" size="small" @click="showAddDialog = true">
        <el-icon><Plus /></el-icon> 添加规则
      </el-button>
    </div>

    <div class="rules-list">
      <el-table :data="validationStore.rules" size="small" empty-text="暂无验证规则">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)">{{ getTypeText(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="range" label="范围" />
        <el-table-column prop="condition" label="条件" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button link type="primary" @click="editRule(row)">编辑</el-button>
            <el-button link type="danger" @click="deleteRule(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 添加/编辑规则对话框 -->
    <el-dialog 
      v-model="showAddDialog" 
      :title="editingRule ? '编辑验证规则' : '添加验证规则'"
      width="500px"
    >
      <el-form :model="ruleForm" label-width="80px">
        <el-form-item label="验证类型">
          <el-select v-model="ruleForm.type" placeholder="请选择验证类型">
            <el-option label="数字" value="number" />
            <el-option label="文本" value="text" />
            <el-option label="日期" value="date" />
            <el-option label="列表" value="list" />
          </el-select>
        </el-form-item>

        <el-form-item label="范围">
          <el-input v-model="ruleForm.range" placeholder="例如: A1:B10" />
        </el-form-item>

        <el-form-item label="条件" v-if="ruleForm.type === 'text'">
          <el-select v-model="ruleForm.condition">
            <el-option label="非空" value="notEmpty" />
            <el-option label="最小长度" value="length" />
          </el-select>
        </el-form-item>

        <el-form-item label="最小值" v-if="ruleForm.type === 'number'">
          <el-input-number v-model="ruleForm.minValue" />
        </el-form-item>

        <el-form-item label="最大值" v-if="ruleForm.type === 'number'">
          <el-input-number v-model="ruleForm.maxValue" />
        </el-form-item>

        <el-form-item label="列表值" v-if="ruleForm.type === 'list'">
          <el-input 
            v-model="ruleForm.listValues" 
            placeholder="用逗号分隔的值，例如: 男,女,其他"
          />
        </el-form-item>

        <el-form-item label="错误提示">
          <el-input v-model="ruleForm.errorMessage" placeholder="验证失败时的提示信息" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="saveRule">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import { useValidationStore } from '@/stores/validation'
import { ref, reactive } from 'vue'

const validationStore = useValidationStore()

const showAddDialog = ref(false)
const editingRule = ref(null)

const ruleForm = reactive({
  id: '',
  type: 'number',
  range: '',
  condition: '',
  errorMessage: '',
  listValues: '',
  minValue: undefined,
  maxValue: undefined
})

const getTypeTag = (type: string) => {
  const tags = {
    number: 'success',
    text: 'warning',
    date: 'info',
    list: 'primary'
  }
  return tags[type as keyof typeof tags] || 'default'
}

const getTypeText = (type: string) => {
  const texts = {
    number: '数字',
    text: '文本',
    date: '日期',
    list: '列表'
  }
  return texts[type as keyof typeof texts] || type
}

const editRule = (rule: any) => {
  editingRule.value = rule
  Object.assign(ruleForm, rule)
  if (rule.listValues) {
    ruleForm.listValues = rule.listValues.join(',')
  }
  showAddDialog.value = true
}

const deleteRule = (ruleId: string) => {
  validationStore.removeRule(ruleId)
}

const saveRule = () => {
  const ruleData = {
    ...ruleForm,
    listValues: ruleForm.listValues ? ruleForm.listValues.split(',').map(v => v.trim()) : []
  }

  if (editingRule.value) {
    // validationStore.updateRule(ruleData.id, ruleData as any)
  } else {
    ruleData.id = Date.now().toString()
    validationStore.addRule(ruleData as any)
  }

  showAddDialog.value = false
  resetForm()
}

const resetForm = () => {
  Object.assign(ruleForm, {
    id: '',
    type: 'number',
    range: '',
    condition: '',
    errorMessage: '',
    listValues: '',
    minValue: undefined,
    maxValue: undefined
  })
  editingRule.value = null
}
</script>

<style scoped>
.validation-panel {
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

.rules-list {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}
</style>