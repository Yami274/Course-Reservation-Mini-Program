<template>
  <scroll-view scroll-y class="tab-body" :style="{ height: bodyH + 'px' }">
    <view style="padding:8rpx 32rpx 28rpx;"><view class="seg"><view class="seg-indicator" :style="segIndicator" /><view v-for="tab in tabs" :key="tab.key" :id="'seg-'+tab.key" class="seg-btn" @tap="setTab(tab.key)">{{tab.label}}<text v-if="getCount(tab.key)>0" class="tab-count">{{getCount(tab.key)}}</text></view></view></view>
    <view class="order-list" :key="activeTab" v-if="filteredOrders.length>0">
      <view v-for="o in filteredOrders" :key="o.id" class="order-card card shadow-warm">
        <view class="status-strip" :style="statusStrip(o.status)"><view class="status-dot" :style="{background:statusColor(o.status)}"/><text>{{statusText(o.status)}}</text></view>
        <view class="order-body" @tap="toDetail(o)">
          <view class="order-thumb ph" :style="{background:o.thumbBg}"><image v-if="o.cover" class="thumb-img" :src="o.cover" mode="aspectFill"/></view>
          <view class="order-info">
            <text class="order-name serif">{{o.courseName}}</text>
            <view style="display:flex;align-items:center;gap:8rpx;margin-top:10rpx;"><SvgIcon name="clock" :color="ic" :size="22"/><text style="font-size:22rpx;color:var(--ink-3);">{{o.timeSlot}}</text></view>
            <view style="display:flex;align-items:center;gap:8rpx;margin-top:8rpx;"><SvgIcon name="user" :color="ic" :size="22"/><text style="font-size:22rpx;color:var(--ink-3);">{{o.studentName||'学员'}}</text></view>
            <view style="display:flex;gap:8rpx;margin-top:12rpx;"><view class="tag">{{o.classType}}</view></view>
          </view>
        </view>
        <view class="order-footer"><view class="order-hint"><view class="hint-dot" :style="{background:statusColor(o.status)}"/><text style="font-size:22rpx;color:var(--ink-3);flex:1;">{{statusHint(o.status)}}</text></view><view class="order-actions"><view v-if="canCancel(o.status)" class="act-btn ghost" @tap.stop="handleCancel(o)">取消预约</view><view v-if="canCancel(o.status)" class="act-btn ghost" @tap.stop="toDetail(o)">查看详情</view><view v-if="o.status==='approved'" class="act-btn ghost" @tap.stop="toDetail(o)">查看详情</view><view v-if="canRebook(o.status)" class="act-btn ghost" @tap.stop="handleRebook(o)">再次预约</view></view></view>
      </view>
    </view>
    <view v-else class="empty-state"><text style="font-size:80rpx;">📋</text><text class="empty-title">暂无预约</text><text class="empty-sub">快去挑选你喜欢的课程吧</text></view>
    <view style="height:200rpx;"/>
  </scroll-view>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { getOrders, cancelOrder } from '@/api/order.js'
import { useUserStore } from '@/stores/user.js'
import { normalizeOrder } from '@/utils/normalize.js'
import SvgIcon from '@/components/SvgIcon.vue'

const props=defineProps({ topH:{type:Number,default:0}, tabH:{type:Number,default:100} })
const ic='#8A7E70'; const bodyH=ref(600); const activeTab=ref('all'); const allOrders=ref([])
const tabs=ref([{key:'all',label:'全部'},{key:'pending',label:'待审核'},{key:'approved',label:'已通过'},{key:'rejected',label:'已拒绝'},{key:'cancelled',label:'已取消'}])
const segIndicator=ref({})

onMounted(async()=>{
  bodyH.value=uni.getSystemInfoSync().windowHeight - props.topH - props.tabH
  const us=useUserStore(); if(!us.isLoggedIn)try{await us.login()}catch(e){}
  loadOrders()
  nextTick(()=>moveIndicator())
})

watch(activeTab,()=>nextTick(()=>moveIndicator()))

function setTab(key){ activeTab.value=key }

function moveIndicator(){
  uni.createSelectorQuery()
    .select('#seg-'+activeTab.value).boundingClientRect()
    .select('.seg').boundingClientRect()
    .exec((res)=>{
      if(res[0]&&res[1]){
        const btn=res[0],seg=res[1]
        segIndicator.value={
          left:(btn.left-seg.left)+'px',
          width:btn.width+'px',
          transition:'left .3s cubic-bezier(.22,.61,.36,1), width .3s cubic-bezier(.22,.61,.36,1)'
        }
      }
    })
}

async function loadOrders(){
  const res=await getOrders({page:1,pageSize:100})
  allOrders.value=(res?.list||res||[]).map(normalizeOrder)
}

const filteredOrders=computed(()=>activeTab.value==='all'?allOrders.value:allOrders.value.filter(o=>o.status===activeTab.value))
function getCount(k){return k==='all'?allOrders.value.length:allOrders.value.filter(o=>o.status===k).length}

const SM={pending:{text:'待审核',color:'#E8B860',bg:'rgba(232,184,96,0.16)',tc:'#8A6520',hint:'讲师将于 24 小时内审核'},approved:{text:'已通过',color:'#6B7F5A',bg:'var(--moss-soft)',tc:'var(--moss)',hint:'请提前 10 分钟到场'},rejected:{text:'已拒绝',color:'#A0473F',bg:'rgba(160,71,63,0.12)',tc:'var(--berry)',hint:'预约未通过'},cancelled:{text:'已取消',color:'#8A7E70',bg:'rgba(42,37,32,0.06)',tc:'var(--ink-3)',hint:'已取消'}}
function statusText(s){return SM[s]?.text||s}
function statusColor(s){return SM[s]?.color||'#8A7E70'}
function statusHint(s){return SM[s]?.hint||''}
function statusStrip(s){var m=SM[s]||SM.cancelled;return{background:m.bg,color:m.tc}}
function canCancel(s){return s==='pending'||s==='approved'}
function canRebook(s){return s==='rejected'||s==='cancelled'}

function toDetail(o){uni.navigateTo({url:'/pages/order/detail?id='+o.id})}
async function handleCancel(o){
  uni.showModal({title:'取消预约',content:'确定要取消该预约吗？',confirmText:'确认取消',confirmColor:'#D97757',success:async(r)=>{if(r.confirm){await cancelOrder(o.id);loadOrders();uni.showToast({title:'已取消',icon:'success'})}}})
}
function handleRebook(o){uni.navigateTo({url:'/pages/course/detail?id='+(o.courseId||1)})}
</script>

<style lang="scss" scoped>
.tab-body{width:100%}
.order-list{padding:0 32rpx;display:flex;flex-direction:column;gap:28rpx}.order-card{border-radius:36rpx;overflow:hidden}.status-strip{width:180rpx;min-height:48rpx;display:flex;align-items:center;justify-content:center;border-radius:12rpx;margin:20rpx 0 0 20rpx;font-size:22rpx;font-weight:600;flex-shrink:0}.status-dot{width:10rpx;height:10rpx;border-radius:50%;margin-right:8rpx}.order-body{padding:0 28rpx 20rpx;display:flex;gap:24rpx}.order-thumb{width:152rpx;height:152rpx;border-radius:24rpx;flex-shrink:0;position:relative;overflow:hidden}.order-info{flex:1;min-width:0}.order-name{font-size:30rpx;font-weight:600;line-height:1.3;color:var(--ink)}.order-footer{padding:0 28rpx 28rpx}.order-hint{display:flex;align-items:center;gap:12rpx;padding:16rpx 20rpx;border-radius:16rpx;background:rgba(42,37,32,0.04)}.hint-dot{width:10rpx;height:10rpx;border-radius:50%;flex-shrink:0}.order-actions{display:flex;gap:16rpx;margin-top:24rpx;justify-content:flex-end}.act-btn{padding:16rpx 32rpx;border-radius:999rpx;font-size:24rpx;font-weight:500}.act-btn.ghost{background:transparent;color:var(--ink-2);border:1rpx solid var(--line)}.thumb-img{position:absolute;top:0;right:0;bottom:0;left:0;width:100%;height:100%;border-radius:inherit}.seg-indicator{position:absolute;top:6rpx;bottom:6rpx;background:var(--card);border-radius:999rpx;box-shadow:0 4rpx 12rpx rgba(0,0,0,0.06);pointer-events:none;z-index:0}.seg-btn{background:transparent!important;z-index:1}.seg-btn.active{background:transparent!important;box-shadow:none;color:var(--ink);font-weight:500}.tab-count{position:absolute;top:-12rpx;right:-12rpx;background:var(--primary);color:#FFFCF5;font-size:18rpx;min-width:28rpx;height:28rpx;border-radius:14rpx;text-align:center;line-height:28rpx;padding:0 6rpx;pointer-events:none}.empty-state{display:flex;flex-direction:column;align-items:center;padding:120rpx 64rpx;gap:16rpx}.empty-title{font-size:30rpx;font-weight:600;color:var(--ink)}.empty-sub{font-size:26rpx;color:var(--ink-3)}
</style>
