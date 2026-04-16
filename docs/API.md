# URP API 接口规范

本文档以当前代码实现为准。

## 统一响应格式

### 成功响应
```json
{ "code": 0, "data": {}, "message": "success" }
```

### 错误响应
```json
{ "code": 4001, "message": "Invalid credentials", "data": null }
```

## 错误码映射

当前实现按 HTTP 状态码映射错误码：

| code | HTTP 状态 | 说明 |
|------|-----------|------|
| 4001 | 401 | 未认证/凭证无效 |
| 4002 | 409 | 资源冲突 |
| 4003 | 400 | 请求参数错误 |
| 4004 | 404 | 资源不存在 |
| 4006 | 403 | 无权限 |
| 5000 | 5xx | 服务器内部错误 |

说明：
- ValidationPipe 开启了 `whitelist` 和 `forbidNonWhitelisted`，多余字段会返回 400
- `message` 在部分校验失败场景下可能为数组

---

## 1. 认证接口

### 1.1 注册 `POST /api/auth/register`

**请求**:
```json
{
  "email": "user@example.com",
  "password": "StrongP@ss123"
}
```

**响应**:
```json
{
  "code": 0,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "status": "active"
    }
  },
  "message": "success"
}
```

### 1.2 登录 `POST /api/auth/login`

**请求**:
```json
{ "email": "user@example.com", "password": "StrongP@ss123" }
```

**响应**: 同注册

### 1.3 刷新 Token `POST /api/auth/refresh`

**请求**:
```json
{ "refreshToken": "eyJ..." }
```

**响应**:
```json
{
  "code": 0,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  },
  "message": "success"
}
```

说明：当前实现会签发新的 `accessToken` 与新的 `refreshToken`；旧 refresh token 在轮换后失效。

### 1.4 修改密码 `POST /api/auth/change-password`

**请求头**: `Authorization: Bearer <accessToken>`

**请求**:
```json
{ "oldPassword": "OldP@ss123", "newPassword": "NewP@ss456" }
```

**响应**:
```json
{
  "code": 0,
  "data": { "message": "Password changed successfully" },
  "message": "success"
}
```

### 1.5 获取当前用户 `GET /api/auth/me`

**请求头**: `Authorization: Bearer <accessToken>`

**响应**:
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "status": "active",
    "lastLoginAt": "2026-04-14T10:00:00Z",
    "roles": [
      { "id": 1, "name": "Guest" }
    ]
  },
  "message": "success"
}
```

---

## 2. 用户管理（均需要 JWT）

### 2.1 用户列表 `GET /api/users`

**参数**: `?page=1&limit=10&status=active&roleId=1`

**响应**:
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": 1,
        "email": "user@example.com",
        "status": "active",
        "lastLoginAt": "2026-04-14T10:00:00Z",
        "createdAt": "2026-04-14T09:00:00Z",
        "roles": [{ "id": 1, "name": "Guest" }]
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 10
  },
  "message": "success"
}
```

### 2.2 创建用户 `POST /api/users`

**请求**:
```json
{
  "email": "new@example.com",
  "password": "StrongP@ss123",
  "roleIds": [1, 2]
}
```

`roleIds` 为可选；未传时会尝试自动分配 `Guest` 角色。

**响应**:
```json
{
  "code": 0,
  "data": { "id": 5, "email": "new@example.com", "status": "active" },
  "message": "success"
}
```

### 2.3 用户详情 `GET /api/users/:id`

**响应**:
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "status": "active",
    "lastLoginAt": "2026-04-14T10:00:00Z",
    "createdAt": "2026-04-14T09:00:00Z",
    "updatedAt": "2026-04-14T10:00:00Z",
    "roles": [
      { "id": 1, "name": "Guest", "description": "默认角色" }
    ]
  },
  "message": "success"
}
```

### 2.4 更新用户 `PUT /api/users/:id`

当前实现仅支持更新邮箱。

**请求**:
```json
{ "email": "updated@example.com" }
```

### 2.5 删除用户 `DELETE /api/users/:id`

**响应**:
```json
{
  "code": 0,
  "data": { "message": "User deleted successfully" },
  "message": "success"
}
```

### 2.6 冻结/激活 `PATCH /api/users/:id/status`

**请求**:
```json
{ "status": "frozen" }
```

状态允许值：`active`、`frozen`

### 2.7 分配角色 `PUT /api/users/:id/roles`

**请求**:
```json
{ "roleIds": [1, 2] }
```

**响应**:
```json
{
  "code": 0,
  "data": { "message": "Roles assigned successfully" },
  "message": "success"
}
```

---

## 3. 角色管理（均需要 JWT）

### 3.1 角色列表 `GET /api/roles`

**响应**:
```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "name": "SuperAdmin",
      "description": "超级管理员",
      "permissionCount": 10,
      "createdAt": "2026-04-14T09:00:00Z"
    }
  ],
  "message": "success"
}
```

### 3.2 角色详情 `GET /api/roles/:id`

**响应**:
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "name": "SuperAdmin",
    "description": "超级管理员",
    "userCount": 1,
    "permissions": [
      {
        "id": 1,
        "key": "user:read",
        "group": "user",
        "description": "查看用户"
      }
    ],
    "createdAt": "2026-04-14T09:00:00Z",
    "updatedAt": "2026-04-14T10:00:00Z"
  },
  "message": "success"
}
```

### 3.3 创建角色 `POST /api/roles`

**请求**:
```json
{ "name": "editor", "description": "内容编辑" }
```

### 3.4 更新角色 `PUT /api/roles/:id`

**请求**:
```json
{ "name": "editor_v2", "description": "内容编辑(更新)" }
```

### 3.5 删除角色 `DELETE /api/roles/:id`

**响应**:
```json
{
  "code": 0,
  "data": { "message": "Role deleted successfully" },
  "message": "success"
}
```

### 3.6 角色授权 `PUT /api/roles/:id/permissions`

**请求**:
```json
{ "permissionIds": [1, 2, 3] }
```

**响应**:
```json
{
  "code": 0,
  "data": { "message": "Permissions assigned successfully" },
  "message": "success"
}
```

---

## 4. 权限管理（均需要 JWT）

### 4.1 权限列表 `GET /api/permissions`

**参数**: `?group=user`

**响应**:
```json
{
  "code": 0,
  "data": [
    { "id": 1, "key": "user:read", "group": "user", "description": "查看用户" },
    { "id": 2, "key": "user:write", "group": "user", "description": "编辑用户" }
  ],
  "message": "success"
}
```

### 4.2 权限详情 `GET /api/permissions/:id`

**响应**:
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "key": "user:read",
    "group": "user",
    "description": "查看用户",
    "createdAt": "2026-04-14T09:00:00Z"
  },
  "message": "success"
}
```

### 4.3 创建权限 `POST /api/permissions`

**请求**:
```json
{ "key": "invoice:create", "group": "finance", "description": "创建发票" }
```

### 4.4 更新权限 `PUT /api/permissions/:id`

**请求**:
```json
{ "description": "更新描述" }
```

### 4.5 删除权限 `DELETE /api/permissions/:id`

**响应**:
```json
{
  "code": 0,
  "data": { "message": "Permission deleted successfully" },
  "message": "success"
}
```

---

## 5. 权限校验（均需要 JWT）

### 5.1 校验权限 `POST /api/check`

**请求头**: `Authorization: Bearer <accessToken>`

**请求**:
```json
{ "permission": "user:write" }
```

**响应**:
```json
{
  "code": 0,
  "data": { "allowed": true },
  "message": "success"
}
```

### 5.2 获取当前用户权限 `GET /api/permissions/me`

**请求头**: `Authorization: Bearer <accessToken>`

**响应**:
```json
{
  "code": 0,
  "data": {
    "permissions": ["user:read", "user:write", "dashboard:view"],
    "roles": ["Guest"]
  },
  "message": "success"
}
```

---

## 6. 典型集成流程

### 6.1 底模最小接入流程
适合“基于 URP 快速派生一个客户项目”的场景：

1. 配置数据库与 JWT 环境变量
2. 启动服务并执行 `npm run seed`
3. 使用默认管理员登录，确认用户 / 角色 / 权限主链路正常
4. 通过管理接口或 seed 新增客户业务权限点
5. 创建客户角色并为角色授权
6. 给目标用户分配角色
7. 在新业务接口接入 `JwtAuthGuard` + `AccessGuard`
8. 前端调用 `/api/auth/me` 与 `/api/permissions/me` 获取当前用户上下文

### 6.2 新增业务权限点示例
以 `invoice:read` 为例，推荐流程：

1. 按 `resource:action` 约定定义权限 key
2. 通过 `POST /api/permissions` 创建权限，例如：
```json
{ "key": "invoice:read", "group": "invoice", "description": "查看发票" }
```
3. 通过 `PUT /api/roles/:id/permissions` 把该权限授权给目标角色
4. 在派生项目的新业务接口上使用 `@RequirePermissions('invoice:read')`
5. 前端通过 `/api/permissions/me` 决定菜单、按钮或页面的显示状态

### 6.3 创建客户角色并授权示例
以 `FinanceManager` 为例，推荐流程：

1. 通过 `POST /api/roles` 创建角色
2. 通过 `PUT /api/roles/:id/permissions` 覆盖式分配权限集合
3. 通过 `PUT /api/users/:id/roles` 给用户分配该角色
4. 让用户重新获取 token / 登录，以确保权限上下文更新

### 6.4 新模块接入授权示例
派生项目新增业务模块时，推荐直接复用现有鉴权链路：

- 仅要求登录：挂 `JwtAuthGuard`
- 要求特定角色：配合 `AccessGuard` + `@RequireRoles(...)`
- 要求细粒度权限点：配合 `AccessGuard` + `@RequirePermissions(...)`

推荐引用文件：
- `src/auth/access.decorator.ts`
- `src/auth/access.guard.ts`
- `src/users/users.controller.ts`
- `src/roles/roles.controller.ts`
- `src/permissions/permissions.controller.ts`

---

## 7. 权限扩展指南

### 7.1 权限 key 命名约定
推荐统一使用 `resource:action`，例如：
- `invoice:read`
- `invoice:create`
- `invoice:approve`

建议：
- `resource` 表示业务域或资源类型
- `action` 表示允许的操作
- 不要直接把页面名、按钮文案作为权限 key

### 7.2 group 分组建议
`group` 用于权限聚合展示与检索，推荐按业务域分组，例如：
- `user`
- `role`
- `permission`
- `invoice`
- `project`

### 7.3 权限扩展时的 source of truth
优先参考以下实现：
- `src/permissions/entities/permission.entity.ts`
- `src/permissions/permissions.service.ts`
- `src/seed.ts`
- `src/auth/access.decorator.ts`
- `src/auth/access.guard.ts`

### 7.4 权限扩展注意事项
- 当前系统已具备权限点路由控制能力，不只是“权限查询接口”
- 当前控制器示例更多使用 `@RequireRoles('SuperAdmin')`，但派生项目可直接启用 `@RequirePermissions(...)`
- 系统内置权限更适合作为底模稳定面；客户业务权限建议新增而不是直接破坏系统权限语义

---

## 8. 角色授权指南

### 8.1 角色设计原则
- 角色应表达职责边界，而不是临时页面或菜单组合
- `SuperAdmin` 更适合作为平台维护角色，不宜直接充当所有业务用户角色
- 客户项目应围绕业务职责扩展角色，例如财务、审核、运营、客服等

### 8.2 授权链路
当前推荐的授权链路为：
1. 创建权限
2. 创建角色
3. 给角色分配权限
4. 给用户分配角色
5. 用户重新获取最新登录态

### 8.3 覆盖式授权的含义
- `PUT /api/roles/:id/permissions` 为覆盖式授权，不是追加式授权
- `PUT /api/users/:id/roles` 为覆盖式分配，不是增量追加
- 派生项目接入时应明确这一行为，避免误以为旧授权会自动保留

### 8.4 推荐参考实现
- `src/roles/roles.service.ts`
- `src/users/users.service.ts`
- `src/seed.ts`

---

## 9. 二次开发建议

### 9.1 建议优先保留
- User / Role / Permission / UserRole / RolePermission 核心模型
- JWT + Guard + Decorator 的鉴权链路
- 统一响应结构与异常处理模式

### 9.2 建议按项目扩展
- 业务权限点
- 客户角色体系
- 新业务模块接口
- seed 初始化内容
- 前端接入实现

### 9.3 建议谨慎改动
- `SuperAdmin` 与系统级权限的语义
- token 结构与认证主流程
- 当前底模中的基础鉴权/授权方式
- 开发态与交付态的数据库策略边界

---

## 10. 备注

- 当前管理接口统一要求 JWT，且底层已具备基于角色与权限点的路由级访问控制能力
- JWT 策略当前从 `Authorization: Bearer <token>` 读取 Access Token
- Demo 页面使用本接口时，当前通过相对 `/api/...` 路径请求后端
- Demo 更适合作为联调和前端集成参考，而不是直接交付给客户的正式前端
