# Websight Works PMS

Project Management System with:
- Backend: Spring Boot (Java)
- Frontend: React + Vite + Tailwind

## Repository Structure

```text
projectmanagement/
├── src/                      # Spring Boot backend source
├── pms-frontend/             # React frontend
├── pom.xml
├── .env.example              # Backend env template
└── GO_LIVE_CHECKLIST.md
```

## Prerequisites

- Java 17+
- Maven Wrapper (included: `./mvnw`)
- Node.js 18+
- MySQL running locally

## Environment Setup

### 1) Backend env

Copy backend template:

```bash
cp .env.example .env
```

Set values in your shell (or export through your runner):

```bash
export SPRING_PROFILES_ACTIVE=dev
export DB_URL=jdbc:mysql://localhost:3306/project_management_system
export DB_USERNAME=root
export DB_PASSWORD=your_password
export APP_JWT_SECRET=your_base64_secret
export APP_JWT_EXPIRATION_MS=86400000
```

### 2) Frontend env

Copy frontend template:

```bash
cp pms-frontend/.env.example pms-frontend/.env
```

Default API target:
- `VITE_API_BASE_URL=http://localhost:8080`

## Run Locally

Open two terminals.

### Terminal 1: Backend

```bash
./mvnw spring-boot:run
```

Backend runs on:
- `http://localhost:8080`

### Terminal 2: Frontend

```bash
cd pms-frontend
npm install
npm run dev
```

Frontend runs on:
- `http://localhost:5173`

## Build

### Backend

```bash
./mvnw -DskipTests compile
```

### Frontend

```bash
cd pms-frontend
npm run build
```

## Auth / Roles

- Admin can manage users/projects/tasks/subtasks.
- Member has restricted access:
  - can view assigned tasks/subtasks
  - can update status for assigned items
  - cannot create/edit/delete management data

## Default Admin

- Email: `admin@websightworks.org`
- Password: `Admin@123`


## Production Notes

Use:
- `SPRING_PROFILES_ACTIVE=prod`
- strong `APP_JWT_SECRET`
- production DB credentials

See:
- `GO_LIVE_CHECKLIST.md`
# websight-works-pms
