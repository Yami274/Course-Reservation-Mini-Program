import { defineStore } from 'pinia'

export const useTabbarStore = defineStore('tabbar', {
  state: () => ({ active: 'home' }),
})
