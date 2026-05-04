<template>
  <view class="course-card" @tap="handleTap">
    <!-- 缩略图 -->
    <view class="thumb" :style="{ background: course.thumbBg || 'linear-gradient(135deg, #F4D9B8, #D97757)' }">
      <image
        v-if="course.cover"
        class="thumb-img"
        :src="course.cover"
        mode="aspectFill"
        @error="course.coverError = true"
      />
      <!-- HOT 标签 -->
      <view v-if="course.isHot" class="hot-tag">HOT</view>
      <!-- 余席 / 已满 -->
      <view class="seats-badge" :class="{ full: course.seatsLeft === 0 }">
        {{ course.seatsLeft === 0 ? '已满' : `余${course.seatsLeft}席` }}
      </view>
    </view>

    <!-- ?????-->
    <view class="content">
      <!-- ?????? -->
      <view class="category-tag" :style="{ background: course.tagBg || '#F2C9B5', color: course.tagColor || '#B5573A' }">
        {{ course.category }}
      </view>

      <!-- ?????-->
      <text class="title">{{ course.name }}</text>

      <!-- ??? -->
      <text class="age">{{ course.ageRange }}</text>

      <!-- ????????+ ??? -->
      <view class="bottom-row">
        <view class="teacher-info">
          <view class="teacher-avatar" :style="{ background: course.teacherAvatarBg || '#C7D1B6' }">
            <text class="teacher-initial">{{ course.teacherName?.[0] || '?' }}</text>
          </view>
          <text class="teacher-name">{{ course.teacherName }}</text>
        </view>
        <text class="price" v-if="course.price">{{ course.price }}</text>
        <text class="price-tag" v-else-if="course.priceTag">{{ course.priceTag }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  course: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['tap'])

function handleTap() {
  emit('tap', props.course)
  uni.navigateTo({ url: `/pages/course/detail?id=${props.course.id}` })
}
</script>

<style lang="scss" scoped>
.course-card {
  background: var(--card);
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 16rpx rgba(42, 37, 32, 0.06);
  transition: transform 0.15s;

  &:active {
    transform: scale(0.975);
  }
}

.thumb {
  position: relative;
  width: 100%;
  height: 200rpx;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 12rpx;
}

.thumb-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border-radius: 24rpx 24rpx 0 0;
}

.hot-tag {
  position: absolute;
  top: 12rpx;
  left: 12rpx;
  background: #D97757;
  color: #fff;
  font-size: 18rpx;
  font-weight: 700;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  letter-spacing: 1rpx;
}

.seats-badge {
  background: rgba(255, 252, 245, 0.92);
  color: #6B7F5A;
  font-size: 20rpx;
  font-weight: 600;
  padding: 4rpx 14rpx;
  border-radius: 20rpx;

  &.full {
    color: #8A7E70;
    background: rgba(255, 252, 245, 0.85);
  }
}

.content {
  padding: 20rpx 24rpx 24rpx;
}

.category-tag {
  display: inline-block;
  font-size: 20rpx;
  font-weight: 500;
  padding: 4rpx 14rpx;
  border-radius: 20rpx;
  margin-bottom: 10rpx;
}

.title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: var(--ink);
  line-height: 1.4;
  margin-bottom: 6rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.age {
  display: block;
  font-size: 22rpx;
  color: var(--ink-3);
  margin-bottom: 16rpx;
}

.bottom-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.teacher-info {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.teacher-avatar {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.teacher-initial {
  font-size: 18rpx;
  font-weight: 700;
  color: #fff;
}

.teacher-name {
  font-size: 22rpx;
  color: var(--ink-2);
}

.price {
  font-size: 26rpx;
  font-weight: 700;
  color: var(--primary);
}

.price-tag {
  font-size: 22rpx;
  font-weight: 600;
  color: var(--primary);
  background: var(--primary-soft);
  padding: 4rpx 14rpx;
  border-radius: 20rpx;
}
</style>

