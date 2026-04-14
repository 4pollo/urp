# URP API 接口规范

## 统一响应格式

### 成功响应
```json
{ "code": 0, "data": {}, "message": "success" }
```

### 错误响应
```json
{ "code": 4001, "message": "Invalid credentials" }
```

### 分页响应
```json
{ "code": 0, "data": { "items": [], "total": 100, "page": 1, "pageSize": 10 } }
```

### 常用状态码

| code | 说明 |
|------|------|
| 0 | 成功 |
| 4001 | 无效凭证 |
| 4002 | 邮箱已存在 |
| 4003 | 密码错误 |
| 4004 | 资源不存在 |
| 4005 | 用户已冻结 |
| 4006 | 无权限 |
| 4007 | Token 已过期 |
| 4008 | Token 无效 |
| 5000 | 服务器内部错误 |

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

### 1.4 修改密码 `POST /api/auth/change-password`

**请求头**: `Authorization: Bearer <accessToken>`

**请求**:
```json
{ "oldPassword": "OldP@ss123", "newPassword": "NewP@ss456" }
```

**响应**:
```json
{ "code": 0, "data": null, "message": "Password changed" }
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
  }
}
```

---

## 2. 用户管理

### 2.1 用户列表 `GET /api/users`

**参数**: `?page=1&pageSize=10&status=active&roleId=1`

**响应**:
```json
{
  "code": 0,
  "data": {
    "items": [
      { "id": 1, "email": "user@example.com", "status": "active", "roles": [...] }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 10
  }
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
    "roles": [
      { "id": 1, "name": "Guest", "description": "默认角色" }
    ]
  }
}
```

### 2.4 更新用户 `PUT /api/users/:id`

**请求**:
```json
{ "email": "updated@example.com" }
```

### 2.5 删除用户 `DELETE /api/users/:id`

**响应**:
```json
{ "code": 0, "data": null, "message": "User deleted" }
```

### 2.6 冻结/激活 `PATCH /api/users/:id/status`

**请求**:
```json
{ "status": "frozen" }
```

### 2.7 分配角色 `PUT /api/users/:id/roles`

**请求**:
```json
{ "roleIds": [1, 2] }
```

---

## 3. 角色管理

### 3.1 角色列表 `GET /api/roles`

**响应**:
```json
{
  "code": 0,
  "data": [
    { "id": 1, "name": "SuperAdmin", "description": "超级管理员" },
    { "id": 2, "name": "Guest", "description": "默认角色" }
  ]
}
```

### 3.2 创建角色 `POST /api/roles`

**请求**:
```json
{ "name": "editor", "description": "内容编辑" }
```

### 3.3 更新角色 `PUT /api/roles/:id`

**请求**:
```json
{ "name": "editor_v2", "description": "内容编辑(更新)" }
```

### 3.4 删除角色 `DELETE /api/roles/:id`

### 3.5 角色授权 `PUT /api/roles/:id/permissions`

**请求**:
```json
{ "permissionIds": [1, 2, 3] }
```

---

## 4. 权限管理

### 4.1 权限列表 `GET /api/permissions`

**参数**: `?group=user`

**响应**:
```json
{
  "code": 0,
  "data": [
    { "id": 1, "key": "user:read", "group": "user", "description": "查看用户" },
    { "id": 2, "key": "user:write", "group": "user", "description": "编辑用户" }
  ]
}
```

### 4.2 创建权限 `POST /api/permissions`

**请求**:
```json
{ "key": "invoice:create", "group": "finance", "description": "创建发票" }
```

### 4.3 更新权限 `PUT /api/permissions/:id`

**请求**:
```json
{ "description": "更新描述" }
```

### 4.4 删除权限 `DELETE /api/permissions/:id`

---

## 5. 权限校验

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
  }
}
```
