import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'files',
      component: () => import('@/views/FileListView.vue'),
    },
    {
      path: '/editor',
      name: 'editor',
      component: () => import('@/views/ExcelEditorView.vue'),
    },
  ],
})

export default router
