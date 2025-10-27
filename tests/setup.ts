import { config } from '@vue/test-utils'
import { beforeEach } from 'vitest'
import ElementPlus from 'element-plus'

// 全局测试配置
beforeEach(() => {
  // 重置DOM
  document.body.innerHTML = ''
  document.head.innerHTML = ''
})

// Vue Test Utils 全局配置
config.global.stubs = {
  Transition: false,
  'transition-group': false
}

// 全局注册Element Plus组件
config.global.plugins = [ElementPlus]

// 模拟全局对象
global.CSS = {
  supports: () => false
} as any

// 模拟 ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any

// 模拟 IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any