# URP 示例页面使用指南

## 访问地址

当前仓库已经有正式前端入口，legacy demo 仅作为参考：

### 正式前端（Next.js）
- **登录页面**: `/login`
- **注册页面**: `/register`
- **用户面板**: `/dashboard`
- **管理面板**: `/admin`

### Legacy Demo（静态参考页）
- **登录页面**: `/demo/login.html`
- **注册页面**: `/demo/register.html`
- **用户面板**: `/demo/dashboard.html`
- **管理面板**: `/demo/admin.html`

说明：
- Web 默认开发端口为 `http://localhost:3000`
- API 默认开发端口为 `http://localhost:3001`
- API 环境变量文件位于 `apps/api/.env`
- legacy demo 静态资源由 Nest 从 `apps/api/public/` 提供

## 默认账户

系统已预置一个管理员账户：

- **邮箱**: `admin@example.com`
- **密码**: `admin123`
- **角色**: `SuperAdmin`（拥有全部已初始化权限）

## 功能说明

### 登录页面
- 使用邮箱和密码登录
- 登录成功后自动跳转到用户面板
- 会在 `localStorage` 中保存 `accessToken`、`refreshToken` 与用户信息

### 注册页面
- 使用邮箱和密码注册新账户
- 密码长度至少 6 位
- 注册成功后会尝试自动分配 `Guest` 角色
- 注册后自动登录并跳转到用户面板

### 用户面板
- 查看当前用户账户信息
- 查看分配角色
- 查看当前用户拥有的权限列表
- 如果当前用户角色包含 `SuperAdmin`，页面会显示管理面板入口

### 管理面板
- 页面为静态资源，加载后通过接口校验当前用户身份
- 仅当前端鉴定为 `SuperAdmin` 时允许继续使用管理功能
- **用户管理**: 查看所有用户，冻结/激活用户，删除用户
- **角色管理**: 查看所有角色，编辑角色信息，删除角色
- **权限管理**: 查看所有权限点，编辑权限信息，删除权限
- **统计信息**: 总用户数、总角色数、总权限数

## 设计特点

- **黑白灰极简风格**：高对比度、几何化界面
- **左右不对称布局**：登录/注册页面采用左右分栏
- **响应式设计**：小屏设备会切换为上下布局
- **动效细节**：使用 cubic-bezier 缓动、悬停反馈和扫描线纹理

## 技术实现

### 正式前端
- 基于 Next.js App Router
- 前端位于 `apps/web/`
- 当前已接入统一请求层、session 存储、认证辅助与管理台页面骨架
- 当前继续沿用 `localStorage` 保存 access / refresh token，后续可再升级更稳妥的 token 策略

### Legacy Demo
- 静态页面以 HTML + CSS + JavaScript 编写
- 使用 Tailwind CDN
- 使用 Google Fonts（Syne + IBM Plex Mono）
- 通过原生 Fetch API 调用后端接口
- 使用 `localStorage` 存储认证相关数据

## Demo 在底模中的作用

这些页面当前的定位是：
- 正式前端由 `apps/web/` 承担主入口
- legacy demo 继续用于演示 URP API 的调用方式
- legacy demo 作为派生项目前端接入时的最小参考实现

因此 `/demo/*.html` **不是**主前端入口，也不建议直接作为客户项目管理台交付。

## 前端最小接入流程

如果你要基于此底模开发客户项目前端，建议参考以下最小流程：

1. 调用登录或注册接口，获取 `accessToken` / `refreshToken`
2. 保存登录态（当前 demo 使用 `localStorage`）
3. 调用 `/api/auth/me` 获取当前用户基本信息与角色
4. 调用 `/api/permissions/me` 获取当前用户权限快照
5. 根据角色/权限控制页面、菜单或按钮显示
6. 调用业务接口时统一携带 `Authorization: Bearer <accessToken>`
7. 认证失效时统一跳回登录页并清理本地状态

对应参考文件：
- 正式前端：`apps/web/app/*`、`apps/web/components/*`、`apps/web/lib/*`
- legacy demo：`apps/api/public/demo/shared.js`
- legacy demo：`apps/api/public/demo/login.html`
- legacy demo：`apps/api/public/demo/register.html`
- legacy demo：`apps/api/public/demo/dashboard.html`
- legacy demo：`apps/api/public/demo/admin.html`

## 派生项目替换点

在客户项目中，通常需要替换或重做以下部分：

- **API 基址管理**：demo 当前通过相对 `/api/...` 调用后端；正式前端通常会封装独立的请求层
- **Token 存储策略**：demo 使用 `localStorage`，正式项目可按安全策略改为更稳妥的存储方式
- **页面与菜单系统**：demo 仅提供最小静态页面，不包含真实业务导航结构
- **角色判断逻辑**：demo 中 `SuperAdmin` 主要用于演示管理权限入口；正式项目应按业务角色与权限点细化
- **状态提示与交互细节**：demo 只覆盖最小联调场景，正式项目通常需要统一 UI 组件、状态管理和异常处理

## 常见误区

- **前端隐藏按钮 ≠ 后端完成鉴权**：真正的访问控制应由 `JwtAuthGuard` + `AccessGuard` 在服务端负责
- **Demo 页面可运行 ≠ 可直接交付**：这些页面主要用于验证接口链路，不代表正式前端方案
- **只判断 `SuperAdmin` 就够了**：对于客户项目，通常需要进一步扩展业务权限点，并在接口上使用 `@RequirePermissions(...)`

## 当前限制

- Demo 仍然是静态 HTML + CSS + JavaScript，适合联调，不适合复杂业务前端直接复用
- demo 当前假设前后端由同一服务或统一网关托管；若前后端完全分离，需要自行规划正式请求层
- 这些页面仅用于功能演示与联调，不应视为生产级前端实现

## 注意事项

生产环境建议使用 React、Vue 或 Angular 等前端框架重新实现完整管理界面，并将当前 demo 仅作为接口接入和权限联调参考。
