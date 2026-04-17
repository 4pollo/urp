# 通用型用户-角色-权限管理系统 (URP) - 产品需求文档 (PRD)

**版本**: v4.1  
**日期**: 2026-04-16  
**产品名称**: URP (User-Role-Permission) Core  
**文档状态**: 与当前实现对齐版

---

## 1. 产品概述

### 1.1 核心目标
构建一个高度可重用的权限管理服务，基于 NestJS 提供标准 RESTful API。通过标准化的 RBAC 模型，降低各类应用重复搭建权限体系的成本。

### 1.2 核心价值
- **高复用性**：提供可直接集成的后端权限 API
- **解耦性**：权限逻辑与业务逻辑分离
- **可扩展性**：通过增加权限数据支撑新业务系统

---

## 2. 当前实现架构

### 2.1 核心模块

| 模块 | 功能描述 | 关键实体 |
|-----|---------|---------|
| **认证模块** | 注册、登录、刷新 Token、修改密码、获取当前用户 | User, UserRole |
| **用户管理** | 用户 CRUD、冻结/激活、分配角色 | User, UserRole |
| **角色管理** | 角色 CRUD、分配权限 | Role, RolePermission |
| **权限管理** | 权限 CRUD、权限查询、权限校验 | Permission |
| **公共基础设施** | 统一响应、异常过滤、全局校验、静态资源托管 | - |

### 2.2 数据模型

#### User
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT AUTO_INCREMENT | 主键 |
| email | VARCHAR(255) | 唯一，用于登录 |
| password | VARCHAR(255) | bcrypt 哈希 |
| status | ENUM('active', 'frozen') | 用户状态 |
| lastLoginAt | DATETIME | 最近登录时间 |
| createdAt | DATETIME | 创建时间 |
| updatedAt | DATETIME | 更新时间 |

#### Role
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT AUTO_INCREMENT | 主键 |
| name | VARCHAR(100) | 角色名，唯一 |
| description | VARCHAR(255) | 描述 |
| createdAt | DATETIME | 创建时间 |
| updatedAt | DATETIME | 更新时间 |

#### Permission
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT AUTO_INCREMENT | 主键 |
| key | VARCHAR(100) | 唯一，格式 `resource:action` |
| group | VARCHAR(50) | 权限分组 |
| description | VARCHAR(255) | 描述 |
| createdAt | DATETIME | 创建时间 |

#### UserRole
- `userId` → `User.id`
- `roleId` → `Role.id`
- 联合唯一索引：`UNIQUE(userId, roleId)`

#### RolePermission
- `roleId` → `Role.id`
- `permissionId` → `Permission.id`
- 联合唯一索引：`UNIQUE(roleId, permissionId)`

### 2.3 技术架构

- **框架**：NestJS
- **数据库**：MySQL
- **ORM**：TypeORM
- **认证**：JWT（Access Token + Refresh Token）
- **架构模式**：Controller → Service → TypeORM Repository
- **输入校验**：ValidationPipe + class-validator
- **响应包装**：全局 Interceptor
- **错误处理**：全局 Exception Filter

### 2.4 环境变量

| 变量 | 说明 | 示例 |
|------|------|------|
| `DB_HOST` | 数据库地址 | `localhost` |
| `DB_PORT` | 数据库端口 | `3306` |
| `DB_USERNAME` | 数据库用户名 | `root` |
| `DB_PASSWORD` | 数据库密码 | `password` |
| `DB_DATABASE` | 数据库名 | `urp` |
| `JWT_SECRET` | JWT 签名密钥 | `your-secret-key` |
| `JWT_ACCESS_EXPIRES` | Access Token 过期时间 | `15m` |
| `JWT_REFRESH_EXPIRES` | Refresh Token 过期时间 | `7d` |
| `CORS_ORIGIN` | 允许的跨域来源 | `http://localhost:3000` |
| `PORT` | 服务监听端口，可选 | `3000` |

---

## 3. 当前实现功能说明

### 3.1 认证流程
- **注册**：邮箱 + 密码 → bcrypt 哈希 → 创建用户 → 尝试分配 `Guest` → 返回 access/refresh token
- **登录**：验证邮箱密码 → 校验用户状态 → 更新 `lastLoginAt` → 返回 access/refresh token
- **刷新 Token**：验证 refresh token 后签发新的 access token 与 refresh token
- **修改密码**：校验旧密码后更新密码哈希，并使旧 refresh token 失效
- **获取当前用户**：通过 JWT 获取当前用户信息及角色

### 3.2 用户管理
- 分页查询用户列表
- 查看用户详情
- 创建用户
- 更新用户邮箱
- 删除用户
- 冻结/激活用户
- 覆盖式分配角色

### 3.3 角色管理
- 角色列表
- 角色详情
- 创建角色
- 更新角色
- 删除角色
- 覆盖式分配权限

### 3.4 权限管理与校验
- 权限列表（支持按 group 过滤）
- 权限详情
- 创建权限
- 更新权限
- 删除权限
- 获取当前用户权限列表
- 校验当前用户是否拥有某权限

说明：当前实现已具备基于权限点的路由级访问控制基础设施，`AccessGuard` 可结合 `@RequireRoles(...)` 与 `@RequirePermissions(...)` 使用；现有控制器示例主要以 `SuperAdmin` 角色控制为主，派生项目可继续扩展到权限点级保护。

### 3.5 数据初始化（Seed）
当前通过独立脚本执行：

```bash
npm run seed
```

种子脚本会：
- 创建 `SuperAdmin` 和 `Guest` 角色
- 初始化基础权限
- 为 `SuperAdmin` 分配全部已初始化权限
- 创建默认管理员 `admin@example.com / admin123`

---

## 4. API 接口设计

### 4.1 认证接口
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/auth/register` | 注册 |
| POST | `/api/auth/login` | 登录 |
| POST | `/api/auth/refresh` | 刷新 Access Token |
| POST | `/api/auth/change-password` | 修改密码 |
| GET | `/api/auth/me` | 获取当前用户信息 |

### 4.2 用户管理（均需要 JWT）
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/users` | 用户列表 |
| POST | `/api/users` | 创建用户 |
| GET | `/api/users/:id` | 用户详情 |
| PUT | `/api/users/:id` | 更新用户 |
| DELETE | `/api/users/:id` | 删除用户 |
| PATCH | `/api/users/:id/status` | 冻结/激活 |
| PUT | `/api/users/:id/roles` | 分配角色 |

### 4.3 角色管理（均需要 JWT）
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/roles` | 角色列表 |
| GET | `/api/roles/:id` | 角色详情 |
| POST | `/api/roles` | 创建角色 |
| PUT | `/api/roles/:id` | 更新角色 |
| DELETE | `/api/roles/:id` | 删除角色 |
| PUT | `/api/roles/:id/permissions` | 授权 |

### 4.4 权限管理（均需要 JWT）
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/permissions` | 权限列表 |
| GET | `/api/permissions/:id` | 权限详情 |
| GET | `/api/permissions/me` | 当前用户权限列表 |
| POST | `/api/permissions` | 创建权限 |
| PUT | `/api/permissions/:id` | 更新权限 |
| DELETE | `/api/permissions/:id` | 删除权限 |
| POST | `/api/check` | 校验权限 |

### 4.5 统一响应格式

成功：
```json
{ "code": 0, "data": {}, "message": "success" }
```

错误：
```json
{ "code": 4001, "message": "Invalid credentials", "data": null }
```

---

## 5. 示例应用

### 5.1 内置示例页面

静态页面由 Nest 托管在 `public/demo/`：
- `/demo/register.html` - 注册页面
- `/demo/login.html` - 登录页面
- `/demo/dashboard.html` - 用户面板
- `/demo/admin.html` - 管理面板

### 5.2 前端调用约束
- Demo 页面当前通过相对 `/api/...` 路径调用后端接口
- Token 与用户信息当前保存在 `localStorage`
- 管理面板通过前端接口结果判断当前用户是否具备 `SuperAdmin` 角色
- Demo 仅作为联调与集成参考，不代表正式交付前端方案

---

## 6. 底模复用与派生项目边界

### 6.1 底模与交付项目的区别
- **底模目标**：提供通用、可复用、可扩展的认证与 RBAC 基础设施
- **交付项目目标**：围绕具体客户业务完成前端、业务模块、部署、运维与安全收口

因此，URP 当前更适合作为客户项目的起点，而不是无需调整即可直接上线的成品系统。

### 6.2 当前已实现能力
- JWT 认证（注册、登录、刷新 token、修改密码、获取当前用户）
- RBAC 核心数据模型（User / Role / Permission）
- 用户、角色、权限管理接口
- 角色与权限、用户与角色的覆盖式分配能力
- 路由级鉴权基础设施（`JwtAuthGuard` + `AccessGuard` + `@RequireRoles(...)` / `@RequirePermissions(...)`）
- Seed 初始化（系统角色、系统权限、默认管理员）
- 正式 Web 前端（Next.js）与 legacy Demo 联调页面

### 6.3 派生项目通常仍需补充的能力
- 客户业务模块与业务接口
- 客户专属角色体系与业务权限点
- 更正式的前端应用与菜单/路由系统
- 审计日志、监控、告警、更多运维能力
- 多租户 / 组织维度 / 更复杂的授权模型（如 ABAC）
- 根据交付要求评估 migration、部署流程和数据库变更策略

### 6.4 派生项目常见定制维度
- **身份体系**：邮箱登录可扩展为手机号、工号、外部 SSO / IdP
- **角色体系**：在保留 `SuperAdmin` 的基础上扩展客户业务角色
- **权限点**：按 `resource:action` 规范新增业务权限
- **接口保护**：对新增业务接口使用 `JwtAuthGuard` 与 `AccessGuard`
- **初始化数据**：调整 `seed.ts` 中的角色、权限和默认管理员策略
- **前端集成**：优先在 `apps/web` 上继续扩展正式 UI 与状态管理，legacy demo 仅保留为接口参考

### 6.5 二次开发建议
- **建议保留**：核心实体关系、JWT 链路、Guard / Decorator、统一响应与异常处理
- **建议扩展**：业务模块、客户权限点、客户角色体系、seed 内容、前端实现
- **谨慎改动**：系统级角色/权限语义、token 主流程、开发态与交付态的数据库策略边界
- **前端组件标准**：派生项目在继续扩展 `apps/web` 正式前端时，必须保持 shadcn/ui 作为基础组件体系；`apps/web/components/ui/*` 是唯一基础组件层，可以自定义主题与品牌表达，但不应再平行发展另一套自定义 primitive

---

## 7. 后续路线图

### P0
- 统一文档与实现
- 增加真正的基于权限点的路由拦截
- 修复 JWT 默认密钥等高风险安全问题

### P1
- 补齐核心业务测试
- 收敛前端 Demo 实现
- 优化配置与数据库交付流程

### P2
- 增强复用性文档与部署说明
- 评估更完整的权限扩展能力（如 ABAC）

---

## 8. 当前状态说明

当前项目已经实现 RBAC 数据模型、认证流程、用户/角色/权限 CRUD、角色与权限路由级控制基础设施、权限查询，以及基于 `apps/web` 的正式前端入口与 legacy Demo 参考页面，但仍需在更复杂授权模型、交付规范与模板复用说明上继续完善。
