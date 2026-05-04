# 安然画室 · API 接口文档

> 版本：v1.0 · 最后更新：2026-05-02
> 技术栈：Node.js + Express · MySQL · JWT
> Base URL：`http://localhost:3000`（开发）/ `https://api.anran-studio.com`（生产）
> 
> 标注说明：`✅ 已实现` / `⚠️ 预留/待实现`

---

## 目录

- [通用约定](#通用约定)
- [认证鉴权](#认证鉴权)
- [用户端接口](#用户端接口)
  - [首页 & 公共](#首页--公共)
  - [课程模块](#课程模块)
  - [预约订单](#预约订单)
  - [学员档案](#学员档案)
- [管理端接口](#管理端接口)
  - [管理员认证](#管理员认证)
  - [仪表盘](#仪表盘)
  - [课程管理](#课程管理)
  - [班型 & 时段管理](#班型--时段管理)
  - [分类管理](#分类管理)
  - [预约审核](#预约审核)
  - [讲师管理](#讲师管理)
  - [地点管理](#地点管理)
  - [轮播图管理](#轮播图管理)
  - [公告管理](#公告管理)
  - [消息推送](#消息推送)
  - [文件上传](#文件上传)
- [预留接口](#预留接口)
- [数据模型](#数据模型)
- [错误码](#错误码)

---

## 通用约定

### 请求格式
- Content-Type: `application/json`（除文件上传使用 `multipart/form-data`）
- 字符编码: `UTF-8`
- 时间格式: ISO 8601（`2026-05-18T09:30:00+08:00`）

### 响应格式
```json
{
  "code": 0,
  "message": "ok",
  "data": { ... }
}
```
- `code`: 0 = 成功，其他 = 失败
- `message`: 提示信息
- `data`: 响应数据（失败时为 null）

### 分页参数（GET 列表接口）
| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `page` | number | 1 | 页码 |
| `pageSize` | number | 10 | 每页条数 |

### 分页响应
```json
{
  "code": 0,
  "data": {
    "list": [],
    "total": 100,
    "page": 1,
    "pageSize": 10,
    "totalPages": 10
  }
}
```

---

## 认证鉴权

### JWT 单 Token 机制 ✅
- **Token**：有效期由环境变量 `JWT_EXPIRES_IN` 控制（默认 7 天）
- 请求头携带：`Authorization: Bearer <token>`
- 用户端 Token 通过微信登录获取
- 管理端 Token 通过用户名密码登录获取

> ⚠️ 注意：当前实现为单 Token 机制，api-docs 旧版文档中描述的双 Token（access_token + refresh_token）**尚未实现**。

---

## 用户端接口

> 路由前缀：`/api`

### 首页 & 公共

#### 获取轮播图列表 ✅
```
GET /api/banners
```
仅返回 `status=active` 的轮播图，按 `sort` 升序排列。

**响应：**
```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "image": "https://oss.example.com/banners/spring.jpg",
      "link_url": "/pages/course/detail?id=1",
      "sort": 1,
      "status": "active",
      "created_at": "2026-05-01T00:00:00.000Z"
    }
  ]
}
```

---

#### 获取公告列表 ✅
```
GET /api/notices
```
仅返回当天在有效期范围内（start_date ≤ today ≤ end_date）且 `status=active` 的公告。

**响应：**
```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "content": "五一假期排课调整，详情查看 →",
      "start_date": "2026-04-28",
      "end_date": "2026-05-06",
      "status": "active",
      "created_at": "2026-05-01T00:00:00.000Z"
    }
  ]
}
```

---

#### 微信登录 ✅
```
POST /api/auth/login
```
**请求体：**
```json
{
  "code": "wx_login_code_from_wx.login()",
  "nickname": "用户昵称（可选）",
  "avatar": "头像URL（可选）"
}
```
**开发环境：** `.env` 中 `WX_APP_ID` / `WX_APP_SECRET` 未配置时，**无论传什么 body**，均使用测试账号 `openid=dev_test_openid` 自动登录。Apifox 调试时直接发送空 JSON `{}` 即可获取 token。

**响应：**
```json
{
  "code": 0,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "openid": "oXXXX",
      "nickname": "朵朵妈",
      "avatar": "https://...",
      "phone": "",
      "role": "user",
      "created_at": "2026-05-01T00:00:00.000Z"
    }
  }
}
```

---

### 课程模块

#### 获取课程列表 ✅
```
GET /api/courses
```
**Query 参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `category_id` | number | 按分类筛选 |
| `keyword` | string | 搜索关键词（匹配课程标题） |
| `status` | string | `published`（默认）/ `draft` / `archived` |
| `page` | number | 页码（默认 1） |
| `pageSize` | number | 每页条数（默认 10） |

**响应：**
```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "id": 1,
        "title": "Scratch 少儿编程启蒙班",
        "cover": "",
        "status": "published",
        "category": { "id": 1, "name": "少儿编程" },
        "created_at": "2026-05-01T00:00:00.000Z"
      }
    ],
    "total": 9,
    "page": 1,
    "pageSize": 10,
    "totalPages": 1
  }
}
```

---

#### 获取热门课程 ✅
```
GET /api/courses/hot
```
**Query 参数：**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `limit` | number | 6 | 返回数量 |

返回已发布课程中按创建时间倒序的前 N 个。

**响应：**
```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "title": "Scratch 少儿编程启蒙班",
      "cover": "",
      "status": "published",
      "category": { "id": 1, "name": "少儿编程" },
      "created_at": "2026-05-01T00:00:00.000Z"
    }
  ]
}
```

---

#### 获取课程详情 ✅
```
GET /api/courses/:id
```
**响应：**
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "title": "Scratch 少儿编程启蒙班",
    "cover": "",
    "intro": "<h3>课程介绍</h3><p>富文本内容...</p>",
    "teacher_ids": [1],
    "location_ids": [1, 2],
    "status": "published",
    "category": { "id": 1, "name": "少儿编程" },
    "teachers": [
      {
        "id": 1,
        "name": "张老师",
        "avatar": "",
        "title": "资深编程讲师 / 5年教学经验",
        "intro": "毕业于XX大学计算机系...",
        "created_at": "2026-05-01T00:00:00.000Z"
      }
    ],
    "locations": [
      {
        "id": 1,
        "name": "万达校区",
        "address": "XX市万达广场3楼301室",
        "latitude": 30.572260,
        "longitude": 104.066540,
        "contact": "13800138000",
        "created_at": "2026-05-01T00:00:00.000Z"
      }
    ],
    "courseTypes": [
      {
        "id": 1,
        "course_id": 1,
        "name": "启蒙班（周六上午）",
        "capacity": 15,
        "price": 0,
        "created_at": "2026-05-01T00:00:00.000Z",
        "schedules": [
          {
            "id": 1,
            "course_type_id": 1,
            "date": "2026-05-09",
            "start_time": "09:00:00",
            "end_time": "11:00:00",
            "max_count": 15,
            "booked_count": 5,
            "status": "active",
            "created_at": "2026-05-01T00:00:00.000Z"
          }
        ]
      }
    ],
    "created_at": "2026-05-01T00:00:00.000Z"
  }
}
```
> ⚠️ 注意：用户端详情仅返回 `status` 为 `active` 或 `full` 的时段（非 cancelled）。

---

#### 获取分类列表 ✅
```
GET /api/categories
```
**响应：**
```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "name": "少儿编程",
      "icon": "/static/icons/code.png",
      "sort": 1,
      "parent_id": 0,
      "created_at": "2026-05-01T00:00:00.000Z"
    }
  ]
}
```

---

#### 获取时段详情（含关联课程信息） ✅
```
GET /api/schedules/:id
```
**响应：**
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "course_type_id": 1,
    "date": "2026-05-09",
    "start_time": "09:00:00",
    "end_time": "11:00:00",
    "max_count": 15,
    "booked_count": 5,
    "status": "active",
    "check_in_code": null,
    "checked_in_at": null,
    "created_at": "2026-05-01T00:00:00.000Z",
    "courseType": {
      "id": 1,
      "course_id": 1,
      "name": "启蒙班（周六上午）",
      "capacity": 15,
      "price": 0,
      "course": { "id": 1, "title": "Scratch 少儿编程启蒙班" }
    }
  }
}
```

---

#### 获取上课地点列表 ✅
```
GET /api/locations
```
**响应：**
```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "name": "万达校区",
      "address": "XX市万达广场3楼301室",
      "latitude": 30.572260,
      "longitude": 104.066540,
      "contact": "13800138000",
      "created_at": "2026-05-01T00:00:00.000Z"
    }
  ]
}
```

---

### 预约订单

> 以下接口需携带 Token：`Authorization: Bearer <token>`

#### 提交预约 ✅
```
POST /api/orders
```
**请求体：**
```json
{
  "course_id": 1,
  "course_type_id": 1,
  "schedule_id": 1,
  "student_id": 1
}
```
**响应：**
```json
{
  "code": 0,
  "message": "预约已提交，请等待管理员审核",
  "data": {
    "id": 1,
    "order_no": null,
    "user_id": 1,
    "course_id": 1,
    "course_type_id": 1,
    "schedule_id": 1,
    "student_id": 1,
    "status": "pending",
    "audit_remark": "",
    "pay_status": "unpaid",
    "transaction_id": null,
    "created_at": "2026-05-02T10:00:00.000Z"
  }
}
```
> ⚠️ 注意：当前后端 Order 模型**未生成** `order_no` 字段（虽然数据库有定义）。预约成功后状态为 `pending`，等待管理员审核。

**业务规则（已实现）：**
- 检查同时段是否已有 `pending`/`approved` 的预约（防重复提交）
- 名额检查使用数据库行级锁（防超卖）
- 提交成功后 `booked_count` +1

---

#### 获取我的预约列表 ✅
```
GET /api/orders
```
**Query 参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `status` | string | `pending`/`approved`/`rejected`/`cancelled`（不传返回全部） |
| `page` | number | 页码 |

**响应：**
```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "id": 1,
        "user_id": 1,
        "course_id": 1,
        "course_type_id": 1,
        "schedule_id": 1,
        "student_id": 1,
        "status": "pending",
        "audit_remark": "",
        "pay_status": "unpaid",
        "transaction_id": null,
        "course": {
          "id": 1,
          "title": "Scratch 少儿编程启蒙班",
          "cover": ""
        },
        "courseType": { "id": 1, "name": "启蒙班（周六上午）" },
        "schedule": {
          "id": 1,
          "date": "2026-05-09",
          "start_time": "09:00:00",
          "end_time": "11:00:00"
        },
        "student": { "id": 1, "name": "朵朵", "age": 5, "phone": "13800138000" },
        "created_at": "2026-05-02T10:00:00.000Z"
      }
    ],
    "total": 8,
    "page": 1,
    "pageSize": 10,
    "totalPages": 1
  }
}
```

---

#### 获取预约详情 ✅
```
GET /api/orders/:id
```
返回当前用户指定订单的完整信息（含课程、班型、时段、学员）。

---

#### 取消预约 ✅
```
PUT /api/orders/:id/cancel
```
**无需请求体**（当前后端不读取 `reason` 字段）。

**业务规则（已实现）：**
- 仅允许 `pending` 或 `approved` 状态下取消
- 取消后 `booked_count` -1（释放名额）

---

### 学员档案

> 以下接口需携带 Token

#### 获取我的学员列表 ✅
```
GET /api/students
```
**响应：**
```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "name": "朵朵",
      "age": 5,
      "phone": "13800138000",
      "notes": "",
      "created_at": "2026-05-01T00:00:00.000Z"
    }
  ]
}
```

---

#### 添加学员 ✅
```
POST /api/students
```
**请求体：**
```json
{
  "name": "朵朵",
  "age": 5,
  "phone": "13800138000",
  "notes": ""
}
```
`name` 必填，其余可选。

---

#### 编辑学员 ✅
```
PUT /api/students/:id
```
**请求体：** 同添加学员（字段可选，传什么更新什么）

---

#### 删除学员 ✅
```
DELETE /api/students/:id
```
> ⚠️ 注意：当前后端**未检查**学员是否有关联预约记录，可直接删除。后续版本会加入关联订单检查。

---

## 管理端接口

> 路由前缀：`/api/admin`
> 所有管理端接口需携带管理员 Token（通过 `/api/admin/login` 获取），且 `role` 必须为 `admin`

### 管理员认证

#### 管理员登录 ✅
```
POST /api/admin/login
```
**请求体：**
```json
{
  "username": "admin",
  "password": "admin123"
}
```
- `username` 对应 `users` 表中 `nickname` 字段、`role=admin` 的用户
- `password` 由环境变量 `ADMIN_PASSWORD` 控制，默认为 `admin123`

**响应：**
```json
{
  "code": 0,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "openid": "admin_test_openid",
      "nickname": "admin",
      "avatar": "",
      "phone": "",
      "role": "admin",
      "created_at": "2026-05-01T00:00:00.000Z"
    }
  }
}
```

---

### 仪表盘

#### 获取仪表盘数据 ✅
```
GET /api/admin/dashboard
```
**响应（当前后端实际字段）：**
```json
{
  "code": 0,
  "data": {
    "todayOrders": 5,
    "pendingCount": 3,
    "totalStudents": 120,
    "totalCourses": 8,
    "trend": [
      { "date": "2026-04-01", "count": 10 },
      { "date": "2026-04-02", "count": 8 }
    ]
  }
}
```
> ⚠️ 注意：当前仪表盘仅返回上述 5 个统计字段（今日订单、待审核数、学员总数、课程总数、30天趋势）。旧版文档中描述的 `course_ranking`、`today_schedules`、`recent_pending_orders` 等字段**尚未实现**。

---

### 课程管理

#### 获取课程列表（管理端） ✅
```
GET /api/admin/courses
```
**Query 参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `status` | string | `draft`/`published`/`archived` |
| `keyword` | string | 关键词搜索课程标题 |
| `page` | number | 页码 |
| `pageSize` | number | 每页条数 |

**响应格式：** 同用户端课程列表（分页）。

---

#### 课程详情（管理端） ✅
```
GET /api/admin/courses/:id
```
返回课程完整信息，包含**全部**班型和时段（含 cancelled 状态）。

---

#### 新增课程 ✅
```
POST /api/admin/courses
```
**请求体：**
```json
{
  "title": "Scratch 少儿编程启蒙班",
  "category_id": 1,
  "cover": "",
  "intro": "<p>课程介绍HTML</p>",
  "teacher_ids": [1],
  "location_ids": [1, 2],
  "status": "draft"
}
```
必填：`title`、`category_id`

---

#### 编辑课程 ✅
```
PUT /api/admin/courses/:id
```
**请求体：** 同新增（字段可选）

---

#### 课程上下架 ✅
```
PUT /api/admin/courses/:id/status
```
**请求体：**
```json
{ "status": "published" }
```
可选值: `draft` / `published` / `archived`

---

#### 删除课程 ✅
```
DELETE /api/admin/courses/:id
```
**业务规则（已实现）：** 有关联订单的课程禁止删除（返回错误）。无关联订单时，级联删除关联的班型和时段。

---

### 班型 & 时段管理

#### 添加班型 ✅
```
POST /api/admin/courses/:courseId/types
```
**请求体：**
```json
{
  "name": "启蒙班（周六上午）",
  "capacity": 15,
  "price": 0
}
```
必填：`name`。`capacity` 默认 20，`price` 默认 0。

---

#### 编辑班型 ✅
```
PUT /api/admin/courses/types/:id
```

---

#### 删除班型 ✅
```
DELETE /api/admin/courses/types/:id
```
级联删除关联的时段。

---

#### 添加时段 ✅
```
POST /api/admin/courses/types/:typeId/schedules
```
**请求体：**
```json
{
  "date": "2026-05-10",
  "start_time": "09:00:00",
  "end_time": "11:00:00",
  "max_count": 15
}
```
必填：`date`、`start_time`、`end_time`。`max_count` 默认 20。初始 `booked_count=0`，`status=active`。

---

#### 编辑时段 ✅
```
PUT /api/admin/courses/schedules/:id
```
**业务规则：** 修改 `max_count` 时不能低于 `booked_count`（已预约人数）。

---

#### 删除时段 ✅
```
DELETE /api/admin/courses/schedules/:id
```
**业务规则：** 已有预约的时段禁止删除。

---

### 分类管理

#### 获取分类列表 ✅
```
GET /api/admin/categories
```

#### 新增分类 ✅
```
POST /api/admin/categories
```
**请求体：**
```json
{
  "name": "少儿编程",
  "icon": "/static/icons/code.png",
  "sort": 1,
  "parent_id": 0
}
```

#### 编辑分类 ✅
```
PUT /api/admin/categories/:id
```

#### 删除分类 ✅
```
DELETE /api/admin/categories/:id
```
**业务规则（已实现）：** 有关联课程的分类不可删除。

---

### 预约审核

#### 获取订单列表（管理端） ✅
```
GET /api/admin/orders
```
**Query 参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `status` | string | `pending`/`approved`/`rejected`/`cancelled` |
| `keyword` | string | 搜索（⚠️ 当前后端未实现搜索逻辑，仅做参数接收） |
| `page` | number | 页码 |

**响应字段：** 包含 `user`（id/nickname/avatar/phone）、`course`、`courseType`、`schedule`、`student`

---

#### 订单详情（管理端） ✅
```
GET /api/admin/orders/:id
```

---

#### 审核订单（通过/拒绝） ✅
```
PUT /api/admin/orders/:id/audit
```
**请求体：**
```json
{
  "action": "approve",
  "remark": "审核通过"
}
```
- `action` 可选值: `approve` / `reject`
- `remark` 可选，审核备注

**业务规则（已实现）：**
- 仅 `pending` 状态订单可审核
- `approve` → `status` 改为 `approved`
- `reject` → `status` 改为 `rejected`，`booked_count` -1（释放名额）

---

#### 管理员取消订单 ✅
```
PUT /api/admin/orders/:id/cancel
```
**无需请求体**。任意状态订单均可取消，取消后释放名额。

---

### 讲师管理

#### 获取讲师列表 ✅
```
GET /api/admin/teachers
```

#### 新增讲师 ✅
```
POST /api/admin/teachers
```
**请求体：**
```json
{
  "name": "张老师",
  "avatar": "",
  "title": "资深编程讲师",
  "intro": "毕业于XX大学..."
}
```
必填：`name`。

> ⚠️ 注意：当前后端 Teacher 模型仅有 `name`、`avatar`、`title`、`intro` 四个字段。旧版文档中描述的 `specialties`（特长数组）和 `years`（教龄）字段**尚未实现**。

#### 编辑讲师 ✅
```
PUT /api/admin/teachers/:id
```

#### 删除讲师 ✅
```
DELETE /api/admin/teachers/:id
```
> ⚠️ 注意：当前后端**未检查**讲师是否有关联课程，可直接删除。后续版本会加入关联检查。

---

### 地点管理

#### 获取地点列表 ✅
```
GET /api/admin/locations
```

#### 新增地点 ✅
```
POST /api/admin/locations
```
**请求体：**
```json
{
  "name": "万达校区",
  "address": "XX市万达广场3楼301室",
  "latitude": 30.572260,
  "longitude": 104.066540,
  "contact": "13800138000"
}
```
必填：`name`、`address`。

> ⚠️ 注意：当前后端 Location 模型仅有 `name`、`address`、`latitude`、`longitude`、`contact` 五个字段。旧版文档中描述的 `status` 字段**尚未实现**。

#### 编辑地点 ✅
```
PUT /api/admin/locations/:id
```

#### 删除地点 ✅
```
DELETE /api/admin/locations/:id
```

---

### 轮播图管理

#### 获取轮播图列表 ✅
```
GET /api/admin/banners
```
返回全部轮播图（含非启用状态），按 `sort` 升序排列。

#### 新增轮播图 ✅
```
POST /api/admin/banners
```
**请求体：**
```json
{
  "image": "https://oss.example.com/banners/spring.jpg",
  "link_url": "/pages/course/detail?id=1",
  "sort": 1,
  "status": "active"
}
```
必填：`image`。`sort` 默认 0，`status` 默认 `active`（可选 `inactive`）。

> ⚠️ 注意：当前后端 Banner 模型仅有 `image`、`link_url`、`sort`、`status` 四个业务字段。旧版文档中描述的 `title`、`subtitle`、`start_date`、`end_date` 字段**尚未实现**。

#### 编辑轮播图 ✅
```
PUT /api/admin/banners/:id
```
修改 `sort` 字段即可调整排序。

#### 删除轮播图 ✅
```
DELETE /api/admin/banners/:id
```

---

### 公告管理

#### 获取公告列表 ✅
```
GET /api/admin/notices
```
返回全部公告（含非启用状态），按创建时间倒序。

#### 新增公告 ✅
```
POST /api/admin/notices
```
**请求体：**
```json
{
  "content": "五一假期排课调整，详情查看 →",
  "start_date": "2026-04-28",
  "end_date": "2026-05-06",
  "status": "active"
}
```
必填：`content`、`start_date`、`end_date`。

#### 编辑公告 ✅
```
PUT /api/admin/notices/:id
```

#### 删除公告 ✅
```
DELETE /api/admin/notices/:id
```

---

### 消息推送

#### 发送订阅消息 ✅
```
POST /api/admin/messages
```
**请求体：**
```json
{
  "user_openid": "oXXXX",
  "template_id": "wx_template_id_from_mp",
  "page": "/pages/order/detail?id=101",
  "data": {
    "thing1": { "value": "Scratch 少儿编程启蒙班" },
    "thing2": { "value": "审核通过" },
    "time3": { "value": "2026年05月09日 09:00" },
    "thing4": { "value": "请提前5分钟到达" }
  }
}
```
必填：`user_openid`、`template_id`、`data`。

**前置条件：** 需在 `.env` 中配置 `WECHAT_APPID` 和 `WECHAT_APPSECRET`。

---

### 文件上传

#### 上传文件 ✅
```
POST /api/admin/upload
```
**Content-Type:** `multipart/form-data`

**表单字段：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `file` | File | 图片文件（jpg/png/gif/webp，≤5MB） |

**响应：**
```json
{
  "code": 0,
  "message": "上传成功",
  "data": {
    "url": "/uploads/2026-05/1714500000_abc123.jpg",
    "filename": "1714500000_abc123.jpg"
  }
}
```
- 配置了阿里云 OSS 则上传到 OSS 并返回 CDN URL
- 未配置 OSS 则保存在本地 `uploads/` 目录

---

## 预留接口

> 以下接口已在数据库层预留字段或文档中规划，**当前后端尚未实现**。

### 个人中心 ⚠️
```
GET  /api/user/profile          # 获取用户信息
PUT  /api/user/profile          # 更新用户信息
GET  /api/user/notifications    # 系统通知列表
PUT  /api/user/notifications/:id/read  # 标记通知已读
```

### Token 刷新 ⚠️
```
POST /api/auth/refresh          # 刷新 Token
```

### 管理端扩展 ⚠️
```
POST /api/admin/logout                   # 管理员登出
POST /api/admin/orders/batch-approve     # 批量审核通过
GET  /api/admin/orders/export            # 导出订单 Excel
GET  /api/admin/students                 # 学员列表（管理端）
GET  /api/admin/students/:id             # 学员详情（管理端）
PUT  /api/admin/students/:id/note        # 添加学员备注
GET  /api/admin/messages                 # 推送记录列表
GET  /api/admin/system/admins            # 管理员列表
POST /api/admin/system/admins            # 新增管理员
PUT  /api/admin/system/admins/:id/password  # 修改管理员密码
GET  /api/admin/system/logs              # 操作日志
```

### 支付模块 ⚠️
```
POST /api/orders/:id/pay            # 发起支付
GET  /api/orders/:id/pay-status     # 查询支付状态
POST /api/admin/orders/:id/refund   # 退款
```

### 课时核销 ⚠️
```
GET  /api/schedules/:id/qrcode          # 获取核销二维码
POST /api/admin/schedules/:id/checkin   # 扫码核销
```

---

## 数据模型

### users（用户）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK | 自增主键 |
| openid | VARCHAR(64) UNIQUE | 微信 openid |
| nickname | VARCHAR(64) | 昵称 |
| avatar | VARCHAR(512) | 头像 URL |
| phone | VARCHAR(20) | 手机号 |
| role | ENUM('user','admin') | 角色 |
| created_at | DATETIME | 注册时间 |

### students（学员档案）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK | |
| user_id | INT FK | 关联用户 |
| name | VARCHAR(32) | 学员姓名 |
| age | INT | 年龄（默认 0） |
| phone | VARCHAR(20) | 联系电话 |
| notes | VARCHAR(255) | 备注 |
| created_at | DATETIME | |

### categories（课程分类）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK | |
| name | VARCHAR(32) | 分类名 |
| icon | VARCHAR(255) | 图标（Emoji 或图片路径） |
| sort | INT | 排序（默认 0） |
| parent_id | INT | 父分类 ID（默认 0=根分类） |
| created_at | DATETIME | |

### courses（课程）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK | |
| category_id | INT FK | 课程分类 |
| title | VARCHAR(128) | 课程标题 |
| cover | VARCHAR(512) | 封面 URL |
| intro | TEXT | HTML 富文本介绍 |
| teacher_ids | JSON | 讲师 ID 数组 |
| location_ids | JSON | 地点 ID 数组 |
| status | ENUM('draft','published','archived') | 状态 |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### course_types（班型）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK | |
| course_id | INT FK | 所属课程 |
| name | VARCHAR(64) | 班型名 |
| capacity | INT | 班级容量（默认 20） |
| price | DECIMAL(10,2) | 价格（默认 0，预留） |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### course_schedules（课程时段）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK | |
| course_type_id | INT FK | 所属班型 |
| date | DATEONLY | 上课日期 |
| start_time | TIME | 开始时间 |
| end_time | TIME | 结束时间 |
| max_count | INT | 最大容量（默认 20） |
| booked_count | INT | 已预约数（默认 0） |
| status | ENUM('active','cancelled','full') | 状态 |
| check_in_code | VARCHAR(64) | 核销码（预留，可 null） |
| checked_in_at | DATETIME | 核销时间（预留，可 null） |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### orders（预约订单）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK | |
| user_id | INT FK | 预约用户 |
| course_id | INT FK | 课程 |
| course_type_id | INT FK | 班型 |
| schedule_id | INT FK | 时段 |
| student_id | INT FK | 学员档案 |
| status | ENUM('pending','approved','rejected','cancelled') | 订单状态 |
| audit_remark | VARCHAR(255) | 审核备注 |
| pay_status | ENUM('unpaid','paid','refunded') | 支付状态（预留） |
| transaction_id | VARCHAR(64) | 微信支付交易号（预留，可 null） |
| created_at | DATETIME | 提交时间 |
| updated_at | DATETIME | |

### teachers（讲师）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK | |
| name | VARCHAR(32) | 讲师姓名 |
| avatar | VARCHAR(512) | 头像 URL |
| title | VARCHAR(64) | 职称/头衔 |
| intro | TEXT | 简介 |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### locations（上课地点）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK | |
| name | VARCHAR(64) | 地点名称 |
| address | VARCHAR(255) | 详细地址 |
| latitude | DECIMAL(10,6) | 纬度 |
| longitude | DECIMAL(10,6) | 经度 |
| contact | VARCHAR(20) | 联系电话 |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### banners（轮播图）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK | |
| image | VARCHAR(512) | 图片 URL |
| link_url | VARCHAR(512) | 跳转路径 |
| sort | INT | 排序（升序，小的在前） |
| status | ENUM('active','inactive') | 状态 |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### notices（公告）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK | |
| content | VARCHAR(255) | 公告内容 |
| start_date | DATEONLY | 有效期起 |
| end_date | DATEONLY | 有效期止 |
| status | ENUM('active','inactive') | 状态 |
| created_at | DATETIME | |
| updated_at | DATETIME | |

---

## 错误码

| 错误码 | HTTP 状态 | 说明 |
|--------|-----------|------|
| 0 | 200 | 成功 |
| 400 | 400 | 请求参数错误/业务规则限制 |
| 401 | 401 | 未登录或 Token 已过期 |
| 403 | 403 | 无权限（非管理员访问管理端） |
| 404 | 404 | 资源不存在 |
| 500 | 500 | 服务器内部错误 |

**常见 400 业务错误消息：**

| 消息 | 说明 |
|------|------|
| 缺少必填参数 | 请求体缺少必填字段 |
| 该时段您已有预约，请勿重复提交 | 同一用户重复预约 |
| 该时段已取消 | 时段已被取消 |
| 名额已满 | 时段预约人数已达上限 |
| 当前状态不可取消 | 订单状态不允许取消 |
| 课程名称和分类为必填项 | 创建课程缺少 title/category_id |
| 该课程存在预约订单，无法删除，请先下架 | 删除有关联订单的课程 |
| 该分类下有课程，无法删除 | 删除有关联课程的分类 |
| 名额不能低于已预约人数 | 修改 max_count 小于 booked_count |
| 该时段已有预约，无法删除 | 删除有关联订单的时段 |
| 操作类型无效，仅支持 approve 或 reject | 审核 action 参数非法 |
| 当前订单状态不允许审核 | 非 pending 状态进行审核 |

---

## 附录：调试建议

### Apifox 导入
将 `docs/api-docs/openapi.json` 导入 Apifox 即可获得完整的接口定义。

### 调试流程
1. 启动后端：`cd backend && npm run dev`
2. 初始化数据库：`cd backend && npm run seed`（创建 admin/admin123 管理员和示例数据）
3. **用户端调试：**
   - `POST /api/auth/login` 获取 token（开发环境不传 code）
   - 将返回的 `token` 填入 Apifox 环境变量
4. **管理端调试：**
   - `POST /api/admin/login` 使用 `admin`/`admin123` 登录
   - 将返回的 `token` 填入 Apifox 环境变量

### OpenAPI 文档
`docs/api-docs/openapi.json` 完全对应后端实际实现的接口，包含完整的请求/响应 Schema 和示例，可直接导入 Apifox 使用。
