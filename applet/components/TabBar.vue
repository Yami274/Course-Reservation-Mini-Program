<template>
  <view class="tabbar">
    <view
      v-for="tab in tabs"
      :key="tab.key"
      class="tab"
      @tap="switchTab(tab)"
    >
      <SvgIcon :name="tab.icon" :size="48" :color="active === tab.key ? '#D97757' : '#8A7E70'" :filled="active === tab.key" />
      <text class="tab-label" :class="{ on: active === tab.key }">{{ tab.label }}</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import SvgIcon from './SvgIcon.vue'

const props = defineProps({
  active: { type: String, default: 'home' }
})

const emit = defineEmits(['switch'])

const tabs = [
  { key: 'home',   label: '首页', icon: 'home',   url: '/pages/index/index' },
  { key: 'course', label: '课程', icon: 'course', url: '/pages/course/list' },
  { key: 'order',  label: '预约', icon: 'order',  url: '/pages/order/list' },
  { key: 'mine',   label: '我的', icon: 'mine',   url: '/pages/mine/index' },
]

function switchTab(tab) {
  if (tab.key === props.active) return
  emit('switch', tab)
  uni.switchTab({ url: tab.url })
}
</script>

<style lang="scss" scoped>
.tabbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100rpx;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  background: rgba(255, 252, 245, 0.95);
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  border-top: 1rpx solid rgba(42, 37, 32, 0.10);
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

  &.on {
    color: #D97757;
    font-weight: 600;
  }
}
</style>
