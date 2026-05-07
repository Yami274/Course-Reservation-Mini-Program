<template>
  <scroll-view scroll-y class="tab-body" :style="{ height: bodyH + 'px' }">
    <view style="padding:8rpx 32rpx 24rpx;" @tap="toSearch"><view class="search-box"><SvgIcon name="search" :color="ic" :size="30"/><text style="flex:1;color:var(--ink-3);">搜索课程、讲师…</text><SvgIcon name="mic" :color="ic" :size="30"/></view></view>
    <view style="padding:0 32rpx 28rpx;"><view class="banner-wrap shadow-warm"><swiper class="banner-swiper" autoplay interval="4000" circular :current="bi" @change="onBC"><swiper-item v-for="(it,i) in banners" :key="i"><view class="banner-card" :style="{background:it.gradient}"><image v-if="it.image&&!it.imgErr" class="banner-bg-img" :src="it.image" mode="aspectFill" @error="it.imgErr=true"/><view v-if="it.image&&!it.imgErr" class="banner-img-overlay"/><view class="banner-deco"><view class="deco-ring"/><view class="deco-dot"/></view><view class="banner-content"><text class="banner-season hand">SPRING · 04</text><text class="banner-title display">{{it.title}}</text><text class="banner-sub">{{it.subtitle}}</text></view><view class="banner-dots"><view v-for="(_,j) in banners" :key="j" class="bdot" :class="{active:bi===j}"/></view></view></swiper-item></swiper></view></view>
    <view v-if="noticeText" style="padding:0 32rpx 32rpx;"><view class="notice-strip"><view class="notice-badge-text">公告</view><text class="notice-content" numberOfLines="1">{{noticeText}}</text></view></view>
    <view style="padding:0 32rpx 44rpx;"><view class="category-grid"><view v-for="cat in categories" :key="cat.id" class="cat-tile" @tap="toCat(cat)"><view class="icon-bg" :style="{background:cat.bg}"><text class="cat-emoji">{{cat.emoji}}</text></view><text class="cat-name">{{cat.name}}</text></view></view></view>
    <view class="section-head" style="padding:0 32rpx 24rpx;"><view><view class="section-title-row"><text class="section-title serif">本期推荐</text><view class="title-underline"/></view><text class="section-sub hand">讲师精选 · 名额有限</text></view><text class="section-more" @tap="goCourses">全部 ›</text></view>
    <scroll-view scroll-x class="hot-scroll" :show-scrollbar="false"><view class="hot-list"><view v-for="c in hotCourses" :key="c.id" class="hot-card card shadow-warm" @tap="toDetail(c)"><view class="hot-thumb ph" :style="{background:c.thumbBg}"><image v-if="c.cover" class="thumb-img" :src="c.cover" mode="aspectFill"/><view v-if="c.isHot" class="tag-ribbon">HOT</view></view><view class="hot-body"><text class="hot-name serif">{{c.name}}</text><view class="hot-bottom"><view class="tag">{{c.ageRange}}</view><view class="hot-footer"><text class="hot-price">{{c.priceText}}</text><text style="font-size:22rpx;color:c.seatsLeft===0?'var(--ink-3)':'var(--moss)'">{{c.seatsLeft===0?'已满':'余'+c.seatsLeft+'席'}}</text></view></view></view></view></view></scroll-view>
    <view style="padding:0 64rpx 36rpx;"><view class="dot-divider"><text class="hand" style="font-size:24rpx;color:var(--ink-3);">最新课程</text></view></view>
    <view style="padding:0 32rpx 0;display:flex;flex-direction:column;gap:24rpx;"><view v-for="c in latestCourses" :key="c.id" class="course-row card" @tap="toDetail(c)"><view class="row-thumb ph" :style="{background:c.thumbBg}"><image v-if="c.cover" class="thumb-img" :src="c.cover" mode="aspectFill"/></view><view class="row-info"><text class="row-name serif">{{c.name}}</text><view style="display:flex;gap:8rpx;margin-top:8rpx;align-items:center;"><SvgIcon name="user" :color="ic" :size="24"/><text style="font-size:22rpx;color:var(--ink-3);">{{c.teacherName}}</text><SvgIcon name="clock" :color="ic" :size="24"/><text style="font-size:22rpx;color:var(--ink-3);">{{c.timeSlot}}</text></view><view style="display:flex;justify-content:space-between;align-items:center;margin-top:10rpx;"><view class="tag">{{c.category}}</view><text style="font-size:24rpx;color:var(--primary-deep);font-weight:600;">{{c.priceText}}</text></view></view></view></view>
    <view style="height:200rpx;"/>
  </scroll-view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getBanners, getNotices, getCategories, getHotCourses } from '@/api/home.js'
import { getCourses } from '@/api/course.js'
import { normalizeCourse } from '@/utils/normalize.js'
import SvgIcon from '@/components/SvgIcon.vue'

const ic='#8A7E70'; const bi=ref(0)
const props=defineProps({ topH:{type:Number,default:0}, tabH:{type:Number,default:100} })
const bodyH=ref(600)
onMounted(()=>{ bodyH.value=uni.getSystemInfoSync().windowHeight-props.topH-props.tabH; loadData() })

const BGs=['linear-gradient(135deg,#F4D9B8,#D97757)','linear-gradient(135deg,#C7D1B6,#6B7F5A)','linear-gradient(135deg,#E8D4B0,#C8A870)','linear-gradient(135deg,#B8CDD8,#7A9CB0)']
const BTs=[{title:'春日色彩\n绘画工坊',subtitle:'4-12岁 · 周末班招募中'},{title:'成人速写\n夜间班',subtitle:'零基础 · 八周入门'},{title:'水彩花卉\n进阶班',subtitle:'国际课程体系 · 系统培养'},{title:'暑期艺术\n特训营',subtitle:'沉浸体验 · 激发创作灵感'}]
const CBg=['#F4DFB1','#C7D1B6','#E5BEB9','#C5D5DD','#F2C9B5','#DDD0B0','#E8DFC8','#F5EDE0']
const noticeText=ref('欢迎来到安然画室'),banners=ref([]),categories=ref([]),hotCourses=ref([]),latestCourses=ref([])

async function loadData(){
  try{
    const[br,nr,cr,hr,lr]=await Promise.all([getBanners(),getNotices(),getCategories(),getHotCourses(4),getCourses({page:1,pageSize:5})])
    banners.value=(br||[]).map((b,i)=>({...b,gradient:BGs[i%4],title:b.title||BTs[i%4].title,subtitle:b.subtitle||BTs[i%4].subtitle,imgErr:false}))
    if((nr||[]).length)noticeText.value=nr[0].content
    categories.value=(cr||[]).map((c,i)=>({...c,emoji:/^\p{Emoji}/u.test((c.icon||'').trim())?c.icon:'🎨',bg:CBg[i%8],key:c.name==='全部'?'all':String(c.id)}))
    hotCourses.value=(hr||[]).map(normalizeCourse)
    latestCourses.value=(lr?.list||lr||[]).map(normalizeCourse)
  }catch(e){}
}

const emit=defineEmits(['switchTab'])
function onBC(e){bi.value=e.detail.current}
function toSearch(){uni.navigateTo({url:'/pages/course/search'})}
function goCourses(){emit('switchTab',1)}
function toDetail(c){uni.navigateTo({url:'/pages/course/detail?id='+c.id})}
function toCat(cat){uni.setStorageSync('pendingCategory',cat.key);emit('switchTab',1)}
</script>

<style lang="scss" scoped>
.tab-body{width:100%}
.banner-wrap{border-radius:44rpx;overflow:hidden}.banner-swiper{width:100%;height:312rpx}.banner-card{width:100%;height:100%;position:relative;display:flex;flex-direction:column;justify-content:space-between;padding:40rpx 44rpx 36rpx;overflow:hidden}.banner-bg-img{position:absolute;top:0;right:0;bottom:0;left:0;width:100%;height:100%;pointer-events:none}.banner-img-overlay{position:absolute;top:0;right:0;bottom:0;left:0;background:linear-gradient(135deg,rgba(42,37,32,0.52),rgba(42,37,32,0.18));pointer-events:none}.banner-deco{position:absolute;right:0;top:0;width:280rpx;height:280rpx;pointer-events:none}.deco-ring{position:absolute;right:-20rpx;top:-20rpx;width:200rpx;height:200rpx;border-radius:50%;border:3rpx dashed rgba(255,252,245,0.45)}.deco-dot{position:absolute;right:60rpx;top:100rpx;width:24rpx;height:24rpx;border-radius:50%;background:rgba(255,252,245,0.5)}.banner-content{position:relative;z-index:1;flex:1;display:flex;flex-direction:column;justify-content:center}.banner-season{position:absolute;top:0;left:0;font-size:22rpx;letter-spacing:.3em;opacity:.85;color:#FFFCF5}.banner-title{display:block;font-size:52rpx;font-weight:700;line-height:1.15;color:#FFFCF5;white-space:pre-line}.banner-sub{display:block;font-size:24rpx;margin-top:16rpx;opacity:.85;color:#FFFCF5}.banner-dots{display:flex;gap:8rpx;margin-top:24rpx}.bdot{width:10rpx;height:4rpx;border-radius:4rpx;background:rgba(255,252,245,0.4);transition:all .3s}.bdot.active{width:36rpx;background:#FFFCF5}
.notice-strip{display:flex;align-items:center;gap:20rpx;padding:16rpx 28rpx;border-radius:24rpx;background:rgba(232,184,96,0.14);border:1rpx solid rgba(232,184,96,0.3)}.notice-badge-text{flex-shrink:0;padding:2rpx 12rpx;border-radius:8rpx;background:var(--butter);color:#3A2A0A;font-size:20rpx;font-weight:700}.notice-content{flex:1;font-size:24rpx;color:var(--ink-2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.category-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:24rpx}.cat-tile{display:flex;flex-direction:column;align-items:center;gap:12rpx}.icon-bg{width:104rpx;height:104rpx;border-radius:32rpx;display:flex;align-items:center;justify-content:center}.cat-emoji{font-size:44rpx}.cat-name{font-size:24rpx;color:var(--ink-2);font-weight:500}
.section-head{display:flex;align-items:flex-start;justify-content:space-between}.section-title-row{position:relative;display:inline-block}.section-title{font-size:44rpx;font-weight:600;color:var(--ink)}.title-underline{position:absolute;left:-4rpx;right:-4rpx;bottom:-6rpx;height:12rpx;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 6' preserveAspectRatio='none'%3E%3Cpath d='M2 4 Q 25 1 50 3 T 98 2.5' stroke='%23D97757' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")no-repeat center/100% 100%;opacity:.85}.section-sub{font-size:24rpx;color:var(--ink-3);margin-top:4rpx;display:block}.section-more{font-size:24rpx;color:var(--ink-3);margin-top:8rpx}
.hot-scroll{width:100%}.hot-list{display:inline-flex;gap:24rpx;padding:0 32rpx 44rpx}.hot-card{flex:0 0 320rpx;display:flex;flex-direction:column;border-radius:36rpx;overflow:hidden}.hot-thumb{width:100%;height:240rpx;position:relative}.hot-body{padding:20rpx 24rpx 24rpx;display:flex;flex-direction:column;flex:1}.hot-name{font-size:30rpx;font-weight:600;line-height:1.25;color:var(--ink);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:75rpx}.hot-bottom{margin-top:auto}.hot-footer{display:flex;justify-content:space-between;align-items:center;margin-top:12rpx}.hot-price{font-size:22rpx;color:var(--primary-deep);font-weight:600}
.course-row{display:flex;gap:24rpx;padding:20rpx;border-radius:32rpx;border:1rpx solid var(--line)}.row-thumb{width:176rpx;height:176rpx;border-radius:24rpx;flex-shrink:0}.row-info{flex:1;display:flex;flex-direction:column;justify-content:space-between;min-width:0;padding:4rpx 0 8rpx}.row-name{font-size:30rpx;font-weight:600;line-height:1.3;color:var(--ink)}.thumb-img{position:absolute;top:0;right:0;bottom:0;left:0;width:100%;height:100%;border-radius:inherit}
</style>
