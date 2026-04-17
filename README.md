# URP - 用户-角色-权限管理系统

基于 NestJS 构建的通用 RBAC 权限管理服务，提供标准 RESTful API，并附带静态 Demo 页面用于演示认证与权限管理流程。

## 特性

- **RBAC 权限模型**：用户、角色、权限三层结构，支持多角色并集
- **JWT 认证**：Access Token + Refresh Token
- **密码安全**：使用 bcrypt 哈希存储密码
- **统一响应格式**：全局拦截器与异常过滤器统一返回结构
- **静态 Demo 页面**：用于快速联调和功能演示

## 技术栈

| 技术 | 说明 |
|------|------|
| NestJS | 服务端框架 |
| TypeORM | ORM |
| MySQL | 关系型数据库 |
| Passport + JWT | 认证 |
| bcrypt | 密码加密 |
| class-validator | 请求校验 |

## 环境变量

当前 API 环境变量文件位于 `apps/api/.env`，示例文件位于 `apps/api/.env.example`。

当前实现使用以下环境变量：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=urp
JWT_SECRET=your-secret-key
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
CORS_ORIGIN=http://localhost:3000
PORT=3000
```

其中 `PORT` 为可选项，当前 monorepo 下 API 默认建议使用 `3001`，前端默认使用 `3000`。
前端若后续需要环境变量，建议放在 `apps/web/.env.local`。

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `apps/api/.env.example` 为 `apps/api/.env` 并填写配置。

### 3. 准备数据库

当前应用在 `NODE_ENV !== 'production'` 时启用 TypeORM `synchronize` 自动同步表结构。

### 4. 初始化种子数据

```bash
npm run seed
```

种子脚本会尽量幂等地执行以下操作：
- 创建 `SuperAdmin` 与 `Guest` 角色
- 初始化基础权限
- 为 `SuperAdmin` 分配全部权限
- 创建默认管理员账号

默认管理员账户：
- 邮箱：`admin@example.com`
- 密码：`admin123`

### 5. 启动服务

```bash
# 启动 API（NestJS）
npm run dev:api

# 启动 Web（Next.js）
npm run dev:web

# 同时启动前后端
npm run dev

# 构建
npm run build:api
npm run build:web
# 或
npm run build
```

默认开发端口：
- Web：`http://localhost:3000`
- API：`http://localhost:3001`

## API 概览

### 认证

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 注册 |
| POST | `/api/auth/login` | 登录 |
| POST | `/api/auth/refresh` | 刷新 Access Token |
| POST | `/api/auth/change-password` | 修改密码，需要 JWT |
| GET | `/api/auth/me` | 获取当前用户，需要 JWT |

### 用户管理（均需要 JWT）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/users` | 用户列表（支持分页） |
| POST | `/api/users` | 创建用户 |
| GET | `/api/users/:id` | 用户详情 |
| PUT | `/api/users/:id` | 更新用户 |
| DELETE | `/api/users/:id` | 删除用户 |
| PATCH | `/api/users/:id/status` | 冻结/激活用户 |
| PUT | `/api/users/:id/roles` | 分配角色（覆盖） |

### 角色管理（均需要 JWT）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/roles` | 角色列表 |
| GET | `/api/roles/:id` | 角色详情 |
| POST | `/api/roles` | 创建角色 |
| PUT | `/api/roles/:id` | 更新角色 |
| DELETE | `/api/roles/:id` | 删除角色 |
| PUT | `/api/roles/:id/permissions` | 分配权限（覆盖） |

### 权限管理（均需要 JWT）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/permissions` | 权限列表 |
| GET | `/api/permissions/:id` | 权限详情 |
| GET | `/api/permissions/me` | 当前用户权限列表 |
| POST | `/api/permissions` | 创建权限 |
| PUT | `/api/permissions/:id` | 更新权限 |
| DELETE | `/api/permissions/:id` | 删除权限 |
| POST | `/api/check` | 校验当前用户是否拥有某权限 |

## 响应格式

成功响应：

```json
{ "code": 0, "data": {}, "message": "success" }
```

错误响应：

```json
{ "code": 4001, "message": "Invalid credentials", "data": null }
```

当前实现中的常用错误码映射：

| code | HTTP 状态 | 说明 |
|------|-----------|------|
| 0 | 200/201 | 成功 |
| 4001 | 401 | 未认证/凭证无效 |
| 4002 | 409 | 资源冲突 |
| 4003 | 400 | 请求参数错误 |
| 4004 | 404 | 资源不存在 |
| 4006 | 403 | 无权限 |
| 5000 | 5xx | 服务端错误 |

## 底模定位与适用边界

URP 当前定位为 **RBAC 权限系统底模**，适合在客户项目中继续派生开发，而不是直接作为最终交付系统上线。

推荐用途：
- 作为新项目的认证与权限基础设施
- 作为客户项目的用户 / 角色 / 权限中心原型
- 作为前后端联调、权限模型验证和接口模板

边界说明：
- 当前已具备完整的 JWT + RBAC 主链路，可直接复用认证、角色授权、权限聚合和管理接口
- `apps/web/` 现已提供正式前端入口；`apps/api/public/demo/` 仅保留为 legacy 联调参考，不应视为生产级前端
- 底模阶段可优先保留当前开发效率优先的配置；正式交付项目再按需要收口 migration、监控、审计、多租户等能力

## 派生项目开发者阅读路径

如果你是基于此仓库继续开发客户项目，建议按下面顺序阅读：

1. **README**：理解底模定位、启动方式和文档入口
2. **[docs/API.md](docs/API.md)**：查看接口、典型接入流程、权限扩展与角色授权方式
3. **[docs/DEMO.md](docs/DEMO.md)**：参考前端如何登录、存 token、获取用户与权限
4. **[docs/PRD.md](docs/PRD.md)**：理解底模边界、常见定制维度与演进方向
5. **代码实现**：以后端 `apps/api/src/auth/*`、`apps/api/src/users/*`、`apps/api/src/roles/*`、`apps/api/src/permissions/*`、`apps/api/src/seed.ts` 与前端 `apps/web/*` 为最终 source of truth

## 常见派生场景与改造入口

### 1. 新增业务权限点
- 在 `src/permissions/entities/permission.entity.ts` 延续当前 `resource:action` 命名约定
- 通过 `src/seed.ts` 或管理接口初始化权限数据
- 通过 `PUT /api/roles/:id/permissions` 将权限授权给角色
- 在新业务接口上使用 `@RequirePermissions(...)` 接入权限点保护

### 2. 新增客户角色体系
- 保留系统级 `SuperAdmin` 作为平台维护角色
- 按客户职责扩展业务角色，如财务、审核、运营等
- 通过 `PUT /api/users/:id/roles` 给用户分配角色

### 3. 给新业务模块接入鉴权
- 登录态校验复用 `JwtAuthGuard`
- 角色/权限控制复用 `AccessGuard`
- 控制器或方法级使用 `@RequireRoles(...)` / `@RequirePermissions(...)`

### 4. 前端接入
- 当前正式前端位于 `apps/web/`，已提供 `/login`、`/register`、`/dashboard`、`/admin` 四条主链路
- 若派生项目继续演进，建议在 `apps/web/lib/*`、`apps/web/hooks/*`、`apps/web/components/*` 基础上扩展
- `apps/api/public/demo/*` 仍可作为最小联调参考，但不建议直接作为客户项目管理台交付

## 前端入口

当前正式前端入口：

| 页面 | 地址 |
|------|------|
| 登录 | `/login` |
| 注册 | `/register` |
| 用户面板 | `/dashboard` |
| 管理面板 | `/admin` |

legacy demo 仍保留以下地址用于联调参考：

| 页面 | 地址 |
|------|------|
| 登录 | `/demo/login.html` |
| 注册 | `/demo/register.html` |
| 用户面板 | `/demo/dashboard.html` |
| 管理面板 | `/demo/admin.html` |

说明：
- 正式前端位于 `apps/web/`
- legacy demo 由 API 静态托管，资源目录为 `apps/api/public/demo/`
- demo 的定位是“联调样例 + 集成参考”，而不是生产前端

详见 [docs/DEMO.md](docs/DEMO.md)

## 常用命令

```bash
npm install
npm run dev:api
npm run dev:web
npm run dev
npm run build:api
npm run build:web
npm run build
npm run lint
npm run test
npm run test:e2e
npm run seed
```

## 项目结构

```text
apps/
├── api/
│   ├── src/
│   │   ├── auth/                # 认证模块、JWT Guard/Strategy、DTO
│   │   ├── users/               # 用户模块、实体、DTO
│   │   ├── roles/               # 角色模块、实体、DTO
│   │   ├── permissions/         # 权限模块、实体、DTO
│   │   ├── common/
│   │   │   ├── filters/         # 全局异常过滤器
│   │   │   └── interceptors/    # 全局响应拦截器
│   │   ├── seed.ts              # 种子数据脚本
│   │   └── main.ts              # API 入口
│   └── public/
│       └── demo/                # legacy 静态 Demo 页面
└── web/
    ├── app/                     # Next.js App Router 页面
    ├── components/              # 前端组件
    ├── hooks/                   # 前端 hooks
    └── lib/                     # 请求、会话、鉴权基础层
```

## 当前实现说明

- 当前仓库已升级为 monorepo：`apps/api` 承载 NestJS API，`apps/web` 承载 Next.js 前端
- 当前 users / roles / permissions 管理接口都要求 JWT
- 当前项目已具备基于角色和权限点的路由级访问控制能力：`AccessGuard` 可配合 `@RequireRoles(...)` 与 `@RequirePermissions(...)` 使用
- 当前前端已提供 `/login`、`/register`、`/dashboard`、`/admin` 四条正式页面链路
- Refresh Token 已具备生命周期控制与单会话轮换策略，修改密码后旧 refresh token 会失效

## 许可证

MIT license
