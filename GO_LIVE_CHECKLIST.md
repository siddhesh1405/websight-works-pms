# Go-Live Checklist

## 1. Environment
- Copy `.env.example` to `.env` in backend root.
- Copy `pms-frontend/.env.example` to `pms-frontend/.env`.
- Set strong `APP_JWT_SECRET` and production DB credentials.

## 2. Database
- Ensure MySQL database `project_management_system` exists.
- Run schema migration/init scripts before first start.
- Confirm unique data rules (email, project title) are active.

## 3. Security
- Verify default admin password is changed immediately.
- Verify member cannot access admin pages or admin APIs.
- Verify token expiry and logout behavior.

## 4. Backend
- Start backend with production profile:
  - `SPRING_PROFILES_ACTIVE=prod ./mvnw spring-boot:run`
- Confirm `/auth/login`, `/tasks`, `/subtasks` behavior with admin/member accounts.
- Confirm no debug-level logs in production.

## 5. Frontend
- Set `VITE_API_BASE_URL` to backend URL.
- Build and serve:
  - `npm run build`
- Verify role-based UI:
  - Admin: full management
  - Member: assigned tasks + status updates only

## 6. Core Regression Smoke Test
- Login as admin -> create project/task/subtask -> assign member.
- Login as member -> view assigned task only -> update task/subtask status.
- Ensure blocked actions show clean “Not allowed” message.

## 7. Operational Readiness
- Enable DB backups.
- Add monitoring/alerts for backend availability and error rates.
- Document rollback steps for release.
