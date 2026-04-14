# 通用型用户-角色-权限管理系统 (URP) - 产品需求文档 (PRD)

**版本**: v4.0  
**日期**: 2026-04-14  
**产品名称**: URP (User-Role-Permission) Core  
**文档状态**: 草案

---

## 1. 产品概述

### 1.1 核心目标
构建一个高度可重用的权限管理服务，基于 NestJS 提供标准 RESTful API。通过标准化的 RBAC 模型，解决各类应用开发中重复构建权限体系的问题。

### 1.2 核心价值
- **高复用性**：纯后端 API 服务，前端直接调用，按需封装。
- **解耦性**：权限逻辑与业务逻辑完全分离。
- **高性能**：基于 MySQL 的轻量级实现，API 响应延迟 < 50ms。

---

## 2. 功能架构

### 2.1 核心模块

| 模块 | 功能描述 | 关键实体 |
|-----|---------|---------|
| **用户管理** | 用户 CRUD，冻结/激活，角色绑定 | User, UserRole |
| **角色管理** | 角色定义，权限分配 | Role, RolePermission |
| **权限管理** | 原子权限点，支持分组 | Permission |

### 2.2 数据库表结构

#### User (用户表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT AUTO_INCREMENT | 主键 |
| email | VARCHAR(255) | 唯一，用于登录 |
| password | VARCHAR(255) | bcrypt 哈希 |
| status | ENUM('active', 'frozen') | 默认 active |
| lastLoginAt | DATETIME | 最近登录时间 |
| createdAt | DATETIME | 创建时间 |
| updatedAt | DATETIME | 更新时间 |

#### Role (角色表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT AUTO_INCREMENT | 主键 |
| name | VARCHAR(100) | 角色名，唯一 |
| description | VARCHAR(255) | 描述 |
| createdAt | DATETIME | 创建时间 |
| updatedAt | DATETIME | 更新时间 |

#### Permission (权限表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT AUTO_INCREMENT | 主键 |
| key | VARCHAR(100) | 权限标识，唯一，格式 `resource:action` |
| group | VARCHAR(50) | 权限分组 (e.g., 'user', 'finance', 'system') |
| description | VARCHAR(255) | 描述 |
| createdAt | DATETIME | 创建时间 |

#### UserRole (用户-角色 关联表)
| 字段 | 类型 | 说明 |
|------|------|------|
| userId | INT | FK → User.id |
| roleId | INT | FK → Role.id |

> 联合唯一索引: `UNIQUE(userId, roleId)`

#### RolePermission (角色-权限 关联表)
| 字段 | 类型 | 说明 |
|------|------|------|
| roleId | INT | FK → Role.id |
| permissionId | INT | FK → Permission.id |

> 联合唯一索引: `UNIQUE(roleId, permissionId)`

### 2.3 复用适配方式

当创建新业务系统 (如财务管理系统) 时：
1. 向 `permission` 表插入业务权限，如 `invoice:create`，group 设为 `finance`
2. 通过 `role_permission` 关联表将权限分配给角色
3. 在业务代码中调用权限校验

URP 核心表和逻辑无需修改，只需扩展权限数据即可。

### 2.4 技术架构

- **框架**: NestJS
- **数据库**: MySQL
- **ORM**: Prisma
- **认证**: JWT (Access Token + Refresh Token)
- **依赖注入**: NestJS IoC Container
- **架构模式**: Controller → Service → Repository (Prisma)

### 2.5 环境变量

| 变量 | 说明 | 示例 |
|------|------|------|
| `DATABASE_URL` | MySQL 连接字符串 | `mysql://user:pass@localhost:3306/urp` |
| `JWT_SECRET` | JWT 签名密钥 | 随机字符串 |
| `JWT_ACCESS_EXPIRES` | Access Token 过期时间 | `15m` |
| `JWT_REFRESH_EXPIRES` | Refresh Token 过期时间 | `7d` |
| `CORS_ORIGIN` | 允许的跨域来源 | `http://localhost:3000` |

---

## 3. 核心功能描述

### 3.1 权限定义

权限采用 `resource:action` 格式，例如：
- `user:read`, `user:write`, `user:delete`
- `system:config`

### 3.2 注册与登录

**注册**: `email` + `password` → bcrypt 哈希 → 自动分配 `Guest` 角色 → 返回 JWT

**登录**: `email` + `password` → 比对 bcrypt → 检查状态 (冻结拒绝) → 返回 JWT

**修改密码**: 用户提供旧密码 + 新密码 → 修改后清除 Refresh Token

### 3.3 角色与分配

- **内置角色**: `SuperAdmin` (拥有所有权限), `Guest` (默认权限)
- **多角色**: 用户可拥有多个角色，最终权限为所有角色权限的并集

### 3.4 权限校验

服务端通过 JWT 解析用户身份，查询角色关联的权限集，判断是否包含目标权限。

### 3.5 数据初始化 (Seed)

首次启动时自动创建 `SuperAdmin` 和 `Guest` 角色。

---

## 4. API 接口设计

### 4.1 认证接口
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/auth/register` | 注册 |
| POST | `/api/auth/login` | 登录 |
| POST | `/api/auth/refresh` | 刷新 Token |
| POST | `/api/auth/change-password` | 修改密码 |
| GET | `/api/auth/me` | 获取当前用户信息 |

### 4.2 用户管理
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/users` | 用户列表 (分页) |
| POST | `/api/users` | 创建用户 |
| GET | `/api/users/:id` | 用户详情 |
| PUT | `/api/users/:id` | 更新用户 |
| DELETE | `/api/users/:id` | 删除用户 |
| PATCH | `/api/users/:id/status` | 冻结/激活 |
| PUT | `/api/users/:id/roles` | 分配角色 (覆盖) |

### 4.3 角色管理
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/roles` | 角色列表 |
| POST | `/api/roles` | 创建角色 |
| PUT | `/api/roles/:id` | 更新角色 |
| DELETE | `/api/roles/:id` | 删除角色 |
| PUT | `/api/roles/:id/permissions` | 授权 (覆盖) |

### 4.4 权限管理
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/permissions` | 权限列表 |
| POST | `/api/permissions` | 创建权限 |
| PUT | `/api/permissions/:id` | 更新权限 |
| DELETE | `/api/permissions/:id` | 删除权限 |

### 4.5 权限校验
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/check` | 校验权限 |
| GET | `/api/permissions/me` | 获取当前用户权限列表 |

### 4.6 统一响应格式

成功:
```json
{ "code": 0, "data": {}, "message": "success" }
```

错误:
```json
{ "code": 4001, "message": "Invalid credentials" }
```

分页:
```json
{ "code": 0, "data": { "items": [], "total": 100, "page": 1, "pageSize": 10 } }
```

---

## 5. 示例应用

### 5.1 内置示例页面

路径 `/demo`，非生产级 UI，用于演示注册、登录、权限管理流程。
- `/demo/register` - 注册页面
- `/demo/login` - 登录页面
- `/demo/dashboard` - 用户面板
- `/demo/admin` - 管理面板 (需 SuperAdmin)

### 5.2 前端调用示例

```typescript
async function api(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(`http://localhost:3000${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  return res.json();
}

// 登录
const { data } = await api('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password }),
});
localStorage.setItem('token', data.accessToken);

// 权限校验
const { data } = await api('/api/check', {
  method: 'POST',
  body: JSON.stringify({ permission: 'user:write' }),
});
```

---

## 6. 路线图

### Phase 1: 核心引擎
- Prisma Schema 与数据库迁移
- JWT 认证与 API 路由
- 统一响应格式与错误处理
- Seed 数据初始化

### Phase 2: 示例与文档
- 简单前端示例页面
- 集成文档与示例代码

### Phase 3: 高级特性 (待定)
- 基于条件的动态权限 (ABAC)
- 第三方身份验证集成

---

## 7. 成功指标
- **集成成本**: 新项目集成时间 < 1 小时
- **性能**: API 响应延迟 < 50ms
- **灵活性**: 支撑至少 5 个不同业务系统无需修改核心代码
