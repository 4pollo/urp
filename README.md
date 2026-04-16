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

其中 `PORT` 为可选项，默认 `3000`。

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填写配置。

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
# 开发模式
npm run start:dev

# 生产模式
npm run build
npm run start:prod
```

服务默认运行在 `http://localhost:3000`，也可通过 `PORT` 调整。

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

## Demo 页面

启动服务后可访问：

| 页面 | 地址 |
|------|------|
| 登录 | `/demo/login.html` |
| 注册 | `/demo/register.html` |
| 用户面板 | `/demo/dashboard.html` |
| 管理面板 | `/demo/admin.html` |

说明：
- Demo 页面由 Nest 静态托管，资源目录为 `public/`
- Demo 页面中的前端请求当前写死为 `http://localhost:3000/api/...`
- 管理面板页面本身是静态资源，页面加载后通过接口判断当前用户是否为 `SuperAdmin`

详见 [docs/DEMO.md](docs/DEMO.md)

## 常用命令

```bash
npm install
npm run start:dev
npm run build
npm run start:prod
npm run format
npm run lint
npm run test
npm run test:e2e
npm run test:cov
npm run seed
```

## 项目结构

```text
src/
├── auth/                # 认证模块、JWT Guard/Strategy、DTO
├── users/               # 用户模块、实体、DTO
├── roles/               # 角色模块、实体、DTO
├── permissions/         # 权限模块、实体、DTO
├── common/
│   ├── filters/         # 全局异常过滤器
│   └── interceptors/    # 全局响应拦截器
├── seed.ts              # 种子数据脚本
├── app.module.ts        # 根模块
├── app.controller.ts    # 根控制器
├── app.service.ts       # 根服务
└── main.ts              # 应用入口
public/
└── demo/                # 静态 Demo 页面
```

## 当前实现说明

- 当前 users / roles / permissions 管理接口都要求 JWT
- 当前项目提供权限查询能力，但尚未在控制器层实现基于权限点的路由拦截
- Refresh Token 当前用于换发新的 Access Token，但未实现持久化、吊销与轮换机制

## 许可证

UNLICENSED
