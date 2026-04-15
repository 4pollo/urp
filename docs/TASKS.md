# URP 开发任务清单

基于 PRD v4.0，Phase 1 核心引擎开发。

---

## 1. 项目初始化

| # | 任务 | 说明 | 状态 |
|---|------|------|------|
| 1.1 | 初始化 NestJS 项目 | 使用 NestJS CLI 创建项目 | [ ] |
| 1.2 | 安装 TypeORM 依赖 | `typeorm`, `@nestjs/typeorm`, `mysql2` | [ ] |
| 1.3 | 安装 JWT / bcrypt 依赖 | `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `bcrypt` | [ ] |
| 1.4 | 配置环境变量 | `.env` 文件，定义 DATABASE_URL, JWT_SECRET 等 | [ ] |
| 1.5 | 配置 Prisma 连接 | `prisma/schema.prisma` 配置 MySQL 连接 | [ ] |

## 2. 数据库层

| # | 任务 | 说明 | 状态 |
|---|------|------|------|
| 2.1 | 定义 TypeORM Entity - User | id, email, password, status, lastLoginAt, createdAt, updatedAt | [ ] |
| 2.2 | 定义 TypeORM Entity - Role | id, name, description, createdAt, updatedAt | [ ] |
| 2.3 | 定义 TypeORM Entity - Permission | id, key, group, description, createdAt | [ ] |
| 2.4 | 定义 TypeORM Entity - UserRole | userId, roleId，联合唯一 | [ ] |
| 2.5 | 定义 TypeORM Entity - RolePermission | roleId, permissionId，联合唯一 | [ ] |
| 2.6 | 配置 TypeORM 连接 | `app.module.ts` 中配置 MySQL 连接和 Entities | [ ] |
| 2.7 | 实现 Seed 脚本 | 初始化 SuperAdmin + Guest 角色 | [ ] |

## 3. 认证模块 (AuthModule)

| # | 任务 | 说明 | 状态 |
|---|------|------|------|
| 3.1 | AuthModule / AuthController / AuthService | 模块结构 | [ ] |
| 3.2 | 注册接口 `POST /api/auth/register` | email+password，bcrypt 哈希，自动分配 Guest | [ ] |
| 3.3 | 登录接口 `POST /api/auth/login` | 验证凭证，检查状态，返回 JWT | [ ] |
| 3.4 | 刷新 Token 接口 `POST /api/auth/refresh` | 验证 Refresh Token，签发新 Access Token | [ ] |
| 3.5 | 修改密码接口 `POST /api/auth/change-password` | 验证旧密码，清除 Refresh Token | [ ] |
| 3.6 | 获取当前用户 `GET /api/auth/me` | 从 JWT 解析用户信息返回 | [ ] |
| 3.7 | JWT Guard / Strategy | Passport JWT 策略实现 | [ ] |
| 3.8 | @JwtAuth() 装饰器 | 路由级 JWT 认证守卫 | [ ] |

## 4. 用户模块 (UserModule)

| # | 任务 | 说明 | 状态 |
|---|------|------|------|
| 4.1 | UserModule / UserController / UserService | 模块结构 | [ ] |
| 4.2 | 用户列表 `GET /api/users` | 分页查询 | [ ] |
| 4.3 | 创建用户 `POST /api/users` | 创建用户并分配角色 | [ ] |
| 4.4 | 用户详情 `GET /api/users/:id` | 含关联角色信息 | [ ] |
| 4.5 | 更新用户 `PUT /api/users/:id` | 更新用户信息 | [ ] |
| 4.6 | 删除用户 `DELETE /api/users/:id` | 级联删除关联 | [ ] |
| 4.7 | 冻结/激活 `PATCH /api/users/:id/status` | 切换 status 字段 | [ ] |
| 4.8 | 分配角色 `PUT /api/users/:id/roles` | 覆盖式分配 | [ ] |

## 5. 角色模块 (RoleModule)

| # | 任务 | 说明 | 状态 |
|---|------|------|------|
| 5.1 | RoleModule / RoleController / RoleService | 模块结构 | [ ] |
| 5.2 | 角色列表 `GET /api/roles` | 列表查询 | [ ] |
| 5.3 | 创建角色 `POST /api/roles` | 创建角色 | [ ] |
| 5.4 | 更新角色 `PUT /api/roles/:id` | 更新角色信息 | [ ] |
| 5.5 | 删除角色 `DELETE /api/roles/:id` | 级联删除关联 | [ ] |
| 5.6 | 角色授权 `PUT /api/roles/:id/permissions` | 覆盖式分配权限 | [ ] |

## 6. 权限模块 (PermissionModule)

| # | 任务 | 说明 | 状态 |
|---|------|------|------|
| 6.1 | PermissionModule / Controller / Service | 模块结构 | [ ] |
| 6.2 | 权限列表 `GET /api/permissions` | 支持按 group 筛选 | [ ] |
| 6.3 | 创建权限 `POST /api/permissions` | 创建权限点 | [ ] |
| 6.4 | 更新权限 `PUT /api/permissions/:id` | 更新权限信息 | [ ] |
| 6.5 | 删除权限 `DELETE /api/permissions/:id` | 删除权限 | [ ] |

## 7. 权限校验模块 (PermissionModule)

| # | 任务 | 说明 | 状态 |
|---|------|------|------|
| 7.1 | 校验接口 `POST /api/check` | 校验当前用户是否有某权限 | [ ] |
| 7.2 | 获取权限列表 `GET /api/permissions/me` | 返回当前用户所有权限 key | [ ] |
| 7.3 | @RequirePermission() 装饰器 | 路由级权限守卫，无权返回 403 | [ ] |
| 7.4 | PermissionService.can() 方法 | 核心权限判断逻辑 | [ ] |

## 8. 公共基础设施

| # | 任务 | 说明 | 状态 |
|---|------|------|------|
| 8.1 | 统一响应格式 Interceptor | 格式化所有响应为 `{ code, data, message }` | [ ] |
| 8.2 | 全局异常过滤器 | 统一错误响应格式 | [ ] |
| 8.3 | DTO 校验管道 | class-validator 参数校验 | [ ] |
| 8.4 | CORS 配置 | 基于环境变量 CORS_ORIGIN | [ ] |

## 9. 示例页面 (可选，Phase 2)

| # | 任务 | 说明 | 状态 |
|---|------|------|------|
| 9.1 | `/demo/register` 页面 | 注册演示 | [ ] |
| 9.2 | `/demo/login` 页面 | 登录演示 | [ ] |
| 9.3 | `/demo/dashboard` 页面 | 用户面板 | [ ] |
| 9.4 | `/demo/admin` 页面 | 管理面板 (需 SuperAdmin) | [ ] |

---

## 依赖关系

```
1. 项目初始化
   └── 2. 数据库层
       └── 3. 认证模块
       └── 4. 用户模块
       └── 5. 角色模块
       └── 6. 权限模块
           └── 7. 权限校验模块
               └── 8. 公共基础设施
                   └── 9. 示例页面
```
