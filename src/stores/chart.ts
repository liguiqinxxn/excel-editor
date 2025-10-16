import { defineStore } from 'pinia'
import type { CellData, WorksheetData } from './excel'

export interface ChartConfig {
  id: string
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'area'
  title: string
  dataRange: string
  xAxisColumn?: number
  yAxisColumns: number[]
  width: number
  height: number
  colors: string[]
}

export const useChartStore = defineStore('chart', {
  state: () => ({
    charts: [] as ChartConfig[],
    activeChart: null as ChartConfig | null
  }),

  actions: {
    // 创建图表
    createChart(config: ChartConfig) {
      this.charts.push(config)
      this.activeChart = config
    },

    // 删除图表
    deleteChart(chartId: string) {
      this.charts = this.charts.filter(chart => chart.id !== chartId)
      if (this.activeChart?.id === chartId) {
        this.activeChart = null
      }
    },

    // 获取图表数据
    getChartData(sheetData: WorksheetData, chartConfig: ChartConfig) {
      const data = this.extractDataFromRange(sheetData, chartConfig.dataRange)
      return this.formatChartData(data, chartConfig)
    },

    // 从范围提取数据
    extractDataFromRange(sheetData: WorksheetData, range: string): any[][] {
      const [start, end] = range.split(':') as [string, string]
      const startCoords = this.parseCellAddress(start)
      const endCoords = this.parseCellAddress(end)
      
      const data: any[][] = []
      
      for (let row = startCoords.row; row <= endCoords.row; row++) {
        const rowData: any[] = []
        for (let col = startCoords.col; col <= endCoords.col; col++) {
          const cell = sheetData.data[row]?.[col]
          rowData.push(cell?.value || null)
        }
        data.push(rowData)
      }
      
      return data
    },

    // 格式化图表数据
    formatChartData(data: any[][], config: ChartConfig) {
      switch (config.type) {
        case 'bar':
          return this.formatBarChartData(data, config)
        case 'line':
          return this.formatLineChartData(data, config)
        case 'pie':
          return this.formatPieChartData(data, config)
        case 'scatter':
          return this.formatScatterChartData(data, config)
        case 'area':
          return this.formatAreaChartData(data, config)
        default:
          return { labels: [], datasets: [] }
      }
    },

    // 格式化柱状图数据
    formatBarChartData(data: any[][], config: ChartConfig) {
      const labels = data.map(row => row[0] || '')
      const datasets = config.yAxisColumns.map((colIndex, index) => ({
        label: `系列 ${index + 1}`,
        data: data.map(row => parseFloat(row[colIndex]) || 0),
        backgroundColor: config.colors[index % config.colors.length]
      }))
      
      return { labels, datasets }
    },

    // 格式化折线图数据
    formatLineChartData(data: any[][], config: ChartConfig) {
      const labels = data.map(row => row[0] || '')
      const datasets = config.yAxisColumns.map((colIndex, index) => ({
        label: `系列 ${index + 1}`,
        data: data.map(row => parseFloat(row[colIndex]) || 0),
        borderColor: config.colors[index % config.colors.length],
        backgroundColor: 'transparent',
        tension: 0.1
      }))
      
      return { labels, datasets }
    },

    // 格式化饼图数据
    formatPieChartData(data: any[][], config: ChartConfig) {
      const labels = data.map(row => row[0] || '')
      const chartData = data.map(row => parseFloat(row[1]) || 0)
      
      return {
        labels,
        datasets: [{
          data: chartData,
          backgroundColor: config.colors
        }]
      }
    },

    // 格式化散点图数据
    formatScatterChartData(data: any[][], config: ChartConfig) {
      const datasets = config.yAxisColumns.map((colIndex, index) => ({
        label: `系列 ${index + 1}`,
        data: data.map(row => ({
          x: parseFloat(row[config.xAxisColumn || 0]) || 0,
          y: parseFloat(row[colIndex]) || 0
        })),
        backgroundColor: config.colors[index % config.colors.length]
      }))
      
      return { datasets }
    },

    // 格式化面积图数据
    formatAreaChartData(data: any[][], config: ChartConfig) {
      const labels = data.map(row => row[0] || '')
      const datasets = config.yAxisColumns.map((colIndex, index) => ({
        label: `系列 ${index + 1}`,
        data: data.map(row => parseFloat(row[colIndex]) || 0),
        borderColor: config.colors[index % config.colors.length],
        backgroundColor: this.hexToRgba(config.colors[index % config.colors.length]!, 0.3),
        fill: true
      }))
      
      return { labels, datasets }
    },

    // 解析单元格地址
    parseCellAddress(address: string): { row: number; col: number } {
      const colMatch = address.match(/[A-Z]+/)?.[0] || ''
      const rowMatch = address.match(/\d+/)?.[0] || '1'
      
      const col = this.columnNameToNumber(colMatch)
      const row = parseInt(rowMatch) - 1
      
      return { row, col }
    },

    // 列名转数字
    columnNameToNumber(name: string): number {
      let result = 0
      for (let i = 0; i < name.length; i++) {
        result = result * 26 + (name.charCodeAt(i) - 64)
      }
      return result - 1
    },

    // 十六进制颜色转RGBA
    hexToRgba(hex: string, alpha: number): string {
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    },

    // 更新图表配置
    updateChart(chartId: string, updates: Partial<ChartConfig>) {
      const chart = this.charts.find(c => c.id === chartId)
      if (chart) {
        Object.assign(chart, updates)
      }
    }
  }
})