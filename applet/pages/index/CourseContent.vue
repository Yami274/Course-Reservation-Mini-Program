<template>
  <scroll-view scroll-y class="tab-body" :style="{ height: bodyH + 'px' }">
    <view style="padding: 8rpx 32rpx 20rpx;" @tap="toSearch"><view class="search-box"><SvgIcon name="search" :color="ic" :size="30"/><text style="flex:1;color:var(--ink-3);">搜索课程、讲师…</text><view style="display:flex;align-items:center;gap:8rpx;"><SvgIcon name="filter" :color="ic" :size="28"/><text style="font-size:24rpx;color:var(--ink-2);font-weight:500;">筛选</text></view></view></view>
    <view class="tab-bar-wrap"><scroll-view scroll-x class="tab-scroll" :show-scrollbar="false"><view class="tab-list"><view v-for="tab in tabs" :key="tab.key" :id="'ctab-'+tab.key" class="tab-item" :class="{active:activeTab===tab.key}" @tap="activeTab=tab.key;moveSlider()">{{tab.label}}</view></view></scroll-view><view class="tab-slider" :style="sliderStyle"/></view>
    <view class="sub-filter-row"><view v-for="(f,i) in subFilters" :key="f" class="sub-chip" :class="{active:activeSub===i}" @tap="activeSub=i">{{f}}</view></view>
    <view class="course-list" :key="activeTab">
      <view v-for="c in filtered" :key="c.id" class="course-card card shadow-warm" @tap="toDetail(c)">
        <view class="thumb ph" :style="{background:c.thumbBg}"><image v-if="c.cover" class="thumb-img" :src="c.cover" mode="aspectFill"/><view v-if="c.isHot" class="tag-ribbon">HOT</view></view>
        <view class="card-info">
          <text class="course-name serif">{{c.name}}</text>
          <view style="display:flex;gap:8rpx;margin-top:12rpx;"><view class="tag">{{c.ageRange}}</view><view v-if="c.timeSlot" class="tag">{{c.timeSlot}}</view></view>
          <view style="display:flex;align-items:center;gap:8rpx;margin-top:16rpx;"><SvgIcon name="user" :color="ic" :size="22"/><text style="font-size:22rpx;color:var(--ink-3);">{{c.teacherName}} 老师</text></view>
          <view class="card-footer"><view><text class="card-price serif">{{c.priceText}}</text><text style="display:block;font-size:20rpx;margin-top:4rpx;color:c.seatsLeft===0?'var(--ink-3)':'var(--moss)'">{{c.seatsLeft===0?'本期已满 · 候补':'余 '+c.seatsLeft+' 席'}}</text></view><view class="book-btn" :style="{background:c.seatsLeft===0?'rgba(42,37,32,0.08)':'var(--primary)',color:c.seatsLeft===0?'var(--ink-3)':'#FFFCF5'}">{{c.seatsLeft===0?'候补':'去预约'}}</view></view>
        </view>
      </view>
    </view>
    <view style="height:200rpx;"/>
  </scroll-view>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { getCourses } from '@/api/course.js'
import { getCategories } from '@/api/home.js'
import { normalizeCourse } from '@/utils/normalize.js'
import SvgIcon from '@/components/SvgIcon.vue'

const props=defineProps({ topH:{type:Number,default:0}, tabH:{type:Number,default:100} })
const ic='#8A7E70'; const bodyH=ref(600)
const activeTab=ref('all'); const activeSub=ref(0); const allCourses=ref([])
const tabs=ref([{key:'all',label:'全部'}])
const subFilters=['默认','最新','名额','周末']
const sliderStyle=ref({})

onMounted(()=>{
  bodyH.value=uni.getSystemInfoSync().windowHeight - props.topH - props.tabH
  loadCats(); loadCourses()
})

const emit=defineEmits(['switchTab'])

watch(activeTab,()=>{loadCourses();moveSlider()})

async function loadCats(){
  try{
    const cats=await getCategories()||[]
    tabs.value=[{key:'all',label:'全部'},...cats.filter(c=>c.name!=='全部').map(c=>({key:String(c.id),label:c.name}))]
  }catch(e){}
}

async function loadCourses(){
  try{
    const params={page:1,pageSize:20,status:'published'}
    if(activeTab.value!=='all')params.category_id=Number(activeTab.value)
    allCourses.value=((await getCourses(params))?.list||[]).map(normalizeCourse)
  }catch(e){}
}

const filtered=computed(()=>{
  let list=[...allCourses.value]
  if(activeSub.value===1)list.sort((a,b)=>(b.createdAt||b.id)-(a.createdAt||a.id))
  if(activeSub.value===2)list.sort((a,b)=>b.seatsLeft-a.seatsLeft)
  return list
})

function moveSlider(){
  nextTick(()=>{
    uni.createSelectorQuery()
      .select('#ctab-'+activeTab.value).boundingClientRect()
      .select('.tab-bar-wrap').boundingClientRect()
      .exec((res)=>{
        if(res[0]&&res[1]){
          const tab=res[0],wrap=res[1]
          const rp=uni.getSystemInfoSync().screenWidth/750
          const w=40*rp
          const cx=tab.left-wrap.left+tab.width/2
          sliderStyle.value={left:(cx-w/2)+'px',width:w+'px',opacity:1,transition:'left .3s cubic-bezier(.22,.61,.36,1),opacity .2s'}
        }
      })
  })
}

function toSearch(){uni.navigateTo({url:'/pages/course/search'})}
function toDetail(c){uni.navigateTo({url:'/pages/course/detail?id='+c.id})}
</script>

<style lang="scss" scoped>
.tab-body{width:100%}
.tab-bar-wrap{position:relative;border-bottom:1rpx solid var(--line)}.tab-scroll{width:100%}.tab-list{display:inline-flex;padding:8rpx 32rpx 0;gap:32rpx}.tab-item{flex-shrink:0;position:relative;padding-bottom:16rpx;font-size:28rpx;font-weight:500;color:var(--ink-3);white-space:nowrap;transition:color .25s,font-weight .25s}.tab-item.active{font-weight:700;color:var(--ink)}.tab-slider{position:absolute;bottom:0;left:0;height:6rpx;border-radius:6rpx;background:var(--primary);pointer-events:none;opacity:0}
.sub-filter-row{display:flex;gap:16rpx;padding:24rpx 32rpx 16rpx}.sub-chip{padding:10rpx 24rpx;border-radius:999rpx;font-size:24rpx;font-weight:500;background:transparent;color:var(--ink-2);border:1rpx solid var(--line)}.sub-chip.active{background:var(--primary-soft);color:var(--primary-deep);border-color:var(--primary-soft)}
.course-list{padding:8rpx 32rpx;display:flex;flex-direction:column;gap:24rpx}.course-card{padding:24rpx;border-radius:36rpx;display:flex;gap:24rpx}.thumb{width:200rpx;height:248rpx;border-radius:28rpx;flex-shrink:0;position:relative}.card-info{flex:1;display:flex;flex-direction:column;min-width:0}.course-name{font-size:32rpx;font-weight:600;line-height:1.3;color:var(--ink)}.card-footer{display:flex;justify-content:space-between;align-items:flex-end;margin-top:auto;padding-top:16rpx}.card-price{font-size:32rpx;font-weight:700;color:var(--primary-deep)}.book-btn{padding:14rpx 28rpx;border-radius:999rpx;font-size:24rpx;font-weight:600}.thumb-img{position:absolute;top:0;right:0;bottom:0;left:0;width:100%;height:100%;border-radius:inherit}
</style>
