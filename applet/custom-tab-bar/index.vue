<template>
  <view class="tabbar">
    <view v-for="tab in tabs" :key="tab.key" class="tab" @tap="switchTab(tab)">
      <view :class="['tab-icon', tab.key + (active === tab.key ? '-on' : '-off')]" />
      <text class="tab-label" :class="{ on: active === tab.key }">{{ tab.label }}</text>
    </view>
  </view>
</template>

<script>
import { ref, watch, onMounted } from 'vue'
import { useTabbarStore } from '@/stores/tabbar.js'

export default {
  setup() {
    const store = useTabbarStore()
    const active = ref(store.active || 'home')

    const tabs = [
      { key: 'home',   label: '首页', url: '/pages/index/index' },
      { key: 'course', label: '课程', url: '/pages/course/list' },
      { key: 'order',  label: '预约', url: '/pages/order/list' },
      { key: 'mine',   label: '我的', url: '/pages/mine/index' },
    ]

    watch(function() { return store.active }, function(val) {
      if (val) active.value = val
    })

    onMounted(function() {
      var pages = getCurrentPages()
      if (pages.length > 0) {
        var route = '/' + pages[pages.length - 1].route
        var tab = tabs.find(function(t) { return t.url === route })
        if (tab) {
          active.value = tab.key
          store.active = tab.key
        }
      }
    })

    function switchTab(tab) {
      if (active.value === tab.key) return
      active.value = tab.key
      store.active = tab.key
      uni.switchTab({ url: tab.url })
    }

    return {
      active,
      tabs,
      switchTab
    }
  }
}
</script>

<style scoped>
.tabbar {
  position: fixed;
  left: 0; right: 0; bottom: 0;
  height: 100rpx;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  background: rgba(255,252,245,0.95);
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  border-top: 1rpx solid rgba(42,37,32,0.10);
  display: flex;
  align-items: flex-start;
  padding-top: 10rpx;
  z-index: 999;
  box-sizing: border-box;
}

.tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rpx;
  padding: 4rpx 0;
}

.tab-label {
  font-size: 20rpx;
  font-weight: 500;
  color: #8A7E70;
  line-height: 1.2;
}

.tab-label.on {
  color: #D97757;
  font-weight: 600;
}

.tab-icon {
  width: 48rpx;
  height: 48rpx;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.home-off {
  background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj48cGF0aCBkPSJNMyAxMWw5LTcgOSA3djlhMSAxIDAgMDEtMSAxaC01di02aC02djZINGExIDEgMCAwMS0xLTF2LTl6IiBzdHJva2U9IiM4QTdFNzAiIHN0cm9rZS13aWR0aD0iMS42IiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+");
}
.home-on {
  background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj48cGF0aCBkPSJNMyAxMWw5LTcgOSA3djlhMSAxIDAgMDEtMSAxaC01di02aC02djZINGExIDEgMCAwMS0xLTF2LTl6IiBzdHJva2U9IiNEOTc3NTciIHN0cm9rZS13aWR0aD0iMS42IiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBmaWxsPSIjRDk3NzU3IiBmaWxsLW9wYWNpdHk9IjAuMTgiLz48L3N2Zz4=");
}

.course-off {
  background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj48cGF0aCBkPSJNNCA1YzItMSA0LTEgNyAwdjE1Yy0zLTEtNS0xLTcgMFY1eiIgc3Ryb2tlPSIjOEE3RTcwIiBzdHJva2Utd2lkdGg9IjEuNiIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0yMCA1Yy0yLTEtNC0xLTcgMHYxNWMzLTEgNS0xIDcgMFY1eiIgc3Ryb2tlPSIjOEE3RTcwIiBzdHJva2Utd2lkdGg9IjEuNiIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==");
}
.course-on {
  background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj48cGF0aCBkPSJNNCA1YzItMSA0LTEgNyAwdjE1Yy0zLTEtNS0xLTcgMFY1eiIgc3Ryb2tlPSIjRDk3NzU3IiBzdHJva2Utd2lkdGg9IjEuNiIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgZmlsbD0iI0Q5Nzc1NyIgZmlsbC1vcGFjaXR5PSIwLjE4Ii8+PHBhdGggZD0iTTIwIDVjLTItMS00LTEtNyAwdjE1YzMtMSA1LTEgNyAwVjV6IiBzdHJva2U9IiNEOTc3NTciIHN0cm9rZS13aWR0aD0iMS42IiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBmaWxsPSIjRDk3NzU3IiBmaWxsLW9wYWNpdHk9IjAuMTgiLz48L3N2Zz4=");
}

.order-off {
  background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj48cmVjdCB4PSIzLjUiIHk9IjUuNSIgd2lkdGg9IjE3IiBoZWlnaHQ9IjE1IiByeD0iMyIgc3Ryb2tlPSIjOEE3RTcwIiBzdHJva2Utd2lkdGg9IjEuNiIvPjxwYXRoIGQ9Ik04IDN2NE0xNiAzdjRNMy41IDEwaDE3IiBzdHJva2U9IiM4QTdFNzAiIHN0cm9rZS13aWR0aD0iMS42IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4=");
}
.order-on {
  background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj48cmVjdCB4PSIzLjUiIHk9IjUuNSIgd2lkdGg9IjE3IiBoZWlnaHQ9IjE1IiByeD0iMyIgc3Ryb2tlPSIjRDk3NzU3IiBzdHJva2Utd2lkdGg9IjEuNiIgZmlsbD0iI0Q5Nzc1NyIgZmlsbC1vcGFjaXR5PSIwLjE4Ii8+PHBhdGggZD0iTTggM3Y0TTE2IDN2NE0zLjUgMTBoMTciIHN0cm9rZT0iI0Q5Nzc1NyIgc3Ryb2tlLXdpZHRoPSIxLjYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==");
}

.mine-off {
  background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjgiIHI9IjQiIHN0cm9rZT0iIzhBN0U3MCIgc3Ryb2tlLXdpZHRoPSIxLjYiLz48cGF0aCBkPSJNNCAyMWMxLjUtNCA1LTYgOC02czYuNSAyIDggNiIgc3Ryb2tlPSIjOEE3RTcwIiBzdHJva2Utd2lkdGg9IjEuNiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+");
}
.mine-on {
  background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjgiIHI9IjQiIHN0cm9rZT0iI0Q5Nzc1NyIgc3Ryb2tlLXdpZHRoPSIxLjYiIGZpbGw9IiNEOTc3NTciIGZpbGwtb3BhY2l0eT0iMC4xOCIvPjxwYXRoIGQ9Ik00IDIxYzEuNS00IDUtNiA4LTZzNi41IDIgOCA2IiBzdHJva2U9IiNEOTc3NTciIHN0cm29rZS13aWR0aD0iMS42IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4=");
}
</style>
