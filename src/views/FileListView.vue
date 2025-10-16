<template>
  <div class="file-list-view">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <h1 class="app-title">Excel在线编辑器</h1>
      </div>
      <div class="toolbar-right">
        <button class="toolbar-button primary" @click="createNewFile">
          <span class="icon">📄</span>
          新建文件
        </button>
        <button class="toolbar-button" @click="openFileDialog">
          <span class="icon">📁</span>
          打开文件
        </button>
        <input 
          ref="fileInput"
          type="file" 
          accept=".xlsx,.xls,.csv" 
          @change="handleFileUpload" 
          style="display: none"
        />
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 侧边栏 -->
      <div class="sidebar">
        <div class="sidebar-section">
          <h3>文件管理</h3>
          <nav class="sidebar-nav">
            <a href="#" class="nav-item active">
              <span class="icon">📊</span>
              所有文件
            </a>
            <a href="#" class="nav-item">
              <span class="icon">⭐</span>
              收藏夹
            </a>
            <a href="#" class="nav-item">
              <span class="icon">🕒</span>
              最近使用
            </a>
            <a href="#" class="nav-item">
              <span class="icon">🗑️</span>
              回收站
            </a>
          </nav>
        </div>

        <div class="sidebar-section">
          <h3>分类</h3>
          <div class="category-list">
            <div class="category-item" v-for="category in categories" :key="category.id">
              <span class="category-color" :style="{ backgroundColor: category.color }"></span>
              {{ category.name }}
            </div>
          </div>
        </div>

        <div class="sidebar-section">
          <h3>存储空间</h3>
          <div class="storage-info">
            <div class="storage-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: storageUsage + '%' }"></div>
              </div>
              <div class="storage-text">
                已使用 {{ storageUsed }} / {{ storageTotal }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 文件列表区域 -->
      <div class="file-list-area">
        <!-- 搜索和筛选 -->
        <div class="file-controls">
          <div class="search-box">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="搜索文件..." 
              class="search-input"
            />
            <span class="search-icon">🔍</span>
          </div>
          <div class="filter-controls">
            <select v-model="sortBy" class="filter-select">
              <option value="name">按名称排序</option>
              <option value="date">按日期排序</option>
              <option value="size">按大小排序</option>
            </select>
            <select v-model="viewMode" class="filter-select">
              <option value="grid">网格视图</option>
              <option value="list">列表视图</option>
            </select>
          </div>
        </div>

        <!-- 文件列表 -->
        <div class="file-list" :class="viewMode">
          <div 
            v-for="file in filteredFiles" 
            :key="file.id" 
            class="file-item"
            @click="openFile(file)"
            @contextmenu="showContextMenu($event, file)"
          >
            <div class="file-icon">
              <span class="icon">📊</span>
            </div>
            <div class="file-info">
              <div class="file-name">{{ file.name }}</div>
              <div class="file-meta">
                <span class="file-size">{{ formatFileSize(file.size) }}</span>
                <span class="file-date">{{ formatDate(file.modifiedAt) }}</span>
              </div>
            </div>
            <div class="file-actions">
              <button class="action-button" @click.stop="toggleFavorite(file)">
                <span class="icon" :class="{ favorite: file.isFavorite }">⭐</span>
              </button>
              <button class="action-button" @click.stop="shareFile(file)">
                <span class="icon">🔗</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="filteredFiles.length === 0" class="empty-state">
          <div class="empty-icon">📊</div>
          <h3>暂无文件</h3>
          <p>点击"新建文件"开始创建您的第一个Excel文件</p>
          <button class="create-button" @click="createNewFile">
            创建新文件
          </button>
        </div>
      </div>
    </div>

    <!-- 右键菜单 -->
    <div 
      v-if="contextMenu.visible" 
      class="context-menu" 
      :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      @click.stop
    >
      <div class="context-item" @click="openFile(contextMenu.file)">
        <span class="icon">📖</span>
        打开
      </div>
      <div class="context-item" @click="renameFile(contextMenu.file)">
        <span class="icon">✏️</span>
        重命名
      </div>
      <div class="context-item" @click="toggleFavorite(contextMenu.file)">
        <span class="icon">⭐</span>
        {{ contextMenu.file?.isFavorite ? '取消收藏' : '收藏' }}
      </div>
      <div class="context-divider"></div>
      <div class="context-item danger" @click="deleteFile(contextMenu.file)">
        <span class="icon">🗑️</span>
        删除
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 响应式数据
const searchQuery = ref('')
const sortBy = ref('date')
const viewMode = ref('grid')
const fileInput = ref<HTMLInputElement>()

// 文件数据
const files = ref([
  {
    id: 1,
    name: '销售报表.xlsx',
    size: 1024 * 1024 * 2.5, // 2.5MB
    modifiedAt: new Date('2024-01-15'),
    isFavorite: true
  },
  {
    id: 2,
    name: '财务数据.xlsx',
    size: 1024 * 1024 * 1.8,
    modifiedAt: new Date('2024-01-14'),
    isFavorite: false
  },
  {
    id: 3,
    name: '项目计划.xlsx',
    size: 1024 * 1024 * 3.2,
    modifiedAt: new Date('2024-01-13'),
    isFavorite: true
  }
])

// 分类数据
const categories = ref([
  { id: 1, name: '工作文件', color: '#4CAF50' },
  { id: 2, name: '个人文件', color: '#2196F3' },
  { id: 3, name: '共享文件', color: '#FF9800' }
])

// 存储空间
const storageUsed = ref('2.1 GB')
const storageTotal = ref('5 GB')
const storageUsage = ref(42)

// 右键菜单
const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  file: null as any
})

// 计算属性
const filteredFiles = computed(() => {
  let result = files.value.filter(file => 
    file.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )

  // 排序
  result.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'size':
        return b.size - a.size
      case 'date':
      default:
        return b.modifiedAt.getTime() - a.modifiedAt.getTime()
    }
  })

  return result
})

// 方法
const createNewFile = () => {
  router.push('/editor')
}

const openFileDialog = () => {
  fileInput.value?.click()
}

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]
    console.log('打开文件:', file.name)
    // 处理文件上传逻辑
    router.push('/editor')
  }
}

const openFile = (file: any) => {
  console.log('打开文件:', file.name)
  router.push('/editor')
}

const toggleFavorite = (file: any) => {
  file.isFavorite = !file.isFavorite
}

const shareFile = (file: any) => {
  console.log('分享文件:', file.name)
}

const showContextMenu = (event: MouseEvent, file: any) => {
  event.preventDefault()
  contextMenu.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    file
  }
}

const renameFile = (file: any) => {
  console.log('重命名文件:', file.name)
  contextMenu.value.visible = false
}

const deleteFile = (file: any) => {
  console.log('删除文件:', file.name)
  files.value = files.value.filter(f => f.id !== file.id)
  contextMenu.value.visible = false
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('zh-CN')
}

// 事件监听
const hideContextMenu = () => {
  contextMenu.value.visible = false
}

onMounted(() => {
  document.addEventListener('click', hideContextMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', hideContextMenu)
})
</script>

<style scoped>
.file-list-view {
  height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.toolbar {
  background: white;
  padding: 16px 24px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.app-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.toolbar-button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.toolbar-button:hover {
  background: #f5f5f5;
}

.toolbar-button.primary {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.toolbar-button.primary:hover {
  background: #0056b3;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.sidebar {
  width: 280px;
  background: white;
  border-right: 1px solid #e0e0e0;
  padding: 24px;
  overflow-y: auto;
}

.sidebar-section {
  margin-bottom: 32px;
}

.sidebar-section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  padding: 12px 16px;
  border-radius: 6px;
  text-decoration: none;
  color: #666;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s;
}

.nav-item:hover,
.nav-item.active {
  background: #f0f7ff;
  color: #007bff;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.category-item:hover {
  background: #f5f5f5;
}

.category-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.storage-progress {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-bar {
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #4CAF50;
  transition: width 0.3s;
}

.storage-text {
  font-size: 12px;
  color: #666;
}

.file-list-area {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.file-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.search-box {
  position: relative;
  width: 300px;
}

.search-input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}

.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.filter-controls {
  display: flex;
  gap: 12px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.file-list.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.file-list.list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 16px;
}

.file-item:hover {
  border-color: #007bff;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.1);
}

.file-list.list .file-item {
  flex-direction: row;
}

.file-list.grid .file-item {
  flex-direction: column;
  text-align: center;
  height: 140px;
}

.file-icon {
  font-size: 32px;
}

.file-info {
  flex: 1;
}

.file-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.file-meta {
  font-size: 12px;
  color: #666;
  display: flex;
  gap: 12px;
}

.file-actions {
  display: flex;
  gap: 8px;
}

.action-button {
  padding: 6px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;
}

.action-button:hover {
  background: #f5f5f5;
}

.action-button .favorite {
  color: #ffc107;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #666;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
}

.empty-state p {
  margin: 0 0 24px 0;
  font-size: 14px;
}

.create-button {
  padding: 12px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 160px;
}

.context-item {
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;
}

.context-item:hover {
  background: #f5f5f5;
}

.context-item.danger {
  color: #d32f2f;
}

.context-divider {
  height: 1px;
  background: #e0e0e0;
  margin: 4px 0;
}

@media (max-width: 1024px) {
  .sidebar {
    width: 240px;
  }
  
  .file-list.grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
  
  .file-controls {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .search-box {
    width: 100%;
  }
}
</style>