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
  "data": { "accessToken": "eyJ..." },
  "message": "success"
}
```

说明：当前实现仅返回新的 `accessToken`，不会轮换 `refreshToken`。

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

## 6. 备注

- 当前管理接口统一要求 JWT，但尚未在控制器层基于权限点做路由拦截
- JWT 策略当前从 `Authorization: Bearer <token>` 读取 Access Token
- Demo 页面使用本接口时，前端请求基址当前写死为 `http://localhost:3000`
