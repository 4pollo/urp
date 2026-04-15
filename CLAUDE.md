# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

URP (User-Role-Permission) Core is a reusable RBAC permission management service built on NestJS. It provides RESTful APIs for user authentication, role management, and permission control, designed as a template repository that can be cloned for new business projects (e.g., finance system, inventory system).

## Documentation

- `PRD.md` - Product requirements document
- `docs/TASKS.md` - Development task checklist
- `docs/API.md` - API interface specification

## Tech Stack

- **Framework**: NestJS
- **Database**: MySQL
- **ORM**: TypeORM (@nestjs/typeorm + typeorm)
- **Authentication**: JWT (Access Token + Refresh Token)
- **Password Hashing**: bcrypt
- **Architecture**: Controller → Service → Repository (TypeORM Entities/Repositories)

## Database Schema

### Core Tables (5)

- **User**: id (INT AUTO_INCREMENT), email, password (bcrypt hashed), status (active/frozen), lastLoginAt, createdAt, updatedAt
- **Role**: id (INT AUTO_INCREMENT), name (unique), description, createdAt, updatedAt
- **Permission**: id (INT AUTO_INCREMENT), key (unique, `resource:action` format), group, description, createdAt
- **UserRole**: userId (FK → User.id), roleId (FK → Role.id), UNIQUE(userId, roleId)
- **RolePermission**: roleId (FK → Role.id), permissionId (FK → Permission.id), UNIQUE(roleId, permissionId)

### Built-in Roles

- `SuperAdmin` - Has all permissions, created on first seed
- `Guest` - Default role assigned on registration

### Permission Key Convention

Format: `resource:action`

| Frontend Scene | Permission Key | Example |
|---------------|---------------|---------|
| Page access | `resource:view` | `dashboard:view`, `finance:view` |
| Read data | `resource:read` | `user:read`, `report:read` |
| Edit data | `resource:write` | `user:write`, `invoice:write` |
| Delete data | `resource:delete` | `user:delete`, `invoice:delete` |
| Export | `resource:export` | `report:export` |
| Manage | `resource:manage` | `system:manage` |

### Multi-Role Support

A user can have multiple roles. Final permissions = union of all assigned roles.

## API Structure

All APIs use unified response format: `{ "code": 0, "data": {}, "message": "success" }`

- `/api/auth/*` - Authentication (register, login, refresh, change-password, me)
- `/api/users` - User CRUD
- `/api/users/:id/status` - Freeze/activate user
- `/api/users/:id/roles` - Assign roles
- `/api/roles` - Role CRUD
- `/api/roles/:id/permissions` - Assign permissions to role
- `/api/permissions` - Permission CRUD
- `/api/check` - Check if current user has a permission
- `/api/permissions/me` - Get current user's permissions

## Authentication Flow

### Registration
1. Submit `email` + `password`
2. Validate email format and password strength
3. Hash password with bcrypt
4. Auto-assign `Guest` role
5. Return JWT Access Token + Refresh Token

### Login
1. Submit `email` + `password`
2. Verify credentials against bcrypt hash
3. Check user status (reject if frozen)
4. Update `lastLoginAt`
5. Return JWT Access Token + Refresh Token

### Change Password
- Provide old password + new password
- After change, clear Refresh Token (force re-login)

## Reusability Pattern

When creating a new business project (e.g., finance system):
1. Clone this repository
2. Insert business permissions into `permission` table (e.g., `invoice:create`, `report:view`, group=`finance`)
3. Assign permissions to roles via `role_permission` table
4. Use permission guards in business code
5. URP core tables and logic remain unchanged

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | MySQL connection string | `mysql://user:pass@localhost:3306/urp` |
| `JWT_SECRET` | JWT signing secret | random string |
| `JWT_ACCESS_EXPIRES` | Access Token expiry | `15m` |
| `JWT_REFRESH_EXPIRES` | Refresh Token expiry | `7d` |
| `CORS_ORIGIN` | Allowed CORS origins | `http://localhost:3000` |

## Development Principles

- **Reusability**: Pure backend API service, frontend calls API directly
- **Decoupling**: Permission logic completely separated from business logic
- **Performance**: API response latency target < 50ms
- **Security**: All passwords bcrypt hashed, JWT-based auth, frozen users cannot login
- **No SDK**: Frontend calls API directly, wraps request logic as needed
- **No over-design**: No email verification, no rate limiting, no ABAC in Phase 1
