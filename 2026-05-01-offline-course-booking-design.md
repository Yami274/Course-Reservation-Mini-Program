# 个人线下课程介绍+预约 微信小程序设计规格

## 项目概述

独立讲师线下课程展示与预约微信小程序，包含用户端与后台管理两大部分。核心业务：课程展示、在线预约报名、订单审核管理。

**业务范围**：以少儿教育课程为主，预留成人课程扩展能力。
**设计风格**：简约清新教育风，适配少儿/成人多品类线下课程。

---

## 一、技术选型

| 层级 | 技术 | 说明 |
|------|------|------|
| 小程序框架 | uni-app 3.x (Vue 3 模式) | 一套代码覆盖微信小程序，可扩展至 H5/App |
| UI 组件库 | uView Plus / uni-ui | 适配 uni-app 的 Vue3 组件库 |
| 状态管理 | Pinia | Vue 3 官方推荐 |
| 请求封装 | uni.request + 拦截器 | JWT Token 管理、错误拦截、加载态 |
| Web 后台框架 | Vue 3 + Vite + TDesign | 腾讯企业级 Vue3 组件库 |
| 后端运行时 | Node.js + Express/Koa | 异步非阻塞，适合 I/O 密集型 |
| ORM | Sequelize 或 Prisma | 统一数据模型管理 + Migration |
| 数据库 | MySQL 8.0 | 关系型，适合课程/订单/用户关联场景 |
| 缓存 | Redis | JWT 黑名单、热点数据缓存、验证码 |
| 文件存储 | 阿里云 OSS / 腾讯云 COS | 封面图、头像、轮播图 |
| 鉴权 | JWT (Access + Refresh Token) | 双 Token 机制 |
| 消息推送 | 微信订阅消息 | 审核结果、开课提醒 |
| 部署 | Nginx + PM2 + Docker | 反向代理 + 进程守护 + 容器化 |

### 扩展预留

- **支付**：接口层预留 `POST /api/orders/:id/pay`，`orders` 表预留 `pay_status`、`transaction_id` 字段
- **课时核销**：预留 `course_schedules` 排课表与核销二维码接口

---

## 二、系统架构

```
┌─────────────────────────────────────────────────────┐
│  uni-app 小程序                    Vue 3 + TDesign   │
│  (用户端 + 管理端入口)              (Web 管理后台)    │
├──────────────────────┬──────────────────────────────┤
│                      │                              │
│              Node.js REST API (Express/Koa)         │
│        JWT 认证 + RBAC 权限 + 文件上传中间件         │
│                      │                              │
│     ┌────────────────┼────────────────┐             │
│     ▼                ▼                ▼             │
│   MySQL 8.0        Redis           OSS/COS         │
│   (业务数据)       (缓存/会话)     (静态资源)       │
└─────────────────────────────────────────────────────┘
```

用户端与管理端共用同一套 REST API，通过 JWT 角色字段区分权限（`user` / `admin`）。

---

## 三、功能清单

### 3.1 用户端

| 模块 | 功能点 | 优先级 | 说明 |
|------|--------|--------|------|
| **首页** | 顶部搜索栏 | P1 | 课程关键词搜索 |
| | 轮播图 Banner | P0 | 3-5 张，可配置链接 |
| | 公告栏 | P1 | 滚动文字公告 |
| | 课程分类导航 | P0 | 图标+文字，4-8 个入口 |
| | 热门课程推荐 | P0 | 横向滑动卡片 |
| | 最新课程 | P1 | 纵向列表 |
| | 底部 TabBar | P0 | 首页/课程/预约/我的 |
| **课程列表** | 分类筛选 | P0 | Tab 切换 |
| | 多条件筛选 | P1 | 年龄/时间/地点 |
| | 课程卡片 | P0 | 封面+标题+名额 |
| | 下拉/上拉加载 | P0 | 分页 |
| **课程详情** | 课程封图 | P0 | 图片轮播 |
| | 课程介绍 | P0 | 富文本 |
| | 讲师信息 | P0 | 头像+资历+简介 |
| | 班型选择 | P0 | 启蒙班/进阶班等 |
| | 上课地点 | P0 | 地址+地图入口 |
| | 时段选择 | P0 | 日历+时间段+剩余名额 |
| | 收藏/分享 | P2 | 微信转发 |
| **预约流程** | 选班型+时段 | P0 | 仅显有名额时段 |
| | 填学员信息 | P0 | 姓名/年龄/联系方式 |
| | 提交预约 | P0 | 确认前名额提示 |
| | 预约成功页 | P0 | 审核提示+查看订单 |
| **我的预约** | 订单列表 | P0 | 按状态标签展示 |
| | 订单详情 | P0 | 课程+学员+审核状态 |
| | 取消预约 | P0 | 手动取消 |
| | 再次预约 | P1 | 快捷跳转 |
| **个人中心** | 微信头像/昵称 | P0 | 微信授权登录 |
| | 学员信息管理 | P1 | 多学员档案 |
| | 系统通知 | P0 | 审核结果推送 |
| | 联系客服 | P0 | 一键拨打/企业微信 |
| | 地址导航 | P0 | 地图导航 |
| | 关于我们 | P1 | 机构/讲师介绍 |

### 3.2 管理后台

| 模块 | 功能点 | 优先级 | 说明 |
|------|--------|--------|------|
| **仪表盘** | 核心数据概览 | P0 | 今日预约/待审核/总学员/课程数 |
| | 预约趋势图 | P1 | 近 30 天折线图 |
| | 课程排行 | P1 | 按预约量排序 |
| **课程管理** | 列表/搜索/筛选 | P0 | 课程列表 |
| | 新增/编辑 | P0 | 富文本+图片+信息配置 |
| | 上架/下架 | P0 | 控制可见性 |
| | 删除 | P0 | 有关联订单禁止删除 |
| | 班型配置 | P0 | 多班型+名额设置 |
| | 时段管理 | P0 | 班型+时段+名额 |
| **分类管理** | 列表/新增/编辑/删除 | P0 | 树形结构+图标+排序 |
| **预约管理** | 订单列表 | P0 | 状态筛选+搜索 |
| | 审核通过/拒绝 | P0 | 可填写备注 |
| | 手动取消 | P0 | 管理员取消+原因 |
| | 导出 Excel | P1 | 按条件导出 |
| **学员管理** | 学员列表 | P0 | 关联微信用户 |
| | 预约历史 | P0 | 单个学员历史 |
| | 备注标签 | P1 | 内部备注 |
| **讲师管理** | 列表/新增/编辑/删除 | P0 | 头像+资历+关联课程 |
| **地点管理** | 列表/新增/编辑/删除 | P0 | 名称+地址+地图坐标 |
| **运营配置** | 轮播图管理 | P0 | 图片+排序+链接 |
| | 公告管理 | P1 | 文字+有效期 |
| **消息推送** | 订阅消息发送 | P0 | 审核结果通知 |
| **系统设置** | 管理员账号 | P1 | 多管理员+角色权限 |
| | 操作日志 | P2 | 关键操作记录 |

### 3.3 小程序管理端（嵌入）

| 功能点 | 优先级 | 说明 |
|--------|--------|------|
| 管理入口（角色切换） | P1 | 用户端内切换至管理视图 |
| 待审核列表 | P1 | 审核通过/拒绝操作 |
| 今日数据概览 | P1 | 预约数/名额使用量 |
| 扫码核销 | P2 | 预留接口 |

---

## 四、页面结构

### 4.1 用户端（14 页）

**TabBar 页面：**
- `pages/index/index` — 首页
- `pages/course/list` — 课程列表
- `pages/order/list` — 我的预约
- `pages/mine/index` — 个人中心

**子页面：**
- `pages/course/detail` — 课程详情（封面/介绍/讲师/班型/地点/时段）
- `pages/course/search` — 搜索页
- `pages/course/teacher` — 讲师详情
- `pages/order/create` — 确认预约（时段+学员信息）
- `pages/order/detail` — 预约详情
- `pages/order/success` — 预约成功
- `pages/mine/students` — 学员管理（列表+添加/编辑）
- `pages/mine/favorites` — 我的收藏
- `pages/mine/notifications` — 系统通知
- `pages/mine/location` — 地址导航

### 4.2 Web 管理后台（15+ 页）

- `dashboard` — 仪表盘（数据概览+趋势图+排行榜）
- `courses` — 课程列表
- `courses/create` / `courses/:id/edit` — 新增/编辑课程（含班型+时段配置）
- `categories` — 分类管理
- `orders` — 预约订单列表（审核+导出）
- `students` — 学员列表
- `students/:id` — 学员详情（预约历史+备注）
- `teachers` — 讲师管理
- `locations` — 上课地点管理
- `settings/banners` — 轮播图配置
- `settings/notices` — 公告配置
- `settings/messages` — 订阅消息模板
- `system/admins` — 管理员账号管理

### 4.3 小程序管理端（3 页）

- `pages/admin/dashboard` — 管理入口 + 今日数据面板
- `pages/admin/orders` — 待审核订单列表 + 审核操作
- `pages/admin/checkin` — 扫码核销 (P2 预留)

---

## 五、数据模型概要

```
users (用户)
  id, openid, nickname, avatar, phone, role(user/admin), created_at

students (学员档案)
  id, user_id, name, age, phone, notes, created_at

categories (课程分类)
  id, name, icon, sort, parent_id, created_at

courses (课程)
  id, category_id, title, cover, intro(richtext), status(draft/published/archived)
  teacher_ids(JSON数组), location_ids(JSON数组), created_at

course_types (班型)
  id, course_id, name, capacity, price(decimal,预留), created_at

course_schedules (时段)
  id, course_type_id, date, start_time, end_time, booked_count, max_count
  status(active/cancelled/full)
  -- 为核销预留字段: check_in_code, checked_in_at

orders (预约订单)
  id, user_id, course_id, course_type_id, schedule_id
  student_id, status(pending/approved/rejected/cancelled), audit_remark
  pay_status(unpaid/paid/refunded, 预留), transaction_id(预留), created_at

teachers (讲师)
  id, name, avatar, title, intro, created_at

locations (上课地点)
  id, name, address, latitude, longitude, contact, created_at

banners (轮播图)
  id, image, link_url, sort, status, created_at

notices (公告)
  id, content, start_date, end_date, status, created_at
```

---

## 六、API 路由规划

```
# 用户端
GET    /api/courses              # 课程列表（分页+筛选）
GET    /api/courses/:id          # 课程详情（含讲师/班型/时段）
GET    /api/categories           # 分类列表
GET    /api/schedules/:id        # 时段详情+剩余名额
POST   /api/orders               # 提交预约
GET    /api/orders               # 我的预约列表
GET    /api/orders/:id           # 预约详情
PUT    /api/orders/:id/cancel    # 取消预约
GET    /api/banners              # 轮播图列表
GET    /api/notices              # 公告列表
POST   /api/students             # 添加学员
GET    /api/students             # 我的学员列表
PUT    /api/students/:id         # 编辑学员

# 管理端
POST   /api/admin/login          # 管理员登录
GET    /api/admin/dashboard      # 仪表盘数据
GET    /api/admin/orders         # 订单列表
PUT    /api/admin/orders/:id/audit   # 审核订单
GET    /api/admin/orders/export  # 导出Excel
CRUD   /api/admin/courses        # 课程管理
CRUD   /api/admin/course-types   # 班型管理
CRUD   /api/admin/schedules      # 时段管理
CRUD   /api/admin/categories     # 分类管理
CRUD   /api/admin/teachers       # 讲师管理
CRUD   /api/admin/locations      # 地点管理
CRUD   /api/admin/banners        # 轮播图管理
CRUD   /api/admin/notices        # 公告管理
POST   /api/admin/messages       # 发送订阅消息
```

---

## 七、业务规则

1. **免费预约**：无需支付，提交即进入审核流程
2. **名额限制**：每个时段独立设置 `max_count`，预约扣减 `booked_count`，取消后释放
3. **审核机制**：用户提交后状态为 `pending`，管理员审核为 `approved` / `rejected`
4. **手动取消**：用户可在待审核/已通过状态下取消预约，释放名额
5. **删除保护**：有关联订单的课程/班型/时段禁止删除，强制下架替代
6. **消息通知**：审核结果（通过/拒绝）通过微信订阅消息推送用户

---

## 八、非功能需求

- 页面首屏加载 < 2s（小程序端）
- 图片懒加载 + CDN 加速
- 接口响应时间 P99 < 500ms
- 移动端适配 375px-428px 屏幕宽度
- 符合微信小程序审核规范（无诱导分享、无虚拟支付）

---

## 九、项目交付阶段

| 阶段 | 范围 | 预计周期 |
|------|------|----------|
| Phase 1 (MVP) | 所有 P0 功能 | 2-4 周 |
| Phase 2 | 所有 P1 功能 | 1-2 周 |
| Phase 3 | P2 功能 + 优化 | 按需迭代 |
