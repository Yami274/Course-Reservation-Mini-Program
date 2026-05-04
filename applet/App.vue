<script>
import { useUserStore } from './stores/user.js'

export default {
	onLaunch: function() {
		console.log('安然画室小程序启动')
		// #ifdef VUE3
		const userStore = useUserStore()
		userStore.initFromStorage()
		// #endif
	},
	onShow: function() {
		console.log('App Show')
	},
	onHide: function() {
		console.log('App Hide')
	}
}
</script>

<style lang="scss">
/* 温暖手作风设计系统 */
/* Google Fonts 不支持在 WXSS 中以 @import url() 加载，使用系统字体回退 */

page {
	/* 暖米纸调色板 */
	--paper: #F5EDE0;
	--paper-2: #FAF4E8;
	--ink: #2A2520;
	--ink-2: #5A4F44;
	--ink-3: #8A7E70;
	--line: rgba(42, 37, 32, 0.10);
	--line-2: rgba(42, 37, 32, 0.06);
	--card: #FFFCF5;

	/* 主色 — 赤陶橙 */
	--primary: #D97757;
	--primary-soft: #F2C9B5;
	--primary-deep: #B5573A;

	/* 辅助色 */
	--moss: #6B7F5A;
	--moss-soft: #C7D1B6;
	--berry: #A0473F;
	--sky: #7A9CB0;
	--butter: #E8B860;

	--tab-bar-h: 98rpx;

	background-color: #F5EDE0;
	font-family: -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', system-ui, sans-serif;
	color: #2A2520;
	font-size: 28rpx;
	line-height: 1.5;
	-webkit-font-smoothing: antialiased;
	overflow-x: hidden;
	box-sizing: border-box;
}

/* 全局盒模型 — 防止内容溢出 */
view, scroll-view, swiper, swiper-item, image, text, input, button, navigator {
	box-sizing: border-box;
}

/* ── 纸张底纹背景 ─────────────────────────────────────────── */
.paper-bg {
	background-color: var(--paper);
}

/* ── 卡片 ───────────────────────────────────────────────────── */
.card {
	background: var(--card);
	border-radius: 36rpx;
	border: 1rpx solid var(--line);
}

/* ── 状态标签 ──────────────────────────────────────────────── */
.pill {
	display: inline-flex;
	align-items: center;
	gap: 8rpx;
	padding: 6rpx 18rpx;
	border-radius: 999rpx;
	font-size: 22rpx;
	font-weight: 500;
	letter-spacing: 0.02em;
}
.pill-primary { background: var(--primary-soft); color: var(--primary-deep); }
.pill-moss    { background: var(--moss-soft);    color: var(--moss); }
.pill-ink     { background: rgba(42,37,32,0.08); color: var(--ink-2); }

/* ── 按钮 ───────────────────────────────────────────────────── */
.btn-primary {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
	background: var(--primary);
	color: #FFFCF5;
	border: none;
	border-radius: 32rpx;
	padding: 28rpx 40rpx;
	font-size: 32rpx;
	font-weight: 600;
	font-family: inherit;
	box-shadow: 0 8rpx 28rpx rgba(217,119,87,0.35), inset 0 2rpx 0 rgba(255,255,255,0.25);
}
.btn-ghost {
	background: transparent;
	color: var(--ink);
	border: 1rpx solid var(--line);
	border-radius: 32rpx;
	padding: 26rpx 40rpx;
	font-size: 30rpx;
	font-weight: 500;
	font-family: inherit;
}

/* ── 字体 ───────────────────────────────────────────────────── */
.serif  { font-family: 'Fraunces', 'Noto Serif SC', Georgia, serif; font-optical-sizing: auto; }
.hand   { font-family: 'Fraunces', 'Noto Serif SC', serif; font-style: italic; }
.display{ font-family: 'Fraunces', 'Noto Serif SC', sans-serif; letter-spacing: 0.01em; }

/* ── 阴影 ───────────────────────────────────────────────────── */
.shadow-warm { box-shadow: 0 12rpx 48rpx rgba(120,80,40,0.10), 0 2rpx 6rpx rgba(120,80,40,0.06); }
.shadow-deep { box-shadow: 0 28rpx 80rpx rgba(120,80,40,0.16), 0 4rpx 12rpx rgba(120,80,40,0.08); }

/* ── 手绘下划线 ─────────────────────────────────────────────── */
.hand-underline {
	position: relative;
	display: inline-block;
}

/* ── 点阵分隔线 ─────────────────────────────────────────────── */
.dot-divider {
	display: flex;
	align-items: center;
	gap: 8rpx;
	color: var(--ink-3);
	font-size: 22rpx;
	padding: 0 16rpx;
}

/* ── 标签 ───────────────────────────────────────────────────── */
.tag {
	display: inline-flex;
	align-items: center;
	gap: 6rpx;
	padding: 6rpx 16rpx;
	border-radius: 12rpx;
	background: rgba(42,37,32,0.05);
	font-size: 22rpx;
	color: var(--ink-2);
}

/* ── 日历日期格 ─────────────────────────────────────────────── */
.cal-day {
	width: 80rpx;
	height: 112rpx;
	border-radius: 24rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	font-size: 22rpx;
	color: var(--ink-2);
	flex-shrink: 0;
	border: 1rpx solid var(--line);
}
.cal-day .num {
	font-size: 36rpx;
	font-weight: 600;
	color: var(--ink);
	margin-top: 4rpx;
}
.cal-day.active {
	background: var(--primary);
	color: rgba(255,252,245,0.85);
	border-color: var(--primary);
}
.cal-day.active .num { color: #FFFCF5; }
.cal-day.full { opacity: 0.45; }

/* ── 印章 ───────────────────────────────────────────────────── */
.stamp {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	border: 3rpx solid currentColor;
	border-radius: 12rpx;
	padding: 6rpx 16rpx;
	font-size: 22rpx;
	font-weight: 700;
	letter-spacing: 0.1em;
	color: var(--berry);
	transform: rotate(-4deg);
	background: rgba(255,255,255,0.5);
}

/* ── 搜索框 ─────────────────────────────────────────────────── */
.search-box {
	display: flex;
	align-items: center;
	gap: 16rpx;
	height: 76rpx;
	padding: 0 28rpx;
	background: var(--card);
	border-radius: 999rpx;
	border: 1rpx solid var(--line);
	color: var(--ink-3);
	font-size: 26rpx;
}

/* ── 分类图标格 ─────────────────────────────────────────────── */
.cat-tile {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 12rpx;
	font-size: 24rpx;
	color: var(--ink-2);
}
.cat-tile .icon-bg {
	width: 104rpx;
	height: 104rpx;
	border-radius: 32rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 48rpx;
}

/* ── 通知点 ─────────────────────────────────────────────────── */
.dot-badge {
	width: 16rpx;
	height: 16rpx;
	border-radius: 50%;
	background: var(--primary);
	box-shadow: 0 0 0 4rpx var(--card);
}

/* ── 分割线 ─────────────────────────────────────────────────── */
.hr { height: 1rpx; background: var(--line); border: none; margin: 0; }

/* ── 地图背景 ────────────────────────────────────────────────── */
.map-bg {
	background:
		linear-gradient(rgba(255,255,255,0.4) 2rpx, transparent 2rpx),
		linear-gradient(90deg, rgba(255,255,255,0.4) 2rpx, transparent 2rpx),
		linear-gradient(135deg, #E8DFC8 0%, #DDD0B0 100%);
	background-size: 48rpx 48rpx, 48rpx 48rpx, 100% 100%;
}

/* ── 头像圆 ─────────────────────────────────────────────────── */
.avatar {
	border-radius: 50%;
	overflow: hidden;
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: 700;
	color: #FFFCF5;
}

/* ── 占位图 ─────────────────────────────────────────────────── */
.ph {
	position: relative;
	overflow: hidden;
	background-color: var(--primary-soft);
	display: flex;
	align-items: center;
	justify-content: center;
	color: var(--primary-deep);
	font-size: 20rpx;
}
.ph.moss   { background-color: var(--moss-soft);  color: var(--moss); }
.ph.butter { background-color: #F4DFB1;            color: #8A6520; }
.ph.sky    { background-color: #C5D5DD;            color: #3F5A6B; }
.ph.berry  { background-color: #E5BEB9;            color: #7A2E2A; }

/* ── 分段控制器 ─────────────────────────────────────────────── */
.seg {
	display: flex;
	padding: 6rpx;
	background: rgba(42,37,32,0.06);
	border-radius: 999rpx;
	font-size: 26rpx;
}
.seg-btn {
	flex: 1;
	border: none;
	background: transparent;
	padding: 14rpx 28rpx;
	border-radius: 999rpx;
	color: var(--ink-2);
	font-weight: 500;
	font-family: inherit;
	text-align: center;
	font-size: 26rpx;
}
.seg-btn.active {
	background: var(--card);
	color: var(--ink);
	box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.06);
}

/* ── 功能角标 ────────────────────────────────────────────────── */
.tag-ribbon {
	position: absolute;
	top: 20rpx;
	left: 20rpx;
	padding: 8rpx 18rpx;
	border-radius: 12rpx;
	background: var(--primary);
	color: #FFFCF5;
	font-size: 22rpx;
	font-weight: 600;
	letter-spacing: 0.02em;
}
</style>
