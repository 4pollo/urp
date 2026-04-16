# URP 开发任务清单

本文档按当前代码状态整理，用于后续整改与演进追踪。

---

## 1. 已完成的核心能力

| # | 任务 | 当前状态 |
|---|------|----------|
| 1.1 | 初始化 NestJS 项目 | [x] |
| 1.2 | 接入 TypeORM + MySQL | [x] |
| 1.3 | 接入 JWT / Passport / bcrypt | [x] |
| 1.4 | 配置环境变量（当前为分离式 DB 配置） | [x] |
| 1.5 | 建立 User / Role / Permission / UserRole / RolePermission 实体 | [x] |
| 1.6 | 全局 ValidationPipe | [x] |
| 1.7 | 全局响应拦截器 | [x] |
| 1.8 | 全局异常过滤器 | [x] |
| 1.9 | 静态 Demo 页面托管 | [x] |
| 1.10 | Seed 脚本 | [x] |

## 2. 已完成的业务接口

### 2.1 Auth
| 接口 | 状态 |
|------|------|
| `POST /api/auth/register` | [x] |
| `POST /api/auth/login` | [x] |
| `POST /api/auth/refresh` | [x] |
| `POST /api/auth/change-password` | [x] |
| `GET /api/auth/me` | [x] |

### 2.2 Users
| 接口 | 状态 |
|------|------|
| `GET /api/users` | [x] |
| `POST /api/users` | [x] |
| `GET /api/users/:id` | [x] |
| `PUT /api/users/:id` | [x] |
| `DELETE /api/users/:id` | [x] |
| `PATCH /api/users/:id/status` | [x] |
| `PUT /api/users/:id/roles` | [x] |

### 2.3 Roles
| 接口 | 状态 |
|------|------|
| `GET /api/roles` | [x] |
| `GET /api/roles/:id` | [x] |
| `POST /api/roles` | [x] |
| `PUT /api/roles/:id` | [x] |
| `DELETE /api/roles/:id` | [x] |
| `PUT /api/roles/:id/permissions` | [x] |

### 2.4 Permissions
| 接口 | 状态 |
|------|------|
| `GET /api/permissions` | [x] |
| `GET /api/permissions/:id` | [x] |
| `GET /api/permissions/me` | [x] |
| `POST /api/permissions` | [x] |
| `PUT /api/permissions/:id` | [x] |
| `DELETE /api/permissions/:id` | [x] |
| `POST /api/check` | [x] |

---

## 3. 当前待整改项

### P0
| # | 任务 | 状态 |
|---|------|------|
| P0-1 | 统一文档与实现 | [x] 本轮已处理 |
| P0-2 | 增加基于权限点的路由级访问控制 | [ ] |
| P0-3 | 移除 JWT 默认密钥兜底并梳理 refresh token 安全策略 | [ ] |

### P1
| # | 任务 | 状态 |
|---|------|------|
| P1-1 | 补齐单元测试与 e2e 测试 | [ ] |
| P1-2 | 收敛前端 Demo 实现（API 基址、innerHTML、复用样式） | [ ] |
| P1-3 | 评估从 `synchronize` 迁移到 migration 流程 | [ ] |

### P2
| # | 任务 | 状态 |
|---|------|------|
| P2-1 | 完善部署、运行、排障说明 | [ ] |
| P2-2 | 补充模板集成与二次开发指南 | [ ] |
| P2-3 | 评估更高级权限模型（如 ABAC） | [ ] |

---

## 4. 说明

- 旧版任务清单中关于 `DATABASE_URL`、Prisma、`/demo/login` 等表述已过期，现已按当前实现修正
- 当前管理接口统一要求 JWT，但尚未实现基于权限点的控制器级 Guard
- 当前测试文件已存在，但业务覆盖率仍然明显不足
- 详细问题与优先级请参考 `docs/整改清单.md`
