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
| P0-1 | 统一文档与实现 | [x] 已完成 |
| P0-2 | 增加基于权限点的路由级访问控制 | [x] 已完成 |
| P0-3 | 移除 JWT 默认密钥兜底并梳理 refresh token 安全策略 | [x] 已完成 |

### P1
| # | 任务 | 状态 |
|---|------|------|
| P1-1 | 补齐单元测试与 e2e 测试 | [x] 本轮已处理 |
| P1-2 | 收敛前端 Demo 实现（API 基址、innerHTML、复用样式） | [x] 本轮已处理 |
| P1-3 | 按底模定位梳理开发态/交付态差异，并评估派生项目迁移到 migration 的时机 | [ ] |

### P2
| # | 任务 | 状态 |
|---|------|------|
| P2-1 | 完善部署、运行、排障说明 | [ ] |
| P2-2 | 补充模板集成、权限扩展、角色授权与二次开发指南 | [x] 本轮已处理 |
| P2-3 | 评估更高级权限模型（如 ABAC） | [ ] |

---

## 4. 说明

- 旧版任务清单中关于 `DATABASE_URL`、Prisma、`/demo/login` 等表述已过期，现已按当前实现修正
- 当前高危管理接口已接入基于角色的控制器级 Guard，普通登录用户与 SuperAdmin 权限边界已收口
- 当前测试体系已补齐核心单测与关键 e2e，但后续仍可继续扩展更完整的集成覆盖
- `P1-3` 当前更偏向底模说明性收口：明确开发态/交付态差异、seed 边界，以及派生项目切换 migration 的建议时机
- `P2-2` 已补充底模阅读路径、典型集成流程、权限扩展、角色授权与二次开发指南，面向派生客户项目开发者使用
- 详细问题与优先级请参考 `docs/整改清单.md`
