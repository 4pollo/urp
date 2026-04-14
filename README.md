# URP - 用户-角色-权限管理系统

基于 NestJS 构建的通用 RBAC 权限管理服务，提供标准的 RESTful API，可作为新项目的基础模板快速集成。

## 特性

- **RBAC 权限模型** — 标准的用户-角色-权限三层架构，支持多角色并集
- **JWT 认证** — Access Token + Refresh Token 双令牌机制
- **密码安全** — bcrypt 哈希加密
- **高复用性** — 核心逻辑与业务逻辑解耦，新项目只需扩展权限数据
- **高性能** — API 响应延迟目标 < 50ms

## 技术栈

| 技术 | 说明 |
|------|------|
| [NestJS](https://nestjs.com/) | 服务端框架 |
| [Prisma](https://www.prisma.io/) | ORM (v5) |
| MySQL | 关系型数据库 |
| Passport + JWT | 认证 |
| bcrypt | 密码加密 |
| class-validator | 请求验证 |

## 数据库设计

5 张核心表：

| 表 | 说明 |
|----|------|
| `users` | 用户表 (id, email, password, status, lastLoginAt) |
| `roles` | 角色表 (id, name, description) |
| `permissions` | 权限表 (id, key, group, description)，key 格式 `resource:action` |
| `user_roles` | 用户-角色关联 (联合唯一) |
| `role_permissions` | 角色-权限关联 (联合唯一) |

内置角色：
- `SuperAdmin` — 超级管理员，拥有所有权限
- `Guest` — 默认访客角色，注册时自动分配

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填写配置：

```env
DATABASE_URL="mysql://root:password@localhost:3306/urp"
JWT_SECRET="your-secret-key"
JWT_ACCESS_EXPIRES="15m"
JWT_REFRESH_EXPIRES="7d"
CORS_ORIGIN="http://localhost:3000"
```

### 3. 初始化数据库

```bash
# 生成 Prisma Client
npx prisma generate

# 执行数据库迁移
npx prisma db push

# 初始化种子数据（创建 SuperAdmin/Guest 角色、基础权限、默认管理员）
npm run prisma:seed
```

默认管理员账户：
- 邮箱：`admin@example.com`
- 密码：`admin123`

### 4. 启动服务

```bash
# 开发模式 (热重载)
npm run start:dev

# 生产模式
npm run build
npm run start:prod
```

服务启动后访问 `http://localhost:3000`

## API 接口

### 认证

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 注册 |
| POST | `/api/auth/login` | 登录 |
| POST | `/api/auth/refresh` | 刷新 Token |
| POST | `/api/auth/change-password` | 修改密码 |
| GET | `/api/auth/me` | 获取当前用户信息 |

### 用户管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/users` | 用户列表 (分页) |
| POST | `/api/users` | 创建用户 |
| GET | `/api/users/:id` | 用户详情 |
| PUT | `/api/users/:id` | 更新用户 |
| DELETE | `/api/users/:id` | 删除用户 |
| PATCH | `/api/users/:id/status` | 冻结/激活用户 |
| PUT | `/api/users/:id/roles` | 分配角色 (覆盖) |

### 角色管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/roles` | 角色列表 |
| POST | `/api/roles` | 创建角色 |
| GET | `/api/roles/:id` | 角色详情 |
| PUT | `/api/roles/:id` | 更新角色 |
| DELETE | `/api/roles/:id` | 删除角色 |
| PUT | `/api/roles/:id/permissions` | 分配权限 (覆盖) |

### 权限管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/permissions` | 权限列表 |
| GET | `/api/permissions/me` | 当前用户的权限列表 |
| POST | `/api/permissions` | 创建权限 |
| PUT | `/api/permissions/:id` | 更新权限 |
| DELETE | `/api/permissions/:id` | 删除权限 |
| POST | `/api/check` | 校验当前用户是否拥有某权限 |

### 响应格式

成功：
```json
{ "code": 0, "data": {}, "message": "success" }
```

错误：
```json
{ "code": 4001, "message": "Invalid credentials" }
```

分页：
```json
{
  "code": 0,
  "data": { "items": [], "total": 100, "page": 1, "limit": 10 }
}
```

## 示例页面

项目内置静态演示页面，启动服务后可访问：

| 页面 | 地址 |
|------|------|
| 登录 | `/demo/login.html` |
| 注册 | `/demo/register.html` |
| 用户面板 | `/demo/dashboard.html` |
| 管理面板 | `/demo/admin.html` (需 SuperAdmin 权限) |

详见 [示例页面文档](docs/DEMO.md)

## 新项目集成指南

1. 克隆本仓库
2. 在 `permission` 表中插入业务权限（如 `invoice:create`，group=`finance`）
3. 通过 `role_permission` 将权限分配给角色
4. 在业务代码中调用权限校验 API
5. URP 核心表和逻辑无需修改

## 常用命令

```bash
# 安装依赖
npm install

# 开发模式
npm run start:dev

# 构建
npm run build

# 格式化代码
npm run format

# ESLint 检查
npm run lint

# 单元测试
npm run test

# e2e 测试
npm run test:e2e

# 测试覆盖率
npm run test:cov

# 数据库种子
npm run prisma:seed

# Prisma Studio (可视化数据库)
npx prisma studio
```

## 项目结构

```
src/
├── auth/              # 认证模块 (注册/登录/JWT)
├── users/             # 用户管理 CRUD
├── roles/             # 角色管理 CRUD
├── permissions/       # 权限管理 CRUD
├── common/            # 全局拦截器、过滤器
├── prisma.module.ts   # Prisma 模块
├── prisma.service.ts  # Prisma 服务
├── app.module.ts      # 根模块
├── app.controller.ts  # 根控制器
└── main.ts            # 入口文件
prisma/
├── schema.prisma      # 数据模型定义
└── seed.ts            # 种子数据
public/demo/           # 静态示例页面
```

## 许可证

MIT
